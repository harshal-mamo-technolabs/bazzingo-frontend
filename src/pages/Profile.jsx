import React, { useState, useEffect, useRef } from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FinishedCertificates, Achievements } from "../components/Profile";
import EditProfileModal from "../components/Profile/EditProfileModal";
import {
  BellIcon,
  LockClosedIcon,
  TicketIcon,
  QuestionMarkCircleIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/solid";
import { getUserProfile, updateUserProfile } from "../services/dashbaordService";
import { refreshTokenLP } from "../services/authService";
import { login as loginAction, loading as loadingAction } from "../app/userSlice";
import { getTokenExpiry, API_RESPONSE_STATUS_SUCCESS } from "../utils/constant";
import MainLayout from "../components/Layout/MainLayout";
import TranslatedText from "../components/TranslatedText.jsx";
import toast from "react-hot-toast";

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const tokenProcessedRef = useRef(false);

  const settings = [
    { label: <TranslatedText text="Notification Preference" />, icon: BellIcon, route: '/notification-preferences' },
    { label: <TranslatedText text="Update Password" />, icon: LockClosedIcon, route: '/update-password' },
    // { label: <TranslatedText text="Ticket Raising System" />, icon: TicketIcon, route: '/client-ticket' },
    { label: <TranslatedText text="Help" />, icon: QuestionMarkCircleIcon, route: '/help-faqs' },
    // { label: <TranslatedText text="Faq" />, icon: ChatBubbleBottomCenterTextIcon, route: '/help-faqs' },
    { label: <TranslatedText text="AGB" />, icon: DocumentTextIcon, route: '/agb' },
    { label: <TranslatedText text="Impressum" />, icon: ShieldCheckIcon, route: '/impressum' },
  ];
  const unreadCount = 3;

  // Handle token-based login from URL (only once)
  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token || tokenProcessedRef.current) {
      // No token in URL or already processed, proceed with normal profile fetch
      return;
    }

    tokenProcessedRef.current = true;

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

            // Remove token from URL
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('token');
            setSearchParams(newSearchParams, { replace: true });

            // Set user data for display
            setUserData(user);

            toast.success('Logged in successfully!');
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

  if (loading) {
    return (
      <MainLayout unreadCount={unreadCount}>
        <div className="bg-white min-h-screen flex items-center justify-center">
          <div className="text-gray-600"><TranslatedText text="Loading profile..." /></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout unreadCount={unreadCount}>
      <div className="bg-white min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
        {/* Main Content - Web Layout*/}
        <div className="hidden lg:block mx-auto px-4 lg:px-12 py-4 lg:py-3">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column */}
            <div className="w-full lg:w-[600px] flex flex-col">
              <div className="order-1 lg:order-none space-y-2.5">
                {/* Profile Info */}
                <h3 className="font-semibold text-[15px] mb-2"><TranslatedText text="Profile Information" /></h3>
                <div className="bg-[#EEEEEE] p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {userData?.avatar ? (
                    <img
                      src={userData.avatar}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover"
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
                    <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-medium text-lg">
                      {(userData?.name || 'A').charAt(0).toUpperCase()}
                    </div>
                  )}
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
                    className="bg-black text-white text-[13px] px-4 py-1.5 rounded-md"
                  >
                    <TranslatedText text="Edit Profile" />
                  </button>
                </div>
              </div>

              <div className="order-2 lg:order-none space-y-2.5">
                {/* Certificates */}
                <h3 className="font-semibold text-[15px] mb-2 mt-2"><TranslatedText text="Certificate" /></h3>
                <FinishedCertificates />
              </div>

              <div className="order-4 lg:order-none p-1 space-y-2">
                {/* Settings */}
                <div className="p-1 space-y-2">
                  <h3 className="font-semibold text-[15px] mb-2"><TranslatedText text="Settings" /></h3>
                  {settings.map(({ label, icon: Icon, route }, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm p-3 hover:bg-gray-50 rounded-md border border-gray-300 cursor-pointer transition-colors"
                      onClick={() => handleSettingClick(route)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700 text-[12px]">{label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="w-full order-3 lg:order-none lg:w-[550px]">
              <h3 className="font-semibold text-[16px] mb-2"><TranslatedText text="Achievements" /></h3>
              <Achievements />
            </div>

          </div>
        </div>

        {/*Mobile Layout*/}
        <div className="block lg:hidden px-4 py-4 space-y-6">

          {/* Profile */}
          <div className="space-y-2.5">
            <h3 className="font-semibold text-[15px] mb-2"><TranslatedText text="Profile Information" /></h3>
            <div className="bg-[#EEEEEE] p-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                {userData?.avatar ? (
                    <img
                      src={userData.avatar}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover"
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
                    <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center font-medium text-lg">
                      {(userData?.name || 'A').charAt(0).toUpperCase()}
                    </div>
                  )}
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
                className="bg-black text-white text-[13px] px-4 py-1.5 rounded-md"
              >
                <TranslatedText text="Edit Profile" />
              </button>
            </div>
          </div>

          {/* Certificate */}
          <div className="space-y-2.5">
            <h3 className="font-semibold text-[15px] mb-2"><TranslatedText text="Certificate" /></h3>
            <FinishedCertificates />
          </div>

          {/* Achievements */}
          <div className="space-y-2.5">
            <h3 className="font-semibold text-[16px] mb-2"><TranslatedText text="Achievements" /></h3>
            <Achievements />
          </div>

          {/* Settings */}
          <div className="space-y-2.5">
            <h3 className="font-semibold text-[15px] mb-2"><TranslatedText text="Settings" /></h3>
            {settings.map(({ label, icon: Icon, route }, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm p-3 hover:bg-gray-50 rounded-md border border-gray-300 cursor-pointer transition-colors"
                onClick={() => handleSettingClick(route)}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 text-[12px]">{label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
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
    </MainLayout>
  );
};

export default Profile;
