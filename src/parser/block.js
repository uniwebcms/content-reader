/**
 * @fileoverview Parse block-level markdown elements
 */

const { parseInline } = require("./inline");
const { isEmptyContent } = require("./utils");
const { parseList } = require("./lists");

/**
 * Parse block level content
 * @param {Object} token - Marked token for block content
 * @param {Object} schema - ProseMirror schema
 * @returns {Object|null} ProseMirror block node or null if empty
 */
function parseBlock(token, schema) {
  // Skip HTML comments
  if (token.type === "html" && token.text.startsWith("<!--")) {
    return null;
  }

  if (token.type === "paragraph") {
    const content = token.tokens.flatMap((t) => parseInline(t, schema));
    if (isEmptyContent(content)) {
      return null;
    }

    return {
      type: "paragraph",
      content,
    };
  }

  if (token.type === "heading") {
    const headingContent = token.tokens.flatMap((t) => parseInline(t, schema));

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

  if (token.type === "list") {
    return parseList(token, schema);
  }

  // Fallback for unknown block types
  return null;
}

module.exports = {
  parseBlock,
};
