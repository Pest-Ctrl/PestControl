import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const issueId = searchParams.get('issueId');

  const where: any = {};
  if (issueId) where.IssueID = issueId;
  const logs = await prisma.auditLog.findMany({
    where,
    include: {
      User: { select: { UserID: true, Username: true } },
      Issue: { select: { IssueID: true, Title: true } },
    },
    orderBy: { AuditTime: 'desc' },
    take: 50,
  });

  return NextResponse.json(logs);
}
