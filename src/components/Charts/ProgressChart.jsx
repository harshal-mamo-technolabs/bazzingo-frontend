import React, { useState } from "react";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Area } from "recharts";

const ProgressChart = () => {
  // Optional: simulate fetching from DB
  /*
  useEffect(() => {
    fetch("/api/statistics")
      .then(res => res.json())
      .then(data => setStatsData(data.chartPoints));
  }, []);
  */

  const [statsData, setStatsData] = useState([500, 900, 1200, 700, 1600, 700, 1800]);
  const xLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Transform data into Recharts format
  const chartData = statsData.map((value, index) => ({
    name: xLabels[index],
    value,
  }));
    return (
        <>
        <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  height="100%"
                  margin={{ top: 0, right: 20, left: 0, bottom: 0 }} // Remove extra space
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="60%" stopColor="#FF6C40" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#FF6C40" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
            
                  {/* Grid only horizontal */}
                  <CartesianGrid stroke="#D5D5D5" strokeDasharray="3 3" vertical={false} />
            
                  {/* X-Axis */}
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#333' }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    height={20}
                  />
            
                  {/* Y-Axis */}
                  <YAxis
                    domain={[0, 2000]}
                    ticks={[100, 500, 1000, 1500, 2000]}
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                  />
            
                  {/* Optional: Remove Tooltip if you don’t need it */}
                  {/* <Tooltip /> */}
            
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#f97316"
                    fill="url(#colorValue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
        </>
    );
};
export default ProgressChart;