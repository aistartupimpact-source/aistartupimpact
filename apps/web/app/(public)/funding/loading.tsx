export default function FundingLoading() {
  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-6 sm:py-10 animate-pulse">
      {/* Header - centered */}
      <div className="mb-6 sm:mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-10 w-72 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        </div>
        <div className="h-4 w-96 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto mt-4" />
        {/* Stats bar */}
        <div className="h-4 w-80 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto mt-4" />
        {/* CTA button */}
        <div className="flex justify-center mt-6">
          <div className="h-12 w-52 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        </div>
      </div>

      {/* Dashboard - chart area */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 mb-6">
        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          ))}
        </div>
        {/* Chart placeholder */}
        <div className="h-[300px] bg-gray-100 dark:bg-gray-800 rounded-xl" />
      </div>

      {/* Funding table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="h-12 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-16 border-b border-gray-100 dark:border-gray-800 px-4 flex items-center gap-4">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-lg shrink-0" />
            <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="w-20 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="w-24 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="w-16 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
