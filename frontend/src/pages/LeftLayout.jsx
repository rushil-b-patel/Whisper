export default function LeftLayout({
  activeFilter,
  handleFilterChange,
  filters,
  departments,
  departmentsLoading,
  departmentsError,
  fetchDepartments,
  activeDepartment,
  setActiveDepartment,
}) {
  const getDeptInitials = (name) => {
    if (!name) return '';

    const stopWords = ['and', '&', 'of', 'the', '(', ')', 'in', 'for'];
    const words = name.split(' ').filter((w) => w && !stopWords.includes(w.toLowerCase()));

    let initials = words
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');

    return initials;
  };

  return (
    <aside className="hidden md:block md:w-64 lg:w-72 h-full overflow-y-auto px-2 py-4">
      <section className="bg-white dark:bg-[#131619] rounded-xl shadow-sm border border-gray-200 dark:border-[#2A2B30] p-4 mb-4">
        <h2 className="font-mono text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Discover
        </h2>
        <ul className="space-y-2">
          {filters.map(({ id, label, icon }) => (
            <li key={id}>
              <button
                onClick={() => handleFilterChange(id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  activeFilter === id
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {icon}
                <span className="font-mono font-medium">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white dark:bg-[#131619] rounded-xl shadow-sm border border-gray-200 dark:border-[#2A2B30] p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-mono text-lg font-semibold text-gray-900 dark:text-white">
            Departments
          </h2>
          {!departmentsLoading && departments.length > 5 && (
            <button className="text-gray-600 dark:text-gray-400 text-sm hover:text-gray-900 dark:hover:text-white hover:underline transition-colors">
              See All
            </button>
          )}
        </div>

        {departmentsLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : departmentsError ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono mb-2">
              {departmentsError}
            </p>
            <button
              onClick={fetchDepartments}
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:underline transition-colors"
            >
              Try again
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {departments.slice(0, 5).map((dept) => {
              const isActive = activeDepartment === dept.name;
              return (
                <li key={dept.name}>
                  <div
                    className={`flex items-center space-x-3 p-2 rounded-lg transition cursor-pointer ${
                      isActive
                        ? 'bg-gray-100 dark:bg-gray-800'
                        : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                    onClick={() => setActiveDepartment(dept.name)}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 text-white font-bold flex items-center justify-center text-xs">
                      {getDeptInitials(dept.name)}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-mono ${
                          isActive
                            ? 'font-semibold text-gray-900 dark:text-white'
                            : 'font-medium text-gray-900 dark:text-white'
                        }`}
                      >
                        {getDeptInitials(dept.name)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {dept.memberCount || 0} members
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {activeDepartment && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setActiveDepartment(null)}
              className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline"
            >
              Clear Department Filter
            </button>
          </div>
        )}
      </section>
    </aside>
  );
}
