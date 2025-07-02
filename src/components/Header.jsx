export default function Header({ unreadCount = 0 }) {
    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="mx-auto px-4 lg:px-12">
                <div className="flex justify-between items-center h-[56px]">

                    {/* ───── Left side: Logo ───── */}
                    <div className="flex items-center">
                        {/* Brain icon: mobile only */}
                        <img
                            src="./favicon-logo.png"              /* put your small brain icon here */
                            alt="Logo"
                            className="block lg:hidden"         /* only on small screens */
                            style={{ width: '55px', height: '80px' }}
                        />

                        {/* Text logo: desktop only */}
                        <h1
                            className="hidden lg:block"
                            style={{
                                fontFamily: 'Roboto, sans-serif',
                                fontSize: '30px',
                                fontWeight: 600,
                                letterSpacing: '0.08em',
                            }}
                        >
                            <span className="text-[#FF6B3E]">B</span>
                            <span className="text-black">AZIN</span>
                            <span className="text-[#FF6B3E]">G</span>
                            <span className="text-[#FF6B3E]">O</span>
                        </h1>
                    </div>

                    {/* ───── Center nav links (desktop only) ───── */}
                    <div className="hidden lg:flex" style={{ gap: '28px' }}>
                        <a style={{ fontFamily: 'Roboto, sans-serif', fontSize: '14px', fontWeight: 500 }}>Games</a>
                        <a style={{ fontFamily: 'Roboto, sans-serif', fontSize: '14px', fontWeight: 500 }}>Assessments</a>
                        <a style={{ fontFamily: 'Roboto, sans-serif', fontSize: '14px', fontWeight: 500 }}>Statistics</a>
                        <a style={{ fontFamily: 'Roboto, sans-serif', fontSize: '14px', fontWeight: 500 }}>Leaderboard</a>
                    </div>

                    {/* ───── Right side icons ───── */}
                    <div className="flex items-center" style={{ gap: '14px' }}>

                        {/* Bell: desktop only */}
                        <div
                            className="relative hidden lg:flex items-center justify-center bg-[#E8E8E8] rounded-full"
                            style={{ width: '40px', height: '40px' }}
                        >
                            <img src="./bell.png" alt="Bell" style={{ width: '18px', height: '18px' }} />
                            {unreadCount > 0 && (
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
                                    {unreadCount}
                                </span>
                            )}
                        </div>

                        {/* Avatar: desktop only */}
                        <div
                            className="hidden lg:flex items-center justify-center bg-black text-white rounded-full font-medium"
                            style={{ width: '40px', height: '40px', fontSize: '18px', fontFamily: 'Inter, sans-serif' }}
                        >
                            A
                        </div>

                        {/* Hamburger: mobile only */}
                        <img
                            src="./hamburger.png"
                            alt="Menu"
                            className="lg:hidden block"
                            style={{ width: '28px', height: '24px' }}
                        />
                    </div>
                </div>
            </div>
        </nav>
    )
};  