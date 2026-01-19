/**
 * Navigation component - Simple header for the app
 */

export default function Navigation() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">SDGE NBT Export Rate Tool</h1>
          </div>
        </div>
      </div>
    </nav>
  );
}
