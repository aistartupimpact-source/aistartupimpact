export default function ToolsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      {/* Header */}
      <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2" />
      <div className="h-5 w-80 bg-gray-200 dark:bg-gray-800 rounded-lg mb-6" />

      {/* Filter/category bar */}
      <div className="flex gap-3 mb-8 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-9 w-24 bg-gray-200 dark:bg-gray-800 rounded-full shrink-0" />
        ))}
      </div>

      {/* Tools grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(9)].map((_, i) => (
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
  );
}
