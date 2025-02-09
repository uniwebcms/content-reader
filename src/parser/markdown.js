/**
 * @fileoverview Core markdown parsing functionality
 */

/**
 * Parse inline content (text, bold, italic, etc.)
 * @param {Object} token - Marked token for inline content
 * @param {Object} schema - ProseMirror schema
 * @returns {Array} Array of ProseMirror inline nodes
 */
function parseInline(token, schema) {
  if (token.type === "text") {
    return [{ type: "text", text: token.text }];
  }

  if (token.type === "strong") {
    return [
      {
        type: "text",
        marks: [{ type: "bold" }],
        text: token.text,
      },
    ];
  }

  if (token.type === "em") {
    return [
      {
        type: "text",
        marks: [{ type: "italic" }],
        text: token.text,
      },
    ];
  }

  if (token.type === "link") {
    const isButton = token.href.startsWith("button:");
    const href = isButton ? token.href.substring(7) : token.href;

    return [
      {
        type: "text",
        marks: [
          {
            type: isButton ? "button" : "link",
            attrs: {
              href,
              title: token.title || null,
              ...(isButton && { variant: "primary" }),
            },
          },
        ],
        text: token.text,
      },
    ];
  }

  if (token.type === "image") {
    const [role, src] = token.href.includes(":")
      ? token.href.split(":")
      : ["content", token.href];

    return [
      {
        type: "image",
        attrs: {
          src,
          alt: token.text || null,
          title: token.title || null,
          role,
        },
      },
    ];
  }

  // Handle unknown token types as plain text
  return [{ type: "text", text: token.raw }];
}

/**
 * Check if content is empty or whitespace-only
 * @param {Array} content - Array of inline content nodes
 * @returns {boolean}
 */
function isEmptyContent(content) {
  if (!content || content.length === 0) return true;

  if (content.length === 1) {
    const node = content[0];
    if (node.type === "text") {
      const text = node.text || "";
      return text.trim() === "";
    }
  }

  return false;
}

/**
 * Parse block level content (paragraphs, headings, etc.)
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

  // Fallback for unknown block types
  return null;
}

/**
 * Helper to check if tokens represent an eyebrow pattern
 * @param {Array} tokens - Array of tokens
 * @param {number} index - Current token index
 * @returns {boolean}
 */
function isEyebrowPattern(tokens, index) {
  return (
    tokens[index]?.type === "heading" &&
    tokens[index]?.depth === 3 &&
    tokens[index + 1]?.type === "heading" &&
    tokens[index + 1]?.depth === 1
  );
}

/**
 * Parse markdown content into ProseMirror document structure
 * @param {Array} tokens - Array of marked tokens
 * @param {Object} schema - ProseMirror schema
 * @returns {Object} ProseMirror document
 */
function parseMarkdownContent(tokens, schema) {
  const content = [];
  let skipNext = false;

  for (let i = 0; i < tokens.length; i++) {
    if (skipNext) {
      skipNext = false;
      continue;
    }

    // Handle eyebrow pattern
    if (isEyebrowPattern(tokens, i)) {
      content.push({
        type: "eyebrowHeading",
        content: tokens[i].tokens.flatMap((t) => parseInline(t, schema)),
      });
      skipNext = true;
      content.push({
        type: "heading",
        attrs: {
          level: 1,
          id: null,
        },
        content: tokens[i + 1].tokens.flatMap((t) => parseInline(t, schema)),
      });
      continue;
    }

    const node = parseBlock(tokens[i], schema);
    if (node) {
      content.push(node);
    }
  }

  // Filter out any remaining null nodes and empty paragraphs
  return {
    type: "doc",
    content: content.filter((node) => {
      if (!node) return false;
      if (node.type === "paragraph" && isEmptyContent(node.content))
        return false;
      return true;
    }),
  };
}

module.exports = {
  parseMarkdownContent,
  parseBlock,
  parseInline,
};
