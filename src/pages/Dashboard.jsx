import React,{useEffect, useRef} from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Download, CheckCircle, Star, BellIcon } from 'lucide-react';
import RecentActivity from '../components/Tables/RecentActivity';

const Dashboard = () => {
  const scrollRef = useRef(null);
  const scrollIntervalRef = useRef(null);

useEffect(() => {
    const container = scrollRef.current;

    // Only run on mobile view
    if (window.innerWidth < 768 && container) {
      const cards = container.querySelectorAll('.carousel-card');
      let index = 0;

      scrollIntervalRef.current = setInterval(() => {
        index = (index + 1) % cards.length;
        const scrollTo = cards[index].offsetLeft;
        container.scrollTo({
          left: scrollTo,
          behavior: 'smooth',
        });
      }, 2000);
    }

    return () => {
      clearInterval(scrollIntervalRef.current);
    };
  }, []);


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img src='/bxs_brain.png' className='md:hidden'/>
              <svg className='hidden md:block' width="168" height="27" viewBox="0 0 168 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.252 14.5918H3.71289L3.67773 11.1816H9.28516C10.2461 11.1816 11.0488 11.0469 11.6934 10.7773C12.3379 10.5078 12.8242 10.1152 13.1523 9.59961C13.4922 9.08398 13.6621 8.45703 13.6621 7.71875C13.6621 6.89844 13.5039 6.23047 13.1875 5.71484C12.8828 5.19922 12.4023 4.82422 11.7461 4.58984C11.0898 4.34375 10.2578 4.2207 9.25 4.2207H5.27734V26H0.443359V0.40625H9.25C10.7031 0.40625 11.998 0.546875 13.1348 0.828125C14.2832 1.09766 15.2559 1.51953 16.0527 2.09375C16.8496 2.66797 17.4531 3.38867 17.8633 4.25586C18.2852 5.12305 18.4961 6.1543 18.4961 7.34961C18.4961 8.4043 18.25 9.37695 17.7578 10.2676C17.2773 11.1465 16.5332 11.8613 15.5254 12.4121C14.5293 12.9629 13.2637 13.2793 11.7285 13.3613L10.252 14.5918ZM10.041 26H2.28906L4.31055 22.2031H10.041C11.002 22.2031 11.793 22.0449 12.4141 21.7285C13.0469 21.4121 13.5156 20.9785 13.8203 20.4277C14.1367 19.8652 14.2949 19.2207 14.2949 18.4941C14.2949 17.6973 14.1543 17.0059 13.873 16.4199C13.6035 15.834 13.1699 15.3828 12.5723 15.0664C11.9863 14.75 11.2129 14.5918 10.252 14.5918H5.22461L5.25977 11.1816H11.6582L12.7656 12.5C14.2422 12.5117 15.4434 12.8047 16.3691 13.3789C17.3066 13.9531 17.998 14.6914 18.4434 15.5938C18.8887 16.4961 19.1113 17.4688 19.1113 18.5117C19.1113 20.1523 18.7539 21.5293 18.0391 22.6426C17.3359 23.7559 16.3047 24.5938 14.9453 25.1562C13.5977 25.7188 11.9629 26 10.041 26Z" fill="#FF5727" />
                <path d="M36.3527 4.29102L29.0577 26H23.9425L33.505 0.40625H36.7745L36.3527 4.29102ZM42.4523 26L35.1222 4.29102L34.6827 0.40625H37.9698L47.5851 26H42.4523ZM42.1183 16.4902V20.3047H28.3898V16.4902H42.1183ZM71.3127 22.2031V26H53.3479V22.2031H71.3127ZM70.9788 3.23633L55.3342 26H52.012V23.0996L67.7268 0.40625H70.9788V3.23633ZM69.2561 0.40625V4.2207H52.0647V0.40625H69.2561ZM82.9291 0.40625V26H78.0951V0.40625H82.9291ZM111.596 0.40625V26H106.745L95.8638 8.24609V26H91.0298V0.40625H95.8638L106.78 18.1777V0.40625H111.596ZM139.367 12.7637V22.7305C138.992 23.2109 138.4 23.7324 137.591 24.2949C136.795 24.8574 135.752 25.3438 134.463 25.7539C133.173 26.1523 131.591 26.3516 129.716 26.3516C128.088 26.3516 126.599 26.082 125.252 25.543C123.904 24.9922 122.744 24.1895 121.771 23.1348C120.798 22.0801 120.048 20.791 119.521 19.2676C118.994 17.7441 118.73 16.0039 118.73 14.0469V12.3594C118.73 10.4023 118.976 8.66211 119.468 7.13867C119.972 5.61523 120.687 4.32617 121.613 3.27148C122.55 2.2168 123.67 1.41406 124.97 0.863281C126.283 0.3125 127.748 0.0371094 129.365 0.0371094C131.533 0.0371094 133.314 0.394531 134.709 1.10938C136.115 1.82422 137.193 2.80859 137.943 4.0625C138.693 5.30469 139.162 6.73438 139.349 8.35156H134.638C134.509 7.46094 134.252 6.68164 133.865 6.01367C133.478 5.33398 132.927 4.80664 132.213 4.43164C131.509 4.04492 130.595 3.85156 129.47 3.85156C128.521 3.85156 127.683 4.03906 126.957 4.41406C126.23 4.78906 125.621 5.33398 125.129 6.04883C124.636 6.76367 124.261 7.64844 124.004 8.70312C123.757 9.75781 123.634 10.9648 123.634 12.3242V14.0469C123.634 15.418 123.775 16.6367 124.056 17.7031C124.338 18.7578 124.742 19.6484 125.269 20.375C125.808 21.0898 126.47 21.6348 127.255 22.0098C128.052 22.373 128.955 22.5547 129.963 22.5547C130.877 22.5547 131.632 22.4785 132.23 22.3262C132.839 22.1621 133.326 21.9688 133.689 21.7461C134.052 21.5234 134.334 21.3066 134.533 21.0957V16.2969H129.453V12.7637H139.367Z" fill="#161616" />
                <path d="M167.542 12.5527V13.8711C167.542 15.8047 167.284 17.5449 166.768 19.0918C166.253 20.627 165.52 21.9336 164.571 23.0117C163.622 24.0898 162.491 24.916 161.178 25.4902C159.866 26.0645 158.407 26.3516 156.801 26.3516C155.219 26.3516 153.766 26.0645 152.442 25.4902C151.13 24.916 149.993 24.0898 149.032 23.0117C148.071 21.9336 147.327 20.627 146.8 19.0918C146.272 17.5449 146.009 15.8047 146.009 13.8711V12.5527C146.009 10.6074 146.272 8.86719 146.8 7.33203C147.327 5.79688 148.065 4.49023 149.014 3.41211C149.964 2.32227 151.094 1.49023 152.407 0.916016C153.731 0.341797 155.184 0.0546875 156.766 0.0546875C158.372 0.0546875 159.831 0.341797 161.143 0.916016C162.456 1.49023 163.587 2.32227 164.536 3.41211C165.497 4.49023 166.235 5.79688 166.751 7.33203C167.278 8.86719 167.542 10.6074 167.542 12.5527ZM162.655 13.8711V12.5176C162.655 11.123 162.526 9.89844 162.268 8.84375C162.01 7.77734 161.63 6.88086 161.126 6.1543C160.622 5.42773 160.001 4.88281 159.262 4.51953C158.524 4.14453 157.692 3.95703 156.766 3.95703C155.829 3.95703 154.997 4.14453 154.27 4.51953C153.555 4.88281 152.946 5.42773 152.442 6.1543C151.938 6.88086 151.551 7.77734 151.282 8.84375C151.024 9.89844 150.895 11.123 150.895 12.5176V13.8711C150.895 15.2539 151.024 16.4785 151.282 17.5449C151.551 18.6113 151.938 19.5137 152.442 20.252C152.958 20.9785 153.579 21.5293 154.305 21.9043C155.032 22.2793 155.864 22.4668 156.801 22.4668C157.739 22.4668 158.571 22.2793 159.298 21.9043C160.024 21.5293 160.634 20.9785 161.126 20.252C161.63 19.5137 162.01 18.6113 162.268 17.5449C162.526 16.4785 162.655 15.2539 162.655 13.8711Z" fill="#FF6C40" />
              </svg>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">Games</a>
              <a href="#" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">Assessments</a>
              <a href="#" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">Statistics</a>
              <a href="#" className="text-gray-700 hover:text-orange-500 font-medium transition-colors">Leaderboard</a>
            </nav>

            {/* User Actions */}
<div className="hidden md:flex items-center space-x-4">
  <div className="relative">
    <div className="w-6 h-6 text-gray-600 hover:text-orange-500 cursor-pointer transition-colors">
      {/* Notification Bell SVG */}
      <BellIcon className="w-6 h-6" />
    </div>
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">1</span>
  </div>
  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
    <span className="text-white font-semibold text-sm">A</span>
  </div>
</div>

{/* Mobile Menu Icon */}
<div className="md:hidden">
  <button type="button" className="text-gray-700 hover:text-orange-500">
    {/* Hamburger Icon */}
    <img src='jam_menu.png'/>
  </button>
</div>

          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className='hidden md:block'>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Good Morning, <span className="text-orange-500">Alex</span>
            </h1>
          </div>
          <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-100">
            <img src="/calander.svg" alt="Calendar" className="w-4 h-4 mr-2" />
            <span className="text-sm text-gray-600">
              Last 7 Days
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
        </div>
         {/* Top Row - Cards with proper proportions */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Desktop View (unchanged) */}
        <div className="hidden sm:flex col-span-2 bg-white rounded-xl px-6 py-6 shadow-sm border border-gray-100 h-[140px] items-center justify-between">
  {/* IQ Score Section */}
  <div className="flex items-center gap-8">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-gray-700 text-xs font-medium">Your IQ</span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-gray-700 text-xs font-medium">Score</span>
        <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
          <span className="text-xs text-gray-600 font-bold">i</span>
        </div>
      </div>
      <div className="text-4xl font-bold text-gray-900 leading-none">125</div>
    </div>

    {/* Brain Icon */}
    <div className="flex items-center justify-center">
      <img src="/Group17.png" alt="Brain" className="w-18 h-[90px] object-contain" />
    </div>

    {/* Certificate Icon */}
    <div className="flex items-center justify-center">
      <img src="/Frame-certi.png" alt="Download Certificate" className="w-18 h-[90px] object-contain" />
    </div>
  </div>

  {/* Total Games Section */}
  <div className="flex items-center gap-4">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-gray-700 text-xs font-medium">Total Game</span>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-gray-700 text-xs font-medium">Played</span>
        <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
          <span className="text-xs text-gray-600 font-bold">i</span>
        </div>
      </div>
      <div className="text-4xl font-bold text-gray-900 leading-none">25</div>
    </div>

    {/* Puzzle Icon */}
    <div className="flex items-center justify-center">
      <img src="/Simplification.png" alt="Puzzle" className="w-18 h-[70px] object-contain" />
    </div>
  </div>
        </div>

        {/* Mobile View */}
        <div className="sm:hidden bg-white rounded-xl px-4 py-4 shadow-sm border border-gray-100 space-y-4">
  {/* Top Row: IQ Score and Total Game Played */}
  <div className="flex justify-between items-center">
    {/* IQ Score */}
      <img src="/Group17.png" alt="Brain" className="w-10 h-10 mb-1" />
    <div className="flex flex-col items-center">
      <p className="text-xs text-gray-700 font-medium">Your IQ Score</p>
      <p className="text-2xl font-bold text-gray-900">125</p>
    </div>

    {/* Total Game Played */}
      <img src="/Simplification.png" alt="Puzzle" className="w-10 h-10 mb-1" />
    <div className="flex flex-col items-center">
      <p className="text-xs text-gray-700 font-medium text-center">Total Game Played</p>
      <p className="text-2xl font-bold text-gray-900">25</p>
    </div>
  </div>

  {/* Download Certificate Button */}
  <div className="flex justify-center">
    <button className="bg-[#d4dcdc] w-full justify-center text-[#003135] font-semibold text-sm rounded-md px-4 py-2 flex items-center gap-2">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 14a1 1 0 001 1h12a1 1 0 001-1v-1H3v1zm4-2h6v-2h3L10 3 4 10h3v2z" />
      </svg>
      Download Certificate
    </button>
  </div>
        </div>

       {/* Certified Cognitive Assessment - spans 1 column */}
       <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-[#ffece6] rounded-xl p-2 h-[140px] flex items-center">
  {/* Icon Area */}
  <div className="w-24 h-24 bg-[#ff5722] rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
    <img
      src="/head-silhouette-with-brain-placeholder.png"
      alt="Head silhouette with brain"
      className="w-18 h-18 object-contain"
    />
  </div>

  {/* Text Area */}
  <div className="flex flex-col justify-center">
    <div className="text-[16px] font-semibold text-gray-800 leading-snug">
      Certified Cognitive Assessment
    </div>
    <div className="bg-[#e0e0e0] text-gray-800 rounded-md px-2 py-[2px] text-[11px] font-medium inline-block mt-1 w-fit">
      Mini Test, 5–10 Question
    </div>
  </div>
      </div>

         <div className="col-span-1 md:col-span-2 lg:col-span-1 relative bg-white rounded-xl p-4 shadow-sm border border-orange-400 h-auto flex flex-col justify-between overflow-hidden">
      {/* Top-right Stars */}
      <div className="absolute top-[-10px] right-[-10px]">
        <div className="flex flex-col items-center gap-[4px] text-orange-500 text-xs">
          <Star className="w-3 h-3" />
          <Star className="w-4 h-4" />
          <Star className="w-5 h-5" />
          <Star className="w-4 h-4" />
          <Star className="w-3 h-3" />
        </div>
      </div>
      {/* Icon + Text */}
      <div className="flex items-start gap-3">
        {/* Medal Icon */}
        <img
          src="https://img.icons8.com/color/48/medal.png"
          alt="Medal"
          className="w-10 h-10"
        />
        <p className="text-sm text-gray-700 leading-snug">
          Get a certified result you can share on LinkedIn or with employers.
        </p>
      </div>
      {/* Price + Button */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-baseline space-x-1">
          <span className="text-xs text-gray-500">Only</span>
          <span className="text-lg font-bold text-black">€0.99</span>
        </div>
        <button className="bg-[#ff6b35] hover:bg-[#ff5a1c] text-white text-xs font-medium py-2 px-4 rounded-full transition">
          Start Certified Test
        </button>
      </div>
    </div>

        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          {/* Left Column - Game Cards */}
          <div className="lg:col-span-1 md:col-span-1 flex flex-col h-full">
           {/* Daily Games Streak */}
          <div className="bg-[#d4f2c6] rounded-xl p-4 text-black w-full max-w-sm md:max-w-none md:w-auto lg:max-w-none lg:w-auto lg:p-3">
  {/* Top label */}
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
      <span className="text-sm font-medium">Daily Games Streak</span>
    </div>
    <div className="w-5 h-5 rounded-full bg-black bg-opacity-10 flex items-center justify-center">
      <span className="text-xs text-black opacity-50">?</span>
    </div>
  </div>

  {/* Image + Text (responsive for mobile, stacked for web) */}
  <div className="lg:hidden bg-white rounded-xl p-2 flex items-center space-x-3 mb-4">
    <img
      src="/head-silhouette-orange.png"
      alt="Head silhouette"
      className="w-16 h-16 object-contain"
    />
    <div>
      <div className="text-sm font-semibold text-black">Memory Match</div>
      <div className="mt-1">
        <span className="bg-gray-200 text-gray-800 text-xs font-medium px-3 py-1 rounded-md inline-block">
          Mini Test, 5–10 Question
        </span>
      </div>
    </div>
  </div>

  {/* Web layout image + text block */}
  <div className="hidden lg:block">
    <div className="bg-[#f5f5f5] rounded-t-lg mb-0">
      <img
        src="/head-silhouette-orange.png"
        alt="Head silhouette"
        className="w-full object-contain p-2"
      />
    </div>
    <div className="bg-[#f5f5f5] rounded-b-lg px-4 py-0">
      <div className="text-sm font-semibold text-black">Memory Match</div>
      <div className="mt-1">
        <span className="bg-gray-200 text-gray-800 text-xs mb-3 font-medium px-3 py-2 rounded-md inline-block">
          Mini Test, 5–10 Question
        </span>
      </div>
    </div>
  </div>

  {/* Pagination dots */}
  <div className="flex justify-center space-x-2 mt-3 mb-4">
    <div className="w-2 h-2 lg:w-2 lg:h-2 bg-gray-900 rounded-full opacity-40 lg:opacity-40 bg-[#00443e]"></div>
    <div className="w-2 h-2 lg:w-2 lg:h-2 bg-gray-900 rounded-full opacity-20 lg:opacity-20 bg-[#c8e4c3]"></div>
    <div className="w-2 h-2 lg:w-2 lg:h-2 bg-gray-900 rounded-full opacity-20 lg:opacity-20 bg-[#c8e4c3]"></div>
  </div>

  {/* Badge Row */}
  <div className="flex items-center space-x-0 mb-4 px-1">
    <span className="text-xl lg:text-lg lg:inline">🏆</span>
    <span className="text-[12px] lg:text-[12px] font-medium text-black">Get your achievement badges</span>
  </div>

  {/* Button */}
  <button className="w-full bg-[#00332e] hover:bg-[#00443e] text-white text-sm font-semibold py-2.5 rounded-md">
    Play Now
  </button>
          </div>
        </div>

        <div className='lg:col-span-1 md:col-span-1 flex flex-col h-full'>
           {/* Daily Quick Assessment */}
        <div className="bg-[#f6c8bc] rounded-xl text-black w-full max-w-sm md:max-w-none md:w-auto lg:max-w-none lg:w-auto p-4 lg:p-3">

        {/* Top label */}
        <div className="flex items-center justify-between mb-3">
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
      <span className="text-sm font-medium">Daily Quick Assesment</span>
    </div>
    <div className="w-5 h-5 rounded-full bg-black bg-opacity-10 flex items-center justify-center">
      <span className="text-xs text-black opacity-50">?</span>
    </div>
        </div>

         {/* Mobile Layout */}
        <div className="lg:hidden bg-white rounded-xl p-2 flex items-center space-x-3 mb-4">
    <img
      src="/vibrant-brain-icon.png"
      alt="Brain Icon"
      className="w-16 h-16 object-contain"
    />
    <div>
      <div className="text-sm font-semibold text-black">Memory Match</div>
      <div className="mt-1">
        <span className="bg-gray-200 text-gray-800 text-xs font-medium px-3 py-1 rounded-md inline-block">
          Mini Test, 5–10 Question
        </span>
      </div>
    </div>
        </div>

          {/* Web Layout */}
          <div className="hidden lg:block">
    {/* Image box */}
    <div className="bg-[#f5f5f5] rounded-t-lg mb-0">
      <img
        src="/vibrant-brain-icon.png"
        alt="Brain Icon"
        className="w-full object-contain p-2"
      />
    </div>

    {/* Title & subtitle */}
    <div className="bg-[#f5f5f5] rounded-b-lg px-4 py-0">
      <div className="text-sm font-semibold text-black">Memory Match</div>
      <div className="mt-1">
        <span className="bg-gray-200 text-gray-800 text-xs mb-3 font-medium px-3 py-2 rounded-md inline-block">
          Mini Test, 5–10 Question
        </span>
      </div>
    </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center space-x-2 mt-3 mb-4">
    <div className="w-2 h-2 bg-gray-900 rounded-full opacity-40"></div>
    <div className="w-2 h-2 bg-gray-900 rounded-full opacity-20"></div>
    <div className="w-2 h-2 bg-gray-900 rounded-full opacity-20"></div>
      </div>

       {/* Badge Row */}
      <div className="flex items-center space-x-0 mb-4 px-1">
    <span className="text-xl lg:text-lg lg:inline">🏆</span>
    <img src="/badge-icon.png" alt="Badge" className="w-6 h-6 lg:hidden" />
    <span className="text-[12px] lg:text-[12px] font-medium text-black">Get your achievement badges</span>
      </div>

      {/* Button */}
      <button className="w-full bg-[#00332e] hover:bg-[#00443e] text-white text-sm font-semibold py-2.5 rounded-md">
      Play Now
      </button>
    </div>
        </div>

          {/* Middle Column - Calendar */}
          <div className="lg:col-span-1 flex flex-col h-full lg:w-[270px] bg-[#ffece6] rounded-xl p-3 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-md font-semibold text-gray-900">Current Streak</h3>
                    <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-500">?</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-500">Nov, 2025</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="bg-white p-1">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 p-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-6 gap-1">
                {/* Calendar days */}
                <div className="text-center p-2 text-sm text-transparent">30</div>
                <div className="text-center p-2 text-sm text-transparent">31</div>
                <div className="text-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">1</div>
                <div className="text-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">2</div>
                <div className="text-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">3</div>
                <div className="text-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">4</div>
                <div className="text-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">5</div>

                <div className="text-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">6</div>
                <div className="text-center p-2 text-sm bg-orange-100 text-orange-600 font-medium rounded-full cursor-pointer transition-colors">7</div>
                <div className="text-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">8</div>
                <div className="text-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">9</div>
                <div className="text-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">10</div>
                <div className="text-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">11</div>
                <div className="text-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">12</div>

                <div className="text-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">13</div>
                <div className="text-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">14</div>
                <div className="text-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">15</div>
                <div className="text-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">16</div>
                <div className="text-center p-2 text-sm bg-orange-100 text-orange-600 font-medium rounded-full cursor-pointer transition-colors">17</div>
                <div className="text-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">18</div>
                <div className="text-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">19</div>

                <div className="text-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">20</div>
                <div className="text-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">21</div>
                <div className="text-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">22</div>
                <div className="text-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">23</div>
                <div className="text-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">24</div>
                <div className="text-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">25</div>
                <div className="text-center p-2 text-sm bg-orange-500 text-white font-semibold rounded-full cursor-pointer transition-colors">26</div>

                <div className="text-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">27</div>
                <div className="text-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">28</div>
                <div className="text-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">29</div>
                <div className="text-center p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">30</div>
                <div className="text-center p-2 text-sm text-transparent">1</div>
                <div className="text-center p-2 text-sm text-transparent">2</div>
                <div className="text-center p-2 text-sm text-transparent">3</div>
              </div>
              </div>
          </div>

          {/* Right Column - Statistics and Suggestions */}
        <div className="lg:col-span-1 md:col-span-1 flex flex-col-reverse md:flex-col h-full space-y-3 md:ml-0 lg:ml-10 lg:w-[430px]">


  {/* Statistics Chart */}
  <div className="bg-[#ffece6] bg-opacity-30 rounded-xl p-4 flex-1 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        <h3 className="text-sm font-semibold text-gray-900">Your statistics</h3>
        <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-xs text-gray-500">i</span>
        </div>
      </div>
      <button className="text-orange-500 hover:text-orange-600 font-medium text-sm flex items-center space-x-1">
        <span>Check Now</span>
        <span>→</span>
      </button>
    </div>

    <div className="relative h-36">
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-500">
        <span>2000</span>
        <span>1500</span>
        <span>1000</span>
        <span>500</span>
        <span>100</span>
      </div>

      {/* Chart area */}
      <div className="ml-10 h-full relative">
        <svg className="w-full h-full" viewBox="0 0 400 160">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="0"
              y1={i * 32}
              x2="400"
              y2={i * 32}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}

          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF5727" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Filled area under curve */}
          <path
            d="M0,120 L57,100 L114,80 L171,60 L228,40 L285,35 L342,30 L399,25 L399,160 L0,160 Z"
            fill="url(#gradient)"
          />

          {/* Line chart */}
          <path
            d="M0,120 L57,100 L114,80 L171,60 L228,40 L285,35 L342,30 L399,25"
            stroke="#f97316"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>

      {/* X-axis labels */}
      <div className="ml-10 flex justify-between text-[9px] md:text-[10px] text-gray-500 md:mt-1">
        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
          <span key={day}>{day}</span>
        ))}
      </div>
    </div>
  </div>

  {/* Suggest for You */}
<div className="bg-[#fef3c7] rounded-xl p-3 shadow-sm border border-gray-100">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-sm font-semibold text-gray-900">Suggest for You</h3>
    <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
      <span className="text-xs text-gray-500">i</span>
    </div>
  </div>

 <div
      ref={scrollRef}
      className="flex overflow-x-auto md:grid md:grid-cols-2 gap-3 whitespace-nowrap scrollbar-hide"
    >
      {/* Maze Escape */}
      <div className="carousel-card inline-block md:w-auto w-[85%] mr-3 bg-white rounded-md p-2 shrink-0">
        <div className="bg-[#dceeff] rounded-md p-3 mb-2 flex justify-center items-center">
          <img src="/maze-escape-icon.png" alt="Maze Escape" className="w-10 h-10" />
        </div>
        <div className="text-xs font-semibold text-gray-800 mb-1">
          Maze Escape
          <span className="ml-2 text-[10px] bg-green-100 text-green-800 px-2 py-[1px] rounded-full">Easy</span>
        </div>
        <p className="text-[11px] text-gray-500">Gamecay</p>
      </div>

      {/* Concentration */}
      <div className="carousel-card inline-block md:w-auto w-[85%] mr-3 bg-white rounded-md p-2 shrink-0">
        <div className="bg-[#d5f4ee] rounded-md p-3 mb-2 flex justify-center items-center">
          <img src="/concentration-icon.png" alt="Concentration" className="w-10 h-10" />
        </div>
        <div className="text-xs font-semibold text-gray-800 mb-1">
          Concentration
          <span className="ml-2 text-[10px] bg-red-100 text-red-800 px-2 py-[1px] rounded-full">Hard</span>
        </div>
        <p className="text-[11px] text-gray-500">Logic</p>
      </div>
    </div>
</div>

      </div>
        </div>
        {/* Recent Activity */}
        <RecentActivity />

      </main>
    </div>
  );
}

export default Dashboard;