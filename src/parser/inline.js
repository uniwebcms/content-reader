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
    // Return the plan text version (the .text excludes special characters)
    return token.raw ? [{ type: "text", text: token.raw }] : [];
  }

  if (token.type === "strong" || token.type === "em") {
    const mark = { type: token.type === "strong" ? "bold" : "italic" };

    return token.tokens.flatMap((t) =>
      parseInline(t, schema).map((node) => ({
        ...node,
        marks: [...(node.marks || []), mark],
      }))
    );
  }

  if (token.type === "html") {
    // Handle HTML tokens however you need
    // You might want to strip the < > or process them differently
    return [{ type: "text", text: token.raw }];
  }

  // Decode HTML entities
  const text = token.text
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");

  if (token.type === "codespan") {
    return [
      {
        type: "text",
        marks: [{ type: "code" }],
        text,
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
        text,
      },
    ];
  }

  if (token.type === "image") {
    const [role, src] = token.href.includes(":")
      ? token.href.split(":")
      : ["image", token.href];

    return [
      {
        type: "image",
        attrs: {
          src,
          title: text || null,
          alt: token.title || null,
          role,
        },
      },
    ];
  }

  // Handle unknown token types as plain text
  return token.raw ? [{ type: "text", text: token.raw }] : [];
}

module.exports = {
  parseInline,
};
