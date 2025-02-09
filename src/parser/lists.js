/**
 * @fileoverview Parse markdown lists
 */

const { parseInline } = require("./inline");

/**
 * Parse list items recursively
 * @param {Array} items - Array of list item tokens
 * @param {Object} schema - ProseMirror schema
 * @returns {Array} Array of ProseMirror list item nodes
 */
function parseListItems(items, schema) {
  return items.map((item) => {
    const itemContent = [];

    // Extract the main content (excluding nested lists)
    const mainContent = item.tokens
      ? item.tokens.filter((t) => t.type !== "list")
      : [];
    if (mainContent.length > 0) {
      itemContent.push({
        type: "paragraph",
        content: mainContent.flatMap((t) => parseInline(t, schema)),
      });
    }

    // Handle nested lists
    const nestedLists = item.tokens
      ? item.tokens.filter((t) => t.type === "list")
      : [];
    for (const list of nestedLists) {
      itemContent.push({
        type: list.ordered ? "orderedList" : "bulletList",
        ...(list.ordered && { attrs: { start: list.start || 1 } }),
        content: parseListItems(list.items, schema),
      });
    }

    return {
      type: "listItem",
      content: itemContent,
    };
  });
}

/**
 * Parse list block
 * @param {Object} token - List token
 * @param {Object} schema - ProseMirror schema
 * @returns {Object} ProseMirror list node
 */
function parseList(token, schema) {
  return {
    type: token.ordered ? "orderedList" : "bulletList",
    ...(token.ordered && { attrs: { start: token.start || 1 } }),
    content: parseListItems(token.items, schema),
  };
}

module.exports = {
  parseList,
  parseListItems,
};
