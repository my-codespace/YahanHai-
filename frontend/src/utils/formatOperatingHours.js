export default function formatOperatingHours(hours) {
  if (!hours) return 'N/A';
  if (typeof hours === 'string') return hours;
  
  const { open, close, closedOn } = hours;
  if (!open && !close) {
    return closedOn ? `Closed on ${closedOn}` : 'N/A';
  }
  
  let timeStr = `${open || ''}`;
  if (close) {
    timeStr += ` - ${close}`;
  }
  if (closedOn) {
    timeStr += ` (Closed: ${closedOn})`;
  }
  return timeStr;
}
