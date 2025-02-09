/**
 * @fileoverview Parse inline markdown elements
 */

/**
 * Parse inline content (text, bold, italic, etc.)
 * @param {Object} token - Marked token for inline content
 * @param {Object} schema - ProseMirror schema
 * @returns {Array} Array of ProseMirror inline nodes
 */
function parseInline(token, schema) {
  if (token.type === "text") {
    return token.text ? [{ type: "text", text: token.text }] : [];
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

  if (token.type === "codespan") {
    return [
      {
        type: "text",
        marks: [{ type: "code" }],
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

  if (token.type === "html") {
    return [];
  }

  // Handle unknown token types as plain text
  return token.raw ? [{ type: "text", text: token.raw }] : [];
}

module.exports = {
  parseInline,
};
