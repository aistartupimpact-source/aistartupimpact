export default function StoriesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-10 w-52 bg-gray-200 dark:bg-gray-800 rounded-lg mb-6" />

      {/* Featured story */}
      <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-8" />

      {/* Story grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="h-40 bg-gray-200 dark:bg-gray-800" />
            <div className="p-4">
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
              <div className="h-5 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2" />
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
