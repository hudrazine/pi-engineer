import assert from "node:assert/strict";
import test from "node:test";
import { createArticle } from "../src/article.js";
import { toSlug } from "../src/slug.js";

test("uses the repository slug semantics", () => {
  assert.deepEqual(createArticle("  Hello, World!  "), {
    title: "  Hello, World!  ",
    slug: "hello-world",
  });
  assert.equal(toSlug("  Hello, World!  "), "hello-world");
});
