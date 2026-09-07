export default function StoryDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-0 sm:px-2 lg:px-4 py-6 sm:py-10 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 mb-6">
        <div className="h-4 w-10 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-3 w-3 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-4 w-14 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-3 w-3 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Main article */}
        <article className="flex-1 min-w-0">
          {/* Category badge */}
          <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded-full mb-4" />

          {/* Title */}
          <div className="space-y-2 mb-4">
            <div className="h-7 sm:h-9 w-full bg-gray-200 dark:bg-gray-800 rounded-lg" />
            <div className="h-7 sm:h-9 w-2/3 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </div>

          {/* Excerpt */}
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mb-1" />
          <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-800 rounded mb-6" />

          {/* Author row + share */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full" />
              <div>
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                <div className="h-3 w-40 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-xl" />
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            </div>
          </div>

          {/* Hero image */}
          <div className="aspect-[16/9] bg-gray-200 dark:bg-gray-800 rounded-xl my-6 sm:my-8" />

          {/* Content paragraphs */}
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
            ))}
          </div>

          {/* Related stories */}
          <div className="mt-10">
            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded-full mb-2" />
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                  <div className="h-3 w-12 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
              ))}
            </div>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0 space-y-6">
          {/* Newsletter */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="h-5 w-36 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mb-4" />
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded-lg" />
          </div>
          {/* More stories */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="h-5 w-36 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
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
