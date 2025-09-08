import React, { useEffect, useRef, memo } from 'react';
import { X } from 'lucide-react';
import { BrainSilhouetteIcon, CertificateLightIcon, SunnyEffectImage, ConquerBadge } from "../../../public/assessment";

const MiniAssessmentCompletionModal = ({ isOpen, onClose, score = 0, totalQuestions = 0 }) => {
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);
  const lastFocusedRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    lastFocusedRef.current = document.activeElement;
    closeBtnRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      const last = lastFocusedRef.current;
      if (last && typeof last.focus === 'function') last.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
      <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-labelledby="acm-title"
          role="dialog"
          aria-modal="true"
      >
        <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close"
            onClick={onClose}
        />

        <div
            ref={dialogRef}
            className="
          relative bg-white rounded-lg shadow-xl
          w-[90vw] md:w-[70vw] lg:w-[28vw]
          md:max-h-[55vh] lg:max-h-[80vh]
          h-auto overflow-y-auto
          transform transition-all duration-200 ease-out
          scale-100 opacity-100
        "
        >
          <div className="relative w-full h-28 md:h-32 lg:h-32">
            <div
                className="absolute inset-0 rounded-t-lg bg-cover bg-center"
                style={{ backgroundImage: `url(${SunnyEffectImage})` }}
            />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10">
              <img
                  src={ConquerBadge}
                  alt="Conquer badge"
                  className="object-contain w-16 h-16 md:w-20 md:h-20 lg:w-16 lg:h-16"
              />
            </div>
          </div>

          <div className="w-full text-center lg:mt-0 md:mt-5">
          <span className="inline-block bg-[#FF6947] text-white text-sm font-medium px-8 py-2 lg:py-1 rounded-full">
            Assessment Complete
          </span>
          </div>

          <div className="w-full text-center mt-1">
            <h2 id="acm-title" className="text-center text-3xl font-bold italic text-[#208900]">
              Well Done!
            </h2>
          </div>

          <div className="mt-3 mx-5">
            <div className="bg-[#FFF4F2] border border-[#FF6947] rounded-lg p-2">
              <p className="text-center text-lg font-semibold text-gray-800">Your Score</p>
              <p className="text-center text-4xl font-bold text-[#FF6947]">{score}/{totalQuestions}</p>
            </div>
          </div>

          <hr className="border-t border-gray-200 mx-5 mt-4 mb-3" />

          <div className="px-5">
            <h3 className="text-[14px] font-semibold text-gray-800 mb-3"> Unlock a full certified test of this and get a detailed report</h3>
          </div>

        <div className="flex mb-5">
  <div className="bg-white border-2 border-orange-400 rounded-xl shadow-md w-full mx-5 my-auto overflow-hidden">
    {/* Header */}
    <div className="bg-gradient-to-r from-orange-200 to-orange-100 px-4 py-2 
                flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
  <div className="flex items-center gap-3">
    <img
      src={BrainSilhouetteIcon}
      alt="Full Driving Assessment"
      className="w-10 h-10 sm:w-11 sm:h-11 p-1 bg-white rounded-full shadow"
    />
    <div>
      <p className="text-sm sm:text-[14px] font-bold text-gray-900">Full Driving Assessment</p>
      <span className="text-[10px] sm:text-[11px] bg-white text-gray-700 font-medium px-2 py-[2px] rounded-md inline-block mt-1 shadow-sm">
        Big Test, 15–20 Questions • Certified
      </span>
    </div>
  </div>
  {/* Locked Icon */}
  <div className="text-orange-600 font-bold text-[15px] sm:text-sm flex items-center gap-1">
    <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17 9h-1V7a4 4 0 00-8 0v2H7a2 2 0 00-2 2v9a2 2 0 
               002 2h10a2 2 0 002-2v-9a2 2 0 00-2-2zm-5 
               7a2 2 0 110-4 2 2 0 010 4zm3-7H9V7a3 3 0 
               016 0v2z"/>
    </svg>
    Locked
  </div>
</div>


    {/* Body */}
    <div className="p-4 space-y-3">
      <div className="flex items-start gap-3 text-[13px] text-gray-700">
        <img src={CertificateLightIcon} alt="Certification" className="w-5 h-5 mt-0.5" />
        <p className="text-[12px] leading-snug">
          Get a <span className="font-semibold text-gray-900">detailed certified report </span>
          with strengths, weaknesses, and recommendations and maintain<span className="font-semibold text-gray-900"> your progress in leaderboard</span>. Share on LinkedIn or with employers.
        </p>
      </div>
    </div>

    {/* Footer */}
    <div className="bg-gray-50 px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-3">
  <div className="text-center sm:text-left">
    <p className="text-xs text-gray-500">Unlock for only</p>
    <p className="text-lg sm:text-xl font-bold text-orange-600">€0.99</p>
  </div>
  <button className="w-full sm:w-auto px-5 py-2 text-sm bg-orange-500 hover:bg-orange-600 
                     transition text-white rounded-lg font-semibold shadow-md">
    Unlock & Start Test
  </button>
</div>

  </div>
</div>


          <button
              ref={closeBtnRef}
              onClick={onClose}
              className="absolute top-4 right-4 z-20 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
  );
};

export default memo(MiniAssessmentCompletionModal);