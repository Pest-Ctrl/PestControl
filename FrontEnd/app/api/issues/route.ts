import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const severity = searchParams.get('severity');
  const assignee = searchParams.get('assignee');
  const search = searchParams.get('search');

  const where: any = {};
  if (status) where.Status = status;
  if (severity) where.Severity = severity;
  if (assignee) where.AssigneeID = assignee;
  if (search) {
    where.OR = [
      { Title: { contains: search } },
      { Description: { contains: search } },
    ];
  }

  const issues = await prisma.issues.findMany({
    where,
    include: {
      Reporter: { select: { UserID: true, Username: true, Email: true } },
      Assignee: { select: { UserID: true, Username: true, Email: true } },
      Repo: { select: { RepoID: true, GHOwner: true, GHName: true } },
      Commit: { select: { CommitID: true, SHA: true, Message: true } },
      _count: { select: { Comments: true } },
    },
    orderBy: { CreatedAt: 'desc' },
  });

  return NextResponse.json(issues);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, severity, bugType, repoId, commitId, filePath, lineRange, environment, spaceId } = body;

  if (!title || !description) {
    return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
  }

  // Find the user by email
  const user = await prisma.users.findUnique({ where: { Email: session.user.email! } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Use provided spaceId or find first space
  const space = spaceId 
    ? await prisma.space.findUnique({ where: { SpaceID: spaceId } })
    : await prisma.space.findFirst();

  if (!space) {
    return NextResponse.json({ error: 'No space found' }, { status: 404 });
  }

  const issue = await prisma.issues.create({
    data: {
      SpaceID: space.SpaceID,
      ReporterID: user.UserID,
      Title: title,
      Description: description,
      Severity: severity || 'Medium',
      BugType: bugType || 'Functional',
      RepoID: repoId || null,
      CommitID: commitId || null,
      FilePath: filePath || null,
      LineRange: lineRange || null,
      Environment: environment || null,
    },
    include: {
      Reporter: { select: { UserID: true, Username: true, Email: true } },
    },
  });

  // Create audit log entry
  await prisma.auditLog.create({
    data: {
      UserID: user.UserID,
      SpaceID: space.SpaceID,
      IssueID: issue.IssueID,
      AuditTitle: 'Issue Filed',
      AuditDesc: `Filed issue: ${title}`,
    },
  });

  return NextResponse.json(issue, { status: 201 });
}
