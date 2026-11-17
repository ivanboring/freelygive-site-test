import { useState } from 'react';
import SearchForm from '@/components/search_form';
import Section from '@/components/section';

interface SearchButtonProps {
  /** Vertical offset in pixels for the search overlay. */
  positionTop?: number;
}

/**
 * Toggle button that opens a search overlay positioned below the header.
 * Switches between a search icon and a close icon based on open state.
 */
const SearchButton = ({ positionTop = 50 }: SearchButtonProps) => {
  const [open, setOpen] = useState(false);
  const toggleOpen = () => {
    setOpen(!open);
  };
  return (
    <>
      <button
        type="button"
        className="rounded bg-blue-600 p-2.5 text-white"
        onClick={toggleOpen}
      >
        {!open && <SearchIcon />}
        {open && <CloseIcon />}
      </button>
      {open && <SearchOverlay positionTop={positionTop} />}
    </>
  );
};

interface SearchOverlayProps {
  /** Vertical offset in pixels from the top of the viewport. */
  positionTop: number;
}

/** Full-width search overlay positioned absolutely below the header. */
const SearchOverlay = ({ positionTop }: SearchOverlayProps) => {
  return (
    <div
      className="absolute right-0 left-0 bg-gray-100"
      style={{ top: `${positionTop}px` }}
    >
      <Section content={<SearchForm />} width="Normal" />
    </div>
  );
};

/** Magnifying glass SVG icon. */
const SearchIcon = () => {
  return (
    <svg
      className="h-4 w-4 stroke-white text-white"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 21L16.7 16.7"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/** X-mark SVG icon for dismissing the search overlay. */
const CloseIcon = () => {
  return (
    <svg
      className="h-4 w-4 stroke-white text-white"
      width="24"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15 5L5 15"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 5L15 15"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default SearchButton;
