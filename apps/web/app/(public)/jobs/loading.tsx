export default function JobsLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-pulse">
      {/* Hero - centered */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="h-9 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto mb-2" />
        <div className="h-5 w-80 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto mb-4" />
        <div className="flex items-center justify-center gap-3">
          <div className="h-9 w-36 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded-full" />
        ))}
      </div>

      {/* Job list cards */}
      <div className="space-y-3 mt-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Company logo */}
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-xl shrink-0" />
            {/* Job info */}
            <div className="flex-1 min-w-0">
              <div className="h-5 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
              <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
              <div className="h-3 w-64 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
            {/* Meta badges */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
              <div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
