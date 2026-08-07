export default function HomeLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      {/* Hero */}
      <div className="h-[340px] bg-gray-200 dark:bg-gray-800 rounded-2xl mb-8" />

      {/* Stats bar */}
      <div className="flex gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 h-20 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        ))}
      </div>

      {/* Content sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
