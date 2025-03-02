/**
 * Utility functions for handling formatted content
 */

/**
 * Extract plain text from HTML content while preserving basic structure
 * @param html HTML content to convert to plain text
 * @returns Plain text with some structure preserved
 */
export function htmlToPlainText(html: string): string {
  if (!html) return "";

  // Create a DOM parser to properly handle HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Function to traverse nodes and preserve structure
  function processNode(node: Node): string {
    // Text node - return its content
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }

    // Element node - handle specially based on tag
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tag = element.tagName.toLowerCase();
      let result = "";

      // Handle specific elements
      switch (tag) {
        case "br":
          return "\n";
        case "p":
        case "div":
          result = processChildren(node) + "\n";
          break;
        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
          result = processChildren(node) + "\n\n";
          break;
        case "ul":
        case "ol":
          result = "\n" + processChildren(node) + "\n";
          break;
        case "li":
          result = "• " + processChildren(node) + "\n";
          break;
        default:
          result = processChildren(node);
      }

      return result;
    }

    // Other node types - process children
    return processChildren(node);
  }

  function processChildren(node: Node): string {
    let result = "";
    for (let i = 0; i < node.childNodes.length; i++) {
      result += processNode(node.childNodes[i]);
    }
    return result;
  }

  // Process the entire document and clean up
  const text = processNode(doc.body);
  return text
    .replace(/\n{3,}/g, "\n\n") // Remove excess line breaks
    .trim();
}

/**
 * Check if HTML has formatting (not just plain text)
 * @param html HTML content to check
 * @returns Boolean indicating if content has formatting
 */
export function hasHtmlFormatting(html: string): boolean {
  if (!html) return false;

  // Check for common HTML tags (excluding simple line breaks which might be in plain text)
  const formattingRegex = /<(?!br\s*\/?>)[a-z][\s\S]*>/i;
  return formattingRegex.test(html);
}

/**
 * Generates a preview of HTML content
 * @param html HTML content to preview
 * @param maxLength Maximum length of the preview text
 * @returns Object containing preview text and formatting status
 */
export function getHtmlPreview(
  html: string,
  maxLength = 150
): { text: string; hasFormatting: boolean } {
  const hasFormatting = hasHtmlFormatting(html);
  const plainText = htmlToPlainText(html);

  // Truncate text if needed
  const text =
    plainText.length > maxLength
      ? plainText.substring(0, maxLength) + "..."
      : plainText;

  return { text, hasFormatting };
}
