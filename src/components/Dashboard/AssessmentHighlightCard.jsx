import { BrainSilhouetteOrangeIcon } from "../../../public/dashboard";
import React from "react";

export default function AssessmentHighlightCard() {
    return (
        <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-[#ffece6] rounded-lg p-2 h-[140px] flex items-center">
            <div className="w-[110px] h-[110px] bg-[#ff5722] rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <img
                    src={BrainSilhouetteOrangeIcon}
                    alt="Head silhouette with brain"
                    className="w-[100px] h-[100px] object-contain"
                />
            </div>
            <div className="flex flex-col justify-center">
                <div className="text-[16px] font-semibold text-gray-800 leading-snug">
                    Certified Cognitive Assessment
                </div>
                <div className="bg-[#e5cec8] text-black rounded-md px-2 py-[2px] text-[9px] border border-gray-400 font-medium inline-block mt-1 w-fit">
                    Mini Test, 5–10 Question
                </div>
            </div>
        </div>
    );
}