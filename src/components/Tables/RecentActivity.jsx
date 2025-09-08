import React, { memo, useEffect, useState } from 'react';
import { getRecentDashboardActivity } from '../../services/dashbaordService';

// Progress bar (memoized to avoid unnecessary re-renders)
const ProgressBar = memo(function ProgressBar({ percentage }) {
  return (
      <div className="relative w-full lg:max-w-[150px] h-9 bg-white border border-gray-200 rounded-[5px] overflow-hidden">
        <div
            className="absolute inset-y-0 left-0 bg-[#fda98d] rounded-l-[5px] transition-all duration-500"
            style={{ width: `${percentage}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-800 z-10">
          {percentage}%
        </div>
      </div>
  );
});

const staticIconMap = {
  game: {
    icon: '/daily-puzzle-icon.png',
    alt: 'Game',
    iconBg: 'bg-gray-100',
  },
  assessment: {
    icon: '/daily-assessment-icon.png',
    alt: 'Assessment',
    iconBg: 'bg-gray-100',
  },
};

export default function RecentActivity() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getRecentDashboardActivity();
        const acts = res?.data?.activities || [];
        const mapped = acts.map((a) => ({
          type: a.type,
          label: a.name,
          pct: a.percentage ?? 0,
          complete: a.type === 'assessment' ? 'Completed' : '',
          statusType: a.type === 'assessment' && a.percentage === 100 ? 'completed' : 'resume',
        }));
        setItems(mapped);
      } catch (e) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
      <>
        <h3 className="text-2xl font-semibold text-gray-900 mb-0">Recent Activity</h3>

        {/* Card container */}
        <div className="bg-white rounded-lg p-2 md:p-6 shadow-sm mt-3">
          {/* Desktop / Tablet table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full table-fixed border-separate border-spacing-y-4">
              <colgroup>
                <col className="w-1/5" />
                <col className="w-1/5" />
                <col className="w-2/5" />
                <col className="w-1/5" />
              </colgroup>
              <thead>
              <tr>
                {['Game Name', 'Game Complete', 'Score', 'Status'].map((h) => (
                    <th
                        key={h}
                        className="text-center align-middle px-6 py-4 text-sm font-medium text-gray-600"
                    >
                      {h}
                    </th>
                ))}
              </tr>
              </thead>
              <tbody>
              {(items || []).map((row, idx) => {
                const { icon, alt, iconBg } = staticIconMap[row.type] || staticIconMap.game;
                return (
                  <tr key={`${row.label}-${idx}`} className="bg-[#F2F5F6] rounded-xl overflow-hidden">
                    <td className="py-4 px-6 rounded-l-xl">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}>
                          <img src={icon} alt={alt} className="w-10 h-10" />
                        </div>
                        <span className="font-medium text-base text-gray-900">{row.label}</span>
                      </div>
                    </td>
                    <td className="py-4 text-center px-6">
                      <span className="font-medium text-base text-gray-900">36/36</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center">
                        <ProgressBar percentage={row.pct} />
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center rounded-r-xl">
                      {row.statusType === 'completed' ? (
                          <div className="flex items-center space-x-2 justify-center text-green-600">
                            <img src="/task-complete-icon.svg" alt="Completed" className="w-5 h-5" />
                            <span className="text-sm font-medium">Completed</span>
                          </div>
                      ) : (
                        <div className="flex items-center space-x-2 justify-center text-green-600">
                        <img src="/task-complete-icon.svg" alt="Completed" className="w-5 h-5" />
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                          // <button
                          //     type="button"
                          //     className="bg-orange-50 text-orange-500 border border-orange-300 hover:bg-orange-100 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                          // >
                          //   Resume
                          // </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <div className="md:hidden space-y-4 mt-4">
            {(items || []).map((row, idx) => {
              const { icon, alt, iconBg } = staticIconMap[row.type] || staticIconMap.game;
              return (
                <div
                    key={`${row.label}-mobile-${idx}`}
                    className="bg-[#F2F5F6] rounded-xl px-3 py-4 flex items-center justify-between gap-3"
                >
                  {/* Icon + Label */}
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}>
                      <img src={icon} alt={alt} className="w-10 h-10" />
                    </div>
                    <span className="text-[12px] font-medium text-gray-900 leading-tight">{row.label}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="flex-1 mx-2 max-w-[190px]">
                    <ProgressBar percentage={row.pct} />
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-end min-w-[20px]">
                    {row.statusType === 'completed' ? (
                        <div className="flex items-center space-x-1 text-green-600 text-xs font-medium">
                          <img src="/task-complete-icon.svg" alt="Completed" className="w-4 h-4" />
                          <span>Completed</span>
                        </div>
                    ) : (
                        <button
                            type="button"
                            className="bg-white text-orange-500 border border-orange-300 hover:bg-orange-100 px-4 py-[6px] rounded-md text-xs font-medium transition-colors"
                        >
                          Resume
                        </button>
                    )}
                  </div>
                </div>
            );
            })}
          </div>
        </div>
      </>
  );
}
