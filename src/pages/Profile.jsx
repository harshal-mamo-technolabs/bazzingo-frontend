import React from "react";
import { ChevronRight } from "lucide-react";
import { FinishedCertificates, Achievements } from "../components/Profile";
import {
  BellIcon,
  LockClosedIcon,
  TicketIcon,
  QuestionMarkCircleIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/solid";


import Header from "../components/Layout/Header";

const Profile = () => {

 const settings = [
  { label: 'Notification Preference', icon: BellIcon },
  { label: 'Update Password', icon: LockClosedIcon },
  { label: 'Ticket Raising System', icon: TicketIcon },
  { label: 'Help', icon: QuestionMarkCircleIcon },
  { label: 'Faq', icon: ChatBubbleBottomCenterTextIcon },
  { label: 'Terms of use', icon: DocumentTextIcon },
  { label: 'Privacy Policy', icon: ShieldCheckIcon },
];
    const unreadCount = 3;

  return (
     <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif'}}>
              {/* Header */}
              <Header unreadCount={unreadCount}/>
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
          src="https://i.pravatar.cc/80"
          alt="Avatar"
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h2 className="text-[15px] font-normal text-gray-800">
            Alex Johnson
          </h2>
          <div className="flex gap-2">
            <p className="text-[13px] text-gray-500">Age: 25</p>
            <span className="text-[10px] text-white bg-orange-500 px-2 py-0.5 rounded-md mt-1 inline-block">
              Premium
            </span>
          </div>
        </div>
      </div>
      <button className="bg-black text-white text-[13px] px-4 py-1.5 rounded-md">
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
      {settings.map(({ label, icon: Icon }, i) => (
        <div
          key={i}
          className="flex items-center justify-between text-sm p-3 hover:bg-gray-50 rounded-md border border-gray-300"
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
          src="https://i.pravatar.cc/80"
          alt="Avatar"
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h2 className="text-[15px] font-normal text-gray-800">
            Alex Johnson
          </h2>
          <div className="flex gap-2">
            <p className="text-[13px] text-gray-500">Age: 25</p>
            <span className="text-[10px] text-white bg-orange-500 px-2 py-0.5 rounded-md mt-1 inline-block">
              Premium
            </span>
          </div>
        </div>
      </div>
      <button className="bg-black text-white text-[13px] px-4 py-1.5 rounded-md">
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
    {settings.map(({ label, icon: Icon }, i) => (
      <div
        key={i}
        className="flex items-center justify-between text-sm p-3 hover:bg-gray-50 rounded-md border border-gray-300"
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
  );
};

export default Profile;