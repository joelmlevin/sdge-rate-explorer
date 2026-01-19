/**
 * About section - Appears at the top of the page
 */

export default function About() {
  return (
    <div className="bg-blue-50 border-b border-blue-100">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <p className="text-sm text-gray-700">
          This is a tool for visualizing and exploring{' '}
          <a
            href="https://www.sdge.com/solar/solar-billing-plan/export-pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            SDG&E NBT export pricing
          </a>
          . Make sure that you select the correct contract year, using the menu in the top right.
        </p>
      </div>
    </div>
  );
}
