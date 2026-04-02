/** TTL (seconds) — list changes often */
export const TTL_PRODUCTS_LIST = 60;

/** Single product payload */
export const TTL_PRODUCT_DETAIL = 120;

/** Category tree rarely changes */
export const TTL_CATEGORIES = 120;

export function productsListCacheKey(
  prefix: string,
  page: number,
  limit: number,
  search: string,
  categoryId: string,
): string {
  const s = search.trim() || '_';
  const c = categoryId || '_';
  return `${prefix}products:page:${page}:limit:${limit}:search:${encodeURIComponent(s)}:cat:${c}`;
}

export function productDetailCacheKey(prefix: string, productId: string): string {
  return `${prefix}product:${productId}`;
}

export function categoriesCacheKey(prefix: string): string {
  return `${prefix}categories`;
}
