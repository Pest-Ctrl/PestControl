const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function uuid() {
  return crypto.randomUUID();
}

async function main() {
  console.log('Seeding database for PostgreSQL...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.commentMentions.deleteMany();
  await prisma.comments.deleteMany();
  await prisma.issueTags.deleteMany();
  await prisma.issues.deleteMany();
  await prisma.commit.deleteMany();
  await prisma.repo.deleteMany();
  await prisma.spaceMembers.deleteMany();
  await prisma.inbox.deleteMany();
  await prisma.space.deleteMany();
  await prisma.tags.deleteMany();
  await prisma.users.deleteMany();

  const adminId = uuid();
  const dev01Id = uuid();
  const qa01Id = uuid();
  const importerId = uuid();
  const dev02Id = uuid();

  // Users
  const admin = await prisma.users.create({
    data: { UserID: adminId, Username: 'admin', Email: 'admin@gmail.com', PassHash: 'placeholder', Role: 'Project Manager' },
  });
  const dev01 = await prisma.users.create({
    data: { UserID: dev01Id, Username: 'dev01', Email: 'test01@gmail.com', PassHash: 'placeholder', Role: 'Developer' },
  });
  const qa01 = await prisma.users.create({
    data: { UserID: qa01Id, Username: 'qa01', Email: 'test02@gmail.com', PassHash: 'placeholder', Role: 'QA Engineer' },
  });
  const importer = await prisma.users.create({
    data: { UserID: importerId, Username: 'importer', Email: 'importer@gmail.com', PassHash: 'placeholder', Role: 'Repository Importer' },
  });
  const dev02 = await prisma.users.create({
    data: { UserID: dev02Id, Username: 'dev02', Email: 'dev02@gmail.com', PassHash: 'placeholder', Role: 'Developer' },
  });
  console.log('  Users created');

  const spaceId = uuid();
  // Space
  const space = await prisma.space.create({
    data: { SpaceID: spaceId, OwnerID: admin.UserID, SpaceName: 'PestControl BTS' },
  });
  for (const u of [admin, dev01, qa01, importer, dev02]) {
    await prisma.spaceMembers.create({
      data: { SpaceID: space.SpaceID, MemberID: u.UserID, Role: u.Role },
    });
  }
  console.log('  Space & members created');

  // Tags
  await Promise.all(
    ['security', 'performance', 'ui', 'api', 'auth', 'database', 'critical-path'].map(
      (name) => prisma.tags.create({ data: { TagName: name } })
    )
  );
  console.log('  Tags created');

  const repoId = uuid();
  // Repo
  const repo = await prisma.repo.create({
    data: { RepoID: repoId, SpaceID: space.SpaceID, GHOwner: 'pest-control', GHName: 'backend', DefaultBranch: 'main', ImportedBy: importer.UserID },
  });
  console.log('  Repo created');

  // Commits
  const commitData = [
    { id: uuid(), SHA: 'a1b2c3d', Message: 'Initial project setup', AuthorName: 'admin', CommittedAt: new Date('2026-08-10T09:00:00Z') },
    { id: uuid(), SHA: 'e4f5g6h', Message: 'Add authentication module', AuthorName: 'dev01', CommittedAt: new Date('2026-08-11T14:30:00Z') },
    { id: uuid(), SHA: 'i7j8k9l', Message: 'Implement JWT token refresh', AuthorName: 'dev01', CommittedAt: new Date('2026-08-12T10:15:00Z') },
    { id: uuid(), SHA: 'm0n1o2p', Message: 'Add dashboard API endpoints', AuthorName: 'dev02', CommittedAt: new Date('2026-08-13T16:45:00Z') },
    { id: uuid(), SHA: 'q3r4s5t', Message: 'Fix Safari compatibility issue', AuthorName: 'dev02', CommittedAt: new Date('2026-08-14T11:00:00Z') },
    { id: uuid(), SHA: 'u6v7w8x', Message: 'Add issue filter component', AuthorName: 'dev01', CommittedAt: new Date('2026-08-15T09:30:00Z') },
    { id: uuid(), SHA: 'y9z0a1b', Message: 'Implement MTTR analytics endpoint', AuthorName: 'dev02', CommittedAt: new Date('2026-08-16T13:20:00Z') },
    { id: uuid(), SHA: 'c2d3e4f', Message: 'Add comment notification system', AuthorName: 'dev01', CommittedAt: new Date('2026-08-17T15:45:00Z') },
    { id: uuid(), SHA: 'g5h6i7j', Message: 'Fix audit log missing entries', AuthorName: 'dev01', CommittedAt: new Date('2026-08-18T10:00:00Z') },
    { id: uuid(), SHA: 'k8l9m0n', Message: 'Add CSV export functionality', AuthorName: 'dev02', CommittedAt: new Date('2026-08-19T14:15:00Z') },
    { id: uuid(), SHA: 'o1p2q3r', Message: 'Fix GitHub OAuth callback error', AuthorName: 'dev01', CommittedAt: new Date('2026-08-20T08:30:00Z') },
    { id: uuid(), SHA: 's4t5u6v', Message: 'Add Kanban drag-and-drop', AuthorName: 'dev02', CommittedAt: new Date('2026-08-21T11:45:00Z') },
    { id: uuid(), SHA: 'w7x8y9z', Message: 'Fix rate limiter window reset', AuthorName: 'dev01', CommittedAt: new Date('2026-08-22T09:00:00Z') },
    { id: uuid(), SHA: 'a0b1c2d', Message: 'Fix WCAG contrast on buttons', AuthorName: 'dev02', CommittedAt: new Date('2026-08-23T16:00:00Z') },
    { id: uuid(), SHA: 'e3f4g5h', Message: 'Implement refresh token rotation', AuthorName: 'dev01', CommittedAt: new Date('2026-08-24T10:30:00Z') },
  ];

  const commits = {};
  for (const c of commitData) {
    commits[c.SHA] = await prisma.commit.create({
      data: { CommitID: c.id, RepoID: repo.RepoID, SHA: c.SHA, Message: c.Message, AuthorName: c.AuthorName, CommittedAt: c.CommittedAt },
    });
  }
  console.log('  Commits created');

  const issueData = [
    { id: uuid(), title: 'Auth token not refreshing on session expiry', status: 'Open', severity: 'Critical', type: 'Security', reporter: dev01.UserID, assignee: null, commitSHA: 'i7j8k9l', createdAt: new Date('2026-08-18') },
    { id: uuid(), title: 'Dashboard fails to load on Safari 17', status: 'InProgress', severity: 'High', type: 'Compatibility', reporter: qa01.UserID, assignee: dev02.UserID, commitSHA: 'q3r4s5t', createdAt: new Date('2026-08-19') },
    { id: uuid(), title: 'Issue filter clears on page refresh', status: 'UnderReview', severity: 'Medium', type: 'Functional', reporter: admin.UserID, assignee: dev01.UserID, commitSHA: 'u6v7w8x', createdAt: new Date('2026-08-19') },
    { id: uuid(), title: 'MTTR endpoint response time > 1s at 90 days', status: 'Open', severity: 'High', type: 'Performance', reporter: dev01.UserID, assignee: null, commitSHA: 'y9z0a1b', createdAt: new Date('2026-08-20') },
    { id: uuid(), title: 'Comment @-mention notification not firing', status: 'Resolved', severity: 'Medium', type: 'Functional', reporter: qa01.UserID, assignee: dev01.UserID, commitSHA: 'c2d3e4f', createdAt: new Date('2026-08-20') },
    { id: uuid(), title: 'Audit log missing assignee change entries', status: 'InProgress', severity: 'High', type: 'Data', reporter: admin.UserID, assignee: dev01.UserID, commitSHA: 'g5h6i7j', createdAt: new Date('2026-08-21') },
    { id: uuid(), title: 'CSV export truncates at 9,000 rows not 10,000', status: 'Open', severity: 'Medium', type: 'Functional', reporter: dev01.UserID, assignee: null, commitSHA: 'k8l9m0n', createdAt: new Date('2026-08-21') },
    { id: uuid(), title: 'GitHub OAuth callback 500 on invalid state', status: 'Closed', severity: 'Critical', type: 'Security', reporter: qa01.UserID, assignee: dev02.UserID, commitSHA: 'o1p2q3r', createdAt: new Date('2026-08-17') },
    { id: uuid(), title: 'Kanban drag-and-drop broken on mobile', status: 'Reopened', severity: 'Low', type: 'UI', reporter: admin.UserID, assignee: dev02.UserID, commitSHA: 's4t5u6v', createdAt: new Date('2026-08-22') },
    { id: uuid(), title: 'Rate limiter not resetting after 15 min window', status: 'Open', severity: 'High', type: 'Security', reporter: dev01.UserID, assignee: null, commitSHA: 'w7x8y9z', createdAt: new Date('2026-08-23') },
    { id: uuid(), title: 'WCAG contrast fail on disabled buttons', status: 'InProgress', severity: 'Low', type: 'UI', reporter: qa01.UserID, assignee: dev02.UserID, commitSHA: 'a0b1c2d', createdAt: new Date('2026-08-23') },
    { id: uuid(), title: 'Refresh token not rotated on every use', status: 'Resolved', severity: 'Critical', type: 'Security', reporter: admin.UserID, assignee: dev01.UserID, commitSHA: 'e3f4g5h', createdAt: new Date('2026-08-24') },
  ];

  for (const issue of issueData) {
    await prisma.issues.create({
      data: {
        IssueID: issue.id, SpaceID: space.SpaceID, ReporterID: issue.reporter, AssigneeID: issue.assignee,
        RepoID: repo.RepoID, CommitID: commits[issue.commitSHA]?.CommitID || null,
        Title: issue.title,
        Description: `Detailed description for: ${issue.title}.\n\nSteps to reproduce:\n1. Navigate to the affected feature\n2. Trigger the described behavior\n3. Observe the defect\n\nExpected: The feature works correctly.\nActual: ${issue.title}.`,
        Status: issue.status, Severity: issue.severity, BugType: issue.type, CreatedAt: issue.createdAt,
      },
    });
  }
  console.log('  Issues created');

  const auditData = [
    { user: dev01.UserID, issue: issueData[11].id, title: 'Status Transition', desc: 'Transitioned from InProgress to Resolved', time: new Date('2026-08-24T15:01:43Z') },
    { user: admin.UserID, issue: issueData[5].id, title: 'Reassignment', desc: 'Reassigned from dev02 to dev01', time: new Date('2026-08-24T14:47:11Z') },
    { user: dev01.UserID, issue: issueData[9].id, title: 'Issue Filed', desc: 'Filed issue', time: new Date('2026-08-23T13:22:08Z') },
    { user: dev02.UserID, issue: issueData[8].id, title: 'Status Transition', desc: 'Transitioned from Resolved to Reopened', time: new Date('2026-08-22T11:55:30Z') },
    { user: qa01.UserID, issue: issueData[2].id, title: 'Comment Added', desc: 'Commented on issue', time: new Date('2026-08-22T10:14:02Z') },
  ];

  for (const audit of auditData) {
    await prisma.auditLog.create({
      data: { AuditID: uuid(), UserID: audit.user, SpaceID: space.SpaceID, IssueID: audit.issue, AuditTitle: audit.title, AuditDesc: audit.desc, AuditTime: audit.time },
    });
  }
  console.log('  Audit logs created');

  const commentData = [
    { issue: issueData[0].id, author: dev01.UserID, body: 'Investigating — the refresh token appears to silently expire without triggering a re-auth flow.' },
    { issue: issueData[0].id, author: qa01.UserID, body: 'Confirmed on Chrome 128 and Firefox 131. Session just dies after 15 minutes.' },
    { issue: issueData[2].id, author: admin.UserID, body: 'This is blocking the QA workflow. Filter state needs to be persisted in URL query params.' },
    { issue: issueData[2].id, author: dev01.UserID, body: 'Fix pushed — using useSearchParams now to persist filter state across refreshes.' },
    { issue: issueData[7].id, author: qa01.UserID, body: 'Verified fix on staging. OAuth callback now properly validates state parameter.' },
    { issue: issueData[8].id, author: dev02.UserID, body: 'The touch event handler conflicts with the HTML5 drag API on mobile Safari. Need a polyfill.' },
  ];

  for (const comment of commentData) {
    await prisma.comments.create({
      data: { CommentID: uuid(), IssueID: comment.issue, AuthorID: comment.author, Body: comment.body },
    });
  }
  console.log('  Comments created');
  console.log('Database seeded successfully!');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
