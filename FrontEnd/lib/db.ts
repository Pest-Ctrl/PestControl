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
        newObj[newKey] = obj[key];
      }
    }
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
        const newKey = key.charAt(0).toLowerCase() + key.slice(1);
        newObj[newKey] = obj[key];
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

// A drop-in replacement for prisma to proxy DB calls to the Java backend
export const prisma = {
  users: {
    findUnique: async ({ where }: any) => {
      const users = await fetchJava('/users');
      if (!users) return null;
      if (where.Email) return users.find((u: any) => u.Email === where.Email) || null;
      if (where.UserID) return users.find((u: any) => u.UserId === where.UserID || u.UserID === where.UserID) || null;
      return null;
    },
    create: async ({ data }: any) => await fetchJava('/users', { method: 'POST', body: JSON.stringify(mapKeysToCamelCase(data)) }),
    update: async ({ where, data }: any) => {
      if (data.Role) {
        return await fetchJava(`/users/${where.UserID || where.UserId}/role`, {
          method: 'PUT',
          body: JSON.stringify({ role: data.Role })
        });
      }
      return null;
    },
    findMany: async () => await fetchJava('/users') || []
  },
  repo: {
    findFirst: async () => { const repos = await fetchJava('/repos'); return repos ? repos[0] : null; },
    findMany: async () => await fetchJava('/repos') || [],
    findUnique: async () => { const repos = await fetchJava('/repos'); return repos ? repos[0] : null; },
    create: async ({ data }: any) => await fetchJava('/repos', { method: 'POST', body: JSON.stringify(mapKeysToCamelCase(data)) })
  },
  commit: {
    findMany: async () => await fetchJava('/commits') || [],
    createMany: async ({ data }: any) => { return []; }
  },
  issues: {
    findMany: async () => await fetchJava('/issues') || [],
    findUnique: async ({ where }: any) => await fetchJava(`/issues/${where.IssueID || where.IssueId}`),
    create: async ({ data }: any) => await fetchJava('/issues', { method: 'POST', body: JSON.stringify(mapKeysToCamelCase(data)) }),
    update: async ({ where, data }: any) => await fetchJava(`/issues/${where.IssueID || where.IssueId}`, { method: 'PUT', body: JSON.stringify(mapKeysToCamelCase(data)) })
  },
  space: {
    findFirst: async () => null,
    findUnique: async () => null
  },
  auditLog: {
    create: async () => null,
    findMany: async () => await fetchJava('/audit') || []
  },
  inbox: {
    findMany: async ({ where }: any) => {
      if (where?.UserID) {
        return await fetchJava(`/inbox?userId=${where.UserID}`) || [];
      }
      return [];
    },
    findUnique: async ({ where }: any) => null,
    update: async ({ where, data }: any) => {
      if (data?.IsRead) {
        return await fetchJava(`/inbox/${where.NotifID || where.NotifId}`, { method: 'PATCH' });
      }
      return null;
    }
  },
  $transaction: async (cb: any) => {
    return cb(prisma);
  }
};
