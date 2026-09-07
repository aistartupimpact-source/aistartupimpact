export default function ToolsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-pulse">
      {/* Header with button */}
      <div className="mb-8 sm:mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 mb-4">
          <div>
            <div className="h-9 w-80 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2" />
            <div className="h-5 w-96 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </div>
          <div className="h-10 w-36 bg-gray-200 dark:bg-gray-800 rounded-xl shrink-0" />
        </div>

        {/* Popular filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-3 w-14 bg-gray-200 dark:bg-gray-800 rounded" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-7 w-24 bg-gray-100 dark:bg-gray-800 rounded-full" />
          ))}
        </div>
      </div>

      {/* Discovery sections */}
      <div className="mb-8">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                <div className="flex-1">
                  <div className="h-5 w-28 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
              </div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2" />
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded mb-3" />
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
                <div className="h-6 w-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Browse by Category */}
      <div className="mb-8">
        <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
