export default function EventsLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        <div className="h-9 w-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
      </div>

      {/* Search bar */}
      <div className="h-11 bg-gray-200 dark:bg-gray-800 rounded-xl mb-4" />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
        ))}
      </div>

      {/* Event cards - stacked list */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 flex gap-4">
            {/* Date block */}
            <div className="w-14 h-16 bg-gray-200 dark:bg-gray-800 rounded-lg shrink-0" />
            {/* Event info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-5 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-5 w-14 bg-gray-200 dark:bg-gray-800 rounded-full shrink-0" />
              </div>
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
              <div className="flex items-center gap-3">
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
