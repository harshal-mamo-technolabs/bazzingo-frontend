import React from 'react'
import { X } from 'lucide-react'

const NewAssessmentModal = ({ isOpen, onClose, selectedAssessment }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div class="
  relative bg-white rounded-lg shadow-xl
  w-[90vw]       /* xs/mobile */
  md:w-[70vw]    /* tablets */
  lg:w-[28vw]    /* desktop */
  md:max-h-[55vh]/* tablet cap */
  lg:max-h-[80vh]/* desktop cap */
  h-auto
  overflow-y-auto
">
        {/* Sunny effect + badge + pill */}
        <div className="relative w-full h-30 md:h-35 lg:h-35">
          {/* Rays background */}
          <div
            className="absolute inset-0 rounded-t-lg bg-cover bg-center"
            style={{ backgroundImage: 'url(./sunny-effect.png)' }}
          />

          {/* Gold badge */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-10">
            <img
              src="./conquer.png"
              alt="Conquer badge"
              className="object-contain w-16 h-16 md:w-20 md:h-20 lg:w-16 lg:h-16"
            />
          </div>

          {/* “Assessment Complete” pill */}

        </div>

        <div className="w-full text-center lg:mt-0 md:mt-5">
          <span className="inline-block bg-[#FF6947] text-white text-sm font-medium px-8 py-2 lg:py-1 rounded-full">
            Assessment Complete
          </span>
        </div>

        <div className="w-full text-center mt-1">
          <span className="text-center text-3xl font-bold italic text-[#208900]">
            Well Done!
          </span>
        </div>

        <div className="mt-3 mx-5">
          <div className="bg-[#FFF4F2] border border-[#FF6947] rounded-lg p-2">
            <p className="text-center text-lg font-semibold text-gray-800">
              Your Score
            </p>
            <p className=" text-center text-4xl font-bold text-[#FF6947]">
              0/10
            </p>
          </div>
        </div>

        <hr className="border-t border-gray-200 mx-5 mt-4 mb-3" />

        <div className="px-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Suggest for You
          </h3>
        </div>

        <div className='flex mb-5'>
          <div className="bg-white border border-orange-300 md:max-w-full 2xl:max-w-full lg:max-w-sm rounded-lg overflow-hidden shadow-sm w-full mx-5 my-auto">
            <div className="bg-[#ffd9ce] w-full px-3 py-2">
              <div className="flex items-center gap-3">
                <img
                  src="/brain_yellow.png"
                  alt="gct"
                  className="w-10 h-10 rounded p-0"
                />
                <div>
                  <p className="text-md lg:text-sm font-semibold text-gray-800">
                    General Cognitive test
                  </p>
                  <span className="text-[10px] bg-gray-200 text-gray-700 font-semibold px-2 py-[2px] rounded-md inline-block mt-1">
                    Mini Test, 5-10 Question
                  </span>
                </div>
              </div>
            </div>
            <div className="p-2.5 flex flex-col justify-between gap-0">
              <div className="flex items-start gap-2 text-[13px] text-gray-700">
                <img
                  src="/certificate-light.png"
                  alt="certification"
                  className="w-5 h-5"
                />
                <p className="text-[12px] 2xl:text-[14px]">
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

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}

export default NewAssessmentModal
