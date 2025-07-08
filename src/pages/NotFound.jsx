import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Search, Brain, Zap, Star } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <>
      {/* Custom CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 107, 62, 0.3); }
          50% { box-shadow: 0 0 40px rgba(255, 107, 62, 0.6); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center relative overflow-hidden" style={{ fontFamily: 'Roboto, sans-serif' }}>
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-orange-100 rounded-full opacity-60 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-orange-200 rounded-full opacity-40 animate-bounce" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-32 left-20 w-12 h-12 bg-orange-300 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-orange-100 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '0.5s' }}></div>

          {/* Floating Icons */}
          <div className="absolute top-16 right-1/4 animate-float">
            <Brain className="w-8 h-8 text-orange-300 opacity-60" />
          </div>
          <div className="absolute bottom-1/4 left-1/4 animate-float" style={{ animationDelay: '1.5s' }}>
            <Zap className="w-6 h-6 text-orange-400 opacity-50" />
          </div>
          <div className="absolute top-1/3 left-16 animate-float" style={{ animationDelay: '3s' }}>
            <Star className="w-7 h-7 text-orange-300 opacity-40" />
          </div>
        </div>

        <div className="text-center px-4 max-w-lg mx-auto relative z-10">
          {/* 404 Number with Enhanced Styling */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent blur-sm">
              <h1 className="text-[120px] md:text-[180px] font-black leading-none">
                404
              </h1>
            </div>
            <h1 className="relative text-[120px] md:text-[180px] font-black text-transparent bg-gradient-to-r from-[#FF6B3E] to-[#FF8A65] bg-clip-text leading-none animate-pulse">
              404
            </h1>
          </div>

          {/* Enhanced Icon with Animation */}
          <div className="mb-8 relative">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              <Search className="w-12 h-12 text-orange-500 relative z-10 animate-bounce" />
            </div>
            {/* Ripple Effect */}
            <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-2 border-orange-300 opacity-30 animate-ping"></div>
          </div>

          {/* Enhanced Main Message */}
          <h2 className="text-gray-900 font-bold mb-4 relative" style={{ fontSize: '28px' }}>
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Oops! Page Not Found
            </span>
          </h2>

          {/* Enhanced Description */}
          <p className="text-gray-600 mb-10 leading-relaxed" style={{ fontSize: '16px' }}>
            It looks like this page took a wrong turn in the digital maze! 🧩<br />
            Don't worry, even the best minds get lost sometimes. Let's get you back on track to continue your
            <span className="text-orange-500 font-semibold"> brain training adventure</span>.
          </p>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            {/* Go Back Button */}
            <button
              onClick={handleGoBack}
              className="group flex items-center justify-center gap-3 px-8 py-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:border-orange-300 hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              style={{ fontSize: '16px', fontWeight: '600' }}
            >
              <ArrowLeft className="w-5 h-5 group-hover:text-orange-500 transition-colors duration-300" />
              Go Back
            </button>

            {/* Go Home Button */}
            <button
              onClick={handleGoHome}
              className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#FF6B3E] to-[#FF8A65] text-white rounded-xl hover:from-[#e55a35] hover:to-[#FF6B3E] transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
              style={{ fontSize: '16px', fontWeight: '600' }}
            >
              <Home className="w-5 h-5 group-hover:animate-bounce" />
              Go Home
            </button>
          </div>

          {/* Enhanced Additional Help Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-100">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-orange-500" />
              <p className="text-gray-700 font-semibold" style={{ fontSize: '16px' }}>
                Continue Your Brain Training
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => navigate('/games')}
                className="group bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 text-orange-700 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-md border border-orange-200"
                style={{ fontSize: '14px', fontWeight: '600' }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 group-hover:text-orange-600" />
                  Games
                </div>
              </button>

              <button
                onClick={() => navigate('/assessments')}
                className="group bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-md border border-blue-200"
                style={{ fontSize: '14px', fontWeight: '600' }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Star className="w-4 h-4 group-hover:text-blue-600" />
                  Assessments
                </div>
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="group bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-md border border-green-200"
                style={{ fontSize: '14px', fontWeight: '600' }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Home className="w-4 h-4 group-hover:text-green-600" />
                  Dashboard
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
