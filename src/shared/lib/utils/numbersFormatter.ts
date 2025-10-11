/**
 * A general purpose number and currency formatter.
 *
 * @param {number | string} value - The number to be formatted.
 * @param {object} config - The configuration object for formatting.
 * @param {'token' | 'usd' | 'number' } [config.type='number'] - The type of value to format.
 * @param {'full' | 'compact'} [config.view='full'] - The view style. 'compact' applies to large values (>= 1000).
 * @param {number} [config.decimals] - The maximum number of decimal places. Defaults vary by type.
 * @param {string} [config.tokenSymbol] - The symbol to append for 'token' type (e.g., 'COMP').
 * @returns {string} The formatted string, or throws an error if the input is invalid.
 * DON'T EXPORT AND DON'T USE THIS FUNCTION DIRECTLY
 */

type FormatType = 'token' | 'usd' | 'number';
type FormatView = 'full' | 'compact';

const formatter = (
  value: number | string,
  config: {
    view: FormatView;
    type?: FormatType;
    decimals?: number;
    tokenSymbol?: string;
  }
): string => {
  const numericValue = Number(value);

  if (isNaN(numericValue) || !isFinite(numericValue)) {
    throw new Error(
      'wrong numbersFormatter value type, it expects number or string'
    );
  }

  const { type = 'number', view = 'full', decimals, tokenSymbol = '' } = config;
  const locale = 'en-US';

  const options: Intl.NumberFormatOptions = {};

  if (view === 'compact' && Math.abs(numericValue) >= 1000) {
    options.notation = 'compact';
    options.maximumFractionDigits = 2;
  }

  switch (type) {
    case 'usd': {
      options.style = 'currency';
      options.currency = 'USD';

      if (!options.notation) {
        options.minimumFractionDigits = 2;
        options.maximumFractionDigits = 2;
      }
      return new Intl.NumberFormat(locale, options).format(numericValue);
    }

    case 'token':
    default: {
      options.style = 'decimal';

      if (!options.notation) {
        options.maximumFractionDigits = decimals ?? 2;
      }

      const numberPart = new Intl.NumberFormat(locale, options).format(
        numericValue
      );

      return type === 'token' ? `${numberPart} ${tokenSymbol}` : numberPart;
    }
  }
};

/** For all formatters parameter view is required*/
export const NumbersFormatter = {
  /**
   * Formats a number as a USD price.
   * e.g., price(12345.67, view: 'compact' ) -> '$12.35K'
   * e.g., price(12345.67, view: 'full' ) -> '$12,345.67'
   */
  price(value: number | string, view: FormatView) {
    return formatter(value, { type: 'usd', view });
  },

  /**
   * Formats a number as a token amount with a symbol.
   * e.g., token(12345, tokenSymbol: 'ETH', view: 'compact' ) -> '12.35K ETH'
   * e.g., token(123.45678, tokenSymbol: 'ETH', view: 'full', decimals: 4 ) -> '123.4568 ETH'
   */
  token(
    value: number | string,
    view: FormatView,
    tokenSymbol: string,
    decimals?: number
  ) {
    return formatter(value, {
      type: 'token',
      decimals,
      tokenSymbol,
      view
    });
  },

  /**
   * Formats a number with default settings.
   * e.g., universal(98765, view: 'compact') -> '98.77K'
   * e.g., universal(98765.4321, view: 'full', decimals: 2 ) -> '98,765.43'
   */
  universal(value: number | string, view: FormatView, decimals?: number) {
    return formatter(value, {
      type: 'number',
      decimals,
      view
    });
  }
};
