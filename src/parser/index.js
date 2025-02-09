/**
 * @fileoverview Orchestrates the markdown parsing process to ProseMirror structure
 */

const { marked } = require("marked");
const { parseMarkdownContent } = require("./markdown");
const { getBaseSchema } = require("../schema");

/**
 * Parse markdown content into ProseMirror document structure
 * @param {string} markdown - Raw markdown content
 * @returns {Object} ProseMirror document structure
 */
function parseMarkdown(markdown) {
  // Get schema to validate against
  const schema = getBaseSchema();

  // Parse markdown to tokens using marked
  const tokens = marked.lexer(markdown);

  // Convert tokens to ProseMirror structure
  const doc = parseMarkdownContent(tokens, schema);

  return doc;
}

module.exports = {
  parseMarkdown,
};
