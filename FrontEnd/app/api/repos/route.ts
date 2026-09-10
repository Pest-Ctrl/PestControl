import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const repos = await prisma.repo.findMany({
    include: {
      _count: { select: { Issues: true, Commits: true } },
    },
    orderBy: { ImportedAt: 'desc' },
  });

  return NextResponse.json(repos);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { owner, name, defaultBranch, isPrivate, pat } = body;

  if (!owner || !name) {
    return NextResponse.json({ error: 'Owner and name are required' }, { status: 400 });
  }

  const user = await prisma.users.findUnique({ where: { Email: session.user.email! } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const space = await prisma.space.findFirst();
  if (!space) return NextResponse.json({ error: 'No space found' }, { status: 404 });

  // Check if already imported
  const existing = await prisma.repo.findFirst({
    where: { SpaceID: space.SpaceID, GHOwner: owner, GHName: name },
  });
  if (existing) {
    return NextResponse.json({ error: 'Repository already imported', repo: existing }, { status: 409 });
  }

  // Set up GitHub API headers
  const ghHeaders: any = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (isPrivate && pat) {
    ghHeaders['Authorization'] = `Bearer ${pat}`;
  }

  // Fetch commits from GitHub API
  let githubCommits = [];
  try {
    const ghRes = await fetch(`https://api.github.com/repos/${owner}/${name}/commits?per_page=15`, {
      headers: ghHeaders,
    });
    if (ghRes.ok) {
      githubCommits = await ghRes.json();
    }
  } catch (err) {
    console.error('Failed to fetch commits from GitHub API:', err);
  }

  // Fetch file tree
  let fileTree = null;
  try {
    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${name}/git/trees/${defaultBranch || 'main'}?recursive=1`, {
      headers: ghHeaders,
    });
    if (treeRes.ok) {
      const treeData = await treeRes.json();
      if (treeData.tree && Array.isArray(treeData.tree)) {
        // Simplify the tree to just the essential data to save space
        fileTree = treeData.tree.map((item: any) => ({
          path: item.path,
          type: item.type, // 'blob' or 'tree'
          size: item.size
        }));
      }
    }
  } catch (err) {
    console.error('Failed to fetch file tree from GitHub API:', err);
  }

  // Use a transaction to create repo and commits
  const repo = await prisma.$transaction(async (tx) => {
    const newRepo = await tx.repo.create({
      data: {
        SpaceID: space.SpaceID,
        GHOwner: owner,
        GHName: name,
        DefaultBranch: defaultBranch || 'main',
        IsPrivate: isPrivate || false,
        PAT: pat || null,
        FileTree: fileTree ? fileTree : undefined,
        ImportedBy: user.UserID,
      },
    });

    if (githubCommits.length > 0) {
      await tx.commit.createMany({
        data: githubCommits.map((c: any) => ({
          RepoID: newRepo.RepoID,
          SHA: c.sha,
          Message: c.commit.message,
          AuthorName: c.commit.author.name,
          AuthorEmail: c.commit.author.email || null,
          CommittedAt: new Date(c.commit.author.date),
        })),
        skipDuplicates: true,
      });
    }
    
    return newRepo;
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      UserID: user.UserID,
      SpaceID: space.SpaceID,
      AuditTitle: 'Repo Imported',
      AuditDesc: `Imported repository ${owner}/${name}`,
    },
  });

  return NextResponse.json(repo, { status: 201 });
}
