export default function IndiaAILoading() {
  return (
    <div className="max-w-7xl mx-auto px-0 sm:px-2 lg:px-4 py-4 sm:py-6 lg:py-10 animate-pulse">
      {/* Hero section - centered */}
      <div className="mb-8 sm:mb-12 lg:mb-16 text-center">
        <div className="h-6 w-44 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-3" />
        <div className="h-8 w-72 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto mb-3" />
        <div className="h-4 w-96 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto" />

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mt-6 sm:mt-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-5">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto mb-2" />
              <div className="h-7 w-20 bg-gray-200 dark:bg-gray-800 rounded mx-auto mb-1" />
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded mx-auto mb-1" />
              <div className="h-3 w-28 bg-gray-200 dark:bg-gray-800 rounded mx-auto" />
            </div>
          ))}
        </div>

        {/* Newsletter placeholder */}
        <div className="h-12 w-80 bg-gray-200 dark:bg-gray-800 rounded-xl mx-auto mt-6" />
      </div>

      {/* Map section */}
      <div className="mb-8 sm:mb-12 lg:mb-16">
        <div className="h-7 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto mb-3" />
        <div className="h-4 w-80 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto mb-8" />
        <div className="h-[400px] bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      </div>

      {/* Funding tracker section */}
      <div className="mb-8 sm:mb-12 lg:mb-16">
        <div className="h-7 w-52 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto mb-6" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg shrink-0" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
              <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Mission tracker section */}
      <div className="mb-12 sm:mb-16">
        <div className="h-7 w-56 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto mb-6" />
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 w-28 bg-gray-200 dark:bg-gray-800 rounded mx-auto mb-2" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded mx-auto" />
              </div>
            ))}
          </div>
          <div className="mt-6 h-3 bg-gray-200 dark:bg-gray-800 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800" />
          ))}
        </div>
      </div>
    </div>
  );
}
