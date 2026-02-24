export const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

export const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
] as const;

/** Desktop calendar overlay dimensions (used for positioning and layout). */
export const CALENDAR_DESKTOP = {
  WIDTH: 640,
  HEIGHT: 412,
  INNER_HEIGHT: 372,
  MARGIN: 16,
  OFFSET_Y: 8
} as const;

/** Single month panel dimensions. */
export const MONTH_PANEL = {
  MOBILE: { WIDTH: 295, HEIGHT: 390 },
  DESKTOP: { WIDTH: 304, HEIGHT: 372 }
} as const;
