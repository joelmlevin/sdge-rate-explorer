/**
 * Footer component - Appears at the bottom of every page
 */

import { useState } from 'react';

export default function Footer() {
  const [showAbout, setShowAbout] = useState(false);
  const [showFaq, setShowFaq] = useState(false);

  return (
    <>
      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            <button
              onClick={() => setShowAbout(!showAbout)}
              className="hover:text-gray-900 transition-colors underline"
            >
              About This Tool
            </button>

            <a
              href="https://github.com/joelmlevin/sdge-rate-explorer"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 transition-colors"
            >
              GitHub
            </a>

            <a
              href="https://venmo.com/joelmlevin"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-gray-900 transition-colors"
            >
              <span className="text-base">☕</span> Buy Me a Coffee
            </a>

            <button
              onClick={() => setShowFaq(!showFaq)}
              className="hover:text-gray-900 transition-colors underline"
            >
              FAQ
            </button>

            <a
              href="https://github.com/joelmlevin/sdge-rate-explorer/discussions/categories/feature-requests"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 transition-colors"
            >
              Make a Recommendation
            </a>
          </div>
        </div>
      </footer>

      {/* About Modal */}
      {showAbout && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAbout(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">About This Tool</h2>
                <button
                  onClick={() => setShowAbout(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
                <p>
                  This is a tool for visualizing and exploring SDGE NBT export pricing.
                  Make sure that you select the correct contract year, using the menu in
                  the top right.
                </p>

                <p>
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

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">What is NBT?</h3>
                  <p>
                    Net Billing Tariff (NBT) is SDGE's solar billing plan that determines
                    how much you're compensated for exporting solar energy to the grid.
                    Your contract year (NBT23, NBT24, NBT25, or NBT26) depends on when you
                    submitted your solar application.
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">How to Use</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Select your contract year in the top-right dropdown</li>
                    <li>Navigate between Day, Week, Month, and Year views</li>
                    <li>Hover over rates to see detailed breakdowns</li>
                    <li>Click on dates to drill down into specific time periods</li>
                    <li>Use the year heatmap to identify patterns across the entire year</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {showFaq && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowFaq(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
                <button
                  onClick={() => setShowFaq(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="text-gray-700 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Which contract year should I use?
                  </h3>
                  <p>
                    Use the contract year that corresponds to when you submitted your
                    solar application to SDGE:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                    <li>NBT23: Applications submitted in 2023</li>
                    <li>NBT24: Applications submitted in 2024</li>
                    <li>NBT25: Applications submitted in 2025</li>
                    <li>NBT26: Applications submitted in 2026</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    What do the colors mean?
                  </h3>
                  <p>
                    Colors represent export rates from low to high:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                    <li><span className="text-purple-600 font-semibold">Purple</span>: Low rates (less favorable for exporting)</li>
                    <li><span className="text-teal-600 font-semibold">Teal</span>: Medium rates</li>
                    <li><span className="text-yellow-600 font-semibold">Yellow</span>: High rates (most favorable for exporting)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    More questions?
                  </h3>
                  <p>
                    Visit our{' '}
                    <a
                      href="https://github.com/joelmlevin/sdge-rate-explorer/discussions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      GitHub Discussions
                    </a>
                    {' '}to ask questions or suggest improvements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
