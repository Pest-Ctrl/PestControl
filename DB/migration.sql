-- Migration script to update the original PestControl database schema for the Gitline feature

-- 1. Update Users Table
ALTER TABLE "users"
ADD COLUMN "Role" VARCHAR(50) DEFAULT 'Developer' NOT NULL;

-- 2. Update Issues Table
-- Rename 'desc' to 'Description'
ALTER TABLE "issues" RENAME COLUMN "desc" TO "Description";

-- Add new fields for Gitline and enriched issue tracking
ALTER TABLE "issues"
ADD COLUMN "RepoID" UUID DEFAULT NULL,
ADD COLUMN "CommitID" UUID DEFAULT NULL,
ADD COLUMN "Severity" VARCHAR(50) DEFAULT 'Medium' NOT NULL,
ADD COLUMN "BugType" VARCHAR(50) DEFAULT 'Functional' NOT NULL,
ADD COLUMN "FilePath" VARCHAR(255) DEFAULT NULL,
ADD COLUMN "LineRange" VARCHAR(50) DEFAULT NULL,
ADD COLUMN "Environment" VARCHAR(255) DEFAULT NULL,
ADD COLUMN "CreatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP NOT NULL,
ADD COLUMN "UpdatedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP NOT NULL;

-- 3. Create Repo Table
CREATE TABLE "repo" (
    "RepoID" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "SpaceID" UUID NOT NULL,
    "GHOwner" VARCHAR(255) NOT NULL,
    "GHName" VARCHAR(255) NOT NULL,
    "DefaultBranch" VARCHAR(100) DEFAULT 'main' NOT NULL,
    "IsPrivate" BOOLEAN DEFAULT FALSE NOT NULL,
    "PAT" VARCHAR(255) DEFAULT NULL,
    "FileTree" JSONB DEFAULT NULL,
    "ImportedAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ImportedBy" UUID NOT NULL,
    CONSTRAINT "Repo_SpaceID_fkey" FOREIGN KEY ("SpaceID") REFERENCES "space"("spaceid") ON DELETE CASCADE,
    CONSTRAINT "Repo_SpaceID_GHOwner_GHName_key" UNIQUE ("SpaceID", "GHOwner", "GHName")
);

-- 4. Create Commit Table
CREATE TABLE "Commit" (
    "CommitID" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "RepoID" UUID NOT NULL,
    "SHA" VARCHAR(40) NOT NULL,
    "Message" TEXT NOT NULL,
    "AuthorName" VARCHAR(255) NOT NULL,
    "AuthorEmail" VARCHAR(255),
    "CommittedAt" TIMESTAMP(6) NOT NULL,
    "URL" VARCHAR(255),
    CONSTRAINT "Commit_RepoID_fkey" FOREIGN KEY ("RepoID") REFERENCES "repo"("RepoID") ON DELETE CASCADE,
    CONSTRAINT "Commit_RepoID_SHA_key" UNIQUE ("RepoID", "SHA")
);

-- 5. Add Foreign Keys for Issues (referencing Repo and Commit)
ALTER TABLE "issues"
ADD CONSTRAINT "Issues_RepoID_fkey" FOREIGN KEY ("RepoID") REFERENCES "repo"("RepoID") ON DELETE SET NULL,
ADD CONSTRAINT "Issues_CommitID_fkey" FOREIGN KEY ("CommitID") REFERENCES "Commit"("CommitID") ON DELETE SET NULL;
