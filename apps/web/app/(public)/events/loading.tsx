export default function EventsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-10 w-36 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2" />
      <div className="h-5 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg mb-6" />

      {/* Search/filter */}
      <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl mb-8" />

      {/* Event cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="h-40 bg-gray-200 dark:bg-gray-800" />
            <div className="p-4">
              <div className="h-5 w-40 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
              <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
