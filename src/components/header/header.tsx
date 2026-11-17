import { useEffect, useRef, useState } from 'react';
import SearchButton from '@/components/search_button';
import { cva } from 'class-variance-authority';
import { cn } from 'drupal-canvas';
import type { CSSProperties } from 'react';
import type { CanvasSlot } from '@freelygive/canvas-utils/types';

/** Header colour scheme. */
type HeaderColorScheme = 'light' | 'dark';

/** Fragment target at the end of the header, used by the skip link. */
const SKIP_TARGET_ID = 'header-skip-target';

/** Header grid layout classes. */
const headerVariants = cva(
  cn(
    'relative grid w-full justify-center gap-4 px-8 py-3 leading-[normal]',
    'border-b border-solid border-gray-200',
    'bg-[var(--color-bg)]',
  ),
  {
    variants: {
      displaySearchForm: {
        false: 'grid-cols-2',
        true: 'grid-cols-2 md:grid-cols-[1fr_auto_1fr]',
      },
      colorScheme: {
        light: '',
        // Brand bar: content aligned to the same 80rem column as sections.
        dark: 'grid-cols-[auto_1fr] items-center border-b-0 bg-navy-900 px-6 py-5 font-brand md:px-10 md:py-[2.15rem] lg:px-[max(5rem,calc((100%_-_80rem)/2))]',
      } satisfies Record<HeaderColorScheme, string>,
    },
  },
);

/** Logo cell classes. */
const logoCellVariants = cva('min-w-[100px] justify-self-start', {
  variants: {
    colorScheme: {
      light: 'my-1 max-h-8 md:my-3',
      // Sits above the full-screen mobile menu so the brand stays visible.
      dark: 'relative z-50 flex items-center',
    } satisfies Record<HeaderColorScheme, string>,
  },
});

/** Menu cell classes. */
const menuCellVariants = cva(
  'flex w-full min-w-[200px] items-center justify-end gap-2 justify-self-end md:min-w-[300px]',
  {
    variants: {
      colorScheme: {
        light:
          'md:content-center md:justify-center md:justify-self-center md:px-6 md:py-2',
        dark: '',
      } satisfies Record<HeaderColorScheme, string>,
    },
  },
);

interface HeaderProps {
  /** Header background color. */
  backgroundColor?: string;
  /** Additional CSS classes. */
  className?: string;
  /** Logo slot content. */
  logo?: CanvasSlot;
  /** Navigation menu slot content. */
  menu?: CanvasSlot;
  /** Whether to show the search button. */
  displaySearchForm?: boolean;
  /** Colour scheme: the default light bar, or the dark navy brand bar. */
  colorScheme?: HeaderColorScheme;
  /** Add a keyboard "Skip to Content" link that jumps past the header. */
  skipLink?: boolean;
}

/**
 * Header component with logo, navigation, and optional search form.
 * Tracks its own height via ResizeObserver to position the search overlay.
 */
const Header = ({
  backgroundColor = '#ffffff',
  className,
  logo,
  menu,
  displaySearchForm,
  colorScheme = 'light',
  skipLink = false,
}: HeaderProps) => {
  const [height, setHeight] = useState(0);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (ref.current) {
        setHeight(ref.current.offsetHeight);
      }
    };

    updateHeight();

    if (!ref.current) return;

    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    resizeObserver.observe(ref.current);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <header
      className={cn(
        headerVariants({ displaySearchForm, colorScheme }),
        className,
      )}
      ref={ref}
      style={
        {
          '--color-bg': backgroundColor,
        } as CSSProperties
      }
    >
      {skipLink && (
        <a
          href={`#${SKIP_TARGET_ID}`}
          className="sr-only z-[60] rounded-sm bg-white font-semibold text-black focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:px-4 focus:py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Skip to Content
        </a>
      )}

      {/* Logo - always first */}
      <div className={logoCellVariants({ colorScheme })}>{logo}</div>

      {/* Search and Menu container on mobile, Menu only on desktop */}
      <div className={menuCellVariants({ colorScheme })}>
        {displaySearchForm && (
          <div className="md:hidden">
            <SearchButton positionTop={height} />
          </div>
        )}
        <div className="md:w-full">{menu}</div>
      </div>

      {/* Search - desktop only (third position) */}
      {displaySearchForm && (
        <div className="hidden min-w-[50px] content-center text-right md:block">
          <SearchButton positionTop={height} />
        </div>
      )}

      {/* Skip link target: focus lands here, so the next Tab leaves the header. */}
      {skipLink && (
        <span
          id={SKIP_TARGET_ID}
          tabIndex={-1}
          className="absolute bottom-0 left-0 size-px outline-none"
        />
      )}
    </header>
  );
};

export default Header;
