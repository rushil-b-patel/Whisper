export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="overflow-x-auto feed-scrollbar-hidden">
      <div className="flex justify-center space-x-4 sm:space-x-4 border-b border-gray-300 dark:border-gray-700 w-max sm:w-full">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`px-4 py-2 font-medium whitespace-nowrap border-b-2 transition-all duration-200 ${
              tab === active
                ? 'border-black dark:border-white text-black dark:text-white font-semibold'
                : 'border-transparent text-gray-500 hover:text-black dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
