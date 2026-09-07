export default function EventDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 mb-6">
        <div className="h-4 w-10 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-3 w-3 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-4 w-14 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-3 w-3 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>

      {/* Cover image / banner */}
      <div className="aspect-[21/9] bg-gray-200 dark:bg-gray-800 rounded-xl mb-6" />

      {/* Category + Format badges */}
      <div className="flex items-center gap-2 mb-3">
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
      </div>

      {/* Title */}
      <div className="h-8 sm:h-10 w-full bg-gray-200 dark:bg-gray-800 rounded-lg mb-2" />
      <div className="h-8 sm:h-10 w-2/3 bg-gray-200 dark:bg-gray-800 rounded-lg mb-3" />

      {/* Subtitle */}
      <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Date, time, location card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg shrink-0" />
                <div>
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg shrink-0" />
                <div>
                  <div className="h-4 w-40 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                  <div className="h-3 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Description card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
            <div className="h-6 w-28 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          </div>

          {/* Speakers */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full shrink-0" />
                  <div>
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                    <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agenda */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Register card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-3" />
            <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2" />
            <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
            <div className="h-11 w-full bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </div>

          {/* Organizer card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded mb-3" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full" />
              <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="h-5 w-12 bg-gray-200 dark:bg-gray-800 rounded mb-3" />
            <div className="flex flex-wrap gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
              ))}
            </div>
          </div>

          {/* Similar events */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="h-5 w-28 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
