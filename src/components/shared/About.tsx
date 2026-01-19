/**
 * About section - Appears at the top of the page
 */

export default function About() {
  return (
    <div className="bg-blue-50 border-b border-blue-100">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            This is a tool for visualizing and exploring SDGE NBT export pricing.
            Make sure that you select the correct contract year, using the menu in
            the top right.
          </p>
          <p className="text-xs text-gray-600">
            <strong>Data Source:</strong>{' '}
            <a
              href="https://www.sdge.com/solar/solar-billing-plan/export-pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              SDGE Solar Billing Plan - Export Pricing
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
