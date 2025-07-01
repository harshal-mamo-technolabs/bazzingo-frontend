import React from 'react';
import TicketRow from './TicketRow';

const TicketsTable = ({ tickets }) => {
  return (
    <>
      <h3 className="text-gray-900 text-base" style={{ fontFamily: 'Inter, sans-serif', fontWeight: '600', marginBottom: '16px' }}>
        Your Tickets
      </h3>

      <table className="w-4/5" style={{ borderCollapse: 'collapse', minWidth: '520px' }}>
        <thead className="bg-[#EDEDED]">
          <tr style={{ height: '32px' }}>
            <th
              className="text-center text-gray-700 border border-[#E5E7EB] text-base"
              style={{ padding: '6px 12px', fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
            >
              Ticket ID
            </th>
            <th
              className="text-left text-gray-700 border border-[#E5E7EB] text-base"
              style={{ padding: '6px 12px', fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
            >
              Subject
            </th>
            <th
              className="text-center text-gray-700 border border-[#E5E7EB] text-base"
              style={{ padding: '6px 12px', fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
            >
              Status
            </th>
            <th
              className="text-center text-gray-700 border border-[#E5E7EB] text-base"
              style={{ padding: '6px 12px', fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}
            >
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket, index) => (
            <TicketRow key={index} ticket={ticket} />
          ))}
        </tbody>
      </table>
    </>
  );
};

export default TicketsTable;
