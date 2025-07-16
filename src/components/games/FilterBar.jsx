import React from 'react';
import { ChevronDown } from 'lucide-react';

const FilterBar = ({
  categories,
  //levels,
  activeCategory,
  //activeLevel,
  onCategoryChange,
  //onLevelChange
}) => {
  return (
    <div className="bg-[#F5F5F5] rounded-md p-2 flex flex-col gap-3
                    sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
      <span className="font-semibold shrink-0" style={{ color: 'black' }}>Categories</span>
      <span className="hidden sm:inline-block h-5 w-px bg-gray-300" />
      <div className="flex gap-2 overflow-x-auto whitespace-nowrap pr-1 sm:flex-wrap" style={{ scrollbarWidth: 'none' }}>
        {categories.map(c => (
          <button
            key={c}
            className={`
              shrink-0 rounded-lg px-6 py-2 text-[12px] font-semibold
              ${activeCategory === c
                ? 'border-[#FF6B3E] text-[#FF6B3E]'
                : 'border-[#ECECEC]'
              } border-2
            `}
            style={{
              color: activeCategory === c ? '#FF6B3E' : '#6B7280',
              backgroundColor: activeCategory === c ? '#f0e2dd' : '#ffffff'
            }}
            onClick={() => onCategoryChange(c)}
          >{c}</button>
        ))}
      </div>

      {/*<span className="hidden sm:inline-block h-5 w-px bg-gray-300" />
      <span className="font-semibold shrink-0" style={{ color: 'black' }}>Levels</span>*/}
      <span className="hidden sm:inline-block h-5 w-px bg-gray-300" />
      <div className="flex gap-2 overflow-x-auto whitespace-nowrap items-center pr-1 sm:flex-wrap" style={{ scrollbarWidth: 'none' }}>
      {/*
        {levels.map(l => (
          <button
            key={l}
            className={`
              shrink-0 rounded-lg px-6 py-2 text-[12px] font-semibold
              ${activeLevel === l
                ? 'border-[#FF6B3E] text-[#FF6B3E]'
                : 'border-[#ECECEC]'
              } border-2
            `}
            style={{
              color: activeLevel === l ? '#FF6B3E' : '#6B7280',
              backgroundColor: activeLevel === l ? '#f0e2dd' : '#ffffff'
            }}
            onClick={() => onLevelChange(l)}
          >{l}</button>
        ))}
        */}
        <div className="relative shrink-0">
          <select
            className="
              appearance-none
              border-2 border-[#ECECEC]
              rounded-lg
              bg-white
              py-2 px-4 pr-8
              text-[12px]
            "
            style={{ color: '#6B7280' }}
          >
            <option value="recent">Recent Played</option>
            <option value="popular">Most Popular</option>
          </select>
          <ChevronDown
            className="
              pointer-events-none
              absolute top-1/2 right-3
              h-4 w-4 text-gray-400
              transform -translate-y-1/2
            "
          />
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
