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
  let logs = await prisma.auditLog.findMany({
    where,
    orderBy: { AuditTime: 'desc' },
    take: 50,
  });

  const users = await prisma.users.findMany();
  
  logs = logs.map((log: any) => {
    const user = users.find((u: any) => u.UserID === log.UserID || u.UserId === log.UserID);
    return {
      ...log,
      User: user ? { UserID: user.UserID, Username: user.Username || user.username } : { UserID: log.UserID, Username: 'System' }
    };
  });

  return NextResponse.json(logs);
}
