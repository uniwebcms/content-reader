const { markdownToProseMirror } = require("../src");

describe("Basic Markdown Parsing", () => {
  test("parses simple paragraph", () => {
    const markdown = "Hello World";
    const result = markdownToProseMirror(markdown);

    expect(result).toEqual({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Hello World",
            },
          ],
        },
      ],
    });
  });

  test("parses basic formatting", () => {
    const markdown = "Some **bold** and *italic* text";
    const result = markdownToProseMirror(markdown);

    expect(result).toEqual({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Some " },
            { type: "text", text: "bold", marks: [{ type: "bold" }] },
            { type: "text", text: " and " },
            { type: "text", text: "italic", marks: [{ type: "italic" }] },
            { type: "text", text: " text" },
          ],
        },
      ],
    });
  });

  test("parses headings", () => {
    const markdown = "# Main Title\n## Subtitle";
    const result = markdownToProseMirror(markdown);

    expect(result).toEqual({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1, id: null },
          content: [{ type: "text", text: "Main Title" }],
        },
        {
          type: "heading",
          attrs: { level: 2, id: null },
          content: [{ type: "text", text: "Subtitle" }],
        },
      ],
    });
  });

  test("parses links", () => {
    const markdown = '[Link text](https://example.com "Title")';
    const result = markdownToProseMirror(markdown);

    expect(result).toEqual({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Link text",
              marks: [
                {
                  type: "link",
                  attrs: {
                    href: "https://example.com",
                    title: "Title",
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });
});

describe("Extended Syntax", () => {
  test("parses images with roles", () => {
    const markdown = '![Alt text](icon:path/to/image.svg "Title")';
    const result = markdownToProseMirror(markdown);

    expect(result).toEqual({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "image",
              attrs: {
                src: "path/to/image.svg",
                alt: "Alt text",
                title: "Title",
                role: "icon",
              },
            },
          ],
        },
      ],
    });
  });

  test("parses button links", () => {
    const markdown = "[Button Text](button:https://example.com)";
    const result = markdownToProseMirror(markdown);

    expect(result).toEqual({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Button Text",
              marks: [
                {
                  type: "button",
                  attrs: {
                    href: "https://example.com",
                    title: null,
                    variant: "primary",
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  //   test("parses eyebrow headings", () => {
  //     const markdown = "### Eyebrow\n# Main Title";
  //     const result = markdownToProseMirror(markdown);

  //     expect(result).toEqual({
  //       type: "doc",
  //       content: [
  //         {
  //           type: "eyebrowHeading",
  //           content: [{ type: "text", text: "Eyebrow" }],
  //         },
  //         {
  //           type: "heading",
  //           attrs: { level: 1, id: null },
  //           content: [{ type: "text", text: "Main Title" }],
  //         },
  //       ],
  //     });
  //   });

  test("parses dividers", () => {
    const markdown = "Text\n\n---\n\nMore text";
    const result = markdownToProseMirror(markdown);

    expect(result).toEqual({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Text" }],
        },
        {
          type: "divider",
          attrs: { style: "line", size: "normal" },
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "More text" }],
        },
      ],
    });
  });

  test("ignores HTML comments", () => {
    const markdown = "<!-- Comment -->\nText\n<!-- Another comment -->";
    const result = markdownToProseMirror(markdown);

    expect(result).toEqual({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Text" }],
        },
      ],
    });
  });
});
