import React, { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { getStreak } from "../../services/dashbaordService"; // adjust path

const Calender = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [showTooltip, setShowTooltip] = useState(false);
  const [streakData, setStreakData] = useState(null);
  const [range, setRange] = useState(null); // will store { start, end }
  const iconRef = useRef(null);

  const handleTooltipClick = (setTooltipFn) => {
    setTooltipFn(true);
    setTimeout(() => setTooltipFn(false), 3000);
  };

  // Fetch streak data
  const fetchStreak = async (startDate, endDate) => {
    try {
      const res = await getStreak(startDate, endDate);
      setStreakData(res.data);
      setRange(res.data.range);
    } catch (err) {
      console.error(err);
    }
  };

  // On mount → default 3-month streak API
  useEffect(() => {
    fetchStreak();
  }, []);

  // Navigation handlers (shift range by 3 months)
  const prevMonth = () => {
    if (!range) return;
    const newStart = dayjs(range.start).subtract(1, "month").format("YYYY-MM-DD");
    const newEnd = dayjs(range.end).subtract(1, "month").format("YYYY-MM-DD");
    fetchStreak(newStart, newEnd);
    setCurrentDate(dayjs(newStart));
  };

  const nextMonth = () => {
    if (!range) return;
    const newStart = dayjs(range.start).add(1, "month").format("YYYY-MM-DD");
    const newEnd = dayjs(range.end).add(1, "month").format("YYYY-MM-DD");
    fetchStreak(newStart, newEnd);
    setCurrentDate(dayjs(newStart));
  };

  const startOfMonth = currentDate.startOf("month");
  const daysInMonth = currentDate.daysInMonth();
  const startDay = startOfMonth.day();
  const blankDays = (startDay + 6) % 7;
  const dayNames = ["M", "T", "W", "T", "F", "S", "S"];

  const getDayStatus = (day) => {
    if (!streakData) return null;
    const dateStr = currentDate.date(day).format("YYYY-MM-DD");
    const found = streakData.days.find(
      (d) => dayjs(d.date).format("YYYY-MM-DD") === dateStr
    );
    return found || null;
  };

  return (
    <div className="w-full lg:w-[280px] flex-shrink-0">
      <div className="bg-[#ffece6] rounded-lg p-3 shadow-sm border border-gray-100 h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex justify-between items-center space-x-2">
              <h3 className="text-md font-semibold text-gray-900">Current Streak</h3>
              <div
                ref={iconRef}
                className="relative cursor-pointer"
                onClick={() => handleTooltipClick(setShowTooltip)}
              >
                <Info className="w-4 h-4 text-black" />
                {showTooltip && (
                  <div className="absolute top-6 right-0 z-50 w-[180px] p-2 text-xs text-black bg-white/20 backdrop-blur-md border border-white/30 rounded shadow-md">
                    Visualizes performance trends by date.
                  </div>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {currentDate.format("MMM, YYYY")}
            </div>
            {streakData?.stats && (
              <div className="text-xs text-gray-600 mt-1">
                🔥 Current: {streakData.stats.currentStreak} | Longest: {streakData.stats.longestStreak}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={prevMonth} className="p-1 bg-white rounded">
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            <button onClick={nextMonth} className="p-1 bg-white rounded">
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white p-1">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 p-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: blankDays }).map((_, i) => (
              <div key={`blank-${i}`} className="p-2 text-sm" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const today = dayjs();
              const isToday =
                currentDate.isSame(today, "month") && day === today.date();

              const status = getDayStatus(day);

              let classes =
                "text-center p-2 text-sm rounded-lg cursor-pointer transition-colors ";
              if (isToday) {
                classes += "bg-orange-500 text-white font-semibold rounded-full";
              } else if (status?.isGamePlayed) {
                classes += "bg-green-200 text-green-800 font-medium";
              } else if (status?.isAssessmentCompleted) {
                classes += "bg-blue-200 text-blue-800 font-medium";
              } else {
                classes += "text-gray-700 hover:bg-gray-100";
              }

              return (
                <div key={day} className={classes}>
                  {day}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calender;
