import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

export type TextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyMedium'
  | 'caption'
  | 'tiny';

export type TextColorRole =
  | 'primary' // Slate 900 - 14.2:1 contrast against glass
  | 'secondary' // Slate 700 - 4.8:1 contrast (meets WCAG AA)
  | 'muted' // Slate 500 - strictly for secondary metadata, labels
  | 'brand' // Sky 600 - clinical brand emphasis
  | 'success' // Clinical Emerald
  | 'warning' // Clinical Amber
  | 'error' // Clinical Crimson
  | 'info' // Clinical Info Sky
  | 'white';

export interface ClinicalTextProps extends RNTextProps {
  variant?: TextVariant;
  color?: TextColorRole;
  mono?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
  children?: React.ReactNode;
}

const VARIANT_CLASSES: Record<TextVariant, string> = {
  display: 'text-display font-bold tracking-tight',
  h1: 'text-h1 font-bold tracking-tight',
  h2: 'text-h2 font-semibold tracking-tight',
  h3: 'text-h3 font-semibold',
  body: 'text-body font-normal',
  bodyMedium: 'text-body-medium font-medium',
  caption: 'text-caption font-medium',
  tiny: 'text-tiny font-semibold tracking-wider',
};

const COLOR_CLASSES: Record<TextColorRole, string> = {
  primary: 'text-slate-900',
  secondary: 'text-slate-700',
  muted: 'text-slate-500',
  brand: 'text-primary-600',
  success: 'text-clinical-success-text',
  warning: 'text-clinical-warning-text',
  error: 'text-clinical-error-text',
  info: 'text-clinical-info-text',
  white: 'text-white',
};

const ALIGN_CLASSES: Record<'left' | 'center' | 'right', string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

/**
 * ClinicalText
 * Typography primitive implementing the OrthoPrint clinical type scale via NativeWind.
 * Enforces high-contrast legibility under harsh lighting.
 * Automatically switches between Geist and IBM Plex Mono.
 */
export function ClinicalText({
  variant = 'body',
  color = 'primary',
  mono = false,
  align = 'left',
  className = '',
  style,
  children,
  ...props
}: ClinicalTextProps) {
  const variantClass = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.body;
  const colorClass = COLOR_CLASSES[color] ?? COLOR_CLASSES.primary;
  const fontClass = mono ? 'font-mono' : 'font-geist';
  const alignClass = ALIGN_CLASSES[align] ?? ALIGN_CLASSES.left;

  return (
    <RNText
      className={`${variantClass} ${colorClass} ${fontClass} ${alignClass} ${className}`}
      style={style}
      {...props}>
      {children}
    </RNText>
  );
}
