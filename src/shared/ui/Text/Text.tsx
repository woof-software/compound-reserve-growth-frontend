import { memo, PropsWithChildren } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { HeaderTagType } from './model/types';

const text = cva('', {
  variants: {
    size: {
      '11': 'text-[11px]',
      '11.5': 'text-[11.5px]',
      '12.6': 'text-[12.6px]',
      '13': 'text-[13px]',
      '14': 'text-[14px]',
      '15': 'text-[15px]',
      '17': 'text-[17px]',
      '23': 'text-[23px]',
      '32': 'text-[32px]'
    },
    weight: {
      '400': 'font-normal',
      '500': 'font-medium',
      '600': 'font-semibold',
      '700': 'font-bold'
    },
    lineHeight: {
      '12': 'leading-[12px]',
      '14': 'leading-[14px]',
      '16': 'leading-[16px]',
      '18': 'leading-[18px]',
      '21': 'leading-[21px]',
      '24': 'leading-[24px]',
      '27': 'leading-[27px]',
      '30': 'leading-[30px]',
      '38': 'leading-[38px]',
      '100': 'leading-[100%]',
      '140': 'leading-[140%]'
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right'
    }
  },
  defaultVariants: {
    size: '14',
    weight: '400',
    lineHeight: '100',
    align: 'left'
  }
});

interface TextProps extends PropsWithChildren, VariantProps<typeof text> {
  className?: string;

  tag?: HeaderTagType;
}

const Text = memo(
  ({
    className,
    size,
    weight,
    lineHeight,
    align,
    tag: Tag = 'p',
    children
  }: TextProps) => {
    return (
      <Tag className={text({ size, weight, lineHeight, align, className })}>
        {children}
      </Tag>
    );
  }
);

export default Text;
