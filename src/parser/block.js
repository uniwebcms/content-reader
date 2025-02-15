/**
 * @fileoverview Parse block-level markdown elements
 */

const { marked } = require("marked");
const { parseInline } = require("./inline");
const { parseList } = require("./lists");
const { parseTable } = require("./tables");

/**
 * Process code block info string (e.g., "javascript:example.js")
 * @param {string} info - Code block info string
 * @returns {Object} Language and filename
 */
function processCodeInfo(info) {
  if (!info) return { language: null, filename: null };

  const parts = info.split(":");
  return {
    language: parts[0] || null,
    filename: parts[1] || null,
  };
}

/**
 * Clean code block text
 * @param {string} text - Raw code block text
 * @returns {string} Cleaned text
 */
function cleanCodeText(text) {
  // Remove common indent (for indented code blocks)
  const lines = text.split("\n");
  const indent = lines[0].match(/^\s*/)[0];
  return lines
    .map((line) => (line.startsWith(indent) ? line.slice(indent.length) : line))
    .join("\n")
    .trim();
}

/**
 * Parse a paragraph's content by tokenizing with marked
 * @param {Object} token - Marked token for paragraph
 * @param {Object} schema - ProseMirror schema
 * @returns {Array} Array of ProseMirror inline nodes
 */
function parseParagraph(token, schema) {
  // // Use marked's inline lexer to properly handle inline code
  // const inlineTokens = marked.Lexer.lexInline(token.text || token.raw);
  // return inlineTokens.flatMap((t) => parseInline(t, schema));

  // Use the pre-parsed tokens instead of re-lexing
  return token.tokens.flatMap((t) => parseInline(t, schema));
}

/**
 * Parse block level content
 * @param {Object} token - Marked token for block content
 * @param {Object} schema - ProseMirror schema
 * @returns {Object|null} ProseMirror block node or null if empty
 */
function parseBlock(token, schema) {
  // console.log("BLOCK TOKEN: ", token);
  // Skip HTML comments
  if (token.type === "html" && token.text.startsWith("<!--")) {
    return null;
  }

  if (token.type === "paragraph") {
    const content = parseParagraph(token, schema);
    if (!content.length) {
      return null;
    }

    return {
      type: "paragraph",
      content,
    };
  }

  if (token.type === "heading") {
    const headingContent = parseParagraph(token, schema);

    return {
      type: "heading",
      attrs: {
        level: token.depth,
        id: null,
      },
      content: headingContent,
    };
  }

  if (token.type === "hr") {
    return {
      type: "divider",
      attrs: { style: "line", size: "normal" },
    };
  }

  if (token.type === "code") {
    const { language, filename } = processCodeInfo(token.lang);
    return {
      type: "codeBlock",
      attrs: { language, filename },
      content: [
        {
          type: "text",
          text: cleanCodeText(token.text),
        },
      ],
    };
  }

  if (token.type === "list") {
    return parseList(token, schema);
  }

  if (token.type === "table") {
    return parseTable(token, schema);
  }

  // Handle unknown block types as null
  return null;
}

module.exports = {
  parseBlock,
  parseParagraph,
};
