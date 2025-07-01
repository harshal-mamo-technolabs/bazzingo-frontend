import React from 'react';
import IssueTypeCheckbox from './IssueTypeCheckbox';

const TicketForm = ({
  subject,
  setSubject,
  description,
  setDescription,
  issueTypes,
  onIssueTypeChange,
  onSubmit
}) => {
  const issueTypeOptions = [
    { type: 'bug', label: 'Bug' },
    { type: 'account', label: 'Account' },
    { type: 'billing', label: 'Billing' },
    { type: 'gameIssue', label: 'Game Issue' },
    { type: 'otherIssue', label: 'Other Issue' }
  ];

  return (
    <>
      <h3 className="text-gray-900 text-base" style={{ fontFamily: 'Inter, sans-serif', fontWeight: '600', marginBottom: '16px' }}>
        Raise a New Ticket
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Subject Field */}
        <div>
          <label className="block text-gray-700" style={{ fontSize: '12px', fontWeight: '400', fontFamily: 'Roboto, sans-serif', marginBottom: '6px' }}>
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter Subject"
            className="w-full border border-[#D0D5DD] focus:outline-none focus:border-blue-500"
            style={{
              height: '32px',
              padding: '0 10px',
              borderRadius: '3px',
              fontSize: '11px'
            }}
          />
        </div>

        {/* Issue Type */}
        <div>
          <label className="block text-gray-700" style={{ fontSize: '12px', fontWeight: '400', fontFamily: 'Roboto, sans-serif', marginBottom: '6px' }}>
            Issue Type
          </label>
          <div className="flex flex-wrap gap-3">
            {issueTypeOptions.map(({ type, label }) => (
              <IssueTypeCheckbox
                key={type}
                type={type}
                checked={issueTypes[type]}
                onChange={onIssueTypeChange}
                label={label}
              />
            ))}
          </div>
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-gray-700" style={{ fontSize: '12px', fontWeight: '400', fontFamily: 'Roboto, sans-serif', marginBottom: '6px' }}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter Description"
            rows={4}
            className="w-full border border-[#D0D5DD] focus:outline-none focus:border-blue-500 resize-none"
            style={{
              padding: '8px 10px',
              borderRadius: '3px',
              fontSize: '11px',
              minHeight: '96px'
            }}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={onSubmit}
          className="bg-[#FF6B3E] text-white border-none hover:bg-[#e55a35] transition-colors duration-200 flex items-center justify-center w-full"
          style={{
            height: '32px',
            borderRadius: '3px',
            fontFamily: 'Roboto, sans-serif',
            fontWeight: '500'
          }}
        >
          Submit Ticket
        </button>
      </div>
    </>
  );
};

export default TicketForm;
