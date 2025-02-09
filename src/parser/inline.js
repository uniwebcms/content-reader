/**
 * @fileoverview Parse inline markdown elements
 */

/**
 * Parse inline text to handle formatting markers
 * @param {string} text - Text content that might contain formatting markers
 * @param {Object} schema - ProseMirror schema
 * @returns {Array} Array of text nodes with marks
 */
function parseFormattedText(text, schema) {
  // Handle bold
  const boldMatch = text.match(/\*\*(.+?)\*\*/);
  if (boldMatch) {
    const [fullMatch, content] = boldMatch;
    const parts = text.split(fullMatch);
    return [
      ...parseInline({ type: "text", text: parts[0] }, schema),
      {
        type: "text",
        marks: [{ type: "bold" }],
        text: content,
      },
      ...parseInline({ type: "text", text: parts[1] }, schema),
    ].filter((part) => part.text !== "");
  }

  // Handle italic
  const italicMatch = text.match(/\*(.+?)\*/);
  if (italicMatch) {
    const [fullMatch, content] = italicMatch;
    const parts = text.split(fullMatch);
    return [
      ...parseInline({ type: "text", text: parts[0] }, schema),
      {
        type: "text",
        marks: [{ type: "italic" }],
        text: content,
      },
      ...parseInline({ type: "text", text: parts[1] }, schema),
    ].filter((part) => part.text !== "");
  }

  // Handle links
  const linkMatch = text.match(/\[(.+?)\]\((.+?)\)/);
  if (linkMatch) {
    const [fullMatch, content, href] = linkMatch;
    const parts = text.split(fullMatch);
    return [
      ...parseInline({ type: "text", text: parts[0] }, schema),
      {
        type: "text",
        marks: [
          {
            type: "link",
            attrs: {
              href,
              title: null,
            },
          },
        ],
        text: content,
      },
      ...parseInline({ type: "text", text: parts[1] }, schema),
    ].filter((part) => part.text !== "");
  }

  // Only return non-empty text nodes
  return text ? [{ type: "text", text }] : [];
}

/**
 * Parse inline content (text, bold, italic, etc.)
 * @param {Object} token - Marked token for inline content
 * @param {Object} schema - ProseMirror schema
 * @returns {Array} Array of ProseMirror inline nodes
 */
function parseInline(token, schema) {
  if (token.type === "text") {
    // Look for formatting markers in text
    if (
      token.text.includes("**") ||
      token.text.includes("*") ||
      (token.text.includes("[") && token.text.includes("]("))
    ) {
      return parseFormattedText(token.text, schema);
    }
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
