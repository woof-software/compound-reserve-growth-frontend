import { PropsWithChildren } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

type HeaderTagType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';

const text = cva('text-primary-11', {
  variants: {
    size: {
      '11': 'text-[11px]',
      '12': 'text-[12px]',
      '13': 'text-[13px]',
      '14': 'text-[14px]',
      '15': 'text-[15px]',
      '16': 'text-[16px]',
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
      '20': 'leading-[20px]',
      '21': 'leading-[21px]',
      '24': 'leading-[24px]',
      '27': 'leading-[27px]',
      '30': 'leading-[30px]',
      '38': 'leading-[38px]',
      '100': 'leading-[100%]',
      '140': 'leading-[140%]',
      '160': 'leading-[160%]'
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

const Text = ({
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
};

export default Text;
