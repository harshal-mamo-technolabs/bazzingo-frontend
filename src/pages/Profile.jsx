import React, { useState,useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { getUserProfile } from "../services/dashbaordService";
import MainLayout from "../components/Layout/MainLayout";

const Profile = () => {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  const settings = [
    { label: 'Notification Preference', icon: BellIcon, route: '/notification-preferences' },
    { label: 'Update Password', icon: LockClosedIcon, route: '/update-password' },
    { label: 'Ticket Raising System', icon: TicketIcon, route: '/client-ticket' },
    { label: 'Help', icon: QuestionMarkCircleIcon, route: '/help-faqs' },
    { label: 'Faq', icon: ChatBubbleBottomCenterTextIcon, route: '/help-faqs' },
    { label: 'Terms of use', icon: DocumentTextIcon, route: '/terms-of-use' },
    { label: 'Privacy Policy', icon: ShieldCheckIcon, route: '/privacy-policy' },
  ];
  const unreadCount = 3;

  // Fetch user profile data
  useEffect(() => {
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
  }, []);

  const handleSettingClick = (route) => {
    if (route) {
      navigate(route);
    }
  };

  if (loading) {
    return (
      <MainLayout unreadCount={unreadCount}>
        <div className="bg-white min-h-screen flex items-center justify-center">
          <div className="text-gray-600">Loading profile...</div>
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
                <h3 className="font-semibold text-[15px] mb-2">Profile Information</h3>
                <div className="bg-[#EEEEEE] p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={userData?.avatar || "https://i.pravatar.cc/80"}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://i.pravatar.cc/80";
                      }}
                    />
                    <div>
                      <h2 className="text-[15px] font-normal text-gray-800">
                        {userData?.name || "Alex Johnson"}
                      </h2>
                      <div className="flex gap-2">
                        <p className="text-[13px] text-gray-500">Age: {userData?.age || 25}</p>
                        {userData?.stripeCustomerId && (
                          <span className="text-[10px] text-white bg-orange-500 px-2 py-0.5 rounded-md mt-1 inline-block">
                            Premium
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="bg-black text-white text-[13px] px-4 py-1.5 rounded-md"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>

              <div className="order-2 lg:order-none space-y-2.5">
                {/* Certificates */}
                <h3 className="font-semibold text-[15px] mb-2 mt-2">Certificate</h3>
                <FinishedCertificates />
              </div>

              <div className="order-4 lg:order-none p-1 space-y-2">
                {/* Settings */}
                <div className="p-1 space-y-2">
                  <h3 className="font-semibold text-[15px] mb-2">Settings</h3>
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
              <h3 className="font-semibold text-[16px] mb-2">Achievements</h3>
              <Achievements />
            </div>

          </div>
        </div>

        {/*Mobile Layout*/}
        <div className="block lg:hidden px-4 py-4 space-y-6">

          {/* Profile */}
          <div className="space-y-2.5">
            <h3 className="font-semibold text-[15px] mb-2">Profile Information</h3>
            <div className="bg-[#EEEEEE] p-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={userData?.avatar || "https://i.pravatar.cc/80"}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://i.pravatar.cc/80";
                  }}
                />
                <div>
                  <h2 className="text-[15px] font-normal text-gray-800">
                    {userData?.name || "Alex Johnson"}
                  </h2>
                  <div className="flex gap-2">
                    <p className="text-[13px] text-gray-500">Age: {userData?.age || 25}</p>
                    {userData?.stripeCustomerId && (
                      <span className="text-[10px] text-white bg-orange-500 px-2 py-0.5 rounded-md mt-1 inline-block">
                        Premium
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="bg-black text-white text-[13px] px-4 py-1.5 rounded-md"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Certificate */}
          <div className="space-y-2.5">
            <h3 className="font-semibold text-[15px] mb-2">Certificate</h3>
            <FinishedCertificates />
          </div>

          {/* Achievements */}
          <div className="space-y-2.5">
            <h3 className="font-semibold text-[16px] mb-2">Achievements</h3>
            <Achievements />
          </div>

          {/* Settings */}
          <div className="space-y-2.5">
            <h3 className="font-semibold text-[15px] mb-2">Settings</h3>
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
