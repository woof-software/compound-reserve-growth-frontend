const stripOrdinals = (s: string) =>
  s.replace(/\b(\d{1,2})(st|nd|rd|th)\b/gi, '$1').trim();

export const parseDateToUTC = (raw?: string): number => {
  if (!raw) return Number.NaN;
  const s = stripOrdinals(String(raw));

  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const d = new Date(s);
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  }

  const mdy = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);

  if (mdy) {
    const mm = Number(mdy[1]);
    const dd = Number(mdy[2]);
    const yyyy = Number(mdy[3].length === 2 ? `20${mdy[3]}` : mdy[3]);
    return Date.UTC(yyyy, mm - 1, dd);
  }

  const mon = s.match(/^([A-Za-z]{3,})\s+(\d{1,2}),?\s+(\d{4})$/);

  if (mon) {
    const monthNames = [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december'
    ];

    const idx = monthNames.indexOf(mon[1].toLowerCase());

    if (idx >= 0) {
      const dd = Number(mon[2]);
      const yyyy = Number(mon[3]);

      return Date.UTC(yyyy, idx, dd);
    }
  }

  const t = Date.parse(s);

  if (!Number.isNaN(t)) {
    const d = new Date(t);

    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  }

  return Number.NaN;
};

export const dateSortingFn =
  (pick: (row: any) => string | undefined) => (rowA: any, rowB: any) => {
    const a = pick(rowA);
    const b = pick(rowB);

    if (!a && !b) return 0;
    if (!a) return 1;
    if (!b) return -1;

    const ta = parseDateToUTC(a);
    const tb = parseDateToUTC(b);

    const badA = Number.isNaN(ta);
    const badB = Number.isNaN(tb);

    if (badA && badB) return 0;
    if (badA) return 1;
    if (badB) return -1;

    return ta - tb;
  };
