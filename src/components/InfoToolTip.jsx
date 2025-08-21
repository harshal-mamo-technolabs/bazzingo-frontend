import React, { memo } from 'react';
import { Info as InfoIcon } from 'lucide-react';

function InfoTooltip({ text, visible, onTrigger }) {
    const tooltipId = 'info-tooltip';

    return (
        <button
            type="button"
            className="relative cursor-pointer"
            onClick={onTrigger}
            aria-label="Show info"
            aria-describedby={visible ? tooltipId : undefined}
        >
            <InfoIcon className="w-4 h-4 text-black" />
            {visible && (
                <div
                    id={tooltipId}
                    role="tooltip"
                    className="absolute top-6 right-0 z-50 w-[180px] p-2 text-xs text-black bg-white/20 backdrop-blur-md border border-white/30 rounded shadow-md"
                >
                    {text}
                </div>
            )}
        </button>
    );
}

export default memo(InfoTooltip);
