import React, { forwardRef } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import dayjs from "dayjs";
import { 
  getDomainDescription, 
  generateInsightsAndTips, 
  calculateReportStats,
  generateDomainScores,
  getDefaultDomains,
  generateRadarData,
  sortDomainsByPerformance,
  generateRecommendedActivities
} from '../../utils/reportUtils.jsx';
import { bandFromTotal } from '../../utils/certificationUtils.jsx';

/**
 * Reusable Report Component
 * Can be used for download, display, or printing
 */
const ReportComponent = forwardRef(({ 
  scoreData, 
  assessmentId, 
  assessmentName = "Assessment",
  userName = "User",
  userAge = "",
  mainCategory = "iq-test",
  totalQuestions = 0,
  programScores = null,
  className = "",
  style = {}
}, ref) => {
  const stats = calculateReportStats(scoreData, totalQuestions);
  const band = bandFromTotal(stats.total);
  const domainScores = generateDomainScores(scoreData);
  const domains = domainScores.length > 0 ? domainScores : getDefaultDomains();
  const radarData = generateRadarData(domains, scoreData);
  const sortedDomains = sortDomainsByPerformance(domains, scoreData);
  const recommendations = generateRecommendedActivities(sortedDomains);
  
  const dateStr = scoreData?.date ? dayjs(scoreData.date).format("DD MMM, YYYY") : dayjs().format("DD MMM, YYYY");

  return (
    <div 
      ref={ref} 
      className={`bg-white text-black max-w-[850px] mx-auto shadow print:shadow-none print:w-[210mm] print:min-h-[297mm] ${className}`}
      style={style}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b p-6">
        <div>
          <div className="text-xl font-semibold">{assessmentName} Report</div>
          <div className="text-sm text-gray-600">
            Assessment Type: {mainCategory.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </div>
        </div>
        <img src="/bazzingo-logo.png" alt="Bazzingo" className="h-10" />
      </div>

      {/* Assessment Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-6 text-sm">
        <div>
          <div className="text-gray-500">Name</div>
          <div className="font-medium">{userName}{userAge ? `, ${userAge}` : ''}</div>
        </div>
        <div>
          <div className="text-gray-500">Assessment Date</div>
          <div className="font-medium">{dateStr}</div>
        </div>
        <div>
          <div className="text-gray-500">Score ID</div>
          <div className="font-medium break-all">{scoreData?._id || assessmentId}</div>
        </div>
        <div>
          <div className="text-gray-500">Assessment Type</div>
          <div className="font-medium">
            {mainCategory.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </div>
        </div>
      </div>

      {/* Summary Dashboard */}
      <div className="p-6 pt-0">
        <div className="mb-2 font-semibold">Summary Dashboard</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 border rounded p-4">
            <RadarChart width={720} height={260} data={radarData} outerRadius="80%">
              <defs>
                <linearGradient id="reportRadar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF5727" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 30]} tick={{ fontSize: 10 }} />
              <Radar dataKey="value" stroke="#f97316" strokeWidth={2} fill="url(#reportRadar)" fillOpacity={1} />
            </RadarChart>
          </div>
          <div className="border rounded p-4 flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Total Score</span>
              <span className="font-semibold">{stats.total} / {scoreData?.outOfScore || totalQuestions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Accuracy</span>
              <span className="font-semibold">{stats.accuracy}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Correct Answers</span>
              <span className="font-semibold">
                {stats.correctAnswers} / {Math.round((scoreData?.outOfScore || totalQuestions) / 5)}
              </span>
            </div>
            {/* Category-specific scores */}
            {programScores && programScores !== null && Object.keys(programScores).length > 0 && (
              <>
                {mainCategory === 'iq-test' && programScores['iq-test'] !== undefined && (
                  <div className="flex items-center justify-between border-t pt-2 mt-2">
                    <span>IQ Score</span>
                    <span className="font-semibold">{programScores['iq-test']}</span>
                  </div>
                )}
                {mainCategory === 'driving-license' && programScores['driving-license'] !== undefined && (
                  <div className="flex items-center justify-between border-t pt-2 mt-2">
                    <span>Driving License Score</span>
                    <span className="font-semibold">{programScores['driving-license']}</span>
                  </div>
                )}
                {mainCategory === 'logic' && programScores['logic'] !== undefined && (
                  <div className="flex items-center justify-between border-t pt-2 mt-2">
                    <span>Logic Score</span>
                    <span className="font-semibold">{programScores['logic']}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Domain Scores Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          {domains.map(d => {
            const sc = scoreData?.byCategory?.[d.key] || 0;
            const { level } = generateInsightsAndTips(d.key, sc, mainCategory);
            return (
              <div key={d.key} className="border rounded p-3">
                <div className="font-medium">{d.label}</div>
                <div className="text-gray-600">{sc} / 30</div>
                <div className="text-[11px] mt-1 inline-block px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                  {level}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cognitive Area Breakdown */}
      <div className="p-6 pt-0">
        <div className="font-semibold mb-3">Cognitive Area Breakdown</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 cognitive-breakdown-grid">
          {domains.map(d => {
            const sc = scoreData?.byCategory?.[d.key] || 0;
            const { level, insights, tips } = generateInsightsAndTips(d.key, sc, mainCategory);
            return (
              <div key={d.key} className="border rounded p-4 break-inside-avoid cognitive-item">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium">{d.label}</div>
                  <div className="text-sm">{sc} / 30</div>
                </div>
                <div className="text-xs text-gray-600 mb-2">{getDomainDescription(d.key, mainCategory)}</div>
                <div className="text-[11px] mb-2 inline-block px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                  {level}
                </div>
                <div className="text-sm font-medium mt-2">Insights</div>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {insights.slice(0,2).map((t,i)=>(<li key={i}>{t}</li>))}
                </ul>
                <div className="text-sm font-medium mt-2">Recommendations</div>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {tips.slice(0,3).map((t,i)=>(<li key={i}>{t}</li>))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Final Score Summary */}
      <div className="p-6 pt-0">
        <div className="font-semibold mb-2">Final Score Summary</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="border rounded p-4">
            <div className="text-gray-500">Total Score</div>
            <div className="text-lg font-semibold">{stats.total} / {scoreData?.outOfScore || totalQuestions}</div>
          </div>
          <div className="border rounded p-4">
            <div className="text-gray-500">Accuracy</div>
            <div className="text-lg font-semibold">{stats.accuracy}%</div>
          </div>
        </div>
        
        {/* Category-specific scores section */}
        {programScores && programScores !== null && Object.keys(programScores).length > 0 && (
          <div className="mt-4">
            <div className="font-semibold mb-2">Category-Specific Scores</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {mainCategory === 'iq-test' && programScores['iq-test'] !== undefined && (
                <div className="border rounded p-4">
                  <div className="text-gray-500">IQ Score</div>
                  <div className="text-lg font-semibold">{programScores['iq-test']}</div>
                </div>
              )}
              {mainCategory === 'driving-license' && programScores['driving-license'] !== undefined && (
                <div className="border rounded p-4">
                  <div className="text-gray-500">Driving License Score</div>
                  <div className="text-lg font-semibold">{programScores['driving-license']}</div>
                </div>
              )}
              {mainCategory === 'logic' && programScores['logic'] !== undefined && (
                <div className="border rounded p-4">
                  <div className="text-gray-500">Logic Score</div>
                  <div className="text-lg font-semibold">{programScores['logic']}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recommended Activities */}
      <div className="p-6 pt-0">
        <div className="font-semibold mb-2">Recommended Activities</div>
        <div className="text-sm text-gray-700">
          <ul className="list-disc list-inside">
            {recommendations.activities.map((activity, index) => (
              <li key={index}>{activity}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-xs text-gray-500 border-t">
        <div>"This assessment reflects performance at the time of testing and may vary over time."</div>
        <div className="mt-1">Generated on {dayjs().format("DD MMM, YYYY HH:mm")} • Bazzingo</div>
      </div>
    </div>
  );
});

ReportComponent.displayName = 'ReportComponent';

export default ReportComponent;
