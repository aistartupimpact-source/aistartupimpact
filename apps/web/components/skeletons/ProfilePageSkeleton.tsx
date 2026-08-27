export default function ProfilePageSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-pulse">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
        <div className="space-y-2">
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-4 w-56 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i}>
            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
            <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
