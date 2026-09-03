-- Seed script for PestControl Gitline Mock Data

-- 1. Insert Users
INSERT INTO "Users" ("UserID", "Username", "Email", "PassHash", "Role") VALUES
('11111111-1111-1111-1111-111111111111', 'admin', 'admin@gmail.com', 'placeholder', 'Project Manager'),
('22222222-2222-2222-2222-222222222222', 'dev01', 'test01@gmail.com', 'placeholder', 'Developer'),
('33333333-3333-3333-3333-333333333333', 'qa01', 'test02@gmail.com', 'placeholder', 'QA Engineer'),
('44444444-4444-4444-4444-444444444444', 'importer', 'importer@gmail.com', 'placeholder', 'Repository Importer'),
('55555555-5555-5555-5555-555555555555', 'dev02', 'dev02@gmail.com', 'placeholder', 'Developer')
ON CONFLICT ("Email") DO NOTHING;

-- 2. Insert Space
INSERT INTO "Space" ("SpaceID", "OwnerID", "SpaceName") VALUES
('aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'PestControl BTS')
ON CONFLICT DO NOTHING;

-- 3. Insert Space Members
INSERT INTO "SpaceMembers" ("SpaceID", "MemberID", "Role") VALUES
('aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Project Manager'),
('aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'Developer'),
('aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'QA Engineer'),
('aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'Repository Importer'),
('aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '55555555-5555-5555-5555-555555555555', 'Developer')
ON CONFLICT DO NOTHING;

-- 4. Insert Tags
INSERT INTO "Tags" ("TagName") VALUES 
('security'), ('performance'), ('ui'), ('api'), ('auth'), ('database'), ('critical-path')
ON CONFLICT ("TagName") DO NOTHING;

-- 5. Insert Repo
INSERT INTO "Repo" ("RepoID", "SpaceID", "GHOwner", "GHName", "DefaultBranch", "ImportedBy") VALUES
('bbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'pest-control', 'backend', 'main', '44444444-4444-4444-4444-444444444444')
ON CONFLICT DO NOTHING;

-- 6. Insert Commits
INSERT INTO "Commit" ("CommitID", "RepoID", "SHA", "Message", "AuthorName", "CommittedAt") VALUES
('c1111-cccc-cccc-cccc-cccccccccccc', 'bbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'i7j8k9l', 'Implement JWT token refresh', 'dev01', '2026-08-12 10:15:00'),
('c2222-cccc-cccc-cccc-cccccccccccc', 'bbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'q3r4s5t', 'Fix Safari compatibility issue', 'dev02', '2026-08-14 11:00:00'),
('c3333-cccc-cccc-cccc-cccccccccccc', 'bbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'u6v7w8x', 'Add issue filter component', 'dev01', '2026-08-15 09:30:00'),
('c4444-cccc-cccc-cccc-cccccccccccc', 'bbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'y9z0a1b', 'Implement MTTR analytics endpoint', 'dev02', '2026-08-16 13:20:00'),
('c5555-cccc-cccc-cccc-cccccccccccc', 'bbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'c2d3e4f', 'Add comment notification system', 'dev01', '2026-08-17 15:45:00'),
('c6666-cccc-cccc-cccc-cccccccccccc', 'bbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'g5h6i7j', 'Fix audit log missing entries', 'dev01', '2026-08-18 10:00:00'),
('c7777-cccc-cccc-cccc-cccccccccccc', 'bbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'k8l9m0n', 'Add CSV export functionality', 'dev02', '2026-08-19 14:15:00'),
('c8888-cccc-cccc-cccc-cccccccccccc', 'bbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'o1p2q3r', 'Fix GitHub OAuth callback error', 'dev01', '2026-08-20 08:30:00'),
('c9999-cccc-cccc-cccc-cccccccccccc', 'bbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 's4t5u6v', 'Add Kanban drag-and-drop', 'dev02', '2026-08-21 11:45:00'),
('c0000-cccc-cccc-cccc-cccccccccccc', 'bbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'w7x8y9z', 'Fix rate limiter window reset', 'dev01', '2026-08-22 09:00:00')
ON CONFLICT DO NOTHING;

-- 7. Insert Issues
INSERT INTO "Issues" ("IssueID", "SpaceID", "ReporterID", "AssigneeID", "RepoID", "CommitID", "Title", "Description", "Status", "Severity", "BugType") VALUES
('11111111-9999-9999-9999-111111111111', 'aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', NULL, 'bbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'c1111-cccc-cccc-cccc-cccccccccccc', 'Auth token not refreshing on session expiry', 'Token expires silently.', 'Open', 'Critical', 'Security'),
('22222222-9999-9999-9999-222222222222', 'aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 'bbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'c2222-cccc-cccc-cccc-cccccccccccc', 'Dashboard fails to load on Safari 17', 'Safari error.', 'InProgress', 'High', 'Compatibility'),
('33333333-9999-9999-9999-333333333333', 'aaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'bbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'c3333-cccc-cccc-cccc-cccccccccccc', 'Issue filter clears on page refresh', 'State is lost.', 'UnderReview', 'Medium', 'Functional')
ON CONFLICT DO NOTHING;
