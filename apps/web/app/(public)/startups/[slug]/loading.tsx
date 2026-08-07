export default function StartupDetailLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-2 lg:px-4 py-6 sm:py-10 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 mb-6">
        <div className="h-4 w-10 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-3 w-3 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-3 w-3 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>

      {/* Header: Logo + Name + Tagline */}
      <div className="mb-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 dark:bg-gray-800 rounded-xl sm:rounded-2xl shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="h-7 sm:h-9 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2" />
            <div className="h-4 sm:h-5 w-72 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
          </div>
          {/* Impact score placeholder */}
          <div className="w-14 h-14 bg-gray-200 dark:bg-gray-800 rounded-full shrink-0 hidden sm:block" />
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full" />
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded-full" />
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content */}
        <div className="flex-1 space-y-6">
          {/* About card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                  <div className="h-5 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Founders card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full shrink-0" />
                  <div>
                    <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Funding history card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
            <div className="h-6 w-36 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                    <div>
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                      <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
                    </div>
                  </div>
                  <div className="h-5 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* AI Products card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sm:p-6">
            <div className="h-6 w-28 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                    <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="h-5 w-36 bg-gray-200 dark:bg-gray-800 rounded mb-3" />
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2" />
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="h-5 w-28 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
