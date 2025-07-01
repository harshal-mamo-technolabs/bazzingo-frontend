import React from 'react';

const TicketRow = ({ ticket }) => {
  return (
    <tr
      style={{
        backgroundColor: '#fbfefe',
        height: '32px'
      }}
    >
      <td
        className="text-center text-gray-900 border border-[#E5E7EB] text-base"
        style={{ padding: '6px 12px', fontFamily: 'Roboto, sans-serif', fontWeight: '500', fontSize: "14px" }}
      >
        {ticket.id}
      </td>
      <td
        className="text-gray-900 border border-[#E5E7EB] text-base"
        style={{ padding: '6px 12px', fontFamily: 'Roboto, sans-serif', fontWeight: '500', fontSize: "14px" }}
      >
        {ticket.subject}
      </td>
      <td
        className="text-center border border-[#E5E7EB] text-base"
        style={{
          padding: '6px 12px',
          fontFamily: 'Roboto, sans-serif',
          fontWeight: '500',
          color: ticket.statusClass === 'status--inprogress' ? '#ff6c40' : '#008223',
          fontSize: "14px"
        }}
      >
        {ticket.status}
      </td>
      <td
        className="text-center text-gray-900 border border-[#E5E7EB] text-base"
        style={{ padding: '6px 12px', fontFamily: 'Roboto, sans-serif', fontWeight: '500', fontSize: "14px" }}
      >
        {ticket.date}
      </td>
    </tr>
  );
};

export default TicketRow;
