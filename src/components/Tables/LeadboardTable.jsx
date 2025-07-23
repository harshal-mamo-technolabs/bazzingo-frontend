import React from 'react';

// Flag components
const IndiaFlag = () => (
  <div className="w-5 h-3.5 rounded-sm overflow-hidden border border-gray-200 flex flex-col">
    <div className="h-1/3 bg-orange-500" />
    <div className="h-1/3 bg-white flex items-center justify-center">
      <div className="w-1.5 h-1.5 border border-blue-600 rounded-full" />
    </div>
    <div className="h-1/3 bg-green-600" />
  </div>
);

const JapanFlag = () => (
  <div className="w-5 h-3.5 rounded-sm overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
    <div className="w-2 h-2 bg-red-600 rounded-full" />
  </div>
);

const ChinaFlag = () => (
  <div className="w-5 h-3.5 rounded-sm overflow-hidden border border-gray-200 bg-red-600 flex items-start justify-start p-0.5">
    <div className="text-yellow-300 text-[10px]">★</div>
  </div>
);

// Sample data
const leaderboardData = [
  { rank: '5842', username: 'Harshal Chauhan', country: 'India', countryFlag: <IndiaFlag />, score: 13000, avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' },
  { rank: '002', username: 'Robert Fox', country: 'Japan', countryFlag: <JapanFlag />, score: 12000, avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' },
  { rank: '003', username: 'Dianna Russell', country: 'China', countryFlag: <ChinaFlag />, score: 11800, avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' },
  { rank: '004', username: 'Wade Warren', country: 'India', countryFlag: <IndiaFlag />, score: 10000, avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' },
  { rank: '005', username: 'Robert Fox', country: 'Japan', countryFlag: <JapanFlag />, score: 9999, avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' },
  { rank: '006', username: 'Dianna Russell', country: 'China', countryFlag: <ChinaFlag />, score: 7000, avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' },
  { rank: '007', username: 'Wade Warren', country: 'India', countryFlag: <IndiaFlag />, score: 6090, avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' },
  { rank: '008', username: 'Robert Fox', country: 'Japan', countryFlag: <JapanFlag />, score: 5800, avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' },
  { rank: '009', username: 'Dianna Russell', country: 'China', countryFlag: <ChinaFlag />, score: 5800, avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' },
  { rank: '010', username: 'Wade Warren', country: 'India', countryFlag: <IndiaFlag />, score: 5500, avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' },
  { rank: '011', username: 'Robert Fox', country: 'Japan', countryFlag: <JapanFlag />, score: 5100, avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' },
  { rank: '012', username: 'Dianna Russell', country: 'China', countryFlag: <ChinaFlag />, score: 5000, avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' },
  { rank: '013', username: 'Wade Warren', country: 'India', countryFlag: <IndiaFlag />, score: 4800, avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' },
  { rank: '014', username: 'Robert Fox', country: 'Japan', countryFlag: <JapanFlag />, score: 4210, avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' },
  { rank: '015', username: 'Wade Warren', country: 'India', countryFlag: <IndiaFlag />, score: 13000, avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' },
  { rank: '016', username: 'Robert Fox', country: 'Japan', countryFlag: <JapanFlag />, score: 12000, avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' },
  { rank: '017', username: 'Dianna Russell', country: 'China', countryFlag: <ChinaFlag />, score: 11800, avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' },
  { rank: '018', username: 'Wade Warren', country: 'India', countryFlag: <IndiaFlag />, score: 10000, avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' },

];

const LeaderboardTable = () => {
  return (
   <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
  <table className="w-full text-[13px] text-gray-700 border-collapse">
    <thead className="bg-[#EEEEEE] text-[13px]">
      <tr className="border-b border-gray-300">
        <th className="px-2 py-2 text-center font-semibold border border-gray-200 md:w-[80px]">Rank</th>
        <th className="px-3 py-2 text-left font-semibold border border-gray-200 md:w-[230px]">Username</th>
        <th className="px-3 py-2 text-center font-semibold border border-gray-200">Country</th>
        <th className="px-3 py-2 text-center font-semibold border border-gray-200">Score</th>
      </tr>
    </thead>
    <tbody>
      {leaderboardData.map((entry, index) => (
        <tr
          key={index}
          className={`hover:bg-[#fdb59f] ${index === 0 ? 'bg-[#fdb59f] font-bold text-black' : ''}`}
        >
          <td className="px-3 py-2 font-medium text-center border border-gray-200">{entry.rank}</td>
          <td className="px-3 py-2 border border-gray-200">
            <div className="flex items-center space-x-2">
              <img
                src={entry.avatar}
                alt={entry.username}
                className="w-6 h-6 rounded-full object-cover border border-gray-300"
              />
              <span>{entry.username}</span>
            </div>
          </td>
          <td className="px-3 py-2 border border-gray-200">
            <div className="flex items-center justify-center space-x-1">
              {entry.countryFlag}
              <span>{entry.country}</span>
            </div>
          </td>
          <td className="px-3 py-2 text-center font-medium border border-gray-200">
            {entry.score.toLocaleString()}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

  );
};

export default LeaderboardTable;
