export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex justify-center space-x-4 border-b border-gray-300 dark:border-gray-700">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`px-4 py-2 font-medium transition ${
            tab === active
              ? 'border-b-2 border-black dark:border-white text-black dark:text-white'
              : 'text-gray-500 hover:text-black dark:hover:text-white'
          }`}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
