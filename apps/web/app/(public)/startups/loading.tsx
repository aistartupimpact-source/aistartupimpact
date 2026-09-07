export default function StartupsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-pulse">
      {/* Header with button */}
      <div className="mb-5 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
        <div>
          <div className="h-9 w-80 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2" />
          <div className="h-5 w-96 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-xl shrink-0" />
      </div>

      {/* Search bar */}
      <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl mb-4" />

      {/* Filter row */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-9 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        ))}
      </div>

      {/* Startup cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
            </div>
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2" />
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-3" />
            <div className="flex items-center gap-2">
              <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
              <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
