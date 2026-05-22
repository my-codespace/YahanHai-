function parseOperatingHours(rawStr) {
  if (!rawStr) return { open: '', close: '', closedOn: '' };
  if (typeof rawStr !== 'string') return rawStr;

  let open = rawStr.trim();
  let close = '';
  let closedOn = '';

  // E.g., "09:00 AM - 09:00 PM (Closed: Sunday)" or "Closed on Sunday"
  const closedMatch = rawStr.match(/(?:closed:?\s*|closed\s+on\s+)([^)\n]+)/i);
  if (closedMatch) {
    closedOn = closedMatch[1].trim();
  }

  // Strip the closed part
  let timePart = rawStr.replace(/\s*\([^)]*\)/g, '').replace(/closed:?.*/i, '').trim();
  
  if (timePart.includes('-')) {
    const parts = timePart.split('-');
    open = parts[0].trim();
    close = parts[1].trim();
  } else {
    open = timePart;
  }

  return { open, close, closedOn };
}

module.exports = parseOperatingHours;
