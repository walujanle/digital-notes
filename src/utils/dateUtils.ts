/**
 * Format a date string based on requested format type
 * @param dateString ISO format date string
 * @param format Format type - 'full' (default), 'relative', or 'time'
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string,
  format: "full" | "relative" | "time" = "full"
): string {
  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    if (format === "relative") {
      // Calculate relative time
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffSec < 60) {
        return "Just now";
      } else if (diffMin < 60) {
        return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
      } else if (diffHour < 24) {
        return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
      } else if (diffDay < 7) {
        return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
      }
    }

    if (format === "time") {
      // Return only time part
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    // Default format: DD-MM-YYYY Time UTC+8
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    // Convert to UTC+8 (Singapore/Malaysia time)
    const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
    const utc8Time = new Date(utcTime + 8 * 3600000);

    const hours = utc8Time.getHours().toString().padStart(2, "0");
    const minutes = utc8Time.getMinutes().toString().padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes} UTC+8`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Date error";
  }
}
