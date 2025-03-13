/**
 * @fileoverview Main entry point for the content-reader package.
 * Exports the main function to convert markdown to ProseMirror structure.
 */

const { marked } = require("marked");
const { parseMarkdownContent } = require("./parser");
const { getBaseSchema } = require("./schema");
const { isValidUniwebMarkdown } = require("./utils");

/**
 * Convert markdown content to ProseMirror document structure
 * @param {string} markdown - The markdown content to parse
 * @returns {Object} ProseMirror document structure
 */
function markdownToProseMirror(markdown) {
    const schema = getBaseSchema();
    const tokens = marked.lexer(markdown);
    return parseMarkdownContent(tokens, schema);
}

module.exports = {
    markdownToProseMirror,
    isValidUniwebMarkdown,
};
