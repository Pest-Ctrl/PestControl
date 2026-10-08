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
  const repoId = searchParams.get('repoId');
  const spaceId = searchParams.get('spaceId');

  const where: any = {};
  if (status) where.Status = status;
  if (severity) where.Severity = severity;
  if (assignee) where.AssigneeID = assignee;
  if (repoId) where.RepoID = repoId;
  if (spaceId) where.SpaceID = spaceId;
  
  if (search) {
    where.OR = [
      { Title: { contains: search } },
      { Description: { contains: search } },
    ];
  }

  let issues = await prisma.issues.findMany({
    where,
    orderBy: { CreatedAt: 'desc' },
  });

  const users = await prisma.users.findMany();
  
  issues = issues.map((issue: any) => {
    const reporter = users.find((u: any) => u.UserID === issue.ReporterID || u.UserId === issue.ReporterID);
    const assignee = users.find((u: any) => u.UserID === issue.AssigneeID || u.UserId === issue.AssigneeID);
    
    return {
      ...issue,
      Reporter: reporter ? { UserID: reporter.UserID, Username: reporter.Username || reporter.username, Email: reporter.Email || reporter.email } : null,
      Assignee: assignee ? { UserID: assignee.UserID, Username: assignee.Username || assignee.username, Email: assignee.Email || assignee.email } : null,
      _count: { Comments: 0 }
    };
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
