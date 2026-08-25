export default function OpinionsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10 animate-pulse">
      {/* Hero */}
      <div className="mb-5 sm:mb-8">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-5 h-5 sm:w-7 sm:h-7 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-6 sm:h-8 w-52 sm:w-72 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        </div>
        <div className="h-4 w-64 sm:w-96 bg-gray-200 dark:bg-gray-800 rounded mt-2" />
      </div>

      {/* Topic pills */}
      <div className="flex gap-2 mb-6 sm:mb-8 overflow-hidden">
        {[8, 14, 12, 16, 10].map((w, i) => (
          <div key={i} className="h-9 sm:h-7 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" style={{ width: `${w * 6}px` }} />
        ))}
      </div>

      {/* Featured section */}
      <div className="mb-8 sm:mb-14">
        <div className="h-6 sm:h-7 w-44 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4 sm:mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 border border-gray-200 dark:border-gray-700">
          {[...Array(2)].map((_, i) => (
            <div key={i} className={`bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 ${i === 0 ? 'border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-700' : ''}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-3 w-12 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
              <div className="h-5 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2" />
              <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-3" />
              <div className="h-4 w-full bg-gray-100 dark:bg-gray-800/50 rounded mb-1" />
              <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-800/50 rounded mb-3" />
              <div className="flex items-center gap-2">
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Latest section */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="flex-1 min-w-0">
          <div className="h-6 sm:h-7 w-36 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4 sm:mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 border border-gray-200 dark:border-gray-700">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 ${i < 5 ? 'border-b border-gray-200 dark:border-gray-700' : ''} ${i % 2 === 0 ? 'sm:border-r border-gray-200 dark:border-gray-700' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-12 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-3 w-14 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
                <div className="h-5 w-full bg-gray-200 dark:bg-gray-800 rounded mb-1.5" />
                <div className="h-5 w-2/3 bg-gray-200 dark:bg-gray-800 rounded mb-3" />
                <div className="h-4 w-full bg-gray-100 dark:bg-gray-800/50 rounded mb-2" />
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar skeleton */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-6 sm:space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-7 h-7 bg-gray-200 dark:bg-gray-800 rounded shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                    <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded mb-1.5" />
                    <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800/50 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="h-5 w-28 bg-gray-200 dark:bg-gray-800 rounded-lg mb-3" />
            <div className="flex gap-2.5 overflow-hidden sm:grid sm:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="shrink-0 w-[140px] sm:w-auto border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-2">
                  <div className="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-gray-200 dark:bg-gray-800" />
                  <div>
                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                    <div className="h-2.5 w-12 bg-gray-100 dark:bg-gray-800/50 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
