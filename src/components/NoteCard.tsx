import { formatDate } from "@/utils/dateUtils";
import { Note } from "@/services/noteService";

interface NoteCardProps {
  note: Note;
  onClick: () => void;
}

// Function to strip HTML tags for preview display
const stripHtml = (html: string): string => {
  // Create a temporary element
  const tempElement = document.createElement("div");
  tempElement.innerHTML = html;

  // Preserve line breaks and spacing in the output text
  const preserveLineBreaks = (node: Node): string => {
    if (node.nodeType === 3) return node.textContent || "";

    if (node.nodeType === 1) {
      const tagName = (node as Element).tagName.toLowerCase();
      let result = "";

      if (tagName === "br") return "\n";
      if (
        tagName === "p" ||
        tagName === "div" ||
        tagName === "h1" ||
        tagName === "h2" ||
        tagName === "h3" ||
        tagName === "h4" ||
        tagName === "h5" ||
        tagName === "h6" ||
        tagName === "li"
      ) {
        result += node.textContent + "\n";
        if (tagName === "p" || tagName.startsWith("h")) {
          result += "\n";
        }
        return result;
      }
    }

    let result = "";
    const childNodes = node.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
      result += preserveLineBreaks(childNodes[i]);
    }

    return result;
  };

  // Extract text and preserve formatting where appropriate
  const textContent = preserveLineBreaks(tempElement);

  // Clean up excess whitespace
  return textContent.replace(/\n{3,}/g, "\n\n").trim();
};

export default function NoteCard({ note, onClick }: NoteCardProps) {
  // Get plain text content for preview
  const plainContent = stripHtml(note.content);

  // Truncate content if it's too long
  const truncatedContent =
    plainContent.length > 150
      ? plainContent.substring(0, 150) + "..."
      : plainContent;

  return (
    <div
      className={`${
        note.color || "bg-white dark:bg-dark-secondary"
      } rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer group h-full flex flex-col`}
      onClick={onClick}
    >
      {/* Card header with gradient overlay */}
      <div className="p-5 pb-3 border-b border-gray-100 dark:border-gray-700/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/50 dark:bg-black/10"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 dark:via-indigo-400/30 to-transparent"></div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1 relative z-10 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
          {note.title}
        </h3>
      </div>

      {/* Card content - optimized preview */}
      <div className="p-5 flex-grow">
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line line-clamp-5 text-sm">
          {truncatedContent}
        </p>
      </div>

      {/* Card footer with metadata and tags */}
      <div className="px-5 py-3 bg-white/50 dark:bg-black/10 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
        <div className="flex items-center">
          <svg
            className="w-3.5 h-3.5 mr-1 opacity-70"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{formatDate(note.updatedAt, "relative")}</span>
        </div>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center">
            <span className="px-2 py-0.5 rounded-full text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
              {note.tags[0]}
              {note.tags.length > 1 && ` +${note.tags.length - 1}`}
            </span>
          </div>
        )}
      </div>

      {/* Enhanced hover effects */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-indigo-500/30 dark:group-hover:border-indigo-400/30 pointer-events-none transition-all duration-300 opacity-0 group-hover:opacity-100"></div>

      <div className="absolute top-3 right-3 bg-indigo-500/90 dark:bg-indigo-500/80 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-90 group-hover:scale-100 shadow-sm">
        <svg
          className="w-3 h-3 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      </div>
    </div>
  );
}
