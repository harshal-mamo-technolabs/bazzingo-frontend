import React from "react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const UserRadarChart = () => {
    return (
        <>
         <ResponsiveContainer width="100%" height={250}>
    <RadarChart cx="50%" cy="50%" outerRadius="90%" data={[
      { subject: 'Pattern Recognition', A: 80 },
      { subject: 'Spatial Orientation', A: 88 },
      { subject: 'Visual Perception', A: 86 },
      { subject: '', A: 119 }, // You may want to remove or replace the empty label
      { subject: 'Logic', A: 120 },
    ]}>
      <defs>
        <linearGradient id="colorRadar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF5727" stopOpacity={0.6} />
          <stop offset="100%" stopColor="#f97316" stopOpacity={0.1} />
        </linearGradient>
      </defs>

      <PolarGrid />
      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#333', fontWeight: 'bold' }} />
      <PolarRadiusAxis angle={30} domain={[0, 180]} tick={false} axisLine={false} />

      <Radar
        name="Score"
        dataKey="A"
        stroke="#f97316"
        strokeWidth={2}
        fill="url(#colorRadar)"
        fillOpacity={1}
      />
    </RadarChart>
  </ResponsiveContainer>
        </>
    );
};
export default UserRadarChart;