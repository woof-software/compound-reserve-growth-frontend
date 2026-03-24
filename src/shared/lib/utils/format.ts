export namespace Format {
  export type FormatView = 'standard' | 'compact';
  export type DateFormat = 'ordinal' | 'short';
  /**
   * Formats a number as a USD price.
   * @example
   * e.g., price(12345.67, view: 'compact' ) -> '$12.35K'
   * e.g., price(12345.67, view: 'full' ) -> '$12,345.67'
   */
  export function price(value: number | string, view?: FormatView) {
    let numberValue = Number(value);
    const options: Intl.NumberFormatOptions = {};
    const locale = 'en-US';

    if (isNaN(numberValue) || !isFinite(numberValue)) {
      console.warn('Value is not');
      numberValue = 0;
    }

    options.maximumFractionDigits = 2;
    options.notation = view;
    options.style = 'currency';
    options.currency = 'USD';

    return new Intl.NumberFormat(locale, options).format(numberValue);
  }

  /**
   * Formats a number as a token amount with a symbol.
   * @example
   * e.g., token(12345, tokenSymbol: 'ETH', view: 'compact' ) -> '12.35K ETH'
   * e.g., token(123.45678, tokenSymbol: 'ETH', view: 'full', decimals: 4 ) -> '123.4568 ETH'
   */
  export function token(
    value: number | string,
    view?: FormatView,
    tokenSymbol?: string
  ) {
    let numberValue = Number(value);
    const options: Intl.NumberFormatOptions = {};
    const locale = 'en-US';

    if (isNaN(numberValue) || !isFinite(numberValue)) {
      console.warn('Value is not');
      numberValue = 0;
    }

    options.notation = view;
    options.maximumFractionDigits = 4;
    options.style = 'decimal';

    const formattedNumber = new Intl.NumberFormat(locale, options).format(
      numberValue
    );
    return tokenSymbol ? `${formattedNumber} ${tokenSymbol}` : formattedNumber;
  }

  export type TokenChartAxis = {
    type: 'token';
    view: FormatView;
    symbol: string;
  };
  export type UsdChartAxis = {
    type: 'usd';
    view: FormatView;
  };

  /**
   * Use this function for Y axis for on every chart
   */
  export function chartAxis(
    value: number | string,
    options: TokenChartAxis | UsdChartAxis
  ): string {
    if (options.type === 'usd') {
      return price(value, options.view);
    }
    return token(value, options.view, options.symbol);
  }

  /**
   * Formats date
   * @example
   * e.g., Format.date('2024-01-15') -> "Jan 15th 2024"
   * e.g., Format.date('2024-01-15', 'short') -> 'Jan 15, 2024'
   */
  const getOrdinalSuffix = (day: number): string => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = day % 100;
    return s[(v - 20) % 10] ?? s[v] ?? s[0];
  };

  const DATE_FORMATTERS: Record<DateFormat, (d: Date) => string> = {
    ordinal: (d) => {
      const day = d.getDate();
      const month = d.toLocaleString('en-US', { month: 'short' });
      return `${month} ${day}${getOrdinalSuffix(day)} ${d.getFullYear()}`;
    },
    short: (d) =>
      d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
  };

  export const date = (
    value: string | null | undefined,
    format: DateFormat = 'ordinal',
    fallback = '-'
  ): string => {
    if (!value) return fallback;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? value
      : DATE_FORMATTERS[format](parsed);
  };
}
