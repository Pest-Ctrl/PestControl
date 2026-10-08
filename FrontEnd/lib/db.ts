import { toSchemaRole } from './roles';

const JAVA_API = 'http://localhost:8080/api';

const mapKeysToPascalCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(mapKeysToPascalCase);
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        let newKey = key.charAt(0).toUpperCase() + key.slice(1);
        if (newKey.endsWith('Id')) {
          newKey = newKey.slice(0, -2) + 'ID';
        }
        if (key === 'ghOwner') newKey = 'GHOwner';
        else if (key === 'ghName') newKey = 'GHName';
        else if (key === 'ghOAuth') newKey = 'GHOAuth';

        const val = mapKeysToPascalCase(obj[key]);
        newObj[newKey] = val;

        // Provide camelCase / alternate casing aliases for maximum compatibility
        if (newKey.endsWith('ID')) {
          const altKey = newKey.slice(0, -2) + 'Id';
          if (!newObj[altKey]) newObj[altKey] = val;
        }
      }
    }
    // Specific entity aliases to match both universal schema and frontend types
    if (newObj.UserId && !newObj.UserID) newObj.UserID = newObj.UserId;
    if (newObj.SpaceId && !newObj.SpaceID) newObj.SpaceID = newObj.SpaceId;
    if (newObj.RepoId && !newObj.RepoID) newObj.RepoID = newObj.RepoId;
    if (newObj.IssueId && !newObj.IssueID) newObj.IssueID = newObj.IssueId;
    if (newObj.CommitId && !newObj.CommitID) newObj.CommitID = newObj.CommitId;
    if (newObj.NotifId && !newObj.NotifID) newObj.NotifID = newObj.NotifId;
    if (newObj.AuditId && !newObj.AuditID) newObj.AuditID = newObj.AuditId;
    if (newObj.OwnerId && !newObj.OwnerID) newObj.OwnerID = newObj.OwnerId;
    if (newObj.ReporterId && !newObj.ReporterID) newObj.ReporterID = newObj.ReporterId;
    if (newObj.AssigneeId && !newObj.AssigneeID) newObj.AssigneeID = newObj.AssigneeId;
    if (newObj.GhOwner && !newObj.GHOwner) newObj.GHOwner = newObj.GhOwner;
    if (newObj.GHOwner && !newObj.GhOwner) newObj.GhOwner = newObj.GHOwner;
    if (newObj.GHOwner && !newObj.ghOwner) newObj.ghOwner = newObj.GHOwner;
    if (newObj.GhName && !newObj.GHName) newObj.GHName = newObj.GhName;
    if (newObj.GHName && !newObj.GhName) newObj.GhName = newObj.GHName;
    if (newObj.GHName && !newObj.ghName) newObj.ghName = newObj.GHName;
    if (newObj.GhOAuth && !newObj.GHOAuth) newObj.GHOAuth = newObj.GhOAuth;
    if (newObj.GHOAuth && !newObj.GhOAuth) newObj.GhOAuth = newObj.GHOAuth;
    if (newObj.GHOAuth && !newObj.ghOAuth) newObj.ghOAuth = newObj.GHOAuth;
    if (newObj.Description && !newObj.desc) newObj.desc = newObj.Description;
    if (newObj.desc && !newObj.Description) newObj.Description = newObj.desc;
    return newObj;
  }
  return obj;
};

const mapKeysToCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(mapKeysToCamelCase);
  } else if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        let newKey = key.charAt(0).toLowerCase() + key.slice(1);
        // Special case handlers for acronyms like GHOwner, SpaceID
        if (key === 'GHOwner') newKey = 'ghOwner';
        else if (key === 'GHName') newKey = 'ghName';
        else if (key === 'GHOAuth') newKey = 'ghOAuth';
        else if (key === 'SpaceID' || key === 'SpaceId') newKey = 'spaceId';
        else if (key === 'UserID' || key === 'UserId') newKey = 'userId';
        else if (key === 'RepoID' || key === 'RepoId') newKey = 'repoId';
        else if (key === 'IssueID' || key === 'IssueId') newKey = 'issueId';
        else if (key === 'CommitID' || key === 'CommitId') newKey = 'commitId';
        else if (key === 'NotifID' || key === 'NotifId') newKey = 'notifId';
        else if (key === 'OwnerID' || key === 'OwnerId') newKey = 'ownerId';
        else if (key === 'ReporterID' || key === 'ReporterId') newKey = 'reporterId';
        else if (key === 'AssigneeID' || key === 'AssigneeId') newKey = 'assigneeId';
        else if (key === 'ImportedBy') newKey = 'importedBy';
        else if (key === 'PassHash') newKey = 'passHash';
        else if (key === 'Description' || key === 'desc') newKey = 'description';
        newObj[newKey] = mapKeysToCamelCase(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};

const fetchJava = async (path: string, options: any = {}) => {
  try {
    const res = await fetch(`${JAVA_API}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers }
    });
    if (!res.ok) {
      console.error(`Java API returned ${res.status} for ${path}`);
      return null;
    }
    const data = await res.json();
    return mapKeysToPascalCase(data);
  } catch (err) {
    console.error(`Error calling Java API ${path}:`, err);
    return null;
  }
};

// Universal DB proxy aligning Next.js / prisma interfaces with the universal DB schema and Java backend
export const prisma = {
  users: {
    findUnique: async ({ where }: any) => {
      const users = await fetchJava('/users');
      if (!users || !Array.isArray(users)) return null;
      if (where.Email || where.email) {
        const target = (where.Email || where.email).toLowerCase();
        return users.find((u: any) => u.Email?.toLowerCase() === target || u.email?.toLowerCase() === target) || null;
      }
      if (where.UserID || where.UserId || where.userId || where.id) {
        const target = where.UserID || where.UserId || where.userId || where.id;
        return users.find((u: any) => u.UserID === target || u.UserId === target || u.userId === target) || null;
      }
      return null;
    },
    create: async ({ data }: any) => {
      const payload: any = {
        username: data.Username || data.username,
        email: data.Email || data.email,
        passHash: data.PassHash || data.passHash || 'dummy',
        ghOAuth: data.GHOAuth || data.ghOAuth || null,
        role: toSchemaRole(data.Role || data.role)
      };
      return await fetchJava('/users', { method: 'POST', body: JSON.stringify(payload) });
    },
    update: async ({ where, data }: any) => {
      const userId = where.UserID || where.UserId || where.userId || where.id;
      if (data.Role || data.role) {
        const schemaRole = toSchemaRole(data.Role || data.role);
        return await fetchJava(`/users/${userId}/role`, {
          method: 'PUT',
          body: JSON.stringify({ role: schemaRole })
        });
      }
      if (data.GHOAuth || data.ghOAuth !== undefined) {
        return await fetchJava(`/users/${userId}`, {
          method: 'PUT',
          body: JSON.stringify({ ghOAuth: data.GHOAuth || data.ghOAuth })
        });
      }
      return null;
    },
    findMany: async (args?: any) => {
      const users = await fetchJava('/users') || [];
      return users;
    }
  },
  repo: {
    findFirst: async (args?: any) => {
      const repos = await fetchJava('/repos');
      if (!repos || repos.length === 0) return null;
      const issues = await fetchJava('/issues') || [];
      const commits = await fetchJava('/commits') || [];
      const r = repos[0];
      const repoIssues = issues.filter((i: any) => i.RepoID === r.RepoID || i.repoId === r.RepoID);
      const repoCommits = commits.filter((c: any) => c.RepoID === r.RepoID || c.repoId === r.RepoID);
      return { ...r, _count: { Issues: repoIssues.length, Commits: repoCommits.length } };
    },
    findMany: async (args?: any) => {
      let repos = await fetchJava('/repos') || [];
      if (args?.where?.SpaceID || args?.where?.spaceId) {
        const sid = args.where.SpaceID || args.where.spaceId;
        repos = repos.filter((r: any) => r.SpaceID === sid || r.spaceId === sid);
      }
      
      let issues: any[] = [];
      let commits: any[] = [];
      if (args?.include?._count) {
         issues = await fetchJava('/issues') || [];
         commits = await fetchJava('/commits') || [];
      }

      return repos.map((r: any) => {
        let counts = { Issues: 0, Commits: 0 };
        if (args?.include?._count) {
          counts.Issues = issues.filter((i: any) => i.RepoID === r.RepoID || i.repoId === r.RepoID).length;
          counts.Commits = commits.filter((c: any) => c.RepoID === r.RepoID || c.repoId === r.RepoID).length;
        }
        return {
          ...r,
          _count: counts
        };
      });
    },
    findUnique: async (args?: any) => {
      const repos = await fetchJava('/repos');
      if (!repos) return null;
      let r = null;
      if (args?.where?.RepoID || args?.where?.repoId || args?.where?.id) {
        const rid = args.where.RepoID || args.where.repoId || args.where.id;
        r = repos.find((item: any) => item.RepoID === rid || item.repoId === rid) || null;
      } else {
        r = repos[0] || null;
      }
      
      if (!r) return null;
      
      const issues = await fetchJava('/issues') || [];
      const commits = await fetchJava('/commits') || [];
      const repoIssues = issues.filter((i: any) => i.RepoID === r.RepoID || i.repoId === r.RepoID);
      const repoCommits = commits.filter((c: any) => c.RepoID === r.RepoID || c.repoId === r.RepoID);
      
      return { ...r, _count: { Issues: repoIssues.length, Commits: repoCommits.length } };
    },
    create: async ({ data }: any) => {
      const payload: any = {
        spaceId: data.SpaceID || data.SpaceId || data.spaceId,
        ghOwner: data.GHOwner || data.ghOwner,
        ghName: data.GHName || data.ghName,
        defaultBranch: data.DefaultBranch || data.defaultBranch || 'main',
        isPrivate: data.IsPrivate ?? data.isPrivate ?? false,
        importedBy: data.ImportedBy || data.importedBy,
      };
      if (data.FileTree || data.fileTree) {
        payload.fileTree = typeof (data.FileTree || data.fileTree) === 'string'
          ? (data.FileTree || data.fileTree)
          : JSON.stringify(data.FileTree || data.fileTree);
      }
      if (data.PAT || data.pat) payload.pat = data.PAT || data.pat;
      return await fetchJava('/repos', { method: 'POST', body: JSON.stringify(payload) });
    }
  },
  commit: {
    findMany: async (args?: any) => {
      const commits = await fetchJava('/commits') || [];
      const mapped = commits.map((c: any) => ({ ...c, SHA: c.CommitID || c.commitId }));
      if (args?.where?.RepoID || args?.where?.repoId) {
        const rid = args.where.RepoID || args.where.repoId;
        if (typeof rid === 'object' && rid !== null && rid.in) {
          return mapped.filter((c: any) => rid.in.includes(c.RepoID) || rid.in.includes(c.repoId));
        }
        return mapped.filter((c: any) => c.RepoID === rid || c.repoId === rid);
      }
      return mapped;
    },
    createMany: async (args?: any) => {
      const { data } = args;
      const created = [];
      for (const item of data) {
        const payload: any = {
          commitId: item.CommitID || item.CommitId || item.commitId || item.SHA || item.sha,
          repoId: item.RepoID || item.RepoId || item.repoId,
          message: item.Message || item.message,
          authorName: item.AuthorName || item.authorName,
          authorEmail: item.AuthorEmail || item.authorEmail,
          committedAt: item.CommittedAt || item.committedAt,
          url: item.URL || item.url || item.Url,
        };
        const res = await fetchJava('/commits', { method: 'POST', body: JSON.stringify(payload) });
        if (res) created.push(res);
      }
      return { count: created.length };
    }
  },
  issues: {
    findMany: async (args?: any) => {
      let issues = await fetchJava('/issues') || [];
      if (args?.where) {
        const w = args.where;
        if (w.Status) issues = issues.filter((i: any) => i.Status === w.Status || i.status === w.Status);
        if (w.Severity) issues = issues.filter((i: any) => i.Severity === w.Severity || i.severity === w.Severity);
        if (w.AssigneeID || w.AssigneeId) {
          const aid = w.AssigneeID || w.AssigneeId;
          issues = issues.filter((i: any) => i.AssigneeID === aid || i.AssigneeId === aid);
        }
        if (w.RepoID || w.RepoId) {
          const rid = w.RepoID || w.RepoId;
          issues = issues.filter((i: any) => i.RepoID === rid || i.RepoId === rid);
        }
      }
      return issues;
    },
    findUnique: async ({ where }: any) => {
      const id = where.IssueID || where.IssueId || where.id;
      return await fetchJava(`/issues/${id}`);
    },
    create: async ({ data }: any) => {
      const payload: any = {
        spaceId: data.SpaceID || data.SpaceId || data.spaceId,
        reporterId: data.ReporterID || data.ReporterId || data.reporterId,
        assigneeId: data.AssigneeID || data.AssigneeId || data.assigneeId || null,
        title: data.Title || data.title,
        description: data.Description || data.description || data.desc,
        status: data.Status || data.status || 'Open',
        repoId: data.RepoID || data.RepoId || data.repoId || null,
        commitId: data.CommitID || data.CommitId || data.commitId || null,
        severity: data.Severity || data.severity || 'Medium',
        bugType: data.BugType || data.bugType || 'Functional',
        filePath: data.FilePath || data.filePath || null,
        lineRange: data.LineRange || data.lineRange || null,
        deadline: data.Deadline || data.deadline || null
      };
      return await fetchJava('/issues', { method: 'POST', body: JSON.stringify(payload) });
    },
    update: async ({ where, data }: any) => {
      const id = where.IssueID || where.IssueId || where.id;
      return await fetchJava(`/issues/${id}`, { method: 'PUT', body: JSON.stringify(mapKeysToCamelCase(data)) });
    }
  },
  space: {
    findFirst: async (args?: any) => {
      const spaces = await fetchJava('/spaces');
      if (!spaces || spaces.length === 0) return null;
      if (args?.where?.OwnerId || args?.where?.OwnerID) {
        const oid = args.where.OwnerId || args.where.OwnerID;
        return spaces.find((s: any) => s.OwnerId === oid || s.OwnerID === oid) || null;
      }
      return spaces[0];
    },
    findMany: async (args?: any) => {
      const spaces = await fetchJava('/spaces');
      if (!spaces) return [];
      if (args?.where?.OwnerId || args?.where?.OwnerID) {
        const oid = args.where.OwnerId || args.where.OwnerID;
        return spaces.filter((s: any) => s.OwnerId === oid || s.OwnerID === oid);
      }
      return spaces;
    },
    findUnique: async ({ where }: any) => {
      if (where?.SpaceId || where?.SpaceID || where?.id) {
        const spaces = await fetchJava('/spaces');
        const id = where.SpaceId || where.SpaceID || where.id;
        return spaces?.find((s: any) => s.SpaceId === id || s.SpaceID === id) || null;
      }
      return null;
    },
    create: async ({ data }: any) => {
      const payload: any = {
        spaceName: data.SpaceName || data.spaceName || data.name,
        ownerId: data.OwnerId || data.OwnerID || data.ownerId
      };
      return await fetchJava('/spaces', { method: 'POST', body: JSON.stringify(payload) });
    },
  },
  auditLog: {
    create: async ({ data }: any) => {
      const payload = mapKeysToCamelCase(data);
      return await fetchJava('/audit', { method: 'POST', body: JSON.stringify(payload) });
    },
    findMany: async (args?: any) => {
      let path = '/audit';
      const params = new URLSearchParams();
      if (args?.where?.SpaceID || args?.where?.spaceId) params.set('spaceId', args.where.SpaceID || args.where.spaceId);
      if (args?.where?.IssueID || args?.where?.issueId) params.set('issueId', args.where.IssueID || args.where.issueId);
      const qs = params.toString();
      if (qs) path += `?${qs}`;
      return await fetchJava(path) || [];
    }
  },
  inbox: {
    findMany: async (args?: any) => {
      const uid = args?.where?.UserID || args?.where?.UserId;
      if (uid) {
        return await fetchJava(`/inbox?userId=${uid}`) || [];
      }
      return [];
    },
    findUnique: async (args?: any) => null,
    update: async ({ where, data }: any) => {
      const id = where.NotifID || where.NotifId || where.id;
      if (data?.IsRead) {
        return await fetchJava(`/inbox/${id}`, { method: 'PATCH' });
      }
      return null;
    }
  },
  $transaction: async (cb: any) => {
    return cb(prisma);
  }
};
