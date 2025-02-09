/**
 * @fileoverview Base schema definition compatible with TipTap v2
 */

const baseNodes = {
  doc: {
    content: "block+",
  },

  paragraph: {
    content: "inline*",
    group: "block",
  },

  heading: {
    attrs: {
      level: { default: 1 },
      id: { default: null },
    },
    content: "inline*",
    group: "block",
  },

  eyebrowHeading: {
    content: "inline*",
    group: "block",
  },

  text: {
    group: "inline",
  },

  image: {
    attrs: {
      src: {},
      alt: { default: null },
      title: { default: null },
      role: { default: "content" },
    },
    group: "block inline",
  },

  divider: {
    attrs: {
      style: { default: "line" },
      size: { default: "normal" },
    },
    group: "block",
  },

  // List nodes
  bulletList: {
    content: "listItem+",
    group: "block",
  },

  orderedList: {
    attrs: {
      start: { default: 1 },
    },
    content: "listItem+",
    group: "block",
  },

  listItem: {
    content: "paragraph block*",
    defining: true,
  },
};

const baseMarks = {
  bold: {},
  italic: {},
  link: {
    attrs: {
      href: {},
      title: { default: null },
    },
  },
  button: {
    attrs: {
      href: {},
      title: { default: null },
      variant: { default: "primary" },
    },
  },
};

/**
 * Get the base schema definition
 * @returns {Object} Combined schema with nodes and marks
 */
function getBaseSchema() {
  return {
    nodes: baseNodes,
    marks: baseMarks,
  };
}

module.exports = {
  getBaseSchema,
};
