export default function FundingLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="h-10 w-72 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto mb-3" />
        <div className="h-5 w-96 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto mb-4" />
        <div className="h-5 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg mx-auto" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        ))}
      </div>

      {/* Funding table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="h-12 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-16 border-b border-gray-100 dark:border-gray-800 px-4 flex items-center gap-4">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="w-20 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="w-24 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
