import React, { useState, useEffect, useRef } from "react";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { getSubmittedFullAssessments } from "../../services/dashbaordService";
import dayjs from "dayjs";
import AssessmentDownloader from "./AssessmentDownloader";

const FinishedCertificates = () => {
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
        const response = await getSubmittedFullAssessments();
        if (response?.status === 'success') {
          setAssessments(response.data?.scores || []);
        }
      } catch (err) {
        console.error('Failed to fetch submitted assessments:', err);
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
            className="flex items-center justify-between bg-white rounded-lg px-4 py-1.5"
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-md flex items-center justify-center">
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
            className="text-[12px] text-orange-500 bg-gray-100 border border-orange-500 px-3 py-1 rounded-md flex items-center gap-1 disabled:opacity-50"
          >
            <DocumentArrowDownIcon className="w-3 h-3" /> 
            {downloading === `certificate-${assessment._id}` ? 'Generating...' : 'Certificate'}
              </button>
        )}
        {assessment.canGenerateReport && (
          <button 
            onClick={() => handleDownloadReport(assessment)}
            disabled={downloading === `report-${assessment._id}`}
            className="text-[12px] text-white bg-orange-500 px-3 py-1 rounded-md flex items-center gap-1 disabled:opacity-50"
          >
            <DocumentArrowDownIcon className="w-3 h-3" /> 
            {downloading === `report-${assessment._id}` ? 'Generating...' : 'Reports'}
              </button>
        )}
            </div>
          </div>
  );

  const renderMobileAssessmentItem = (assessment, idx) => (
    <div
      key={assessment._id || idx}
            className="flex items-center justify-between bg-white rounded-lg px-2 py-1.5"
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-md flex items-center justify-center">
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
            className="text-[12px] text-orange-500 bg-gray-100 border border-orange-500 px-1 py-1 rounded-sm flex items-center gap-1 disabled:opacity-50"
          >
            <DocumentArrowDownIcon className="w-3 h-3" /> 
            {downloading === `certificate-${assessment._id}` ? 'Generating...' : 'Certificate'}
              </button>
        )}
        {assessment.canGenerateReport && (
          <button 
            onClick={() => handleDownloadReport(assessment)}
            disabled={downloading === `report-${assessment._id}`}
            className="text-[12px] text-white bg-orange-500 px-1 py-1 rounded-sm flex items-center gap-1 disabled:opacity-50"
          >
            <DocumentArrowDownIcon className="w-3 h-3" /> 
            {downloading === `report-${assessment._id}` ? 'Generating...' : 'Reports'}
              </button>
        )}
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-8">
      <div className="text-gray-500 text-sm">
        You haven't submitted any assessment to get report and certificate
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-[#EEEEEE] p-3 rounded-lg">
        <div className="flex gap-2 mb-1">
          <img src="/fluent_certi.png"/>
          <h3 className="font-semibold text-gray-500 text-[11px]">
            Finished certified assessments
          </h3>
        </div>
        <div className="text-center py-4 text-gray-500 text-sm">
          Loading...
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
            Finished certified assessments
          </h3>
        </div>
        <div className="text-center py-4 text-red-500 text-sm">
          Error loading assessments
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
              Finished certified assessments
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
              Finished certified assessments
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
      {assessments.map((assessment) => (
        <AssessmentDownloader
          key={assessment._id}
          assessment={assessment}
          onDownloadStart={handleDownloadStart}
          onDownloadEnd={handleDownloadEnd}
          ref={(el) => {
            if (el) {
              downloaderRefs.current[assessment._id] = el;
            }
          }}
        />
      ))}
        </>
    );
};
export default FinishedCertificates;