import { GITHUB_REPOSITORY, OWNER, OWNER_WEBSITE } from "@/config";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Background gradient - already dark, but with slightly different tones for dark mode */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 via-indigo-800 to-gray-900 dark:from-indigo-950 dark:via-indigo-900 dark:to-slate-950"></div>

      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

        {/* Dot grid pattern - subtle background texture */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <svg
            className="h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 80 80"
          >
            <circle cx="4" cy="4" r="2" fill="currentColor" />
          </svg>
        </div>

        {/* Glowing orbs */}
        <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-indigo-500/10 dark:bg-indigo-400/15 blur-2xl"></div>
        <div className="absolute -bottom-32 -right-20 w-64 h-64 rounded-full bg-indigo-400/20 dark:bg-indigo-300/15 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 h-16 bg-indigo-600/10 dark:bg-indigo-400/15 blur-2xl rounded-full"></div>
      </div>

      {/* Content - Simplified to only copyright */}
      <div className="container relative mx-auto px-4 py-8 z-10">
        <div className="text-center">
          <p className="text-white text-sm">
            &copy; {new Date().getFullYear()},{" "}
            <a className="hover:underline" href={OWNER_WEBSITE}>
              {OWNER}
            </a>{" "}
            |{" "}
            <a className="hover:underline" href={GITHUB_REPOSITORY}>
              GitHub Repository
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
