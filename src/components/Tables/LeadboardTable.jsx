import React from 'react';
import { getFlagByCountry } from '../../utils/CountryFlags';

const LeaderboardTable = ({ data = [], currentUser, scope, loading, selectedCountry, selectedAgeGroup }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 p-4 text-center">
        Loading leaderboard data...
      </div>
    );
  }

  const getRank = (item, scope) => {
    if (scope === "global") return item.gameGlobalRank || item.assessmentGlobalRank;
    if (scope === "country") return item.gameCountryRank || item.assessmentCountryRank;
    if (scope === "age") return item.gameAgeGroupRank || item.assessmentAgeGroupRank;
    if (scope === "assessment") return item.assessmentGlobalRank || item.assessmentCountryRank || item.assessmentAgeGroupRank;
    return item.gameGlobalRank || item.assessmentGlobalRank;
  };

  const getScore = (item, scope) => {
    if (scope === "assessment") return item.assessment?.totalScore || 0;
    return item.game?.totalScore || 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <table className="w-full text-[13px] text-gray-700 border-collapse">
        <thead className="bg-[#EEEEEE] text-[13px]">
          <tr className="border-b border-gray-300">
            <th className="px-2 py-2 text-center font-semibold border border-gray-200 md:w-[80px]">Rank</th>
            <th className="px-3 py-2 text-left font-semibold border border-gray-200 md:w-[230px]">Username</th>
            <th className="px-3 py-2 text-center font-semibold border border-gray-200">Country</th>
            <th className="px-3 py-2 text-center font-semibold border border-gray-200">
              {scope === "assessment" ? "Assessment Score" : "Game Score"}
            </th>
          </tr>
        </thead>
        <tbody>
          {(!currentUser && (!data || data.length === 0)) && (
            <tr>
              <td colSpan={4} className="px-3 py-6 text-center text-gray-500">
                {`No data is available for ${
                  selectedCountry || selectedAgeGroup
                    ? `the selected ${selectedCountry ? `country "${selectedCountry}"` : ""}${selectedCountry && selectedAgeGroup ? " and " : ""}${selectedAgeGroup ? `age group "${selectedAgeGroup}"` : ""}`
                    : "the selected filters"
                }.`}
              </td>
            </tr>
          )}
          {/* Current user row */}
          {currentUser && (
            <tr className="bg-[#fdb59f] font-bold text-black">
              <td className="px-3 py-2 font-medium text-center border border-gray-200">
                {getRank(currentUser, scope)}
              </td>
              <td className="px-3 py-2 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-full object-cover border border-gray-300"
                  />
                  <span>{currentUser.name}</span>
                </div>
              </td>
              <td className="px-3 py-2 border border-gray-200">
                <div className="flex items-center justify-center space-x-1">
                  {getFlagByCountry(currentUser.country)}
                  <span className="capitalize">{currentUser.country}</span>
                </div>
              </td>
              <td className="px-3 py-2 text-center font-medium border border-gray-200">
                {getScore(currentUser, scope).toLocaleString()}
              </td>
            </tr>
          )}

          {/* Other users */}
          {data.map((entry, index) => (
            <tr
              key={entry._id || index}
              className="hover:bg-gray-50"
            >
              <td className="px-3 py-2 font-medium text-center border border-gray-200">
                {getRank(entry, scope)}
              </td>
              <td className="px-3 py-2 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <img
                    src={entry.avatar}
                    alt={entry.name}
                    className="w-6 h-6 rounded-full object-cover border border-gray-300"
                  />
                  <span>{entry.name}</span>
                </div>
              </td>
              <td className="px-3 py-2 border border-gray-200">
                <div className="flex items-center justify-center space-x-1">
                  {getFlagByCountry(entry.country)}
                  <span className="capitalize">{entry.country}</span>
                </div>
              </td>
              <td className="px-3 py-2 text-center font-medium border border-gray-200">
                {getScore(entry, scope).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;