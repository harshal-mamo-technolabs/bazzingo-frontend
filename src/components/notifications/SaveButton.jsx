import React from 'react';
import TranslatedText from '../TranslatedText.jsx';

const SaveButton = ({ onSave, loading = false }) => {
  return (
    <button
      onClick={onSave}
      disabled={loading}
      className={`w-full sm:w-auto bg-[#FF6B3E] rounded-lg text-white border-none hover:bg-[#e55a35] transition-colors mb-2 duration-200 flex items-center justify-center text-sm lg:text-base ${
        loading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      style={{
        height: '32px',
        fontFamily: 'Roboto, sans-serif',
        fontWeight: '300',
        fontSize: '14px',
        padding: '20px 20px',
      }}
    >
      {loading ? <TranslatedText text="Saving..." /> : <TranslatedText text="Save Preferences" />}
    </button>
  );
};

export default SaveButton;