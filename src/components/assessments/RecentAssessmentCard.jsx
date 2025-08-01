import React from 'react';
import {CarIcon, MessageIcon} from "../../../public/assessment";

const RecentAssessmentCard = ({ assessment }) => {
  return (
    <div className="flex items-start justify-between bg-white rounded-xl px-5 py-4">
      <div className="flex items-start gap-4">
        <div
          className={`rounded-md flex items-center justify-center overflow-hidden bg-[#fce1d8]`}
          style={{ width: '56px', height: '56px' }}
        >
          {assessment.type === 'car' ? (
            <img src={CarIcon} alt="car icon" className="w-6 h-6 object-contain" />
          ) : (
            <img src={MessageIcon} alt="message icon" className="w-6 h-6 object-contain" />
          )}
        </div>

        <div>
          <h3 className="text-black self-start" style={{ fontSize: '16px', fontWeight: '600', fontFamily: 'Roboto, sans-serif' }}>
            {assessment.title}
          </h3>

          <span
            className="
              inline-block
              rounded-lg border-2 border-[#118C24]
              bg-gradient-to-b from-[#E2F8E0] via-[#CDEDC8] to-[#DAF3D5]
              px-2 py-1 mt-1
              text-[#118C24] font-bold text-[12px] leading-none
            "
          >
            {assessment.status}
          </span>
        </div>
      </div>

      <span className="text-black self-start" style={{ fontSize: '18px', fontWeight: '600', fontFamily: 'Roboto, sans-serif' }}>
        {assessment.score}
      </span>
    </div>
  );
};

export default RecentAssessmentCard;