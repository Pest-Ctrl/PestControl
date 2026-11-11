import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const issue = await prisma.issues.findUnique({
    where: { IssueID: id },
    include: {
      Reporter: { select: { UserID: true, Username: true, Email: true } },
      Assignee: { select: { UserID: true, Username: true, Email: true } },
      Repo: { select: { RepoID: true, GHOwner: true, GHName: true } },
      Commit: { select: { CommitID: true, SHA: true, Message: true, AuthorName: true, CommittedAt: true } },
      Comments: {
        include: {
          Author: { select: { UserID: true, Username: true, Email: true } },
        },
        orderBy: { CreatedAt: 'asc' },
      },
      AuditLogs: {
        include: {
          User: { select: { UserID: true, Username: true } },
        },
        orderBy: { AuditTime: 'desc' },
      },
    },
  });

  if (!issue) {
    return NextResponse.json({ error: 'Issue not found' }, { status: 404 });
  }

  return NextResponse.json(issue);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status, assigneeId, severity } = body;

  const user = await prisma.users.findUnique({ where: { Email: session.user.email! } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const existingIssue = await prisma.issues.findUnique({ where: { IssueID: id } });
  if (!existingIssue) return NextResponse.json({ error: 'Issue not found' }, { status: 404 });

  const updateData: any = {};
  let auditDesc = '';

  if (status && status !== existingIssue.Status) {
    updateData.Status = status;
    auditDesc = `Transitioned from ${existingIssue.Status} to ${status}`;
  }
  if (assigneeId !== undefined) {
    updateData.AssigneeID = assigneeId || null;
    auditDesc = auditDesc ? `${auditDesc}; Reassigned` : 'Reassigned';
  }
  if (severity && severity !== existingIssue.Severity) {
    updateData.Severity = severity;
    auditDesc = auditDesc ? `${auditDesc}; Severity changed to ${severity}` : `Severity changed to ${severity}`;
  }

  updateData.userId = user.UserID;

  const updated = await prisma.issues.update({
    where: { IssueID: id },
    data: updateData,
  });

  if (auditDesc) {
    await prisma.auditLog.create({
      data: {
        UserID: user.UserID,
        SpaceID: existingIssue.SpaceID,
        IssueID: id,
        AuditTitle: status ? 'Status Transition' : 'Update',
        AuditDesc: auditDesc,
      },
    });
  }

  return NextResponse.json(updated);
}
