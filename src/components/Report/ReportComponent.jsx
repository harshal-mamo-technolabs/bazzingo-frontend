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
  generateRecommendedActivities,
  isQuickAssessment,
  getMaxDomainScore
} from '../../utils/reportUtils.jsx';
import { bandFromTotal } from '../../utils/certificationUtils.jsx';
import TranslatedText from '../TranslatedText.jsx';

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
  // Determine assessment type (quick = 10 questions, full = 30 questions)
  const questionCount = totalQuestions || 30;
  const isQuick = isQuickAssessment(questionCount);
  
  const stats = calculateReportStats(scoreData, questionCount);
  const band = bandFromTotal(stats.total);
  const domainScores = generateDomainScores(scoreData, questionCount);
  const domains = domainScores.length > 0 ? domainScores : getDefaultDomains();
  const domainCount = domains.length || 5;
  const maxDomainScore = getMaxDomainScore(questionCount, domainCount);
  const radarData = generateRadarData(domains, scoreData, questionCount);
  const sortedDomains = sortDomainsByPerformance(domains, scoreData);
  const recommendations = generateRecommendedActivities(sortedDomains);
  
  const dateStr = scoreData?.date ? dayjs(scoreData.date).format("DD MMM, YYYY") : dayjs().format("DD MMM, YYYY");
  
  // Calculate radar chart domain based on max possible score
  const radarMaxDomain = maxDomainScore;

  return (
    <div 
      ref={ref} 
      className={`report-container bg-white text-black max-w-[850px] mx-auto shadow print:shadow-none ${className}`}
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif', ...style }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-6">
        <div>
          <div className="text-xl font-semibold text-gray-900">{assessmentName} <TranslatedText text="Report" /></div>
          <div className="text-sm text-gray-600">
            <TranslatedText text="Assessment Type" />: {mainCategory.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            {isQuick && <span className="ml-2 text-orange-500 font-medium">(<TranslatedText text="Quick Assessment" />)</span>}
          </div>
        </div>
        <img src="/bazzingo-logo.png" alt="Bazzingo" className="h-10" />
      </div>

      {/* Assessment Info */}
      <div className="grid grid-cols-4 gap-4 p-6 text-sm border-b border-gray-100">
        <div>
          <div className="text-gray-500 text-xs uppercase tracking-wide mb-1"><TranslatedText text="Name" /></div>
          <div className="font-medium text-gray-900">{userName}{userAge ? `, ${userAge}` : ''}</div>
        </div>
        <div>
          <div className="text-gray-500 text-xs uppercase tracking-wide mb-1"><TranslatedText text="Assessment Date" /></div>
          <div className="font-medium text-gray-900">{dateStr}</div>
        </div>
        <div>
          <div className="text-gray-500 text-xs uppercase tracking-wide mb-1"><TranslatedText text="Score ID" /></div>
          <div className="font-medium text-gray-900 break-all text-xs">{scoreData?._id || assessmentId}</div>
        </div>
        <div>
          <div className="text-gray-500 text-xs uppercase tracking-wide mb-1"><TranslatedText text="Assessment Type" /></div>
          <div className="font-medium text-gray-900">
            {mainCategory.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </div>
        </div>
      </div>

      {/* Summary Dashboard */}
      <div className="p-6">
        <div className="text-lg font-semibold text-gray-900 mb-4"><TranslatedText text="Summary Dashboard" /></div>
        <div className="grid grid-cols-3 gap-6">
          {/* Radar Chart */}
          <div className="col-span-2 border border-gray-200 rounded-lg p-4 bg-gray-50">
            <RadarChart width={480} height={220} data={radarData} outerRadius="75%">
              <defs>
                <linearGradient id="reportRadar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF5727" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#4b5563' }} />
              <PolarRadiusAxis angle={30} domain={[0, radarMaxDomain]} tick={{ fontSize: 9, fill: '#9ca3af' }} />
              <Radar dataKey="value" stroke="#f97316" strokeWidth={2} fill="url(#reportRadar)" fillOpacity={1} />
            </RadarChart>
          </div>
          
          {/* Score Summary */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 text-sm"><TranslatedText text="Total Score" /></span>
                <span className="font-bold text-gray-900">{stats.total} / {stats.maxScore}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 text-sm"><TranslatedText text="Correct Answers" /></span>
                <span className="font-bold text-gray-900">{stats.correctAnswers} / {stats.questionCount}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600 text-sm"><TranslatedText text="Accuracy" /></span>
                <span className="font-bold text-green-600">{stats.accuracy}%</span>
              </div>
              {/* Category-specific scores */}
              {programScores && Object.keys(programScores).length > 0 && (
                <>
                  {mainCategory === 'iq-test' && programScores['iq-test'] !== undefined && (
                    <div className="flex items-center justify-between py-2 bg-orange-50 px-2 rounded">
                      <span className="text-gray-700 text-sm font-medium"><TranslatedText text="IQ Score" /></span>
                      <span className="font-bold text-orange-600 text-lg">{programScores['iq-test']}</span>
                    </div>
                  )}
                  {mainCategory === 'driving-license' && programScores['driving-license'] !== undefined && (
                    <div className="flex items-center justify-between py-2 bg-orange-50 px-2 rounded">
                      <span className="text-gray-700 text-sm font-medium"><TranslatedText text="License Score" /></span>
                      <span className="font-bold text-orange-600 text-lg">{programScores['driving-license']}</span>
                    </div>
                  )}
                  {mainCategory === 'logic' && programScores['logic'] !== undefined && (
                    <div className="flex items-center justify-between py-2 bg-orange-50 px-2 rounded">
                      <span className="text-gray-700 text-sm font-medium"><TranslatedText text="Logic Score" /></span>
                      <span className="font-bold text-orange-600 text-lg">{programScores['logic']}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Domain Scores Table */}
        <div className="mt-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 border border-gray-200"><TranslatedText text="Domain" /></th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700 border border-gray-200"><TranslatedText text="Score" /></th>
                <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700 border border-gray-200"><TranslatedText text="Performance" /></th>
              </tr>
            </thead>
            <tbody>
              {domains.map((d, idx) => {
                const sc = scoreData?.byCategory?.[d.key] || 0;
                const domainMax = d.maxScore || maxDomainScore;
                const { level } = generateInsightsAndTips(d.key, sc, mainCategory, domainMax);
                const percentage = Math.round((sc / domainMax) * 100);
                return (
                  <tr key={d.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-2 px-3 text-sm font-medium text-gray-900 border border-gray-200"><TranslatedText text={d.label} /></td>
                    <td className="py-2 px-3 text-sm text-center text-gray-700 border border-gray-200">
                      <span className="font-semibold">{sc}</span> / {domainMax}
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center border border-gray-200">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                        <TranslatedText text={level} />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cognitive Area Breakdown */}
      <div className="p-6 pt-0">
        <div className="text-lg font-semibold text-gray-900 mb-4"><TranslatedText text="Cognitive Area Breakdown" /></div>
        <div className="grid grid-cols-2 gap-4">
          {domains.map(d => {
            const sc = scoreData?.byCategory?.[d.key] || 0;
            const domainMax = d.maxScore || maxDomainScore;
            const { level, insights, tips } = generateInsightsAndTips(d.key, sc, mainCategory, domainMax);
            return (
              <div key={d.key} className="border border-gray-200 rounded-lg p-4 bg-white cognitive-item">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-900"><TranslatedText text={d.label} /></div>
                  <div className="text-sm font-medium text-gray-700">{sc} / {domainMax}</div>
                </div>
                <div className="text-xs text-gray-500 mb-2"><TranslatedText text={getDomainDescription(d.key, mainCategory)} /></div>
                <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-700 mb-3">
                  <TranslatedText text={level} />
                </span>
                
                <div className="text-xs font-semibold text-gray-700 mt-2 mb-1"><TranslatedText text="Insights" />:</div>
                <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5 mb-2">
                  {insights.slice(0,2).map((t,i)=>(<li key={i}><TranslatedText text={t} /></li>))}
                </ul>
                
                <div className="text-xs font-semibold text-gray-700 mt-2 mb-1"><TranslatedText text="Recommendations" />:</div>
                <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
                  {tips.slice(0,2).map((t,i)=>(<li key={i}><TranslatedText text={t} /></li>))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Final Score Summary */}
      <div className="p-6 pt-0">
        <div className="text-lg font-semibold text-gray-900 mb-4"><TranslatedText text="Final Score Summary" /></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4 text-center">
            <div className="text-xs text-orange-600 uppercase tracking-wide mb-1"><TranslatedText text="Total Score" /></div>
            <div className="text-2xl font-bold text-orange-700">{stats.total}</div>
            <div className="text-xs text-orange-500"><TranslatedText text="out of" /> {stats.maxScore}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-xs text-blue-600 uppercase tracking-wide mb-1"><TranslatedText text="Correct Answers" /></div>
            <div className="text-2xl font-bold text-blue-700">{stats.correctAnswers}</div>
            <div className="text-xs text-blue-500"><TranslatedText text="out of" /> {stats.questionCount}</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-xs text-green-600 uppercase tracking-wide mb-1"><TranslatedText text="Accuracy" /></div>
            <div className="text-2xl font-bold text-green-700">{stats.accuracy}%</div>
            <div className="text-xs text-green-500"><TranslatedText text="performance rate" /></div>
          </div>
        </div>
        
        {/* Category-specific scores section */}
        {programScores && Object.keys(programScores).length > 0 && (
          <div className="mt-4">
            <div className="grid grid-cols-3 gap-4">
              {mainCategory === 'iq-test' && programScores['iq-test'] !== undefined && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 text-center">
                  <div className="text-xs text-purple-600 uppercase tracking-wide mb-1"><TranslatedText text="IQ Score" /></div>
                  <div className="text-2xl font-bold text-purple-700">{programScores['iq-test']}</div>
                  <div className="text-xs text-purple-500"><TranslatedText text="estimated IQ" /></div>
                </div>
              )}
              {mainCategory === 'driving-license' && programScores['driving-license'] !== undefined && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 text-center">
                  <div className="text-xs text-purple-600 uppercase tracking-wide mb-1"><TranslatedText text="License Score" /></div>
                  <div className="text-2xl font-bold text-purple-700">{programScores['driving-license']}</div>
                </div>
              )}
              {mainCategory === 'logic' && programScores['logic'] !== undefined && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 text-center">
                  <div className="text-xs text-purple-600 uppercase tracking-wide mb-1"><TranslatedText text="Logic Score" /></div>
                  <div className="text-2xl font-bold text-purple-700">{programScores['logic']}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recommended Activities */}
      <div className="p-6 pt-0">
        <div className="text-lg font-semibold text-gray-900 mb-3"><TranslatedText text="Recommended Activities" /></div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {recommendations.activities.map((activity, index) => (
              <li key={index}><TranslatedText text={activity} /></li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
        <div className="italic">"<TranslatedText text="This assessment reflects performance at the time of testing and may vary over time." />"</div>
        <div className="mt-2 font-medium"><TranslatedText text="Generated on" /> {dayjs().format("DD MMM, YYYY HH:mm")} • Bazzingo</div>
      </div>

      {/* PDF-specific styles */}
      <style>{`
        .report-container {
          width: 850px;
          max-width: 850px;
        }
        .cognitive-item {
          break-inside: avoid;
          page-break-inside: avoid;
        }
        @media print {
          .report-container {
            width: 210mm;
            max-width: 210mm;
          }
          .cognitive-item {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
});

ReportComponent.displayName = 'ReportComponent';

export default ReportComponent;
