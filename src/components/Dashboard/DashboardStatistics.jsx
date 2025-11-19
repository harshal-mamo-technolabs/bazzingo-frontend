import InfoTooltip from "../InfoToolTip.jsx";
import handleTooltipClick from "../../utils/toolTipHandler.js";
import React, {Suspense} from "react";
import ProgressChart from "../Charts/ProgressChart.jsx";
import { useNavigate } from 'react-router-dom';
import TranslatedText from "../TranslatedText.jsx";
import { useTranslateText } from "../../hooks/useTranslate";

export default function DashboardStatistics({showTooltipStats, setShowTooltipStats}) {
    const navigate = useNavigate();
    const tooltipText = useTranslateText(
      "This chart shows how your score improves over time based on your gameplay."
    );

    return (
        <div className="bg-[#EEEEEE] bg-opacity-30 rounded-lg p-4 shadow-sm border border-gray-100 w-full">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-normal text-gray-900">
                      <TranslatedText text="Your statistics" />
                    </h3>
                    <InfoTooltip
                        text={tooltipText}
                        visible={showTooltipStats}
                        onTrigger={() => handleTooltipClick(setShowTooltipStats)}
                    />
                </div>
                <button
                    type="button"
                    className="text-black hover:text-orange-600 font-medium text-sm flex items-center space-x-1"
                    onClick={() => navigate('/statistics')}
                >
                    <span>
                      <TranslatedText text="Check Now" />
                    </span>
                    <span>→</span>
                </button>
            </div>

            <div className="relative h-40 w-full">
                <Suspense fallback={<div className="h-full w-full animate-pulse bg-gray-200 rounded"/>}>
                    <ProgressChart/>
                </Suspense>
            </div>
        </div>
    )
}