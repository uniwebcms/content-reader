/**
 * @fileoverview Main parser orchestration
 */

const { parseBlock } = require("./block");
const { isEyebrowPattern, parseEyebrowPattern } = require("./patterns");
const { isEmptyContent } = require("./utils");

/**
 * Parse markdown content into ProseMirror document structure
 * @param {Array} tokens - Array of marked tokens
 * @param {Object} schema - ProseMirror schema
 * @returns {Object} ProseMirror document
 */
function parseMarkdownContent(tokens, schema) {
    const content = [];
    let skipNext = false;
    console.log("tokens:", tokens);
    for (let i = 0; i < tokens.length; i++) {
        if (skipNext) {
            skipNext = false;
            continue;
        }

        // Handle eyebrow pattern
        // if (isEyebrowPattern(tokens, i)) {
        //   content.push(...parseEyebrowPattern(tokens, i, schema));
        //   skipNext = true;
        //   continue;
        // }

        const node = parseBlock(tokens[i], schema);
        if (node) {
            if (Array.isArray(node)) {
                content.push(...node);
            } else {
                content.push(node);
            }
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
};
