import React, { memo } from "react";
import {BrainDuotoneIcon, DownloadCertificateIcon, PuzzlePiecesIcon} from "../../utils/dashboard-image.js";

const InfoDot = memo(({ title = "More info" }) => (
    <span
        className="w-4 h-4 rounded-full bg-gray-300 text-gray-600 text-[10px] flex items-center justify-center font-bold"
        title={title}
        aria-label={title}
    >
    i
  </span>
));

const StatItem = memo(({ topLabel, bottomLabel, value, infoTitle }) => (
    <div>
        <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-700 text-xs font-medium">{topLabel}</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
            <span className="text-gray-700 text-xs font-medium">{bottomLabel}</span>
            <InfoDot title={infoTitle} />
        </div>
        <div className="text-4xl font-bold text-gray-900 leading-none">{value}</div>
    </div>
));

function IQAndGamesSummary({ iqScore = 0, totalGames = 0, onDownloadCertificate }) {
    return (
        <>
            {/* Desktop / Tablet */}
            <div className="hidden sm:flex col-span-1 md:col-span-2 bg-white rounded-lg px-6 py-6 shadow-sm border border-gray-100 h-[140px] items-center justify-between">
                {/* Left: IQ Score */}
                <div className="flex items-center gap-8">
                    <StatItem
                        topLabel="Your IQ"
                        bottomLabel="Score"
                        value={iqScore}
                        infoTitle="Your latest IQ score"
                    />

                    {/* Brain Icon */}
                    <div className="flex items-center justify-center">
                        <img src={BrainDuotoneIcon} alt="Brain illustration" className="w-18 h-[90px] object-contain" />
                    </div>

                    {/* Certificate (clickable if handler provided) */}
                    <div className="flex items-center justify-center">
                        {onDownloadCertificate ? (
                            <button
                                type="button"
                                onClick={onDownloadCertificate}
                                className="focus:outline-none"
                                aria-label="Download certificate"
                                title="Download certificate"
                            >
                                <img
                                    src={DownloadCertificateIcon}
                                    alt="Download Certificate"
                                    className="w-18 h-[90px] object-contain"
                                />
                            </button>
                        ) : (
                            <img
                                src={DownloadCertificateIcon}
                                alt="Download Certificate"
                                className="w-18 h-[90px] object-contain"
                            />
                        )}
                    </div>
                </div>

                {/* Right: Total Games */}
                <div className="flex items-center gap-4">
                    <StatItem
                        topLabel="Total Game"
                        bottomLabel="Played"
                        value={totalGames}
                        infoTitle="Total games you have played"
                    />
                    <div className="flex items-center justify-center">
                        <img src={PuzzlePiecesIcon} alt="Puzzle pieces" className="w-18 h-[70px] object-contain" />
                    </div>
                </div>
            </div>

            {/* Mobile */}
            <div className="sm:hidden bg-white rounded-xl px-4 py-4 shadow-sm border border-gray-100 space-y-4">
                {/* Top Row */}
                <div className="flex justify-between items-center">
                    {/* IQ Score */}
                    <img src={BrainDuotoneIcon} alt="Brain" className="w-10 h-10 mb-1" />
                    <div className="flex flex-col items-center">
                        <p className="text-xs text-gray-700 font-medium">Your IQ Score</p>
                        <p className="text-2xl font-bold text-gray-900">{iqScore}</p>
                    </div>

                    {/* Total Game Played */}
                    <img src={PuzzlePiecesIcon} alt="Puzzle" className="w-10 h-10 mb-1" />
                    <div className="flex flex-col items-center">
                        <p className="text-xs text-gray-700 font-medium text-center">Total Game Played</p>
                        <p className="text-2xl font-bold text-gray-900">{totalGames}</p>
                    </div>
                </div>

                {/* Download Certificate Button */}
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={onDownloadCertificate}
                        className="bg-[#d4dcdc] w-full justify-center text-[#003135] font-semibold text-sm rounded-md px-4 py-2 flex items-center gap-2 disabled:opacity-60"
                        disabled={!onDownloadCertificate}
                        aria-label="Download certificate"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M3 14a1 1 0 001 1h12a1 1 0 001-1v-1H3v1zm4-2h6v-2h3L10 3 4 10h3v2z" />
                        </svg>
                        Download Certificate
                    </button>
                </div>
            </div>
        </>
    );
}

export default memo(IQAndGamesSummary);