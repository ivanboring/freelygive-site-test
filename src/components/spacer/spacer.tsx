import { cva } from 'class-variance-authority';

/** Spacer height preset. */
export type SpacerHeight = 'Small' | 'Medium' | 'Large' | 'Extra Large';

/** Spacer height classes. */
const spacerVariants = cva('', {
  variants: {
    height: {
      Small: 'h-8',
      Medium: 'h-12',
      Large: 'h-16',
      'Extra Large': 'h-24',
    } satisfies Record<SpacerHeight, string>,
  },
});

interface SpacerProps {
  /** Height preset. */
  height?: SpacerHeight;
}

/**
 * Empty vertical spacer element with configurable height presets.
 */
const Spacer = ({ height = 'Small' }: SpacerProps) => {
  return <div className={spacerVariants({ height })}>&nbsp;</div>;
};

export default Spacer;
