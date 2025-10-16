type Config = {
  mode?: string;
  view?: string;
  timeFrame?: string;
};

export const getCsvFileName = (prefix: string, config?: Config) => {
  const now = new Date();
  const dateWithTime = now
    .toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    .replace(/\//g, '.')
    .replace(', ', '_');

  if (!config) {
    return `${prefix}_${dateWithTime}.csv`;
  }

  return `${prefix}_${config.timeFrame}_${config.mode}_${config.view}_${dateWithTime}.csv`;
};
