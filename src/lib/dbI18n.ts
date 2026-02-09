import type { TFunction } from "i18next";

export function dbKey(entity: string, id: string | number, field: string): string {
  return `db.${entity}.${id}.${field}`;
}

export function tDb(
  t: TFunction,
  entity: string,
  id: string | number,
  field: string,
  fallback: string
): string {
  return t(dbKey(entity, id, field), { defaultValue: fallback });
}
