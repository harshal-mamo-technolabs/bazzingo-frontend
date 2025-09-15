import React, { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const NoticeModal = ({ isOpen, onClose, title = "Congratulations!", message = "" }) => {
  useEffect(() => {
    if (isOpen) {
      // Create custom toast with the modal content
      toast.custom(
        (t) => (
          <div className="relative">
            {/* Left celebration streamers */}
            <div className="pointer-events-none absolute left-0 top-0 h-full w-20 md:w-28 overflow-hidden">
              <div className="absolute left-2 top-4 space-y-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={`l-${i}`}
                    className={`confetti-piece confetti-left-${i % 5}`}
                    style={{
                      animationDelay: `${(i % 5) * 0.3}s`,
                      left: `${(i % 3) * 6}px`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Right celebration streamers */}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-20 md:w-28 overflow-hidden">
              <div className="absolute right-2 top-4 space-y-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={`r-${i}`}
                    className={`confetti-piece confetti-right-${i % 5}`}
                    style={{
                      animationDelay: `${(i % 5) * 0.35}s`,
                      right: `${(i % 3) * 6}px`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl w-[90vw] md:w-[70vw] lg:w-[28vw] h-auto overflow-hidden">
              {/* Gradient header with emoji */}
              <div
                className="px-4 py-4 flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(90deg, #F4C3B4 0%, #FF6C40 100%)',
                }}
              >
                <span className="text-2xl">🎉</span>
                <h3 className="text-lg font-bold text-white text-center tracking-wide">{title}</h3>
                <span className="text-2xl">🎊</span>
              </div>

              {/* Content */}
              <div className="p-5">
                <p className="text-[15px] text-gray-800 text-center leading-relaxed">
                  {message || 'Great job keeping your streak alive!'}
                </p>

                {/* Subtle badge row */}
                {/* <div className="mt-3 flex items-center justify-center gap-2">
                  <img src="/medal-gold.png" alt="Badge" className="w-6 h-6" />
                  <span className="text-[12px] text-gray-700 font-medium">Keep it up!</span>
                </div> */}

                <div className="mt-5 flex justify-center">
                  <button 
                    onClick={() => {
                      toast.dismiss(t.id);
                      onClose();
                    }} 
                    className="px-5 py-2 text-sm bg-[#FF6B3D] hover:bg-[#e55a35] text-white rounded-lg font-semibold transition-colors"
                  >
                    Awesome
                  </button>
                </div>
              </div>
            </div>
          </div>
        ),
        {
          duration: Infinity, // Stay until dismissed
          position: 'top-center',
          id: 'notice-modal-toast', // Unique ID to prevent multiple toasts
        }
      );
    } else {
      // Dismiss the toast when modal is closed
      toast.dismiss('notice-modal-toast');
    }

    return () => {
      // Clean up toast when component unmounts
      toast.dismiss('notice-modal-toast');
    };
  }, [isOpen, onClose, title, message]);

  return (
    <>
      <Toaster 
        containerStyle={{
          top: 20,
          left: 0,
          bottom: 20,
          right: 0,
        }}
        toastOptions={{
          // Remove default toast styles
          style: {
            background: 'transparent',
            boxShadow: 'none',
            padding: 0,
            margin: 0,
          },
        }}
      />
      
      {/* Inline styles for confetti animation */}
      <style>{`
        @keyframes fallLeft {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        @keyframes fallRight {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(-360deg); opacity: 0; }
        }
        .confetti-piece {
          width: 8px;
          height: 14px;
          border-radius: 2px;
          opacity: 0.9;
          position: relative;
          animation-duration: 3.8s;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in;
        }
        .confetti-left-0 { background: #ff6b3d; animation-name: fallLeft; }
        .confetti-left-1 { background: #fbbf24; animation-name: fallLeft; }
        .confetti-left-2 { background: #34d399; animation-name: fallLeft; }
        .confetti-left-3 { background: #60a5fa; animation-name: fallLeft; }
        .confetti-left-4 { background: #a78bfa; animation-name: fallLeft; }
        .confetti-right-0 { background: #ff6b3d; animation-name: fallRight; }
        .confetti-right-1 { background: #fbbf24; animation-name: fallRight; }
        .confetti-right-2 { background: #34d399; animation-name: fallRight; }
        .confetti-right-3 { background: #60a5fa; animation-name: fallRight; }
        .confetti-right-4 { background: #a78bfa; animation-name: fallRight; }
      `}</style>
    </>
  );
};

export default NoticeModal;