export type SchemaRole = 'Developer' | 'QAEngineer' | 'RepoImporter' | 'Admin';

export const SCHEMA_ROLES: SchemaRole[] = ['Developer', 'QAEngineer', 'RepoImporter', 'Admin'];

/**
 * Normalizes any role input (including UI display names, aliases, and lowercase variants)
 * to the exact canonical universal schema enum in DB/main.sql ('Developer' | 'QAEngineer' | 'RepoImporter' | 'Admin').
 */
export function toSchemaRole(role?: string | null): SchemaRole {
  if (!role) return 'Developer';
  const clean = role.toString().replace(/[\s_-]/g, '').toLowerCase();
  if (clean === 'developer') return 'Developer';
  if (clean === 'qaengineer' || clean === 'qa' || clean === 'qualityassurance') return 'QAEngineer';
  if (clean === 'repoimporter' || clean === 'repositoryimporter' || clean === 'importer') return 'RepoImporter';
  if (clean === 'admin' || clean === 'projectmanager' || clean === 'pm' || clean === 'superadmin') return 'Admin';
  return 'Developer';
}

/**
 * Converts a schema role into a user-friendly UI display label.
 */
export function toDisplayRole(role?: string | null): string {
  const schema = toSchemaRole(role);
  switch (schema) {
    case 'QAEngineer':
      return 'QA Engineer';
    case 'RepoImporter':
      return 'Repository Importer';
    case 'Admin':
      return 'Admin / Project Manager';
    case 'Developer':
    default:
      return 'Developer';
  }
}

export function isAdmin(role?: string | null): boolean {
  return toSchemaRole(role) === 'Admin';
}

export function isQA(role?: string | null): boolean {
  return toSchemaRole(role) === 'QAEngineer';
}

export function isImporter(role?: string | null): boolean {
  return toSchemaRole(role) === 'RepoImporter';
}

export function isDeveloper(role?: string | null): boolean {
  return toSchemaRole(role) === 'Developer';
}
