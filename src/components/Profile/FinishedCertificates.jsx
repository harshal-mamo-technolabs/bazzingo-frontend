import React, { useState, useEffect, useRef } from "react";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import {
  getSubmittedFullAssessments,
  getAdhdUserReports,
  getEmotionalIntelligenceUserReports,
} from "../../services/dashbaordService";
import dayjs from "dayjs";
import AssessmentDownloader from "./AssessmentDownloader";
import AdhdProfileReportDownloader from "./AdhdProfileReportDownloader";
import EmotionalIntelligenceProfileReportDownloader from "./EmotionalIntelligenceProfileReportDownloader";
import TranslatedText from "../TranslatedText.jsx";

const FinishedCertificates = ({ highlight = false }) => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState("");
  
  // Refs for downloader components
  const downloaderRefs = useRef({});

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        setError(null);

        const [fullRes, adhdRes, eiRes] = await Promise.allSettled([
          getSubmittedFullAssessments(),
          getAdhdUserReports(),
          getEmotionalIntelligenceUserReports(),
        ]);

        let list = [];
        if (fullRes.status === "fulfilled" && fullRes.value?.status === "success") {
          list = [...(fullRes.value.data?.scores || [])];
        } else if (fullRes.status === "rejected") {
          console.error("Failed to fetch full assessment scores:", fullRes.reason);
        }

        const adhdItems = [];
        if (adhdRes.status === "fulfilled" && adhdRes.value?.status === "success") {
          const d = adhdRes.value.data || {};
          const userInfo = d.userInfo && typeof d.userInfo === "object" ? d.userInfo : {};
          const reports = Array.isArray(d.reports) ? d.reports : [];
          reports.forEach((r, i) => {
            const meta = r.assessmentMeta && typeof r.assessmentMeta === "object"
              ? r.assessmentMeta
              : {};
            const stableId =
              meta.reportId ||
              meta._id ||
              `adhd-${meta.completedAt || meta.assessmentId || i}-${i}`;
            adhdItems.push({
              _id: stableId,
              assessmentName: "ADHD Trait Assessment",
              date:
                meta.completedAt ||
                r.completedAt ||
                new Date().toISOString(),
              canGenerateCertificate: false,
              canGenerateReport: true,
              isAdhdReport: true,
              adhdReportPayload: {
                totalScore: r.totalScore,
                byCategoryScores: r.byCategoryScores || {},
                assessmentMeta: { ...meta },
                userInfo,
              },
            });
          });
        } else if (adhdRes.status === "rejected") {
          console.error("Failed to fetch ADHD reports:", adhdRes.reason);
        }

        const eiItems = [];
        if (eiRes.status === "fulfilled" && eiRes.value?.status === "success") {
          const d = eiRes.value.data || {};
          const userInfo = d.userInfo && typeof d.userInfo === "object" ? d.userInfo : {};
          const reports = Array.isArray(d.reports) ? d.reports : [];
          reports.forEach((r, i) => {
            const meta =
              r.assessmentMeta && typeof r.assessmentMeta === "object"
                ? r.assessmentMeta
                : {};
            const stableId =
              meta.reportId ||
              meta._id ||
              `ei-${meta.completedAt || meta.assessmentId || i}-${i}`;
            eiItems.push({
              _id: stableId,
              assessmentName: "Emotional Intelligence Assessment",
              date: meta.completedAt || r.completedAt || new Date().toISOString(),
              canGenerateCertificate: false,
              canGenerateReport: true,
              isEmotionalIntelligenceReport: true,
              eiReportPayload: {
                totalScore: r.totalScore,
                byCategoryScores: r.byCategoryScores || {},
                assessmentMeta: { ...meta },
                userInfo,
              },
            });
          });
        } else if (eiRes.status === "rejected") {
          console.error("Failed to fetch Emotional Intelligence reports:", eiRes.reason);
        }

        const merged = [...list, ...adhdItems, ...eiItems].sort(
          (a, b) => new Date(b.date || 0) - new Date(a.date || 0),
        );

        setAssessments(merged);

        if (
          merged.length === 0 &&
          fullRes.status === "rejected" &&
          adhdRes.status === "rejected" &&
          eiRes.status === "rejected"
        ) {
          setError("Could not load assessment history.");
        }
      } catch (err) {
        console.error("Failed to fetch submitted assessments:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  const formatDate = (dateString) => {
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  const handleDownloadStart = (downloadId) => {
    setDownloading(downloadId);
  };

  const handleDownloadEnd = () => {
    setDownloading("");
  };

  const handleDownloadCertificate = (assessment) => {
    const downloaderRef = downloaderRefs.current[assessment._id];
    if (downloaderRef && downloaderRef.downloadCertificate) {
      downloaderRef.downloadCertificate();
    }
  };

  const handleDownloadReport = (assessment) => {
    const downloaderRef = downloaderRefs.current[assessment._id];
    if (downloaderRef && downloaderRef.downloadReport) {
      downloaderRef.downloadReport();
    }
  };

  const renderAssessmentItem = (assessment, idx) => (
    <div
      key={assessment._id || idx}
      className={`flex items-center justify-between bg-white rounded-lg px-4 py-1.5 transition-all duration-200 ${
        highlight ? 'shadow-md shadow-orange-100/50 border border-orange-100' : ''
      }`}
      style={highlight ? { willChange: 'transform, box-shadow' } : {}}
    >
      <div className="flex items-center gap-2">
        <div className={`w-10 h-10 rounded-md flex items-center justify-center transition-all duration-200 ${
          highlight ? 'bg-gradient-to-br from-orange-50 to-amber-50' : ''
        }`}
        style={highlight ? { willChange: 'background-color, transform' } : {}}
        >
          <img
            src="/Brain_game.png"
            alt="icon"
            className="w-9 h-9"
          />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-gray-800">
            {assessment.assessmentName}
          </p>
          <p className="text-[10px] text-gray-500">
            {formatDate(assessment.date)}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        {assessment.canGenerateCertificate && (
          <button 
            onClick={() => handleDownloadCertificate(assessment)}
            disabled={downloading === `certificate-${assessment._id}`}
            className={`text-[12px] text-orange-500 bg-gray-100 border border-orange-500 px-3 py-1 rounded-md flex items-center gap-1 disabled:opacity-50 transition-all duration-150 ${
              highlight 
                ? 'hover:bg-orange-100 hover:shadow-md hover:shadow-orange-100 hover:-translate-y-0.5' 
                : ''
            }`}
          >
            <DocumentArrowDownIcon className="w-3 h-3" /> 
            {downloading === `certificate-${assessment._id}` ? <TranslatedText text="Generating..." /> : <TranslatedText text="Certificate" />}
          </button>
        )}
        {assessment.canGenerateReport && (
          <button 
            onClick={() => handleDownloadReport(assessment)}
            disabled={downloading === `report-${assessment._id}`}
            className={`text-[12px] text-white bg-orange-500 px-3 py-1 rounded-md flex items-center gap-1 disabled:opacity-50 transition-all duration-150 ${
              highlight 
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-200/50 hover:shadow-xl hover:shadow-orange-300/50 hover:-translate-y-0.5' 
                : ''
            }`}
          >
            <DocumentArrowDownIcon className="w-3 h-3" /> 
            {downloading === `report-${assessment._id}` ? <TranslatedText text="Generating..." /> : <TranslatedText text="Reports" />}
          </button>
        )}
      </div>
    </div>
  );

  const renderMobileAssessmentItem = (assessment, idx) => (
    <div
      key={assessment._id || idx}
      className={`flex items-center justify-between bg-white rounded-lg px-2 py-1.5 transition-all duration-200 ${
        highlight ? 'shadow-md shadow-orange-100/50 border border-orange-100' : ''
      }`}
      style={highlight ? { willChange: 'transform, box-shadow' } : {}}
    >
      <div className="flex items-center gap-2">
        <div className={`w-10 h-10 rounded-md flex items-center justify-center transition-all duration-200 ${
          highlight ? 'bg-gradient-to-br from-orange-50 to-amber-50' : ''
        }`}
        style={highlight ? { willChange: 'background-color, transform' } : {}}
        >
          <img
            src="/Brain_game.png"
            alt="icon"
            className="w-9 h-9"
          />
        </div>
        <div>
          <p className="text-[12px] font-semibold text-gray-800">
            {assessment.assessmentName}
          </p>
          <p className="text-[10px] text-gray-500">
            {formatDate(assessment.date)}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        {assessment.canGenerateCertificate && (
          <button 
            onClick={() => handleDownloadCertificate(assessment)}
            disabled={downloading === `certificate-${assessment._id}`}
            className={`text-[12px] text-orange-500 bg-gray-100 border border-orange-500 px-1 py-1 rounded-sm flex items-center gap-1 disabled:opacity-50 transition-all duration-150 ${
              highlight 
                ? 'hover:bg-orange-100 active:bg-orange-100' 
                : ''
            }`}
          >
            <DocumentArrowDownIcon className="w-3 h-3" /> 
            {downloading === `certificate-${assessment._id}` ? <TranslatedText text="..." /> : <TranslatedText text="Certificate" />}
          </button>
        )}
        {assessment.canGenerateReport && (
          <button 
            onClick={() => handleDownloadReport(assessment)}
            disabled={downloading === `report-${assessment._id}`}
            className={`text-[12px] text-white bg-orange-500 px-1 py-1 rounded-sm flex items-center gap-1 disabled:opacity-50 transition-all duration-150 ${
              highlight 
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-md shadow-orange-200/50' 
                : ''
            }`}
          >
            <DocumentArrowDownIcon className="w-3 h-3" /> 
            {downloading === `report-${assessment._id}` ? <TranslatedText text="..." /> : <TranslatedText text="Reports" />}
          </button>
        )}
      </div>
    </div>
  );

  const renderEmptyState = () => (
      <div className="text-center py-8">
      <div className="text-gray-500 text-sm">
        <TranslatedText text="You haven't submitted any assessment to get report and certificate" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-[#EEEEEE] p-3 rounded-lg">
        <div className="flex gap-2 mb-1">
          <img src="/fluent_certi.png"/>
          <h3 className="font-semibold text-gray-500 text-[11px]">
            <TranslatedText text="Finished certified assessments" />
          </h3>
        </div>
          <div className="text-center py-4 text-gray-500 text-sm">
          <TranslatedText text="Loading..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#EEEEEE] p-3 rounded-lg">
        <div className="flex gap-2 mb-1">
          <img src="/fluent_certi.png"/>
          <h3 className="font-semibold text-gray-500 text-[11px]">
            <TranslatedText text="Finished certified assessments" />
          </h3>
        </div>
        <div className="text-center py-4 text-red-500 text-sm">
          <TranslatedText text="Error loading assessments" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="hidden lg:block">
        <div className="bg-[#EEEEEE] p-3 rounded-lg">
          <div className="flex gap-2 mb-1">
            <img src="/fluent_certi.png"/>
            <h3 className="font-semibold text-gray-500 text-[11px]">
              <TranslatedText text="Finished certified assessments" />
            </h3>
          </div>
          <div className="space-y-1">
            {assessments.length > 0 ? (
              assessments.map((assessment, idx) => renderAssessmentItem(assessment, idx))
            ) : (
              renderEmptyState()
            )}
          </div>
        </div>
      </div>

      <div className="block lg:hidden">
        <div className="bg-[#EEEEEE] p-3 rounded-lg">
          <div className="flex gap-2 mb-1">
            <img src="/fluent_certi.png" />
            <h3 className="font-semibold text-gray-500 text-[11px]">
            <TranslatedText text="Finished certified assessments" />
            </h3>
          </div>
          <div className="space-y-1">
            {assessments.length > 0 ? (
              assessments.map((assessment, idx) => renderMobileAssessmentItem(assessment, idx))
            ) : (
              renderEmptyState()
            )}
      </div>
    </div> 
        </div>

      {/* Assessment Downloaders */}
      {assessments.map((assessment) =>
        assessment.isAdhdReport ? (
          <AdhdProfileReportDownloader
            key={`adhd-${assessment._id}`}
            apiData={assessment.adhdReportPayload}
            reportListId={assessment._id}
            onDownloadStart={handleDownloadStart}
            onDownloadEnd={handleDownloadEnd}
            ref={(el) => {
              if (el) {
                downloaderRefs.current[assessment._id] = el;
              } else {
                delete downloaderRefs.current[assessment._id];
              }
            }}
          />
        ) : assessment.isEmotionalIntelligenceReport ? (
          <EmotionalIntelligenceProfileReportDownloader
            key={`ei-${assessment._id}`}
            apiData={assessment.eiReportPayload}
            reportListId={assessment._id}
            onDownloadStart={handleDownloadStart}
            onDownloadEnd={handleDownloadEnd}
            ref={(el) => {
              if (el) {
                downloaderRefs.current[assessment._id] = el;
              } else {
                delete downloaderRefs.current[assessment._id];
              }
            }}
          />
        ) : (
          <AssessmentDownloader
            key={assessment._id}
            assessment={assessment}
            onDownloadStart={handleDownloadStart}
            onDownloadEnd={handleDownloadEnd}
            ref={(el) => {
              if (el) {
                downloaderRefs.current[assessment._id] = el;
              } else {
                delete downloaderRefs.current[assessment._id];
              }
            }}
          />
        ),
      )}
    </>
  );
};
export default FinishedCertificates;