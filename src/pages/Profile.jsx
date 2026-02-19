import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronRight, Sparkles, Award, Download, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FinishedCertificates, Achievements } from "../components/Profile";
import EditProfileModal from "../components/Profile/EditProfileModal";
import {
  BellIcon,
  LockClosedIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  TicketIcon,
  ChatBubbleBottomCenterTextIcon,
  ClipboardIcon,
} from "@heroicons/react/24/solid";
import { getUserProfile, updateUserProfile } from "../services/dashbaordService";
import { refreshTokenLP } from "../services/authService";
import { login as loginAction, loading as loadingAction } from "../app/userSlice";
import { getTokenExpiry, API_RESPONSE_STATUS_SUCCESS } from "../utils/constant";
import MainLayout from "../components/Layout/MainLayout";
import TranslatedText from "../components/TranslatedText.jsx";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { useI18n } from "../context/I18nContext.jsx";
import { isProfilePageVisible, isComponentVisible } from "../config/accessControl";


// Premium Celebration Modal Component
const CelebrationModal = ({ isOpen, onClose, userName }) => {
  const [step, setStep] = useState(0);
  
  useEffect(() => {
    if (isOpen) {
      // Staggered reveal animation
      const timers = [
        setTimeout(() => setStep(1), 100),
        setTimeout(() => setStep(2), 400),
        setTimeout(() => setStep(3), 700),
        setTimeout(() => setStep(4), 1000),
      ];
      return () => timers.forEach(clearTimeout);
    } else {
      setStep(0);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center perspective-1000">
      {/* Premium dark backdrop with blur */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black/70 backdrop-blur-md celebration-backdrop"
        onClick={onClose}
      />
      
      {/* Ambient light effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[100px] celebration-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-400/15 rounded-full blur-[80px] celebration-glow-delayed" />
      </div>
      
      {/* Modal Card */}
      <div className={`relative max-w-lg w-full mx-6 celebration-card ${step >= 1 ? 'celebration-card-visible' : ''}`}>
        {/* Glass card */}
        <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Top accent line */}
          <div className="h-1 bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400" />
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-300 z-10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="px-8 pt-10 pb-8">
            {/* Award Badge */}
            <div className={`relative mb-8 celebration-badge ${step >= 2 ? 'celebration-badge-visible' : ''}`}>
              {/* Outer ring */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full border-2 border-orange-200 celebration-ring" />
              </div>
              {/* Inner glow */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-50 rounded-full blur-sm" />
              </div>
              {/* Badge */}
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full shadow-lg shadow-orange-500/30" />
                <div className="absolute inset-1 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center">
                  <Award className="w-10 h-10 text-white drop-shadow-sm" />
                </div>
                {/* Shine effect */}
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/30 to-transparent rotate-45 celebration-shine" />
                </div>
              </div>
            </div>
            
            {/* Title */}
            <div className={`text-center mb-3 celebration-text ${step >= 3 ? 'celebration-text-visible' : ''}`}>
              <p className="text-sm font-medium text-orange-500 uppercase tracking-widest mb-2">
                <TranslatedText text="Achievement Unlocked" />
              </p>
              <h2 className="text-2xl font-bold text-gray-900">
                <TranslatedText text="Congratulations" />, {userName || 'Champion'}!
              </h2>
            </div>
            
            {/* Description */}
            <div className={`text-center mb-8 celebration-text ${step >= 3 ? 'celebration-text-visible' : ''}`} style={{ transitionDelay: '100ms' }}>
              <p className="text-gray-600 leading-relaxed">
                <TranslatedText text="Your official certificate and detailed report are ready. Download them to showcase your achievement." />
              </p>
            </div>
            
            {/* Documents Preview */}
            <div className={`flex justify-center gap-6 mb-8 celebration-docs ${step >= 4 ? 'celebration-docs-visible' : ''}`}>
              <div className="text-center group cursor-pointer">
                <div className="w-16 h-20 mx-auto bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200 flex items-center justify-center mb-2 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-orange-200/50 transition-all duration-300">
                  <Award className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-xs font-medium text-gray-700"><TranslatedText text="Certificate" /></p>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="w-16 h-20 mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 flex items-center justify-center mb-2 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-blue-200/50 transition-all duration-300">
                  <DocumentTextIcon className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-xs font-medium text-gray-700"><TranslatedText text="Report" /></p>
              </div>
            </div>
            
            {/* Action Button */}
            <div className={`celebration-button ${step >= 4 ? 'celebration-button-visible' : ''}`}>
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 px-6 rounded-xl font-semibold shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 hover:from-orange-600 hover:to-amber-600 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Download className="w-5 h-5" />
                <TranslatedText text="View & Download" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Premium CSS Animations */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        
        .celebration-backdrop {
          animation: backdropFade 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .celebration-glow {
          animation: glowPulse 4s ease-in-out infinite;
        }
        
        .celebration-glow-delayed {
          animation: glowPulse 4s ease-in-out infinite;
          animation-delay: 2s;
        }
        
        .celebration-card {
          opacity: 0;
          transform: translateY(30px) scale(0.95);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .celebration-card-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        
        .celebration-badge {
          opacity: 0;
          transform: scale(0.5);
          transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .celebration-badge-visible {
          opacity: 1;
          transform: scale(1);
        }
        
        .celebration-ring {
          animation: ringExpand 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        
        .celebration-shine {
          animation: shine 3s ease-in-out infinite;
        }
        
        .celebration-text {
          opacity: 0;
          transform: translateY(15px);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .celebration-text-visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .celebration-docs {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .celebration-docs-visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .celebration-button {
          opacity: 0;
          transform: translateY(15px);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .celebration-button-visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        @keyframes backdropFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        
        @keyframes ringExpand {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        
        @keyframes shine {
          0% { transform: translateX(-200%) rotate(45deg); }
          30%, 100% { transform: translateX(200%) rotate(45deg); }
        }
      `}</style>
    </div>
  );
};

// Premium Token Login Loading Component
const TokenLoginLoader = () => (
  <div className="fixed inset-0 z-[90] flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
    {/* Subtle background pattern */}
    <div className="absolute inset-0 opacity-30">
      <div className="absolute inset-0" style={{ 
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(226 232 240) 1px, transparent 0)',
        backgroundSize: '32px 32px'
      }} />
    </div>
    
    {/* Ambient glow */}
    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-400/10 rounded-full blur-[120px]" />
    
    <div className="relative text-center px-6">
      {/* Logo/Icon with elegant animation */}
      <div className="relative mb-10">
        <div className="relative w-20 h-20 mx-auto">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 border-2 border-orange-200 rounded-full loader-ring" />
          {/* Progress arc */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle 
              cx="40" cy="40" r="38" 
              fill="none" 
              stroke="url(#loader-gradient)" 
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="240"
              className="loader-progress"
            />
            <defs>
              <linearGradient id="loader-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>
          </svg>
          {/* Center icon */}
          <div className="absolute inset-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Award className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>
      
      {/* Text content */}
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        <TranslatedText text="Preparing Your Achievement" />
      </h2>
      <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto">
        <TranslatedText text="We're verifying your credentials and loading your certificates..." />
      </p>
      
      {/* Elegant progress indicator */}
      <div className="flex justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <div 
            key={i}
            className="w-2 h-2 rounded-full bg-orange-400 loader-dot"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
    
    <style>{`
      .loader-ring {
        animation: ringRotate 3s linear infinite;
      }
      
      .loader-progress {
        animation: progressDash 2s ease-in-out infinite;
      }
      
      .loader-dot {
        animation: dotPulse 1.4s ease-in-out infinite;
      }
      
      @keyframes ringRotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @keyframes progressDash {
        0% { stroke-dashoffset: 240; }
        50% { stroke-dashoffset: 60; }
        100% { stroke-dashoffset: 240; }
      }
      
      @keyframes dotPulse {
        0%, 80%, 100% { 
          transform: scale(0.6);
          opacity: 0.4;
        }
        40% { 
          transform: scale(1);
          opacity: 1;
        }
      }
    `}</style>
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setLanguage } = useI18n();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isTokenLogin, setIsTokenLogin] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [highlightCertificates, setHighlightCertificates] = useState(false);
  const tokenProcessedRef = useRef(false);
  const certificateRef = useRef(null);
  const certificateMobileRef = useRef(null);
  
  // Fire elegant golden celebration
  const fireCelebration = useCallback(() => {
    // Check if we're on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    
    // Elegant gold/amber color palette
    const colors = ['#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7', '#ffffff'];
    
    // Mobile-optimized settings
    const baseConfig = {
      colors,
      shapes: ['circle'],
      zIndex: 9999, // Higher z-index for mobile
      disableForReducedMotion: false,
    };
    
    // Initial burst - elegant center bloom
    // Reduce particle count on mobile for better performance
    confetti({
      ...baseConfig,
      particleCount: isMobile ? 50 : 80,
      spread: isMobile ? 80 : 100,
      origin: { y: 0.5, x: 0.5 },
      scalar: isMobile ? 0.8 : 1,
      gravity: 0.8,
      drift: 0,
      ticks: isMobile ? 200 : 300,
    });
    
    // Delayed side shimmers
    setTimeout(() => {
      // Left shimmer
      confetti({
        ...baseConfig,
        particleCount: isMobile ? 25 : 40,
        angle: 60,
        spread: isMobile ? 45 : 55,
        origin: { x: 0, y: 0.6 },
        scalar: isMobile ? 0.6 : 0.8,
        gravity: 0.6,
        ticks: isMobile ? 150 : 250,
      });
      // Right shimmer
      confetti({
        ...baseConfig,
        particleCount: isMobile ? 25 : 40,
        angle: 120,
        spread: isMobile ? 45 : 55,
        origin: { x: 1, y: 0.6 },
        scalar: isMobile ? 0.6 : 0.8,
        gravity: 0.6,
        ticks: isMobile ? 150 : 250,
      });
    }, 300);
    
    // Gentle falling sparkles
    setTimeout(() => {
      confetti({
        ...baseConfig,
        particleCount: isMobile ? 20 : 30,
        spread: isMobile ? 150 : 180,
        origin: { y: 0, x: 0.5 },
        colors: ['#fbbf24', '#fcd34d', '#ffffff'],
        scalar: isMobile ? 0.5 : 0.6,
        gravity: 0.4,
        drift: 1,
        ticks: isMobile ? 250 : 400,
      });
    }, 600);
  }, []);
  
  // Scroll to certificate section
  const scrollToCertificates = useCallback(() => {
    setTimeout(() => {
      const ref = window.innerWidth >= 1024 ? certificateRef : certificateMobileRef;
      if (ref.current) {
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 500);
  }, []);

  const baseSettings = [
    {
      label: <TranslatedText text="Notification Preference" />,
      icon: BellIcon,
      route: "/notification-preferences",
    },
    {
      label: <TranslatedText text="Update Password" />,
      icon: LockClosedIcon,
      route: "/update-password",
    },
    {
      label: <TranslatedText text="Help" />,
      icon: QuestionMarkCircleIcon,
      route: "/help-faqs",
    },
  ];
  
  // Conditionally visible profile pages
  const profilePages = [
    {
      label: <TranslatedText text="Ticket Raising System" />,
      icon: TicketIcon,
      route: "/client-ticket",
      pageKey: "ticketRaisingSystem",
    },
    {
      label: <TranslatedText text="Faq" />,
      icon: ChatBubbleBottomCenterTextIcon,
      route: "/help-faqs",
      pageKey: "faq",
    },
    {
      label: <TranslatedText text="Privacy Policy" />,
      icon: ShieldCheckIcon,
      route: "/privacy-policy",
      pageKey: "privacyPolicy",
    },
    {
      label: <TranslatedText text="Terms of Use" />,
      icon: ClipboardIcon,
      route: "/terms-of-use",
      pageKey: "termsOfUse",
    },
    {
      label: <TranslatedText text="AGB" />,
      icon: DocumentTextIcon,
      route: "/agb",
      pageKey: "agb",
    },
    {
      label: <TranslatedText text="Impressum" />,
      icon: ShieldCheckIcon,
      route: "/impressum",
      pageKey: "impressum",
    },
  ];
  
  // Filter based on access control
  const visibleProfilePages = profilePages.filter(page =>
    isProfilePageVisible(page.pageKey)
  );
  
  // Filter base settings to hide update password if switch is enabled
  const filteredBaseSettings = baseSettings.filter(setting => {
    if (setting.route === "/update-password" && isComponentVisible('hideUpdatePasswordForMSISDN')) {
      return false; // Hide update password if switch is enabled
    }
    return true;
  });
  
  // Final settings list
  const settings = [...filteredBaseSettings, ...visibleProfilePages];
  const unreadCount = 3;

  // Handle token-based login from URL (only once)
  useEffect(() => {
    const token = searchParams.get('token');
    const langParam = searchParams.get('lang');
    
    // Handle language parameter first (even if no token)
    if (langParam) {
      const validLanguages = ['en', 'de', 'ro'];
      if (validLanguages.includes(langParam.toLowerCase())) {
        setLanguage(langParam.toLowerCase());
      }
    }
    
    if (!token || tokenProcessedRef.current) {
      // No token in URL or already processed, proceed with normal profile fetch
      // But still remove lang parameter if present
      if (langParam) {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('lang');
        setSearchParams(newSearchParams, { replace: true });
      }
      return;
    }

    tokenProcessedRef.current = true;
    setIsTokenLogin(true);

    const handleTokenLogin = async () => {
      try {
        setLoading(true);
        dispatch(loadingAction());

        // Call refresh token API
        const response = await refreshTokenLP(token);

        if (response.status === API_RESPONSE_STATUS_SUCCESS && response.data?.token) {
          const newToken = response.data.token;

          // Fetch user profile with new token
          // We need to temporarily set the token to fetch user data
          const tempUserData = {
            user: null, // Will be fetched
            accessToken: newToken,
            tokenExpiry: getTokenExpiry(),
          };
          
          // Temporarily store token to fetch user profile
          localStorage.setItem("user", JSON.stringify(tempUserData));

          try {
            // Fetch user profile
            const profileResponse = await getUserProfile();
            const user = profileResponse.data.user;

            // Store complete user data with token
            const completeUserData = {
              user: user,
              accessToken: newToken,
              tokenExpiry: getTokenExpiry(),
            };

            // Update localStorage and Redux
            localStorage.setItem("user", JSON.stringify(completeUserData));
            dispatch(loginAction(completeUserData));

            // Remove token and lang from URL
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('token');
            newSearchParams.delete('lang');
            setSearchParams(newSearchParams, { replace: true });

            // Set user data for display
            setUserData(user);

            // 🎉 Trigger celebration!
            setLoading(false);
            setIsTokenLogin(false);
            
            // Small delay to ensure DOM is ready, especially on mobile
            setTimeout(() => {
              // Fire confetti
              try {
                fireCelebration();
              } catch (error) {
                console.error('Confetti error:', error);
                // Fallback: try again after a short delay
                setTimeout(() => {
                  try {
                    fireCelebration();
                  } catch (retryError) {
                    console.error('Confetti retry error:', retryError);
                  }
                }, 200);
              }
            }, 100);
            
            // Show celebration modal
            setShowCelebration(true);
            
            // Highlight certificates section
            setHighlightCertificates(true);
            
            // Scroll to certificates after modal closes or after a delay
            scrollToCertificates();
            
            // Remove highlight after 10 seconds
            setTimeout(() => setHighlightCertificates(false), 10000);
            
            toast.success('Welcome! Your documents are ready to download.');
          } catch (profileError) {
            console.error('Failed to fetch user profile after token refresh:', profileError);
            // Even if profile fetch fails, we still have the token
            // Store what we have
            const minimalUserData = {
              user: null,
              accessToken: newToken,
              tokenExpiry: getTokenExpiry(),
            };
            localStorage.setItem("user", JSON.stringify(minimalUserData));
            dispatch(loginAction(minimalUserData));
            
            // Remove token from URL
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('token');
            setSearchParams(newSearchParams, { replace: true });
            
            setIsTokenLogin(false);
            toast.error('Logged in but failed to load profile. Please refresh the page.');
          }
        } else {
          throw new Error('Invalid response from token refresh');
        }
      } catch (error) {
        console.error('Failed to refresh token:', error);
        toast.error('Failed to authenticate with token. Please try again.');
        
        // Remove token from URL even on error
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('token');
        setSearchParams(newSearchParams, { replace: true });
        setIsTokenLogin(false);
      } finally {
        setLoading(false);
        dispatch(loadingAction());
      }
    };

    handleTokenLogin();
  }, []); // Only run once on mount - token is read from URL on initial load

  // Fetch user profile data (only if not already fetched from token login)
  useEffect(() => {
    // Skip if we're processing a token login or already have user data
    if (searchParams.get('token') || userData) {
      return;
    }

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await getUserProfile();
        setUserData(response.data.user);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [searchParams, userData]);

  const handleSettingClick = (route) => {
    if (route) {
      navigate(route);
    }
  };

  // Show special loader for token login
  if (loading && isTokenLogin) {
    return <TokenLoginLoader />;
  }

  if (loading) {
    return (
      <MainLayout unreadCount={unreadCount}>
        <div className="profile-loading-screen min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-orange-50/20">
          <div className="profile-loading-content text-center">
            <div className="profile-loading-avatar" />
            <p className="text-gray-500 mt-4 text-sm font-medium"><TranslatedText text="Loading profile..." /></p>
            <div className="profile-loading-dots">
              <span /><span /><span />
            </div>
          </div>
          <style>{`
            .profile-loading-screen { font-family: Inter, sans-serif; }
            .profile-loading-avatar {
              width: 56px; height: 56px; margin: 0 auto;
              border-radius: 50%; background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
              animation: profileLoadingPulse 1.5s ease-in-out infinite;
            }
            .profile-loading-dots { display: flex; justify-content: center; gap: 6px; margin-top: 12px; }
            .profile-loading-dots span {
              width: 6px; height: 6px; border-radius: 50%; background: #f97316;
              animation: profileLoadingDot 1.2s ease-in-out infinite;
            }
            .profile-loading-dots span:nth-child(2) { animation-delay: 0.2s; }
            .profile-loading-dots span:nth-child(3) { animation-delay: 0.4s; }
            @keyframes profileLoadingPulse {
              0%, 100% { opacity: 0.6; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.05); }
            }
            @keyframes profileLoadingDot {
              0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
              40% { transform: scale(1.2); opacity: 1; }
            }
          `}</style>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout unreadCount={unreadCount}>
      <div className="profile-page min-h-screen relative overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
        {/* Subtle animated background */}
        <div className="absolute inset-0 pointer-events-none profile-bg-gradient" aria-hidden />
        <div className="absolute inset-0 pointer-events-none profile-bg-dots" aria-hidden />

        {/* Main Content - Web Layout*/}
        <div className="hidden lg:block mx-auto px-4 lg:px-12 py-4 lg:py-3 relative z-10">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column */}
            <div className="w-full lg:w-[600px] flex flex-col">
              <div className="order-1 lg:order-none space-y-2.5 profile-section profile-section-1">
                {/* Profile Info */}
                <h3 className="font-semibold text-[15px] mb-2 profile-heading"><TranslatedText text="Profile Information" /></h3>
                <div className="profile-card bg-[#EEEEEE] p-3 rounded-xl flex items-center justify-between border border-gray-200/80 shadow-sm hover:shadow-md hover:border-gray-300/80 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="profile-avatar-wrap relative flex-shrink-0">
                      {userData?.avatar ? (
                    <img
                      src={userData.avatar}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white/80 shadow-md"
                      onError={(e) => {
                        // If image fails to load, show initials
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        if (parent && !parent.querySelector('.avatar-fallback')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'avatar-fallback w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-medium text-lg';
                          fallback.textContent = (userData?.name || 'A').charAt(0).toUpperCase();
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-medium text-lg ring-2 ring-white/80 shadow-md">
                      {(userData?.name || 'A').charAt(0).toUpperCase()}
                    </div>
                  )}
                    </div>
                    <div>
                      <h2 className="text-[15px] font-normal text-gray-800">
                        {userData?.name || "Alex Johnson"}
                      </h2>
                      <div className="flex gap-2">
                        <p className="text-[13px] text-gray-500"><TranslatedText text="Age" />: {userData?.age || 25}</p>
                        {userData?.stripeCustomerId && (
                          <span className="text-[10px] text-white bg-orange-500 px-2 py-0.5 rounded-md mt-1 inline-block">
                            <TranslatedText text="Premium" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
<button
                    onClick={() => setIsEditModalOpen(true)}
                    className="profile-edit-btn bg-black text-white text-[13px] px-4 py-1.5 rounded-lg hover:bg-gray-800 active:scale-[0.98] transition-all duration-200 shadow-sm"
                  >
                    <TranslatedText text="Edit Profile" />
                  </button>
                </div>
              </div>

              <div
                ref={certificateRef}
                className={`profile-section profile-section-2 order-2 lg:order-none space-y-2.5 transition-all duration-300 ease-out rounded-2xl relative ${
                  highlightCertificates 
                    ? 'bg-gradient-to-br from-orange-50/80 to-amber-50/60 lg:p-4 lg:-m-4 p-2 -m-2 shadow-xl shadow-orange-100/50' 
                    : ''
                }`}
              >
                {/* Subtle glow effect */}
                {highlightCertificates && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400/10 via-amber-400/10 to-orange-400/10 certificate-glow pointer-events-none" />
                )}
                
                {/* Certificates */}
                <h3 className={`font-semibold text-[15px] mb-2 mt-2 transition-all duration-200 flex items-center gap-2 relative ${
                  highlightCertificates ? 'text-orange-600' : ''
                }`}>
                  {highlightCertificates && (
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full">
                      <Award className="w-3.5 h-3.5 text-white" />
                    </span>
                  )}
                  <TranslatedText text="Certificate" />
                  {highlightCertificates && (
                    <span className="text-xs font-normal text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full">
                      <TranslatedText text="Ready" />
                    </span>
                  )}
                </h3>
                <FinishedCertificates highlight={highlightCertificates} />
              </div>

              <div className="profile-section profile-section-4 order-4 lg:order-none p-1 space-y-2">
                {/* Settings */}
                <div className="p-1 space-y-2">
                  <h3 className="font-semibold text-[15px] mb-2 profile-heading"><TranslatedText text="Settings" /></h3>
                  {settings.map(({ label, icon: Icon, route }, i) => (
                    <div
                      key={i}
                      className="profile-setting-item group flex items-center justify-between text-sm p-3 hover:bg-gray-50 rounded-xl border border-gray-300 cursor-pointer transition-all duration-300 hover:border-orange-200 hover:shadow-sm"
                      onClick={() => handleSettingClick(route)}
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-gray-500 profile-setting-icon transition-all duration-300 group-hover:scale-110 group-hover:text-orange-500" />
                        <span className="text-gray-700 text-[12px]">{label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 profile-setting-chevron transition-transform duration-300 group-hover:translate-x-0.5" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="profile-section profile-section-3 w-full order-3 lg:order-none lg:w-[550px]">
              <h3 className="font-semibold text-[16px] mb-2 profile-heading"><TranslatedText text="Achievements" /></h3>
              <Achievements />
            </div>

          </div>
        </div>

        {/*Mobile Layout*/}
        <div className="block lg:hidden px-4 py-4 space-y-6 relative z-10">
          {/* Profile */}
          <div className="profile-section profile-section-1 space-y-2.5">
            <h3 className="font-semibold text-[15px] mb-2 profile-heading"><TranslatedText text="Profile Information" /></h3>
            <div className="profile-card bg-[#EEEEEE] p-3 rounded-xl flex items-center justify-between border border-gray-200/80 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="profile-avatar-wrap relative flex-shrink-0">
                {userData?.avatar ? (
                    <img
                      src={userData.avatar}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white/80 shadow-md"
                      onError={(e) => {
                        // If image fails to load, show initials
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        if (parent && !parent.querySelector('.avatar-fallback')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'avatar-fallback w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-medium text-lg';
                          fallback.textContent = (userData?.name || 'A').charAt(0).toUpperCase();
                          parent.appendChild(fallback);
                        }
                      }}
                    />
) : (
                    <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-medium text-lg ring-2 ring-white/80 shadow-md">
                      {(userData?.name || 'A').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-[15px] font-normal text-gray-800">
                    {userData?.name || "Alex Johnson"}
                  </h2>
                  <div className="flex gap-2">
                    <p className="text-[13px] text-gray-500"><TranslatedText text="Age" />: {userData?.age || 25}</p>
                    {userData?.stripeCustomerId && (
                      <span className="text-[10px] text-white bg-orange-500 px-2 py-0.5 rounded-md mt-1 inline-block">
                        <TranslatedText text="Premium" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="profile-edit-btn bg-black text-white text-[13px] px-4 py-1.5 rounded-lg hover:bg-gray-800 active:scale-[0.98] transition-all duration-200"
              >
                <TranslatedText text="Edit Profile" />
              </button>
            </div>
          </div>

          {/* Certificate */}
          <div
            ref={certificateMobileRef}
            className={`profile-section profile-section-2 space-y-2.5 transition-all duration-300 ease-out rounded-2xl relative ${
              highlightCertificates 
                ? 'bg-gradient-to-br from-orange-50/80 to-amber-50/60 p-2 -m-2 shadow-xl shadow-orange-100/50' 
                : ''
            }`}
          >
            {/* Subtle glow effect */}
            {highlightCertificates && (
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400/10 via-amber-400/10 to-orange-400/10 certificate-glow pointer-events-none" />
            )}
            
            <h3 className={`font-semibold text-[15px] mb-2 transition-all duration-200 flex items-center gap-2 relative ${
              highlightCertificates ? 'text-orange-600' : ''
            }`}>
              {highlightCertificates && (
                <span className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full">
                  <Award className="w-3.5 h-3.5 text-white" />
                </span>
              )}
              <TranslatedText text="Certificate" />
              {highlightCertificates && (
                <span className="text-xs font-normal text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full">
                  <TranslatedText text="Ready" />
                </span>
              )}
            </h3>
            <FinishedCertificates highlight={highlightCertificates} />
          </div>

          {/* Achievements */}
          <div className="profile-section profile-section-3 space-y-2.5">
            <h3 className="font-semibold text-[16px] mb-2 profile-heading"><TranslatedText text="Achievements" /></h3>
            <Achievements />
          </div>

          {/* Settings */}
          <div className="profile-section profile-section-4 space-y-2.5">
            <h3 className="font-semibold text-[15px] mb-2 profile-heading"><TranslatedText text="Settings" /></h3>
            {settings.map(({ label, icon: Icon, route }, i) => (
              <div
                key={i}
                className="profile-setting-item group flex items-center justify-between text-sm p-3 hover:bg-gray-50 rounded-xl border border-gray-300 cursor-pointer transition-all duration-300 hover:border-orange-200 hover:shadow-sm"
                onClick={() => handleSettingClick(route)}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-gray-500 transition-all duration-300 group-hover:scale-110 group-hover:text-orange-500" />
                  <span className="text-gray-700 text-[12px]">{label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 transition-transform duration-300 group-hover:translate-x-0.5" />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentProfile={userData || {}}
        onSave={async (updatedData) => {
          try {
            await updateUserProfile(updatedData);
            // Refresh user data
            const response = await getUserProfile();
            setUserData(response.data.user);
          } catch (error) {
            console.error('Failed to update profile:', error);
          }
        }}
      />
      
      {/* Celebration Modal for Token Login */}
      <CelebrationModal 
        isOpen={showCelebration} 
        onClose={() => {
          setShowCelebration(false);
          scrollToCertificates();
        }}
        userName={userData?.name}
      />
      
      {/* Global styles for animations */}
      <style>{`
        @keyframes certificateGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        .certificate-glow {
          animation: certificateGlow 2s ease-in-out infinite;
        }
        /* Profile page background layers */
        .profile-page { position: relative; min-height: 100%; }
        .profile-bg-gradient {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background: linear-gradient(135deg, rgba(255,247,237,0.4) 0%, transparent 40%, transparent 60%, rgba(254,243,199,0.2) 100%);
        }
        .profile-bg-dots {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image: radial-gradient(rgba(251,146,60,0.12) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        /* Staggered section entrance */
        @keyframes profileSectionEnter {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .profile-section {
          animation: profileSectionEnter 0.5s ease-out forwards;
          opacity: 0;
        }
        .profile-section-1 { animation-delay: 0.05s; }
        .profile-section-2 { animation-delay: 0.15s; }
        .profile-section-3 { animation-delay: 0.25s; }
        .profile-section-4 { animation-delay: 0.35s; }
        .profile-heading { letter-spacing: 0.02em; }
        .profile-card { transition: box-shadow 0.3s ease, border-color 0.3s ease; }
        .profile-avatar-wrap { transition: transform 0.3s ease; }
        .profile-edit-btn { transition: background-color 0.2s ease, transform 0.2s ease; }
        .profile-setting-item { transition: border-color 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease; }
        .profile-setting-icon { transition: transform 0.3s ease, color 0.3s ease; }
        .profile-setting-chevron { transition: transform 0.3s ease; }
      `}</style>
    </MainLayout>
  );
};

export default Profile;
