import {MedalIcon} from "../../../public/dashboard";

export default function AssessmentUpsellCard() {
    return (
        <div className="col-span-1 md:col-span-2 lg:col-span-1 relative bg-white rounded-lg p-3 shadow-sm border border-orange-400 h-auto flex flex-col justify-between overflow-hidden">
            <img src={MedalIcon} alt="Medal Icon" className="w-9 h-9 object-contain mb-2 md:mb-0 mt-[-10px]" />
            <div className="flex items-start mb-2 md:mb-0 mt-0">
                <p className="text-[13px] text-gray-700 leading-snug">
                    Get a certified result you can share on LinkedIn or with employers.
                </p>
            </div>
            <div className="flex items-center gap-4 mt-2 mb-1">
                <div className="flex flex-col leading-none">
                    <span className="text-xs text-gray-500">Only</span>
                    <span className="text-md font-bold text-black">€0.99</span>
                </div>
                <button
                    className="bg-[#ff6b35] hover:bg-[#ff5a1c] text-white text-xs w-full font-medium py-2 px-4 rounded-[5px] transition"
                    type="button"
                >
                    Start Certified Test
                </button>
            </div>
        </div>
    )
}