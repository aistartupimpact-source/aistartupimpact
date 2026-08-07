export default function JobsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-10 w-40 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2" />
      <div className="h-5 w-72 bg-gray-200 dark:bg-gray-800 rounded-lg mb-6" />

      {/* Search bar */}
      <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl mb-8" />

      {/* Job cards */}
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg shrink-0" />
            <div className="flex-1">
              <div className="h-5 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-800 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
