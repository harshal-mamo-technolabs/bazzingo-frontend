import React from "react";
import { DocumentArrowDownIcon } from "@heroicons/react/24/outline";

const FinishedCertificates = () => {
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
        {[1, 2, 3].map((_, idx) => (
          <div
            key={idx}
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
                  {idx === 2 ? "Memory Test" : "IQ Test"}
                </p>
                <p className="text-[10px] text-gray-500">21/01/2025</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="text-[12px] text-orange-500 bg-gray-100 border border-orange-500 px-3 py-1 rounded-md flex items-center gap-1">
                <DocumentArrowDownIcon className="w-3 h-3" /> Certificate
              </button>
              <button className="text-[12px] text-white bg-orange-500 px-3 py-1 rounded-md flex items-center gap-1">
                <DocumentArrowDownIcon className="w-3 h-3" /> Reports
              </button>
            </div>
          </div>
        ))}
      </div>
        </div>
        </div>

        <div className=" block lg:hidden">
           <div className="bg-[#EEEEEE] p-3 rounded-lg">
      <div className="flex gap-2 mb-1">
        <img src="/fluent_certi.png" />
        <h3 className="font-semibold text-gray-500 text-[11px]">
          Finished certified assessments
        </h3>
      </div>
      <div className="space-y-1">
        {[1, 2, 3].map((_, idx) => (
          <div
            key={idx}
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
                  {idx === 2 ? "Memory Test" : "IQ Test"}
                </p>
                <p className="text-[10px] text-gray-500">21/01/2025</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="text-[12px] text-orange-500 bg-gray-100 border border-orange-500 px-1 py-1 rounded-sm flex items-center gap-1">
                <DocumentArrowDownIcon className="w-3 h-3" /> Certificate
              </button>
              <button className="text-[12px] text-white bg-orange-500 px-1 py-1 rounded-sm flex items-center gap-1">
                <DocumentArrowDownIcon className="w-3 h-3" /> Reports
              </button>
            </div>
          </div>
        ))}
      </div>
    </div> 
        </div>
        </>
    );
};
export default FinishedCertificates;