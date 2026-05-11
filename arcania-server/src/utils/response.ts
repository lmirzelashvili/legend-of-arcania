export function success<T>(data: T, meta?: Record<string, unknown>) {
  return { data, ...(meta ? { meta } : {}) };
}

export function paginated<T>(data: T[], total: number, page: number, pageSize: number) {
  return { data, meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
}
