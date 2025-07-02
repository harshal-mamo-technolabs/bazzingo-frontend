import React,{ useState } from 'react';
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";

const Calender = () => {
    const [currentDate, setCurrentDate] = useState(dayjs());

  const startOfMonth = currentDate.startOf("month");
  //const endOfMonth = currentDate.endOf("month");

  const daysInMonth = currentDate.daysInMonth();
  const startDay = startOfMonth.day(); // 0 (Sunday) - 6 (Saturday)
  const blankDays = (startDay + 6) % 7; // Shift Sunday to end

  const prevMonth = () => setCurrentDate(currentDate.subtract(1, "month"));
  const nextMonth = () => setCurrentDate(currentDate.add(1, "month"));

  const dayNames = ["M", "T", "W", "T", "F", "S", "S"];

    return (
        <>
        {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex justify-between items-center space-x-2">
            <h3 className="text-md font-semibold text-gray-900">Current Streak</h3>
            <Info className="w-4 h-4" />
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {currentDate.format("MMM, YYYY")}
          </div>
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
        {/* Day Names */}
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

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: blankDays }).map((_, i) => (
            <div
              key={`blank-${i}`}
              className="text-center p-2 text-sm text-transparent"
            >
              {i + 1}
            </div>
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const today = dayjs();
            const isToday =
              currentDate.isSame(today, "month") &&
              day === today.date();

            return (
              <div
                key={day}
                className={`text-center p-2 text-sm rounded-lg cursor-pointer transition-colors
                  ${isToday
                    ? "bg-orange-500 text-white font-semibold rounded-full"
                    : "text-gray-700 hover:bg-gray-100"}`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
        </>
    );
};
export default Calender;