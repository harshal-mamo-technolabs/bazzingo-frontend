import {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {NavLink, useLocation, useNavigate} from 'react-router-dom';
import {useDispatch} from 'react-redux';
import {logout} from '../app/userSlice';
import brainIcon from '../../public/header/bxs_brain.png';
import bellIcon from '../../public/header/bell.png';
import hamburgerIcon from '../../public/header/hamburger.png';
import { getUserProfile } from '../services/dashbaordService';
import NotificationDropdown from './NotificationDropdown';
import notificationService from '../services/notificationService';

/** ---------------------------
 *  Config & shared styles
 *  ------------------------- */
const NAV = [
    {path: '/dashboard', label: 'Dashboard', matchChildren: false},
    {path: '/games', label: 'Games', matchChildren: true},
    {path: '/assessments', label: 'Assessments', matchChildren: true},
    {path: '/statistics', label: 'Statistics', matchChildren: false},
    {path: '/leadboard', label: 'Leaderboard', matchChildren: false},
    {path: '/pricing', label: 'Pricing', matchChildren: false},
    {path: '/subscription', label: 'Subscription', matchChildren: false},
];

const TEXT_BASE = {fontFamily: 'Roboto, sans-serif'};
const NAV_BTN_STYLE = {...TEXT_BASE, fontSize: '14px', fontWeight: 500};

/** ---------------------------
 *  Header Component
 *  ------------------------- */
export default function Header({unreadCount = 0}) {
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [userData, setUserData] = useState(null);

    const notificationRef = useRef(null);
    const profileRef = useRef(null);
    const mobileMenuRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    // Fetch notifications on component mount
    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await notificationService.getUserNotifications();
            if (response.status === 'success') {
                const notificationList = response.data.items || [];
                const unreadCount = response.data.unreadCount || 0;
                setNotifications(notificationList);
                setNotificationCount(unreadCount);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    // Matches /games and /games/*
    const isActiveNavItem = useCallback(
        (path) => {
            if (path === '/games') {
                return location.pathname === '/games' || location.pathname.startsWith('/games/');
            }
            return location.pathname === path;
        },
        [location.pathname]
    );

     // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await getUserProfile();
        setUserData(response.data.user);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

    // Close menus on route change (prevents sticky open dropdowns)
    useEffect(() => {
        setIsNotificationOpen(false);
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    // Attach outside-click & Escape listeners only when something is open
    useEffect(() => {
        const somethingOpen = isNotificationOpen || isProfileOpen || isMobileMenuOpen;
        if (!somethingOpen) return;

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

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsNotificationOpen(false);
                setIsProfileOpen(false);
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside, true);
        document.addEventListener('keydown', handleKeyDown, true);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside, true);
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [isNotificationOpen, isProfileOpen, isMobileMenuOpen]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    // Notifications are now managed by state and fetched from API

    return (
        <nav className="bg-white border-b border-gray-200 relative z-50">
            <div className="mx-auto px-4 lg:px-12">
                <div className="flex justify-between items-center h-[56px]">

                    {/* Left: Logo */}
                    <div className="flex items-center">
                        {/* Brain icon: mobile only */}
                        <img
                            src={brainIcon}
                            alt="Bazingo logo"
                            className="block lg:hidden cursor-pointer"
                            style={{width: '42px', height: '46px'}}
                            onClick={() => navigate('/dashboard')}
                        />
                        {/* Text logo: desktop only */}
                        <h1
                            className="hidden lg:block cursor-pointer"
                            style={{...TEXT_BASE, fontSize: '30px', fontWeight: 600, letterSpacing: '0.08em'}}
                            onClick={() => navigate('/dashboard')}
                        >
                            <span className="text-[#FF6B3E]">B</span>
                            <span className="text-black">AZIN</span>
                            <span className="text-[#FF6B3E]">G</span>
                            <span className="text-[#FF6B3E]">O</span>
                        </h1>
                    </div>

                    {/* Center: Desktop Nav */}
                    <DesktopNav/>

                    {/* Right: Actions */}
                    <div className="flex items-center" style={{gap: '14px'}}>
                        {/* Notifications (desktop) */}
                        <div className="relative hidden lg:block" ref={notificationRef}>
                            <button
                                aria-haspopup="menu"
                                aria-expanded={isNotificationOpen}
                                onClick={() => setIsNotificationOpen((o) => !o)}
                                className="relative flex items-center justify-center bg-[#E8E8E8] rounded-full hover:bg-[#DADADA] transition-colors duration-200"
                                style={{width: '40px', height: '40px'}}
                                title="Notifications"
                            >
                                <img src={bellIcon} alt="Open notifications" style={{width: '18px', height: '18px'}}/>
                                {notificationCount > 0 && (
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
                                        aria-label="3 unread notifications"
                                    >
                    {notificationCount}
                  </span>
                                )}
                            </button>

                            <NotificationDropdown 
                                isOpen={isNotificationOpen}
                                onClose={() => setIsNotificationOpen(false)}
                                onRefresh={fetchNotifications}
                            />
                        </div>

                        {/* Profile (desktop) */}
                        <div className="relative hidden lg:block" ref={profileRef}>
                            <button
                                aria-haspopup="menu"
                                aria-expanded={isProfileOpen}
                                onClick={() => setIsProfileOpen((o) => !o)}
                                className="flex items-center justify-center bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors duration-200"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    fontSize: '18px',
                                    fontFamily: 'Inter, sans-serif'
                                }}
                                title="Open profile menu"
                            >
                                  {userData?.avatar ? (
                  <img
                    src={userData.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover "
                    onError={(e) => {
                      e.target.src = "https://i.pravatar.cc/80";
                      e.target.className = "w-full h-full object-cover bg-gray-300";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-black text-white flex items-center justify-center font-medium text-lg">
                    {userData?.name ? userData.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                )}
                            </button>

                            {isProfileOpen && (
                                <ProfileDropdown
                                    userName={userData?.name || 'Alex Johnson'}
                                    onProfile={() => navigate('/profile')}
                                    onDashboard={() => navigate('/dashboard')}
                                    onStatistics={() => navigate('/statistics')}
                                    onChangePassword={() => navigate('/update-password')}
                                    onNotificationPrefs={() => navigate('/notification-preferences')}
                                    onLogout={handleLogout}
                                />
                            )}
                        </div>

                        {/* Mobile menu */}
                        <div className="relative lg:hidden" ref={mobileMenuRef}>
                            <button
                                aria-haspopup="menu"
                                aria-expanded={isMobileMenuOpen}
                                onClick={() => setIsMobileMenuOpen((o) => !o)}
                                className="block p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
                                title="Open menu"
                            >
                                <img src={hamburgerIcon} alt="Menu" style={{width: '28px', height: '24px'}}/>
                            </button>

                            {isMobileMenuOpen && (
                                <MobileMenu
                                    isActive={isActiveNavItem}
                                    onClose={() => setIsMobileMenuOpen(false)}
                                    onNavigate={navigate}
                                    onOpenNotifications={() => {
                                        setIsMobileMenuOpen(false);
                                        setIsNotificationOpen(true);
                                    }}
                                    notificationCount={notificationCount}
                                />
                            )}
                        </div>
                    </div>
                    {/* End right actions */}
                </div>
            </div>
        </nav>
    );
}

/** ---------------------------
 *  Desktop Navigation
 *  ------------------------- */
const DesktopNav = memo(function DesktopNav() {
    return (
        <div className="hidden lg:flex gap-7">
            {NAV.map(({path, label, matchChildren}) => (
                <NavLink
                    key={path}
                    to={path}
                    end={!matchChildren} // exact for everything except Games
                    className={({isActive}) =>
                        `hover:text-orange-500 transition-colors ${isActive ? 'text-[#FF6B3E]' : ''}`
                    }
                    style={NAV_BTN_STYLE}
                    title={label}
                >
                    {label}
                </NavLink>
            ))}
        </div>
    );
});

/** ---------------------------
 *  Notifications Dropdown
 *  ------------------------- */
const NotificationsDropdown = memo(function NotificationsDropdown({notifications, onViewAll}) {
    return (
        <div
            role="menu"
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
        >
            <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900" style={TEXT_BASE}>
                    Notifications
                </h3>
            </div>

            <div className="max-h-96 overflow-y-auto">
                {notifications.map((n) => (
                    <div
                        key={n.id}
                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                            n.unread ? 'bg-orange-50' : ''
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900" style={TEXT_BASE}>
                                    {n.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1" style={TEXT_BASE}>
                                    {n.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-2" style={TEXT_BASE}>
                                    {n.time}
                                </p>
                            </div>
                            {n.unread && <div className="w-2 h-2 bg-[#FF6B3E] rounded-full mt-2"/>}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={onViewAll}
                    className="w-full text-center text-sm text-[#FF6B3E] hover:text-[#e55a35] font-medium transition-colors"
                    style={TEXT_BASE}
                >
                    View All Notifications
                </button>
            </div>
        </div>
    );
});

/** ---------------------------
 *  Profile Dropdown
 *  ------------------------- */
const ProfileDropdown = memo(function ProfileDropdown({
                                                          userName,
                                                          onProfile,
                                                          onDashboard,
                                                          onStatistics,
                                                          onChangePassword,
                                                          onNotificationPrefs,
                                                          onLogout,
                                                      }) {
    return (
        <div
            role="menu"
            className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
        >
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    <div
                        className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-medium text-lg">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900" style={TEXT_BASE}>
                            {userName}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="py-2">
                <button
                    onClick={onProfile}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    style={TEXT_BASE}
                >
                    👤 My Profile
                </button>
                <button
                    onClick={onDashboard}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    style={TEXT_BASE}
                >
                    📊 Dashboard
                </button>
                <button
                    onClick={onStatistics}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    style={TEXT_BASE}
                >
                    📈 Statistics
                </button>
                <button
                    onClick={onChangePassword}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    style={TEXT_BASE}
                >
                    🔒 Change Password
                </button>
                <button
                    onClick={onNotificationPrefs}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    style={TEXT_BASE}
                >
                    🔔 Notifications
                </button>
            </div>

            <div className="border-t border-gray-100 py-2">
                <button
                    onClick={onLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                    style={TEXT_BASE}
                >
                    🚪 Sign Out
                </button>
            </div>
        </div>
    );
});

/** ---------------------------
 *  Mobile Menu
 *  ------------------------- */
const MobileMenu = memo(function MobileMenu({
                                                isActive,
                                                onNavigate,
                                                onClose,
                                                onOpenNotifications,
                                                notificationCount,
                                            }) {
    return (
        <div
            role="menu"
            className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
        >
            <div className="py-2">
                <button
                    onClick={() => {
                        onNavigate('/games');
                        onClose();
                    }}
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
                        isActive('/games') ? 'text-orange-500 bg-orange-50' : 'text-gray-700'
                    }`}
                    style={TEXT_BASE}
                >
                    🎮 Games
                </button>

                <button
                    onClick={() => {
                        onNavigate('/assessments');
                        onClose();
                    }}
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
                        isActive('/assessments') ? 'text-orange-500 bg-orange-50' : 'text-gray-700'
                    }`}
                    style={TEXT_BASE}
                >
                    📝 Assessments
                </button>

                <button
                    onClick={() => {
                        onNavigate('/statistics');
                        onClose();
                    }}
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
                        isActive('/statistics') ? 'text-orange-500 bg-orange-50' : 'text-gray-700'
                    }`}
                    style={TEXT_BASE}
                >
                    📊 Statistics
                </button>

                <button
                    onClick={() => {
                        onNavigate('/leadboard');
                        onClose();
                    }}
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
                        isActive('/leadboard') ? 'text-orange-500 bg-orange-50' : 'text-gray-700'
                    }`}
                    style={TEXT_BASE}
                >
                    🏆 Leaderboard
                </button>

                <button
                    onClick={() => {
                        onNavigate('/pricing');
                        onClose();
                    }}
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
                        isActive('/pricing') ? 'text-orange-500 bg-orange-50' : 'text-gray-700'
                    }`}
                    style={TEXT_BASE}
                >
                    💎 Pricing
                </button>

                <button
                    onClick={() => {
                        onNavigate('/subscription');
                        onClose();
                    }}
                    className={`w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors ${
                        isActive('/subscription') ? 'text-orange-500 bg-orange-50' : 'text-gray-700'
                    }`}
                    style={TEXT_BASE}
                >
                    📋 Subscription
                </button>
            </div>

            <div className="border-t border-gray-100 py-2">
                <button
                    onClick={() => {
                        onNavigate('/profile');
                        onClose();
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    style={TEXT_BASE}
                >
                    👤 Profile
                </button>

                <button
                    onClick={() => {
                        onNavigate('/dashboard');
                        onClose();
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    style={TEXT_BASE}
                >
                    📈 Dashboard
                </button>

                <button
                    onClick={onOpenNotifications}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors relative"
                    style={TEXT_BASE}
                >
                    🔔 Notifications
                    {notificationCount > 0 && (
                        <span
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#FF6B3E] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {notificationCount}
            </span>
                    )}
                </button>
            </div>

            <div className="border-t border-gray-100 py-2">
                <button
                    onClick={() => {
                        onNavigate('/login'); // navigation happens after logout in parent; this preserves visual route on mobile close
                        onClose();
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                    style={TEXT_BASE}
                >
                    🚪 Sign Out
                </button>
            </div>
        </div>
    );
});
