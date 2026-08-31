function normalizeArticleSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

export function createArticle(title) {
  return { title, slug: normalizeArticleSlug(title) };
}
