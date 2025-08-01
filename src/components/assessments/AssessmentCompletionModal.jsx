import React, { useEffect, useRef, memo } from 'react';
import { X } from 'lucide-react';
import { BrainSilhouetteIcon, CertificateLightIcon, SunnyEffectImage, ConquerBadge } from "../../../public/assessment";

const AssessmentCompletionModal = ({ isOpen, onClose, selectedAssessment }) => {
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
              <p className="text-center text-4xl font-bold text-[#FF6947]">4/10</p>
            </div>
          </div>

          <hr className="border-t border-gray-200 mx-5 mt-4 mb-3" />

          <div className="px-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Suggested for You</h3>
          </div>

          <div className="flex mb-5">
            <div className="bg-white border border-orange-300 md:max-w-full 2xl:max-w-full lg:max-w-sm rounded-lg overflow-hidden shadow-sm w-full mx-5 my-auto">
              <div className="bg-[#ffd9ce] w-full px-3 py-2">
                <div className="flex items-center gap-3">
                  <img src={BrainSilhouetteIcon} alt="General Cognitive test" className="w-10 h-10 rounded p-0" />
                  <div>
                    <p className="text-md lg:text-sm font-semibold text-gray-800">General Cognitive test</p>
                    <span className="text-[10px] bg-gray-200 text-gray-700 font-semibold px-2 py-[2px] rounded-md inline-block mt-1">
                    Mini Test, 5-10 Question
                  </span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 flex flex-col justify-between gap-0">
                <div className="flex items-start gap-2 text-[13px] text-gray-700">
                  <img src={CertificateLightIcon} alt="Certification" className="w-5 h-5" />
                  <p className="text-[12px] 2xl:text[14px]">
                    Get a certified result you can share on LinkedIn or with employers.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between mt-1 p-1 gap-2">
                  <div className="text-xs text-gray-700 leading-4">
                    <p className="text-[12px]">Only</p>
                    <p className="text-[18px] font-bold text-black">€0.99</p>
                  </div>
                  <button className="px-4 py-1.5 text-[13px] bg-[#FF6B3D] min-w-[150px] text-white rounded-md font-semibold">
                    Start Certified Test
                  </button>
                </div>
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

export default memo(AssessmentCompletionModal);
