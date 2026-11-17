'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { getSlotChildren } from '@freelygive/canvas-utils/slots';
import { useHydrated } from '@freelygive/canvas-utils/ssr';
import { cva } from 'class-variance-authority';
import { cn, JsonApiClient, sortMenu } from 'drupal-canvas';
import useSWR from 'swr';
import type {
  CanvasMenuItem,
  CanvasSlot,
} from '@freelygive/canvas-utils/types';

/**
 * Drupal JSON:API client, created on first fetch rather than at import:
 * constructing it throws on sites without the JSON:API module, which would
 * stop the whole navigation hydrating even when its links come from the slot.
 */
let client: JsonApiClient | undefined;
const getClient = () => (client ??= new JsonApiClient());

/** Colour scheme of the menu links on wide screens. */
type NavigationColorScheme = 'light' | 'dark';

/** How the menu opens on small screens. */
type NavigationMobileMenu = 'dropdown' | 'fullscreen';

/**
 * Media query matching the `lg` breakpoint, from which the full-screen menu's
 * links show inline (a full menu needs about 60rem to fit on one row).
 */
const FULLSCREEN_DESKTOP_QUERY = '(min-width: 64rem)';

/**
 * Link styling handed to `nav_link` children through CSS custom properties,
 * so the same links can be large and dark in the mobile overlay and small and
 * light in the desktop bar.
 */
const linkVarsVariants = cva('', {
  variants: {
    colorScheme: {
      light: '[--nav-link-color:var(--color-gray-900)] [--nav-link-size:1rem]',
      dark: '',
    } satisfies Record<NavigationColorScheme, string>,
    mobileMenu: {
      dropdown: '',
      fullscreen: '',
    } satisfies Record<NavigationMobileMenu, string>,
  },
  compoundVariants: [
    // Dark links on the white mobile panel, light links in the dark bar.
    {
      colorScheme: 'dark',
      mobileMenu: 'dropdown',
      className:
        '[--nav-link-color:var(--color-black)] [--nav-link-size:1rem] md:[--nav-link-color:var(--color-white)]',
    },
    {
      colorScheme: 'dark',
      mobileMenu: 'fullscreen',
      className:
        '[--nav-link-color:var(--color-black)] [--nav-link-size:2.07rem] lg:[--nav-link-color:var(--color-white)] lg:[--nav-link-size:1rem]',
    },
    {
      colorScheme: 'light',
      mobileMenu: 'fullscreen',
      className: '[--nav-link-size:2.07rem] lg:[--nav-link-size:1rem]',
    },
  ],
});

/**
 * Link styling before hydration (or without JavaScript): the links stay in
 * the bar at every width, so they use the wide-screen colours and size.
 */
const staticLinkVarsVariants = cva('[--nav-link-size:1rem]', {
  variants: {
    colorScheme: {
      light: '[--nav-link-color:var(--color-gray-900)]',
      dark: '[--nav-link-color:var(--color-white)]',
    } satisfies Record<NavigationColorScheme, string>,
  },
});

/** Toggle button colour for the full-screen menu. */
const fullscreenToggleVariants = cva(
  'relative z-50 flex size-11 cursor-pointer items-center justify-center rounded-sm focus:outline-none focus-visible:outline-2 focus-visible:outline-current lg:hidden',
  {
    variants: {
      colorScheme: {
        light: 'text-gray-900',
        dark: 'text-white aria-expanded:text-black',
      } satisfies Record<NavigationColorScheme, string>,
    },
  },
);

interface MainNavigationProps {
  /**
   * Optional author-defined menu links (`nav_link` components). When empty,
   * the menu items are fetched from the Drupal main menu instead.
   */
  links?: CanvasSlot;
  /** Colour scheme of the menu on wide screens. */
  colorScheme?: NavigationColorScheme;
  /** How the menu opens on small screens. */
  mobileMenu?: NavigationMobileMenu;
}

/**
 * Main navigation menu component. Renders author-defined links from its slot,
 * or fetches the menu from Drupal, as a horizontal list on desktop and either
 * a dropdown drawer or a full-screen overlay on mobile.
 */
const MainNavigation = ({
  links,
  colorScheme = 'light',
  mobileMenu = 'dropdown',
}: MainNavigationProps) => {
  const hasSlotLinks = getSlotChildren(links).length > 0;
  const { data, error, isLoading } = useSWR(
    hasSlotLinks ? null : ['menu_items', 'main'],
    ([type, resourceId]) => getClient().getResource(type, resourceId),
  );

  // MenuItem type from drupal-canvas omits title/url present on JSON:API items.
  const menuLinks: CanvasMenuItem[] =
    !hasSlotLinks && !error && !isLoading && data
      ? (Array.from(
          sortMenu(data as Parameters<typeof sortMenu>[0]),
        ) as CanvasMenuItem[])
      : [];
  const [open, setOpen] = useState(false);
  const hydrated = useHydrated();
  const navId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Full-screen overlay: lock page scroll, close on Escape (returning focus to
  // the toggle) and close when the viewport widens to the desktop layout.
  useEffect(() => {
    if (mobileMenu !== 'fullscreen' || !open) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const desktop = window.matchMedia(FULLSCREEN_DESKTOP_QUERY);
    const onWiden = () => {
      if (desktop.matches) setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    desktop.addEventListener('change', onWiden);
    return () => {
      root.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      desktop.removeEventListener('change', onWiden);
    };
  }, [mobileMenu, open]);

  const fetchedLinks = menuLinks.map(({ id, title, url }) => (
    <a
      key={id}
      href={url}
      className="text-md flex items-center p-2 text-black hover:text-blue-500 focus:text-blue-600 focus:outline-none dark:text-blue-500 dark:focus:text-blue-500"
      aria-current="page"
    >
      {title}
    </a>
  ));

  if (mobileMenu === 'fullscreen') {
    return (
      <>
        <button
          ref={toggleRef}
          type="button"
          className={cn(
            fullscreenToggleVariants({ colorScheme }),
            // Without JavaScript the links stay visible, so no toggle.
            !hydrated && 'hidden',
          )}
          aria-expanded={open}
          aria-controls={navId}
          aria-label="Toggle navigation"
          onClick={() => setOpen(!open)}
        >
          <svg
            className="h-4 w-9"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 36 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            {open ? (
              <path d="M10 0 26 16M26 0 10 16" />
            ) : (
              <path d="M0 3h36M0 13h36" />
            )}
          </svg>
        </button>
        <nav
          id={navId}
          // The overlay styles are scoped to `max-lg:` rather than set bare and
          // undone at `lg:`: a theme's own `.fixed`, `.invisible` or
          // `.opacity-0` utility (loaded later) would otherwise win on desktop.
          className={
            hydrated
              ? cn(
                  linkVarsVariants({ colorScheme, mobileMenu }),
                  'overflow-y-auto transition-[opacity,visibility] duration-300 motion-reduce:transition-none',
                  'max-lg:fixed max-lg:inset-0 max-lg:z-40 max-lg:flex max-lg:items-center max-lg:justify-center max-lg:bg-white',
                  open
                    ? 'visible opacity-100'
                    : 'max-lg:invisible max-lg:opacity-0',
                )
              : // Pre-hydration / no-JS: a plain wrapped list, never hidden.
                staticLinkVarsVariants({ colorScheme })
          }
          aria-label="Main navigation"
        >
          <div
            className={
              hydrated
                ? 'flex items-center text-center max-lg:flex-col max-lg:gap-y-2 max-lg:py-24 lg:flex-row lg:flex-wrap lg:justify-end lg:gap-x-2.5 lg:gap-y-1 xl:gap-x-[1.15rem]'
                : 'flex flex-row flex-wrap items-center justify-end text-center max-lg:gap-x-4 max-lg:gap-y-2 lg:gap-x-2.5 lg:gap-y-1 xl:gap-x-[1.15rem]'
            }
          >
            {hasSlotLinks ? links : fetchedLinks}
          </div>
        </nav>
      </>
    );
  }

  return (
    <>
      <div className="flex justify-end md:!hidden">
        <button
          type="button"
          className="relative flex size-9 items-center justify-center rounded-lg border text-sm font-semibold text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none disabled:pointer-events-none"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={() => {
            setOpen(!open);
          }}
        >
          <svg
            className={cn('size-4', open ? 'hidden' : '')}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" x2="21" y1="6" y2="6" />
            <line x1="3" x2="21" y1="12" y2="12" />
            <line x1="3" x2="21" y1="18" y2="18" />
          </svg>
          <svg
            className={cn('size-4 shrink-0', open ? '' : 'hidden')}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
          <span className="sr-only">Toggle navigation</span>
        </button>
      </div>
      <nav
        className={cn(
          'absolute left-0 w-screen bg-white px-10 py-6 md:static md:block md:w-full md:px-8 md:py-0',
          open ? '' : 'hidden',
          hasSlotLinks && linkVarsVariants({ colorScheme, mobileMenu }),
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-h-[75vh] overflow-hidden overflow-y-auto">
          <div className="flex flex-col gap-0.5 py-2 md:flex-row md:items-center md:justify-center md:gap-1 md:py-0">
            {hasSlotLinks ? links : fetchedLinks}
          </div>
        </div>
      </nav>
    </>
  );
};

export default MainNavigation;
