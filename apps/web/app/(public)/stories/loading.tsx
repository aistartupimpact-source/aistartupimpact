export default function StoriesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-pulse">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="h-9 w-72 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2" />
        <div className="h-5 w-96 bg-gray-200 dark:bg-gray-800 rounded-lg" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
        {/* Main column */}
        <div className="flex-1 min-w-0">
          {/* Featured stories - 2 col */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
                <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-800" />
                <div className="p-4 sm:p-5">
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                  <div className="h-5 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-3" />
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="w-5 h-5 bg-gray-200 dark:bg-gray-800 rounded-full" />
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Story list items */}
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="w-24 h-20 bg-gray-200 dark:bg-gray-800 rounded-lg shrink-0" />
                <div className="flex-1">
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                  <div className="h-5 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                  <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
            <div className="h-5 w-28 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mb-4" />
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </div>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-3" />
            <div className="flex flex-wrap gap-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-7 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
              ))}
            </div>
          </div>
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
