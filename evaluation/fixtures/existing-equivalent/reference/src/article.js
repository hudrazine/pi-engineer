import { toSlug } from "./slug.js";

export function createArticle(title) {
  return { title, slug: toSlug(title) };
}
