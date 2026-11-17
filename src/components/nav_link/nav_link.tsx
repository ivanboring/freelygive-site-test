'use client';

import { useHydrated } from '@freelygive/canvas-utils/ssr';

interface NavLinkProps {
  /** Link label. */
  title: string;
  /** Destination URL. */
  link: string;
}

/** Normalise a path for comparison: drop trailing slashes (root stays "/"). */
const normalisePath = (path: string): string => path.replace(/\/+$/, '') || '/';

/** Whether a link points at the page currently being viewed. */
const isCurrentPage = (link: string): boolean => {
  try {
    const target = new URL(link, window.location.href);
    return (
      target.origin === window.location.origin &&
      normalisePath(target.pathname) === normalisePath(window.location.pathname)
    );
  } catch {
    return false;
  }
};

/**
 * A single main-menu link, placed in the `links` slot of `main_navigation`.
 * Its colour and size come from the parent menu, and it marks itself as the
 * current page (underlined) when it points at the page being viewed.
 */
const NavLink = ({ title, link }: NavLinkProps) => {
  // Resolved only after hydration so the first client render matches the
  // server one (the server does not know the current URL).
  const hydrated = useHydrated();
  const current = hydrated && isCurrentPage(link);

  return (
    <a
      href={link}
      aria-current={current ? 'page' : undefined}
      className="inline-block py-1 text-[length:var(--nav-link-size,1rem)] leading-[1.2] font-semibold tracking-[0.02em] text-[color:var(--nav-link-color,var(--color-gray-900))] decoration-1 underline-offset-[0.55em] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current aria-[current=page]:underline md:py-2"
    >
      {title}
    </a>
  );
};

export default NavLink;
