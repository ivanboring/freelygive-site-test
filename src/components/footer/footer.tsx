import { cva } from 'class-variance-authority';
import { Image } from 'drupal-canvas';
import type { CanvasImage, CanvasSlot } from '@freelygive/canvas-utils/types';

/** Footer colour scheme. */
type FooterColorScheme = 'light' | 'dark';

/** Footer surface classes for the column layout. */
const footerVariants = cva(
  'w-full px-6 py-10 md:px-10 lg:px-[max(5rem,calc((100%_-_80rem)/2))]',
  {
    variants: {
      colorScheme: {
        light: 'bg-white text-gray-900',
        dark: 'bg-navy-900 font-brand text-mint',
      } satisfies Record<FooterColorScheme, string>,
    },
  },
);

/** Legal/copyright text classes. */
const legalTextVariants = cva(
  'text-[1.0625rem]/[1.8] font-semibold whitespace-pre-wrap',
  {
    variants: {
      colorScheme: {
        light: 'text-gray-900',
        dark: 'text-white',
      } satisfies Record<FooterColorScheme, string>,
    },
  },
);

/** Contact heading classes. */
const contactHeadingVariants = cva(
  'text-[1.3rem]/[1.8] font-bold lg:text-2xl/[1.8]',
  {
    variants: {
      colorScheme: {
        light: 'text-primary-dark',
        dark: 'text-accent',
      } satisfies Record<FooterColorScheme, string>,
    },
  },
);

interface FooterProps {
  /** Footer text content (legal / copyright line). */
  text?: string;
  /** Colour scheme: the default light footer, or the dark navy brand footer. */
  colorScheme?: FooterColorScheme;
  /** Brand logo shown at the start of the footer. */
  logo?: CanvasImage;
  /** Heading above the contact links, e.g. "Happy to help". */
  contactHeading?: string;
  /** Legal links shown under the footer text (e.g. a privacy policy). */
  links?: CanvasSlot;
  /** Contact links (e.g. phone and email buttons). */
  contact?: CanvasSlot;
  /** Social media icon links, shown beside the contact links. */
  social?: CanvasSlot;
  /** Accreditation badges and logos. */
  badges?: CanvasSlot;
}

/**
 * Site footer. On its own it shows a simple legal text row; with a logo,
 * contact details, social links or badges (or the dark brand scheme) it lays
 * them out in three columns: brand and legal, contact, and badges.
 */
const Footer = ({
  text,
  colorScheme = 'light',
  logo,
  contactHeading,
  links,
  contact,
  social,
  badges,
}: FooterProps) => {
  const hasColumns =
    colorScheme !== 'light' ||
    Boolean(
      logo?.src || contactHeading || links || contact || social || badges,
    );

  if (!hasColumns) {
    return (
      <footer className="bg-white">
        <div className="mx-auto max-w-screen-xl px-4 pt-4 pb-8 sm:px-6 lg:px-8">
          <div className="mt-16 border-t border-gray-100 pt-8 sm:flex sm:items-center sm:justify-between lg:mt-24">
            <div className="flex flex-wrap justify-center gap-4 text-xs lg:justify-end">
              {text}
            </div>

            <ul className="mt-8 flex justify-center gap-6 sm:mt-0 lg:justify-end"></ul>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={footerVariants({ colorScheme })}>
      <div className="grid gap-x-6 gap-y-10 md:grid-cols-[42fr_29fr_29fr] lg:gap-x-0">
        {/* Brand and legal */}
        <div className="flex flex-col items-start gap-2">
          {logo?.src && (
            <Image
              src={logo.src}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              className="h-auto w-[13rem] max-w-full md:w-[19.5rem]"
            />
          )}
          {text && <p className={legalTextVariants({ colorScheme })}>{text}</p>}
          {links && (
            <div className="flex flex-wrap gap-x-6 gap-y-2">{links}</div>
          )}
        </div>

        {/* Contact */}
        {(contactHeading || contact || social) && (
          <div className="flex flex-col items-start gap-4 lg:gap-5">
            {contactHeading && (
              <p className={contactHeadingVariants({ colorScheme })}>
                {contactHeading}
              </p>
            )}
            <div className="flex flex-wrap items-start gap-x-16 gap-y-6 lg:gap-x-20">
              {contact && (
                <div className="flex flex-col items-start gap-2.5">
                  {contact}
                </div>
              )}
              {social && (
                <div className="flex flex-col items-start gap-2.5 pt-0.5">
                  {social}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Badges */}
        {badges && (
          <div className="flex max-w-[19.5rem] flex-wrap items-center gap-x-3 gap-y-3">
            {badges}
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
