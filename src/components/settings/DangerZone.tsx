import { useState } from "react";

interface DangerZoneProps {
  onDelete: (password: string) => Promise<boolean>;
}

export default function DangerZone({ onDelete }: DangerZoneProps) {
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (confirmText !== "delete my account") {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(password);
      // Success is handled in parent
    } catch (error) {
      // Error is handled in parent
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 flex items-center">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          Danger Zone
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Actions in this section can permanently delete your data
        </p>
      </div>

      <div className="px-6 py-6">
        <div className="rounded-lg overflow-hidden border border-red-200 dark:border-red-900/30">
          <div className="px-6 py-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Delete Account
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Permanently delete your account and all of your notes. This
                  action cannot be undone.
                </p>
              </div>
              <div className="flex-shrink-0">
                <button
                  onClick={() => setShowDeleteAccount(true)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-red-300 dark:border-red-700 rounded-lg shadow-sm text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-dark-secondary hover:bg-red-50 dark:hover:bg-red-900/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>

          {/* Delete Account Form */}
          {showDeleteAccount && (
            <div className="border-t border-red-200 dark:border-red-900/30 px-6 py-5 bg-red-50 dark:bg-red-900/10">
              <form onSubmit={handleDeleteAccount} className="space-y-5">
                <div>
                  <label
                    htmlFor="delete-password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Your Password
                  </label>
                  <div className="relative">
                    <input
                      id="delete-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password to confirm"
                      className="block w-full px-4 py-3 rounded-lg text-gray-900 dark:text-white border border-red-300 dark:border-red-700 bg-white dark:bg-dark-elevated focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-400 dark:focus:border-red-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                    >
                      {showPassword ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
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
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="delete-confirm"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Confirmation
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    To confirm deletion, type{" "}
                    <span className="font-medium text-red-600 dark:text-red-400">
                      &quot;delete my account&quot;
                    </span>{" "}
                    below:
                  </p>
                  <input
                    id="delete-confirm"
                    name="confirm"
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    required
                    placeholder="delete my account"
                    className="block w-full px-4 py-3 rounded-lg text-gray-900 dark:text-white border border-red-300 dark:border-red-700 bg-white dark:bg-dark-elevated focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-400 dark:focus:border-red-400"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteAccount(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-secondary text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      isDeleting ||
                      confirmText !== "delete my account" ||
                      !password
                    }
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {isDeleting ? (
                      <div className="flex items-center">
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
                        Deleting...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Permanently Delete Account
                      </div>
                    )}
                  </button>
                </div>

                <div className="text-xs text-red-600 dark:text-red-400 pt-2">
                  <p>
                    Warning: This action cannot be undone. All your notes and
                    account information will be permanently deleted.
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
