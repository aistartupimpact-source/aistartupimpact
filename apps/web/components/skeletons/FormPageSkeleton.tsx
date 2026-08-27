export default function FormPageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 animate-pulse">
      <div className="text-center mb-8">
        <div className="h-8 w-52 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto mb-3" />
        <div className="h-4 w-72 max-w-full bg-gray-200 dark:bg-gray-800 rounded mx-auto" />
      </div>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 sm:p-8 space-y-5">
        {[...Array(4)].map((_, i) => (
          <div key={i}>
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
            <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded-lg" />
          </div>
        ))}
        <div className="h-24 w-full bg-gray-100 dark:bg-gray-800 rounded-lg" />
        <div className="h-11 w-full bg-gray-200 dark:bg-gray-800 rounded-xl" />
      </div>
    </div>
  );
}
