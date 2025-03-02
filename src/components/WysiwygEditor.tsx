"use client";

import { useRef, useEffect, useState } from "react";

interface WysiwygEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

export default function WysiwygEditor({
  initialValue,
  onChange,
  placeholder = "Write your note content here...",
  minHeight = "12rem",
  className = "",
}: WysiwygEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    heading: false,
    bulletList: false,
    numberList: false,
  });

  // Flag to prevent issues with updates and cursor position
  const isUpdatingRef = useRef(false);

  // Keep track of the last valid selection
  const lastSelectionRef = useRef<Range | null>(null);

  // Sanitize the HTML content to remove unwanted styles and fix structure
  const sanitizeHtml = (html: string): string => {
    // Create a temporary div to manipulate the HTML
    const temp = document.createElement("div");
    temp.innerHTML = html;

    // Remove background colors and other unwanted styles
    const elementsWithStyle = temp.querySelectorAll("[style]");
    elementsWithStyle.forEach((el) => {
      // Keep only essential styles, remove bg colors, text colors from tailwind
      const style = el.getAttribute("style") || "";
      if (style.includes("background-color") || style.includes("--tw-")) {
        el.removeAttribute("style");
      }
    });

    // Fix invalid nesting (like <b> containing <ol>)
    const fixNestedBold = (element: Element) => {
      // Code remains the same
      const boldTags = element.querySelectorAll("b");
      boldTags.forEach((boldTag) => {
        // If bold contains block elements, we need to restructure
        const blockElements = boldTag.querySelectorAll(
          "ol, ul, p, h1, h2, h3, h4, h5, h6"
        );
        if (blockElements.length > 0) {
          // Get the parent of the bold tag
          const parent = boldTag.parentNode;
          if (parent) {
            // Move each block element outside the bold tag
            blockElements.forEach((block) => {
              // Make the text inside the block still bold
              const textNodes = Array.from(block.childNodes);
              textNodes.forEach((node) => {
                if (node.nodeType === Node.TEXT_NODE) {
                  const b = document.createElement("b");
                  b.textContent = node.textContent || "";
                  node.parentNode?.replaceChild(b, node);
                }
              });

              // Move the block outside the bold tag
              parent.insertBefore(block, boldTag);
            });

            // If the bold tag is now empty, remove it
            if (boldTag.innerHTML.trim() === "") {
              parent.removeChild(boldTag);
            }
          }
        }
      });
    };

    fixNestedBold(temp);

    // Remove empty paragraphs unless it's the only paragraph
    const paragraphs = temp.querySelectorAll("p");
    if (paragraphs.length > 1) {
      paragraphs.forEach((p) => {
        if (p.innerHTML.trim() === "" || p.innerHTML === "<br>") {
          p.parentNode?.removeChild(p);
        }
      });
    }

    // Ensure there's at least one paragraph
    if (temp.innerHTML.trim() === "") {
      temp.innerHTML = "<p><br></p>";
    }

    return temp.innerHTML;
  };

  // Initialize editor with content - ONLY ONCE on mount
  useEffect(() => {
    if (editorRef.current) {
      try {
        let cleanContent = "";

        if (initialValue) {
          // Handle escaped HTML
          let processedInitialValue = initialValue;
          if (initialValue.includes("\\u003C")) {
            processedInitialValue = initialValue
              .replace(/\\u003C/g, "<")
              .replace(/\\u003E/g, ">")
              .replace(/\\"/g, '"');
          }

          cleanContent = sanitizeHtml(processedInitialValue);
        }

        // Set the sanitized content
        editorRef.current.innerHTML = cleanContent || "<p><br></p>";
      } catch (error) {
        console.error("Error initializing editor content:", error);
        editorRef.current.innerHTML = "<p><br></p>";
      }
    }
    // Run this only once on mount with the initial value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save cursor position reliably
  const saveCurrentSelection = () => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return null;

    // Make sure the selection is inside our editor
    if (!selection.rangeCount) return null;

    const range = selection.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) return null;

    // Store this valid selection
    lastSelectionRef.current = range.cloneRange();
    return range.cloneRange();
  };

  // Restore cursor position
  const restoreSelection = (range: Range | null = null) => {
    const targetRange = range || lastSelectionRef.current;
    if (!targetRange || !editorRef.current) return;

    // Make sure the range points to nodes that still exist in the DOM
    if (
      !document.contains(targetRange.startContainer) ||
      !document.contains(targetRange.endContainer)
    ) {
      return;
    }

    try {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(targetRange);
      }
    } catch (error) {
      console.log("Failed to restore selection", error);
    }
  };

  // COMPLETELY REVAMPED input handler to fix cursor position issues
  useEffect(() => {
    const editorElement = editorRef.current;
    if (!editorElement) return;

    const handleInput = () => {
      // Prevent recursive updates that could cause cursor issues
      if (isUpdatingRef.current) return;

      // Set flag to prevent any other updates while we're processing
      isUpdatingRef.current = true;

      try {
        // Save current cursor position
        const savedRange = saveCurrentSelection();

        // Get current content and notify parent component
        const currentContent = editorElement.innerHTML;

        // We're only notifying the parent component of changes,
        // NOT modifying the DOM content here which would cause cursor issues
        onChange(currentContent);

        // Ensure cursor is restored to the right position
        if (savedRange) {
          restoreSelection(savedRange);
        }
      } finally {
        // Reset flag
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 0);
      }
    };

    // Track input events
    editorElement.addEventListener("input", handleInput);

    // Clean up
    return () => {
      editorElement.removeEventListener("input", handleInput);
    };
  }, [onChange]);

  // Format checking on selection change
  useEffect(() => {
    const checkFormattingState = () => {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        heading: isHeadingActive(),
        bulletList: document.queryCommandState("insertUnorderedList"),
        numberList: document.queryCommandState("insertOrderedList"),
      });
    };

    const isHeadingActive = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return false;

      const parentElement =
        selection.getRangeAt(0).startContainer.parentElement;
      return parentElement ? /^H[1-3]$/.test(parentElement.tagName) : false;
    };

    const handleSelectionChange = () => {
      // Save the current valid selection when it changes
      saveCurrentSelection();

      // Only check formatting if the selection is within our editor
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && editorRef.current) {
        const range = selection.getRangeAt(0);
        if (editorRef.current.contains(range.commonAncestorContainer)) {
          checkFormattingState();
        }
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  // Better execCommand that preserves cursor position
  const execCommand = (command: string, value: string = "") => {
    // Focus editor first
    if (editorRef.current) {
      editorRef.current.focus();
    }

    // Save selection
    const savedRange = saveCurrentSelection();

    // If there's no valid selection, restore the last known good one
    if (!savedRange && lastSelectionRef.current) {
      restoreSelection();
    }

    // Execute the command
    document.execCommand(command, false, value);

    // Get the updated content but don't modify the DOM
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }

    // Update active formats
    setActiveFormats({
      ...activeFormats,
      [command.toLowerCase()]: document.queryCommandState(command),
    });
  };

  // Format handlers remain the same
  const handleBold = () => execCommand("bold");
  const handleItalic = () => execCommand("italic");
  const handleUnderline = () => execCommand("underline");
  const handleHeading = () => {
    // Get current selection
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const currentNode = range.startContainer.parentElement;

    // Check if we're already in a heading
    if (currentNode && /^H[1-3]$/.test(currentNode.tagName)) {
      // Replace heading with paragraph
      execCommand("formatBlock", "p");
      setActiveFormats({ ...activeFormats, heading: false });
    } else {
      // Create heading
      execCommand("formatBlock", "h2");
      setActiveFormats({ ...activeFormats, heading: true });
    }
  };

  const handleBulletList = () => {
    execCommand("insertUnorderedList");
    setActiveFormats({
      ...activeFormats,
      bulletList: !activeFormats.bulletList,
      numberList: false,
    });
  };

  const handleNumberList = () => {
    execCommand("insertOrderedList");
    setActiveFormats({
      ...activeFormats,
      numberList: !activeFormats.numberList,
      bulletList: false,
    });
  };

  const handleClearFormatting = () => {
    execCommand("removeFormat");

    // If there's a current selection, we also need to ensure lists and headings are cleared
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      // Check if we're in a list or heading
      const parentElement = range.startContainer.parentElement;
      if (parentElement) {
        if (
          /^(UL|OL)$/.test(parentElement.tagName) ||
          /^(UL|OL)$/.test(parentElement.parentElement?.tagName || "")
        ) {
          document.execCommand("insertorderedlist", false, "");
          document.execCommand("insertunorderedlist", false, "");
        }

        if (/^H[1-6]$/.test(parentElement.tagName)) {
          document.execCommand("formatBlock", false, "p");
        }
      }
    }

    // Update active formats
    setActiveFormats({
      bold: false,
      italic: false,
      underline: false,
      heading: false,
      bulletList: false,
      numberList: false,
    });
  };

  // Component UI remains the same
  return (
    <div className={`wysiwyg-editor-container relative ${className}`}>
      {/* Toolbar UI - remains the same */}
      <div
        className="wysiwyg-main-toolbar flex items-center bg-white dark:bg-dark-secondary 
        border-b border-gray-200 dark:border-gray-700 p-1 mb-1 gap-1 
        rounded-t-lg overflow-x-auto overflow-y-hidden"
      >
        {/* Toolbar buttons - remain the same */}
        <button
          type="button"
          onClick={handleBold}
          className={`p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
            ${activeFormats.bold ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          title="Bold (Ctrl+B)"
        >
          {/* SVG icon - remains the same */}
          <svg
            className="w-4 h-4 text-gray-700 dark:text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"
            />
          </svg>
        </button>

        {/* Other toolbar buttons - remain the same */}
        <button
          type="button"
          onClick={handleItalic}
          className={`p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
            ${activeFormats.italic ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          title="Italic (Ctrl+I)"
        >
          <svg
            className="w-4 h-4 text-gray-700 dark:text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <line x1="19" y1="4" x2="10" y2="4"></line>
            <line x1="14" y1="20" x2="5" y2="20"></line>
            <line x1="15" y1="4" x2="9" y2="20"></line>
          </svg>
        </button>

        <button
          type="button"
          onClick={handleUnderline}
          className={`p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
            ${activeFormats.underline ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          title="Underline (Ctrl+U)"
        >
          <svg
            className="w-4 h-4 text-gray-700 dark:text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
            <line x1="4" y1="21" x2="20" y2="21"></line>
          </svg>
        </button>

        <div className="h-5 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

        <button
          type="button"
          onClick={handleHeading}
          className={`p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
            ${activeFormats.heading ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          title="Heading"
        >
          <svg
            className="w-4 h-4 text-gray-700 dark:text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleBulletList}
          className={`p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
            ${activeFormats.bulletList ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          title="Bullet List"
        >
          <svg
            className="w-4 h-4 text-gray-700 dark:text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </button>

        <button
          type="button"
          onClick={handleNumberList}
          className={`p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
            ${activeFormats.numberList ? "bg-gray-200 dark:bg-gray-600" : ""}`}
          title="Number List"
        >
          <svg
            className="w-4 h-4 text-gray-700 dark:text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <line x1="10" y1="6" x2="21" y2="6"></line>
            <line x1="10" y1="12" x2="21" y2="12"></line>
            <line x1="10" y1="18" x2="21" y2="18"></line>
            <path d="M4 6h1v4"></path>
            <path d="M4 10h2"></path>
            <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
          </svg>
        </button>

        <div className="h-5 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>

        <button
          type="button"
          onClick={handleClearFormatting}
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Clear formatting"
        >
          <svg
            className="w-4 h-4 text-gray-700 dark:text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h14"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 5l-6 14"
            />
          </svg>
        </button>
      </div>

      {/* Editor div with improved event handling */}
      <div
        ref={editorRef}
        className="wysiwyg-editor w-full rounded-b-lg border border-gray-300 dark:border-gray-600 
          bg-white dark:bg-dark-elevated text-gray-900 dark:text-white shadow-sm 
          focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 
          dark:focus:border-indigo-400 dark:focus:ring-indigo-400 p-3 overflow-y-auto prose dark:prose-invert 
          empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none"
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setIsToolbarVisible(true)}
        onBlur={() => setTimeout(() => setIsToolbarVisible(false), 200)}
        style={{ minHeight }}
        data-placeholder={placeholder}
        onKeyDown={() => {
          // Handle keydown events manually if needed for cursor position
          // This is a good place to add more keyboard shortcuts if needed
        }}
        onMouseUp={() => {
          // Explicitly save selection on mouse click
          saveCurrentSelection();
        }}
      />

      {/* Format indicator - remains the same */}
      <div
        className={`wysiwyg-indicator absolute bottom-4 right-4 text-xs 
          ${isToolbarVisible ? "opacity-100" : "opacity-0"} 
          transition-opacity duration-200 bg-gray-700/80 dark:bg-gray-900/80 
          text-white px-2 py-1 rounded-md shadow-sm backdrop-blur-sm`}
      >
        {/* Format indicator contents - remain the same */}
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              activeFormats.bold ? "bg-green-500" : "bg-gray-400"
            }`}
            title={activeFormats.bold ? "Bold is active" : "Bold is inactive"}
          ></div>
          <div
            className={`w-2 h-2 rounded-full ${
              activeFormats.italic ? "bg-green-500" : "bg-gray-400"
            }`}
            title={
              activeFormats.italic ? "Italic is active" : "Italic is inactive"
            }
          ></div>
          <div
            className={`w-2 h-2 rounded-full ${
              activeFormats.heading ? "bg-green-500" : "bg-gray-400"
            }`}
            title={
              activeFormats.heading
                ? "Heading is active"
                : "Heading is inactive"
            }
          ></div>
        </div>
      </div>
    </div>
  );
}
