import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../app/userSlice';

export default function Header({ unreadCount = 0 }) {
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const notificationRef = useRef(null);
    const profileRef = useRef(null);
    const mobileMenuRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    // Helper function to check if nav item is active
    const isActiveNavItem = (path) => {
        return location.pathname === path;
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const notifications = [
        { id: 1, title: 'New Assessment Available', message: 'Try the new Cognitive Speed Test', time: '2 hours ago', unread: true },
        { id: 2, title: 'Daily Challenge Complete', message: 'You completed today\'s brain training', time: '1 day ago', unread: true },
        { id: 3, title: 'Weekly Report Ready', message: 'Your progress report is available', time: '3 days ago', unread: false },
    ];

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="mx-auto px-4 lg:px-12">
                <div className="flex justify-between items-center h-[56px]">

                    {/* ───── Left side: Logo ───── */}
                    <div className="flex items-center">
                        {/* Brain icon: mobile only */}
                        <img
                            src="./bxs_brain.png"              /* put your small brain icon here */
                            alt="Logo"
                            className="block lg:hidden cursor-pointer"         /* only on small screens */
                            style={{ width: '42px', height: '46px' }}
                            onClick={() => navigate('/dashboard')}
                        />

                        {/* Text logo: desktop only */}
                        <h1
                            className="hidden lg:block cursor-pointer"
                            style={{
                                fontFamily: 'Roboto, sans-serif',
                                fontSize: '30px',
                                fontWeight: 600,
                                letterSpacing: '0.08em',
                            }}
                            onClick={() => navigate('/dashboard')}
                        >
                            <span className="text-[#FF6B3E]">B</span>
                            <span className="text-black">AZIN</span>
                            <span className="text-[#FF6B3E]">G</span>
                            <span className="text-[#FF6B3E]">O</span>
                        </h1>
                    </div>

                    {/* ───── Center nav links (desktop only) ───── */}
                    <div className="hidden lg:flex" style={{ gap: '28px' }}>
                        <button
                            onClick={() => navigate('/dashboard')}
                            style={{
                                fontFamily: 'Roboto, sans-serif',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: isActiveNavItem('/dashboard') ? '#FF6B3E' : 'inherit'
                            }}
                            className="hover:text-orange-500 transition-colors"
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => navigate('/games')}
                            style={{
                                fontFamily: 'Roboto, sans-serif',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: isActiveNavItem('/games') ? '#FF6B3E' : 'inherit'
                            }}
                            className="hover:text-orange-500 transition-colors"
                        >
                            Games
                        </button>

                        <button
                            onClick={() => navigate('/assessments')}
                            style={{
                                fontFamily: 'Roboto, sans-serif',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: isActiveNavItem('/assessments') ? '#FF6B3E' : 'inherit'
                            }}
                            className="hover:text-orange-500 transition-colors"
                        >
                            Assessments
                        </button>
                        <button
                            onClick={() => navigate('/statistics')}
                            style={{
                                fontFamily: 'Roboto, sans-serif',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: isActiveNavItem('/statistics') ? '#FF6B3E' : 'inherit'
                            }}
                            className="hover:text-orange-500 transition-colors"
                        >
                            Statistics
                        </button>
                        <button
                            onClick={() => navigate('/leadboard')}
                            style={{
                                fontFamily: 'Roboto, sans-serif',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: isActiveNavItem('/leadboard') ? '#FF6B3E' : 'inherit'
                            }}
                            className="hover:text-orange-500 transition-colors"
                        >
                            Leaderboard
                        </button>
                    </div>

                    {/* ───── Right side icons ───── */}
                    <div className="flex items-center" style={{ gap: '14px' }}>

                        {/* Bell with Notification Dropdown: desktop only */}
                        <div className="relative hidden lg:block" ref={notificationRef}>
                            <button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="relative flex items-center justify-center bg-[#E8E8E8] rounded-full hover:bg-[#DADADA] transition-colors duration-200"
                                style={{ width: '40px', height: '40px' }}
                            >
                                <img src="./bell.png" alt="Bell" style={{ width: '18px', height: '18px' }} />
                                {3 > 0 && (
                                    <span
                                        className="absolute bg-[#FF6B3E] text-white rounded-full flex items-center justify-center"
                                        style={{
                                            top: '5px',
                                            right: '7px',
                                            width: '15px',
                                            height: '15px',
                                            fontSize: '8px',
                                            lineHeight: 1,
                                            fontWeight: 400,
                                            fontFamily: 'Roboto, sans-serif',
                                        }}
                                    >
                                        {3}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {isNotificationOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                    <div className="p-4 border-b border-gray-100">
                                        <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                            Notifications
                                        </h3>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${notification.unread ? 'bg-orange-50' : ''
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-medium text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                                            {notification.title}
                                                        </h4>
                                                        <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                                            {notification.time}
                                                        </p>
                                                    </div>
                                                    {notification.unread && (
                                                        <div className="w-2 h-2 bg-[#FF6B3E] rounded-full mt-2"></div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 border-t border-gray-100">
                                        <button
                                            onClick={() => navigate('/notifications')}
                                            className="w-full text-center text-sm text-[#FF6B3E] hover:text-[#e55a35] font-medium transition-colors"
                                            style={{ fontFamily: 'Roboto, sans-serif' }}
                                        >
                                            View All Notifications
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Avatar with Profile Dropdown: desktop only */}
                        <div className="relative hidden lg:block" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center justify-center bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors duration-200"
                                style={{ width: '40px', height: '40px', fontSize: '18px', fontFamily: 'Inter, sans-serif' }}
                            >
                                A
                            </button>

                            {/* Profile Dropdown */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                    <div className="p-4 border-b border-gray-100">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-medium text-lg">
                                                A
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                                    Alex Johnson
                                                </h3>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="py-2">
                                        <button
                                            onClick={() => navigate('/profile')}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            style={{ fontFamily: 'Roboto, sans-serif' }}
                                        >
                                            👤 My Profile
                                        </button>
                                        <button
                                            onClick={() => navigate('/dashboard')}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            style={{ fontFamily: 'Roboto, sans-serif' }}
                                        >
                                            📊 Dashboard
                                        </button>
                                        <button
                                            onClick={() => navigate('/statistics')}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            style={{ fontFamily: 'Roboto, sans-serif' }}
                                        >
                                            📈 Statistics
                                        </button>
                                        <button
                                            onClick={() => navigate('/update-password')}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            style={{ fontFamily: 'Roboto, sans-serif' }}
                                        >
                                            🔒 Change Password
                                        </button>
                                        <button
                                            onClick={() => navigate('/notification-preferences')}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            style={{ fontFamily: 'Roboto, sans-serif' }}
                                        >
                                            🔔 Notifications
                                        </button>
                                    </div>
                                    <div className="border-t border-gray-100 py-2">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            style={{ fontFamily: 'Roboto, sans-serif' }}
                                        >
                                            🚪 Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Hamburger with Mobile Menu: mobile only */}
                        <div className="relative lg:hidden" ref={mobileMenuRef}>
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="block p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
                            >
                                <img
                                    src="./hamburger.png"
                                    alt="Menu"
                                    style={{ width: '28px', height: '24px' }}
                                />
                            </button>

                            {/* Mobile Menu Dropdown */}
                            {isMobileMenuOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                    <div className="py-2">
                                        <button
                                            onClick={() => { navigate('/games'); setIsMobileMenuOpen(false); }}
                                            className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${isActiveNavItem('/games') ? 'text-orange-500 bg-orange-50' : 'text-gray-700'
                                                }`}
                                            style={{ fontFamily: 'Roboto, sans-serif' }}
                                        >
                                            🎮 Games
                                        </button>
                                        <button
                                            onClick={() => { navigate('/assessments'); setIsMobileMenuOpen(false); }}
                                            className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${isActiveNavItem('/assessments') ? 'text-orange-500 bg-orange-50' : 'text-gray-700'
                                                }`}
                                            style={{ fontFamily: 'Roboto, sans-serif' }}
                                        >
                                            📝 Assessments
                                        </button>
                                        <button
                                            onClick={() => { navigate('/statistics'); setIsMobileMenuOpen(false); }}
                                            className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${isActiveNavItem('/statistics') ? 'text-orange-500 bg-orange-50' : 'text-gray-700'
                                                }`}
                                            style={{ fontFamily: 'Roboto, sans-serif' }}
                                        >
                                            📊 Statistics
                                        </button>
                                        <button
                                            onClick={() => { navigate('/leadboard'); setIsMobileMenuOpen(false); }}
                                            className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${isActiveNavItem('/leadboard') ? 'text-orange-500 bg-orange-50' : 'text-gray-700'
                                                }`}
                                            style={{ fontFamily: 'Roboto, sans-serif' }}
                                        >
                                            🏆 Leaderboard
                                        </button>
                                    </div>
                                    <div className="border-t border-gray-100 py-2">
                                        <button
                                            onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }}
                                            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            style={{ fontFamily: 'Roboto, sans-serif' }}
                                        >
                                            👤 Profile
                                        </button>
                                        <button
                                            onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }}
                                            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            style={{ fontFamily: 'Roboto, sans-serif' }}
                                        >
                                            📈 Dashboard
                                        </button>
                                        <button
                                            onClick={() => { setIsMobileMenuOpen(false); setIsNotificationOpen(true); }}
                                            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors relative"
                                            style={{ fontFamily: 'Roboto, sans-serif' }}
                                        >
                                            🔔 Notifications
                                            {unreadCount > 0 && (
                                                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[#FF6B3E] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                    <div className="border-t border-gray-100 py-2">
                                        <button
                                            onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                            className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            style={{ fontFamily: 'Roboto, sans-serif' }}
                                        >
                                            🚪 Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
};  