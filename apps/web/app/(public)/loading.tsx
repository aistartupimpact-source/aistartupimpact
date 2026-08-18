export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      {/* Tagline bar */}
      <div className="bg-navy-900 text-center py-1 px-4">
        <div className="h-3 w-80 bg-gray-700 rounded mx-auto" />
      </div>

      {/* Hero carousel placeholder */}
      <div className="h-[340px] sm:h-[420px] bg-navy-900" />

      {/* Trending ticker */}
      <div className="bg-navy-900 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center gap-4">
          <div className="h-2 w-2 bg-gray-600 rounded-full shrink-0" />
          <div className="h-3 w-8 bg-gray-700 rounded shrink-0" />
          <div className="flex gap-8 flex-1 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-3 w-48 bg-gray-700 rounded shrink-0" />
            ))}
          </div>
        </div>
      </div>

      {/* Latest Stories section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="h-7 w-36 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-5 sm:p-6 border-b border-gray-200 dark:border-gray-700 sm:odd:border-r">
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded mb-3" />
              <div className="h-5 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2" />
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-3" />
              <div className="flex items-center gap-2">
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured tools / sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-7 w-40 bg-gray-200 dark:bg-gray-800 rounded-lg mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
