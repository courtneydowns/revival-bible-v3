export function formatCentralTime(value, options = {}) {
  if (!value) return options.fallback || 'No timestamp';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return options.fallback || 'No timestamp';

  const formatOptions = options.timeZoneName
    ? {
      timeZone: 'America/Chicago',
      year: options.year || 'numeric',
      month: options.month || 'short',
      day: options.day || 'numeric',
      hour: options.hour || 'numeric',
      minute: options.minute || '2-digit',
      timeZoneName: options.timeZoneName
    }
    : {
      timeZone: 'America/Chicago',
      dateStyle: options.dateStyle || 'medium',
      timeStyle: options.timeStyle || 'short'
    };

  if (!options.timeZoneName && !formatOptions.dateStyle && !formatOptions.timeStyle) {
    formatOptions.timeZoneName = 'short';
  }

  return new Intl.DateTimeFormat('en-US', formatOptions).format(date);
}
