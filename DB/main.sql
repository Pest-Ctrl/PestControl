-- DROP TABLES
DROP TABLE IF EXISTS Users CASCADE;
DROP TABLE IF EXISTS Inbox CASCADE;
DROP TABLE IF EXISTS Tags CASCADE;
DROP TABLE IF EXISTS Space CASCADE;
DROP TABLE IF EXISTS Repo CASCADE;
DROP TABLE IF EXISTS Commit CASCADE;
DROP TABLE IF EXISTS Issues CASCADE;
DROP TABLE IF EXISTS Comments CASCADE;
DROP TABLE IF EXISTS SpaceMembers CASCADE;
DROP TABLE IF EXISTS IssueTags CASCADE;
DROP TABLE IF EXISTS CommentMentions CASCADE;
DROP TABLE IF EXISTS AuditLog CASCADE;

-- DROP TYPES
DROP TYPE IF EXISTS IssueStatus;
DROP TYPE IF EXISTS SeverityStatus;
DROP TYPE IF EXISTS BugTypes;
DROP TYPE IF EXISTS Roles;

-- CREATE EXTENSION
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ENUMS
DO $$
BEGIN
	CREATE TYPE IssueStatus AS ENUM ('Open', 'InProgress', 'UnderReview', 'Resolved', 'Closed', 'Reopened');
EXCEPTION
	WHEN duplicate_object THEN
		NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE SeverityStatus AS ENUM ('Critical', 'High', 'Medium', 'Low');
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE BugTypes AS ENUM ('Functional', 'Performance', 'Security', 'UI', 'Compatibility', 'Data');
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE Roles AS ENUM ('Developer', 'QAEngineer', 'RepoImporter', 'Admin');
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END $$;

-- CREATE TABLES
CREATE TABLE Users (
    UserID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Username VARCHAR(255) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    PassHash VARCHAR(255) NULL,
    GHOAuth VARCHAR(255) NULL,
    "role" Roles DEFAULT 'Developer' NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE Inbox (
    NotifID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserID UUID NOT NULL,
    NotifTitle VARCHAR(255) NOT NULL,
    NotifDesc TEXT NOT NULL,
    IsRead BOOLEAN DEFAULT FALSE NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

CREATE TABLE Tags (
    TagID SERIAL PRIMARY KEY,
    TagName VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE Space (
    SpaceID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    OwnerID UUID NOT NULL,
    SpaceName VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (OwnerID) REFERENCES Users(UserID) ON DELETE CASCADE
);


CREATE TABLE Repo (
    RepoID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    SpaceID UUID NOT NULL,
    GHOwner VARCHAR(255) NOT NULL,
    GHName VARCHAR(255) NOT NULL,
    DefaultBranch VARCHAR(255) NOT NULL DEFAULT 'main',
    IsPrivate BOOLEAN NOT NULL DEFAULT false,
    FileTree JSONB,
    ImportedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ImportedBy UUID NOT NULL,
    FOREIGN KEY (SpaceID) REFERENCES Space(SpaceID) ON DELETE CASCADE,
    FOREIGN KEY (ImportedBy) REFERENCES Users(UserID) ON DELETE CASCADE
);

CREATE TABLE Commit (
    CommitID VARCHAR(255) PRIMARY KEY,
    RepoID UUID NOT NULL,
    "message" TEXT NOT NULL,
    AuthorName VARCHAR(255) NOT NULL,
    AuthorEmail VARCHAR(255) NOT NULL,
    CommittedAt TIMESTAMP NOT NULL,
    "url" VARCHAR(255) UNIQUE NOT NULL,
    FOREIGN KEY (RepoID) REFERENCES Repo(RepoID) ON DELETE CASCADE
);

CREATE TABLE Issues (
    IssueID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    SpaceID UUID NOT NULL,
    ReporterID UUID NOT NULL,
    AssigneeID UUID NULL,
    Title VARCHAR(255) NOT NULL,
    "desc" TEXT NOT NULL,
    "status" IssueStatus DEFAULT 'Open' NOT NULL,
    RepoID UUID NOT NULL,
    CommitID VARCHAR(255) NOT NULL,
    Severity SeverityStatus DEFAULT 'Medium' NOT NULL,
    BugType BugTypes DEFAULT 'Functional' NOT NULL,
    FilePath VARCHAR(255),
    LineRange VARCHAR(100),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Deadline TIMESTAMP,
    FOREIGN KEY (SpaceID) REFERENCES Space(SpaceID) ON DELETE CASCADE,
    FOREIGN KEY (ReporterID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (AssigneeID) REFERENCES Users(UserID) ON DELETE SET NULL,
    FOREIGN KEY (RepoID) REFERENCES Repo(RepoID) ON DELETE CASCADE,
    FOREIGN KEY (CommitID) REFERENCES Commit(CommitID) ON DELETE CASCADE
);

CREATE TABLE Comments (
    CommentID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    IssueID UUID NOT NULL,
    AuthorID UUID NOT NULL,
    ParentID UUID NULL,
    Body TEXT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (IssueID) REFERENCES Issues(IssueID) ON DELETE CASCADE,
    FOREIGN KEY (AuthorID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (ParentID) REFERENCES Comments(CommentID) ON DELETE CASCADE
);

CREATE TABLE SpaceMembers (
    SpaceID UUID,
    MemberID UUID,
    -- Space-wide roles will replace User-roles later
    "role" Roles DEFAULT 'Developer' NOT NULL,
    JoinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (SpaceID, MemberID),
    FOREIGN KEY (SpaceID) REFERENCES Space(SpaceID) ON DELETE CASCADE,
    FOREIGN KEY (MemberID) REFERENCES Users(UserID) ON DELETE CASCADE
);

CREATE TABLE IssueTags (
    IssueID UUID,
    TagID INT,
    PRIMARY KEY (IssueID, TagID),
    FOREIGN KEY (IssueID) REFERENCES Issues(IssueID) ON DELETE CASCADE,
    FOREIGN KEY (TagID) REFERENCES Tags(TagID) ON DELETE CASCADE
);

CREATE TABLE CommentMentions (
    CommentID UUID,
    MentionedUserID UUID,
    PRIMARY KEY (CommentID, MentionedUserID),
    FOREIGN KEY (CommentID) REFERENCES Comments(CommentID) ON DELETE CASCADE,
    FOREIGN KEY (MentionedUserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

CREATE TABLE AuditLog (
    AuditID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    UserID UUID NOT NULL,
    SpaceID UUID NOT NULL,
    IssueID UUID NULL,
    AuditTitle VARCHAR(255) NOT NULL,
    AuditDesc TEXT NOT NULL,
    AuditTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (SpaceID) REFERENCES Space(SpaceID) ON DELETE CASCADE,
    FOREIGN KEY (IssueID) REFERENCES Issues(IssueID) ON DELETE SET NULL
);

-- Insert dummy data

INSERT INTO Users (UserID, Username, Email, PassHash, "role", CreatedAt) VALUES
('1d190b3e-7282-4815-bab1-dbc69cd6dd0b', 'Importer User', 'importer@gmail.com', 'dummy', 'Repository Importer', '2026-09-24 11:31:57.4592'),
('f2cac24a-8e85-4094-a6b7-2df7208e73e2', 'Test User 01', 'test01@gmail.com', 'dummy', 'Developer', '2026-09-10 12:47:25.817706'),
('dfc45cce-95b4-49c2-9307-ea4457da073d', 'Test User 02', 'test02@gmail.com', 'dummy', 'QA Engineer', '2026-09-24 11:18:28.202379'),
('45c2752d-190d-4cdf-8f4e-10742770fbc5', 'Admin User', 'admin@gmail.com', 'dummy', 'Admin', '2026-09-24 11:18:40.810412')
ON CONFLICT (Email) DO NOTHING;