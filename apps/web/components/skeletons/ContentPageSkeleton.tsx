export default function ContentPageSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero section */}
      <div className="bg-gray-100 dark:bg-gray-800/50 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-4" />
          <div className="h-4 w-96 max-w-full bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
      {/* Content sections */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        {[...Array(3)].map((_, i) => (
          <div key={i}>
            <div className="h-6 w-44 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
