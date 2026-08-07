export default function StartupsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      {/* Header */}
      <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2" />
      <div className="h-5 w-96 bg-gray-200 dark:bg-gray-800 rounded-lg mb-6" />

      {/* Search/filter bar */}
      <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl mb-8" />

      {/* Startup cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg" />
              <div className="flex-1">
                <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
            </div>
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2" />
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
