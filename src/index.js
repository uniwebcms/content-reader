/**
 * @fileoverview Main entry point for the content-reader package.
 * Exports the main function to convert markdown to ProseMirror structure.
 */

const { parseMarkdown } = require("./parser");

/**
 * Convert markdown content to ProseMirror document structure
 * @param {string} markdown - The markdown content to parse
 * @returns {Object} ProseMirror document structure
 */
function markdownToProseMirror(markdown) {
  return parseMarkdown(markdown);
}

module.exports = {
  markdownToProseMirror,
};
