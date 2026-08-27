export default function ListPageSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-pulse">
      <div className="h-8 w-52 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2" />
      <div className="h-4 w-80 max-w-full bg-gray-200 dark:bg-gray-800 rounded mb-8" />
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 dark:bg-gray-800 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
