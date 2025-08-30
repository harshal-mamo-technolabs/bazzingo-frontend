import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Area,
  Tooltip,
  Layer
} from "recharts";
import { motion } from "framer-motion";
import { getWeeklyScores } from "../../services/dashbaordService";

const CustomTooltip = ({ active, payload, coordinate }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: coordinate.y,
        left: coordinate.x,
        transform: "translate(-50%, -100%)",
        background: "rgba(255,255,255,0.2)",
        backdropFilter: "blur(6px)",
        padding: "4px 8px",
        borderRadius: "4px",
        fontSize: "12px",
        color: "#FF6C40",
        pointerEvents: "none",
        whiteSpace: "nowrap",
      }}
    >
      {payload[0].value}
    </div>
  );
};

const ProgressChart = () => {
  const [statsData, setStatsData] = useState([]);
  const [activePos, setActivePos] = useState(null);

  const xLabels = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const res = await getWeeklyScores();
        // API shape: res.data.scores = { MONDAY: 0, TUESDAY: 0, ... }
        const scores = res?.data?.scores || {};

        // Map API scores into chartData format
        const orderedDays = [
          "SUNDAY",
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
        ];

        const chartReadyData = orderedDays.map((day, i) => ({
          name: xLabels[i],
          value: scores[day] ?? 0,
        }));

        setStatsData(chartReadyData);
      } catch (err) {
        console.error("Error loading weekly scores:", err);
      }
    };

    fetchScores();
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={statsData}
          margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          onMouseMove={({ chartX, chartY, activePayload }) => {
            if (activePayload) setActivePos({ x: chartX, y: chartY });
          }}
          onMouseLeave={() => {
            setActivePos(null);
          }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="60%" stopColor="#FF6C40" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#FF6C40" stopOpacity={0.1} />
            </linearGradient>

            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <CartesianGrid stroke="#D5D5D5" strokeDasharray="3 3" vertical={false} />

          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fontWeight: "bold", fill: "#333" }}
            axisLine={false}
            tickLine={false}
            interval={0}
            height={20}
          />

          <YAxis
            domain={[0, 2000]}
            ticks={[100, 500, 1000, 1500, 2000]}
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={30}
          />

          <Tooltip content={<CustomTooltip />} cursor={false} />

          <Area
            type="monotone"
            dataKey="value"
            stroke="#f97316"
            fill="url(#colorValue)"
            strokeWidth={2}
            isAnimationActive={true}
            animationDuration={4000}
            animationEasing="ease-out"
            dot={false}
            activeDot={false}
          />

          {activePos && (
            <Layer>
              <motion.circle
                cx={activePos.x}
                cy={activePos.y}
                r={6}
                stroke="#f97316"
                fill="#fff"
                filter="url(#glow)"
                initial={{ r: 6, opacity: 1 }}
                animate={{ r: [6, 10, 6], opacity: [1, 0.6, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              />
            </Layer>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;
