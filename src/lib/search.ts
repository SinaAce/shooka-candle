type SearchTerm = { contains: string };

function term(field: string, value: string): Record<string, SearchTerm> {
  return { [field]: { contains: value } };
}

export function splitSearchTerms(query?: string | null) {
  if (!query?.trim()) return [];
  return query.trim().split(/\s+/).filter(Boolean);
}

/** هر کلمه باید حداقل در یکی از فیلدها پیدا شود */
export function buildAndSearch<T extends Record<string, unknown>>(
  terms: string[],
  fieldsPerTerm: (term: string) => T[]
): { AND: { OR: T[] }[] } | undefined {
  if (terms.length === 0) return undefined;
  return {
    AND: terms.map((term) => ({ OR: fieldsPerTerm(term) })),
  };
}

export function buildProductSearchWhere(search?: string | null) {
  const terms = splitSearchTerms(search);
  return buildAndSearch(terms, (t) => [
    term("name", t),
    term("description", t),
    term("scent", t),
    term("slug", t),
    term("burnTime", t),
    term("weight", t),
    { category: term("name", t) },
  ]);
}

export function buildUserSearchWhere(search?: string | null) {
  const terms = splitSearchTerms(search);
  return buildAndSearch(terms, (t) => [
    term("name", t),
    term("email", t),
    term("phone", t),
    term("id", t),
    term("role", t),
  ]);
}

export function buildOrderSearchWhere(search?: string | null) {
  const terms = splitSearchTerms(search);
  return buildAndSearch(terms, (t) => [
    term("orderNumber", t),
    term("notes", t),
    term("status", t),
    term("paymentMethod", t),
    term("receiptStatus", t),
    { user: { OR: [term("name", t), term("email", t), term("phone", t)] } },
    {
      address: {
        OR: [
          term("fullName", t),
          term("phone", t),
          term("province", t),
          term("city", t),
          term("address", t),
          term("postalCode", t),
        ],
      },
    },
    { items: { some: term("name", t) } },
  ]);
}

export function buildAdminProductSearchWhere(search?: string | null) {
  const terms = splitSearchTerms(search);
  return buildAndSearch(terms, (t) => [
    term("name", t),
    term("description", t),
    term("scent", t),
    term("slug", t),
    { category: term("name", t) },
  ]);
}
