export const PostCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-[#0e1113] p-5 sm:p-6 rounded-2xl shadow border border-gray-200 dark:border-slate-800 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700" />
        <div className="flex flex-col gap-1">
          <div className="w-24 h-3 bg-gray-300 dark:bg-gray-700 rounded" />
          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded" />
        </div>
      </div>
      <div className="w-3/4 h-5 bg-gray-300 dark:bg-gray-700 rounded mb-3" />
      <div className="space-y-2 mb-4">
        <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="w-5/6 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="w-full h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
      <div className="flex justify-between items-center">
        <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}