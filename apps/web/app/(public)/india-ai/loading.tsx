export default function IndiaAILoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-10 w-56 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2" />
      <div className="h-5 w-96 bg-gray-200 dark:bg-gray-800 rounded-lg mb-8" />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        ))}
      </div>

      {/* Map placeholder */}
      <div className="h-[400px] bg-gray-200 dark:bg-gray-800 rounded-2xl mb-8" />

      {/* City cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
