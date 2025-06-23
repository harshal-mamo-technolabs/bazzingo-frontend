import React from 'react';
import { Bell, Menu, ChevronDown, ArrowRight, HelpCircle } from 'lucide-react';

const UserDashboard = () => {
  const unreadCount = 3;

  // Mock leaderboard data
  const leaderboardData = [
    { rank: '001', name: 'Wade Warren', country: 'India', score: 13000, flag: '🇮🇳' },
    { rank: '002', name: 'Robert Fox', country: 'Japan', score: 12000, flag: '🇯🇵' },
    { rank: '003', name: 'Dianne Russell', country: 'China', score: 11800, flag: '🇨🇳' },
    { rank: '004', name: 'Wade Warren', country: 'India', score: 10000, flag: '🇮🇳' },
    { rank: '005', name: 'Robert Fox', country: 'Japan', score: 9999, flag: '🇯🇵' },
    { rank: '006', name: 'Dianne Russell', country: 'China', score: 7000, flag: '🇨🇳' },
    { rank: '007', name: 'Wade Warren', country: 'India', score: 6000, flag: '🇮🇳' },
    { rank: '008', name: 'Robert Fox', country: 'Japan', score: 5800, flag: '🇯🇵' },
    { rank: '009', name: 'Dianne Russell', country: 'China', score: 5800, flag: '🇨🇳' },
    { rank: '010', name: 'Wade Warren', country: 'India', score: 5500, flag: '🇮🇳' },
    { rank: '011', name: 'Robert Fox', country: 'Japan', score: 5100, flag: '🇯🇵' },
    { rank: '012', name: 'Dianne Russell', country: 'China', score: 5000, flag: '🇨🇳' },
    { rank: '013', name: 'Wade Warren', country: 'India', score: 4800, flag: '🇮🇳' },
    { rank: '014', name: 'Robert Fox', country: 'Japan', score: 4210, flag: '🇯🇵' },
    { rank: '015', name: 'Dianne Russell', country: 'China', score: 4200, flag: '🇨🇳' },
    { rank: '016', name: 'Wade Warren', country: 'India', score: 4200, flag: '🇮🇳' },
    { rank: '017', name: 'Wade Warren', country: 'India', score: 4100, flag: '🇮🇳' },
    { rank: '018', name: 'Wade Warren', country: 'India', score: 4000, flag: '🇮🇳' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">
                <span className="text-[#FF6B00]">B</span>
                <span className="text-black">AZIN</span>
                <span className="text-[#FF6B00]">G</span>
                <span className="text-[#FF6B00]">O</span>
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm pb-4">Games</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm pb-4">Assessments</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 text-sm pb-4">Statistics</a>
              <a href="#" className="text-[#FF6B00] border-b-2 border-[#FF6B00] font-medium text-sm pb-4">Leaderboard</a>
            </nav>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#FF6B00] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="bg-black text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium">
                A
              </div>
              <Menu className="lg:hidden text-gray-600 h-6 w-6" />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Left Column - Leaderboard */}
          <div className="flex-1">
            {/* Filter Controls - Exact match to image */}
            <div className="bg-white p-4 rounded-lg mb-6 border border-gray-200">
              <div className="flex gap-3">
                <button className="bg-[#FF6B00] text-white px-4 py-2 rounded text-sm font-medium">
                  Global
                </button>

                <div className="relative">
                  <button className="bg-white border border-gray-300 px-4 py-2 rounded text-sm text-gray-700 flex items-center gap-2 min-w-[100px]">
                    Country
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                <div className="relative">
                  <button className="bg-white border border-gray-300 px-4 py-2 rounded text-sm text-gray-700 flex items-center gap-2 min-w-[90px]">
                    By Age
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                <div className="relative">
                  <button className="bg-white border border-gray-300 px-4 py-2 rounded text-sm text-gray-700 flex items-center gap-2 min-w-[140px]">
                    By Assessment
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              {/* Table Header */}
              <div className="bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-4">
                  <div className="px-6 py-4 text-sm font-medium text-gray-700 border-r border-gray-200">Rank</div>
                  <div className="px-6 py-4 text-sm font-medium text-gray-700 border-r border-gray-200">Username</div>
                  <div className="px-6 py-4 text-sm font-medium text-gray-700 border-r border-gray-200">Country</div>
                  <div className="px-6 py-4 text-sm font-medium text-gray-700">Score</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {leaderboardData.map((item, index) => (
                  <div
                    key={index}
                    className={`${item.rank === '018' ? 'bg-[#FFE4D8]' : 'hover:bg-gray-50'}`}
                  >
                    <div className="grid grid-cols-4">
                      <div className="px-6 py-4 text-sm font-medium text-gray-900 border-r border-gray-200">{item.rank}</div>
                      <div className="px-6 py-4 border-r border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {item.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <span className="text-sm text-gray-900">{item.name}</span>
                        </div>
                      </div>
                      <div className="px-6 py-4 border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.flag}</span>
                          <span className="text-sm text-gray-700">{item.country}</span>
                        </div>
                      </div>
                      <div className="px-6 py-4 text-sm font-medium text-gray-900">{item.score}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - User Stats & Recent Activity */}
          <div className="w-full max-w-[320px]">
            {/* Your Rank Card */}
            <div className="bg-gradient-to-br from-[#FF6B00] to-[#FF8A6B] text-white rounded-lg p-6 mb-6 relative overflow-hidden shadow-sm">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium opacity-90">Your Rank</span>
                  <HelpCircle className="h-4 w-4 opacity-70" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(3)].map((_, i) => (
                    <span key={i} className="text-yellow-300 text-lg">★</span>
                  ))}
                  <div className="text-4xl font-bold mx-2">250</div>
                  {[...Array(4)].map((_, i) => (
                    <span key={i + 3} className="text-yellow-300 text-lg">★</span>
                  ))}
                </div>
                <div className="text-sm opacity-90">
                  <div className="flex justify-between">
                    <span>Total Game Played</span>
                    <span className="font-semibold text-[#FF6B00] bg-white px-2 py-1 rounded text-sm">25</span>
                  </div>
                </div>
              </div>
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
                <div className="w-full h-full bg-white rounded-full transform translate-x-8 -translate-y-8"></div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-700">Speed</span>
                    <span className="text-sm font-semibold text-gray-900">1002</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-[#FF6B00] h-1.5 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-700">Attention</span>
                    <span className="text-sm font-semibold text-gray-900">1001</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-[#FF6B00] h-1.5 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-700">Memory</span>
                    <span className="text-sm font-semibold text-gray-900">1001</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-[#FF6B00] h-1.5 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-700">Flexibility</span>
                    <span className="text-sm font-semibold text-gray-900">1001</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-[#FF6B00] h-1.5 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-700">Troubleshooting</span>
                    <span className="text-sm font-semibold text-gray-900">1001</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-[#FF6B00] h-1.5 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-700">Brain Score Index</span>
                  <span className="text-sm font-semibold text-gray-900">1002</span>
                </div>

                <button className="w-full bg-[#FF6B00] text-white text-sm font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#FF8A6B] transition-colors">
                  Posting your rank
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#FFE4D8] rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-[#FF6B00] rounded"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">Daily Puzzle</span>
                      <span className="text-sm text-gray-600 bg-[#FFE4D8] px-2 py-1 rounded">89%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-[#FF6B00] h-1.5 rounded-full" style={{ width: '89%' }}></div>
                      </div>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-blue-500 rounded"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">Daily Assessment</span>
                      <span className="text-sm text-gray-600 bg-[#FFE4D8] px-2 py-1 rounded">39%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-[#FF6B00] h-1.5 rounded-full" style={{ width: '39%' }}></div>
                      </div>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                        Completed
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                    <div className="w-6 h-6 bg-pink-500 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">Magic Square</span>
                      <span className="text-sm text-gray-600 bg-[#FFE4D8] px-2 py-1 rounded">10%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-[#FF6B00] h-1.5 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                      <span className="text-xs px-2 py-1 bg-[#FFE4D8] text-[#FF6B00] rounded-full hover:bg-[#FFE4D8]">
                        Running
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;