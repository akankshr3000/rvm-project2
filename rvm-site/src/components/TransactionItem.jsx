const TransactionItem = ({ transaction, currentUserId }) => {
  const t = transaction;
  const isCredit = t.type === 'credit';
  const isSent = t.type === 'transfer_sent';
  const isReceived = t.type === 'transfer_received';

  const accentColor = isSent ? '#ef4444' : '#00ff41';
  const icon = isCredit ? '🍶' : isSent ? '↑' : '↓';
  const iconBg = isSent ? 'rgba(239,68,68,0.15)' : 'rgba(0,255,65,0.12)';

  let title = 'Bottle Credit';
  if (isSent) title = `Sent to ${t.receiver_name || 'Unknown'}`;
  if (isReceived) title = `Received from ${t.sender_name || 'Unknown'}`;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    const hours = d.getHours();
    const mins = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    return `${day} ${month} ${year} · ${h}:${mins} ${ampm}`;
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 1.25rem',
      background: 'rgba(0,255,65,0.02)',
      borderRadius: 12,
      borderLeft: `3px solid ${accentColor}`,
      border: '1px solid rgba(0,255,65,0.08)',
      borderLeftColor: accentColor,
      borderLeftWidth: 3,
      transition: 'border-color 0.2s',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,255,65,0.2)'}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'rgba(0,255,65,0.08)';
      e.currentTarget.style.borderLeftColor = accentColor;
    }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
        {/* Icon */}
        <div style={{
          width: 40, height: 40, minWidth: 40,
          borderRadius: 10,
          background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isCredit ? '1.1rem' : '1rem',
          fontWeight: 700,
          color: accentColor,
        }}>
          {icon}
        </div>

        {/* Content */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontWeight: 600,
            fontSize: '0.85rem',
            color: '#e8f5e8',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {title}
          </div>
          <div style={{
            fontFamily: "'Space Mono', 'Inter', monospace",
            fontSize: '0.62rem',
            color: 'rgba(232,245,232,0.35)',
            marginTop: 2,
          }}>
            {t.id ? `#${String(t.id).slice(0, 8)}` : ''} {t.created_at ? `· ${formatDate(t.created_at)}` : ''}
          </div>
        </div>
      </div>

      {/* Amount */}
      <div style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: '0.95rem',
        color: isSent ? '#ef4444' : '#00ff41',
        whiteSpace: 'nowrap',
        marginLeft: '0.75rem',
      }}>
        {isSent ? '-' : '+'}{t.coins} coins
      </div>
    </div>
  );
};

export default TransactionItem;
