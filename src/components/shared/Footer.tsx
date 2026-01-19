/**
 * Footer component - Appears at the bottom of every page
 */

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600">
          <a
            href="https://github.com/joelmlevin/sdge-rate-explorer"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 transition-colors hover:underline px-5 py-1"
          >
            GitHub
          </a>
          <span className="text-gray-400 mx-1">•</span>
          <a
            href="https://venmo.com/joelmlevin"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 transition-colors hover:underline px-5 py-1"
          >
            Support This Project
          </a>
          <span className="text-gray-400 mx-1">•</span>
          <a
            href="https://github.com/joelmlevin/sdge-rate-explorer/discussions/categories/feature-requests"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 transition-colors hover:underline px-5 py-1"
          >
            Make a Recommendation
          </a>
        </div>
      </div>
    </footer>
  );
}
