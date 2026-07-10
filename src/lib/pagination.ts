export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 40, 60] as const;

export function parsePagination(
  searchParams: URLSearchParams | Record<string, string | undefined>,
  defaultLimit = DEFAULT_PAGE_SIZE
) {
  const get = (key: string) =>
    searchParams instanceof URLSearchParams
      ? searchParams.get(key) ?? undefined
      : searchParams[key];

  const page = Math.max(1, parseInt(get("page") || "1", 10) || 1);
  const rawLimit = parseInt(get("limit") || String(defaultLimit), 10) || defaultLimit;
  const limit = Math.min(60, Math.max(1, rawLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function paginationMeta(total: number, page: number, limit: number) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
