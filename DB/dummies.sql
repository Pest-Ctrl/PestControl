ROLLBACK;

BEGIN;
--Please change the hashed password howerver you like
INSERT INTO "users" ("userid", "username", "email", "passhash", "Role")
VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin',    'admin@gmail.com',
   '$2b$10$akCOg6.mG5knnEMLHhP4deHWcuYZpIruIISyet71rOBxrU/9Fw9wO',
   'Project Manager'),

  ('22222222-2222-2222-2222-222222222222', 'dev01',    'test01@gmail.com',
   '$2b$10$6oGw2ooQL0srR2rNOa2eE.3Acr.g2RcDzejoFXP85wN34uJSv910S',
   'Developer'),

  ('33333333-3333-3333-3333-333333333333', 'qa01',     'test02@gmail.com',
   '$2b$10$Ie.NHx6Ly1K3Mlws.DjsUeHl4ntqXdQ7FiWAl1grZKeCnQYLwtGae',
   'QA Engineer'),

  ('44444444-4444-4444-4444-444444444444', 'importer', 'importer@gmail.com',
   '$2b$10$jQOHfjP7EgP9r.A4SjpLOOTBnC1ZU15xYEU2JV0BRO4bH4Ht0.xzC',
   'Repository Importer')
ON CONFLICT ("email") DO UPDATE SET
  "username" = EXCLUDED."username",
  "passhash" = EXCLUDED."passhash",
  "Role" = EXCLUDED."Role";

INSERT INTO "space" ("spaceid", "ownerid", "spacename")
VALUES (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'PestControl Demo Workspace'
)
ON CONFLICT ("spaceid") DO NOTHING;

INSERT INTO "spacemembers" ("spaceid", "memberid")
VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
   '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
   '22222222-2222-2222-2222-222222222222'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
   '33333333-3333-3333-3333-333333333333'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
   '44444444-4444-4444-4444-444444444444')
ON CONFLICT ("spaceid", "memberid") DO UPDATE SET
  "Role" = EXCLUDED."Role";

COMMIT;