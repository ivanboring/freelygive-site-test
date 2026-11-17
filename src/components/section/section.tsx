import { cva } from 'class-variance-authority';
import { cn } from 'drupal-canvas';
import type { CanvasSlot } from '@freelygive/canvas-utils/types';

/** Content max-width constraint. */
export type SectionWidth = 'Normal' | 'Wide' | 'Full';

/** Background colour of the section band. */
export type SectionColorScheme = 'none' | 'navy' | 'navy_dark';

/** Shape cut into the bottom edge of a section band. */
type SectionBottomEdge = 'none' | 'curve' | 'chevron';

/** Colour revealed by the bottom edge (normally the next section's colour). */
type SectionEdgeColor = 'navy' | 'navy_dark' | 'white';

/** Vertical padding inside a section band. */
type SectionSpacing = 'none' | 'small' | 'medium' | 'large';

/** Inner content width classes. */
const widthVariants = cva('mx-auto', {
  variants: {
    width: {
      Normal: 'max-w-2xl px-4',
      Wide: 'max-w-4xl px-4',
      Full: 'max-w-[1440px] px-6 md:px-10 lg:px-20',
    } satisfies Record<SectionWidth, string>,
  },
});

/** Full-bleed band classes (background, brand type, vertical padding). */
const bandVariants = cva('relative w-full', {
  variants: {
    colorScheme: {
      none: '',
      navy: 'bg-navy-700 font-brand text-white',
      navy_dark: 'bg-navy-900 font-brand text-white',
    } satisfies Record<SectionColorScheme, string>,
    spacing: {
      none: 'py-0',
      small: 'py-5',
      medium: 'py-10',
      large: 'py-16 md:py-20',
    } satisfies Record<SectionSpacing, string>,
  },
});

/** Fill colour of the bottom-edge shape. */
const edgeColorVariants = cva(
  'pointer-events-none absolute inset-x-0 -bottom-px block h-[8vw] w-full',
  {
    variants: {
      edgeColor: {
        navy: 'fill-navy-700',
        navy_dark: 'fill-navy-900',
        white: 'fill-white',
      } satisfies Record<SectionEdgeColor, string>,
    },
  },
);

/**
 * SVG paths (viewBox 0 0 100 10, stretched to the full width) for the area
 * below the edge, painted in the next section's colour.
 */
const EDGE_PATHS: Record<Exclude<SectionBottomEdge, 'none'>, string> = {
  // Rises from the bottom-left corner to the top-right, flattening at the left.
  curve: 'M0 10C25 10 50 10 100 0V10Z',
  // A downward-pointing chevron meeting the bottom edge at the centre.
  chevron: 'M0 0L50 10L100 0V10H0Z',
};

interface SectionProps {
  /** Content max-width constraint. */
  width?: SectionWidth;
  /** Background colour; any value other than `none` renders a full-bleed band. */
  colorScheme?: SectionColorScheme;
  /** Shape cut into the bottom edge of the band. */
  bottomEdge?: SectionBottomEdge;
  /** Colour shown below the bottom-edge shape. */
  bottomEdgeColor?: SectionEdgeColor;
  /** Vertical padding inside the band. */
  spacing?: SectionSpacing;
  /** Slot content to render inside the section. */
  content?: CanvasSlot;
}

/**
 * Page section wrapper with configurable content width. With a colour scheme
 * or bottom edge it becomes a full-bleed band with brand typography, optional
 * vertical padding and a curved or chevron-shaped transition into the next
 * section.
 */
const Section = ({
  width,
  colorScheme = 'none',
  bottomEdge = 'none',
  bottomEdgeColor = 'navy',
  spacing = 'medium',
  content,
}: SectionProps) => {
  if (colorScheme === 'none' && bottomEdge === 'none') {
    return (
      <div className={cn(widthVariants({ width }), 'm-auto my-8')}>
        {content}
      </div>
    );
  }

  return (
    <section className={bandVariants({ colorScheme, spacing })}>
      <div className={widthVariants({ width })}>{content}</div>
      {bottomEdge !== 'none' && (
        <>
          {/* Reserve room for the edge so it never covers content. */}
          <div aria-hidden="true" className="h-[8vw]" />
          <svg
            aria-hidden="true"
            focusable="false"
            className={edgeColorVariants({ edgeColor: bottomEdgeColor })}
            viewBox="0 0 100 10"
            preserveAspectRatio="none"
          >
            <path d={EDGE_PATHS[bottomEdge]} />
          </svg>
        </>
      )}
    </section>
  );
};

export default Section;
