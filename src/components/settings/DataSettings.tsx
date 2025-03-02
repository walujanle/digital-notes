import { useState } from "react";

interface DataSettingsProps {
  onExport: () => Promise<boolean>;
}

export default function DataSettings({ onExport }: DataSettingsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport();
      // Success is handled in parent
    } catch (error) {
      // Error is handled in parent
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-indigo-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Data & Backup
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Export your notes and account data or perform backups
        </p>
      </div>

      <div className="px-6 py-6">
        <div className="space-y-6">
          {/* Data Export Section */}
          <div className="bg-gray-50 dark:bg-dark-elevated/50 rounded-lg overflow-hidden">
            <div className="px-6 py-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Export Your Data
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Download all your notes and account information in JSON
                    format for backup or migration purposes
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isExporting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Preparing...
                      </>
                    ) : (
                      <>
                        <svg
                          className="-ml-1 mr-2 h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Export All Data
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Example of exported data */}
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-5">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Export includes:
              </h4>
              <ul className="mt-2 space-y-1.5 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                <li>All your notes with content and metadata</li>
                <li>Tags and categories</li>
                <li>Account information (except password)</li>
                <li>User preferences</li>
              </ul>

              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-secondary p-3 rounded border border-gray-200 dark:border-gray-700 font-mono">
                <div className="overflow-hidden text-ellipsis">
                  {`{
  "user": {
    "id": "user_123",
    "name": "User Name",
    "username": "username",
    "email": "user@example.com"
  },
  "notes": [
    {
      "id": "note_1",
      "title": "Sample Note",
      "content": "This is an example note content...",
      "tags": ["work", "important"],
      "color": "bg-yellow-100",
      "createdAt": "2023-05-15T09:24:57Z",
      "updatedAt": "2023-05-16T14:33:12Z"
    },
    ...
  ]
}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
