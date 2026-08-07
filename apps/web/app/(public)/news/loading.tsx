export default function NewsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-0 sm:px-2 lg:px-4 py-6 sm:py-10 animate-pulse">
      {/* Header */}
      <div className="mb-4 sm:mb-8 px-4 sm:px-0">
        <div className="h-9 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2" />
        <div className="h-5 w-96 bg-gray-200 dark:bg-gray-800 rounded-lg" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-10">
        {/* Main column */}
        <div className="flex-1 min-w-0">
          {/* Filter tabs */}
          <div className="flex gap-2 mb-6 px-4 sm:px-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
            ))}
          </div>

          {/* Article list */}
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="flex-1">
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                  <div className="h-5 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-3" />
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-200 dark:bg-gray-800 rounded-full" />
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
                  </div>
                </div>
                <div className="w-28 h-20 bg-gray-200 dark:bg-gray-800 rounded-lg shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-6">
          {/* Newsletter */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
            <div className="h-5 w-28 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mb-4" />
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </div>
          {/* Quick Links */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
              ))}
            </div>
          </div>
          {/* Trending */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
            <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-6 h-6 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-4 flex-1 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
