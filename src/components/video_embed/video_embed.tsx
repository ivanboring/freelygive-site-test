import { cva } from 'class-variance-authority';
import type { TextColor } from '@/lib/theme';

/** Downward offset on wide screens, for staggered rows of videos. */
type VideoEmbedOffset = 'none' | 'small' | 'large';

/** Outer wrapper classes, including the staggered offset. */
const wrapperVariants = cva('flex w-full flex-col items-center', {
  variants: {
    offset: {
      none: '',
      small: 'md:mt-[4.8rem]',
      large: 'md:mt-[9.6rem]',
    } satisfies Record<VideoEmbedOffset, string>,
  },
});

/** Caption colour (text and its curved underline). */
const captionVariants = cva(
  'mt-3 px-2 text-center [font-family:inherit] text-[1.3rem]/[1.37] font-normal lg:text-2xl/[1.37]',
  {
    variants: {
      textColor: {
        Dark: 'text-black',
        Light: 'text-white',
      } satisfies Record<TextColor, string>,
    },
  },
);

/** Underline stroke matching the caption colour. */
const underlineVariants = cva('', {
  variants: {
    textColor: {
      Dark: 'underline-curve-dark',
      Light: 'underline-curve',
    } satisfies Record<TextColor, string>,
  },
});

/** Convert a YouTube or Vimeo watch/share link into its embeddable URL. */
const toEmbedUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      return `https://www.youtube.com/embed${parsed.pathname}${parsed.search}`;
    }
    if (host.endsWith('youtube.com') && parsed.pathname === '/watch') {
      const id = parsed.searchParams.get('v');
      parsed.searchParams.delete('v');
      const query = parsed.searchParams.toString();
      return `https://www.youtube.com/embed/${id}${query ? `?${query}` : ''}`;
    }
    if (host === 'vimeo.com') {
      return `https://player.vimeo.com/video${parsed.pathname}`;
    }
    return url;
  } catch {
    return url;
  }
};

interface VideoEmbedProps {
  /** YouTube or Vimeo video link (watch, share or embed URL). */
  videoUrl: string;
  /** Accessible title of the embedded player, e.g. the video's title. */
  videoTitle: string;
  /** Caption shown under the video with a hand-drawn underline. */
  caption?: string;
  /** Caption colour, for dark or light backgrounds. */
  textColor?: TextColor;
  /** Downward offset on wide screens, to stagger a row of videos. */
  offset?: VideoEmbedOffset;
}

/**
 * Responsive 16:9 embedded YouTube or Vimeo player with an optional caption
 * underlined by a hand-drawn stroke. Videos in a grid can be offset to form a
 * staggered row on wide screens.
 */
const VideoEmbed = ({
  videoUrl,
  videoTitle,
  caption,
  textColor = 'Light',
  offset = 'none',
}: VideoEmbedProps) => {
  return (
    <div className={wrapperVariants({ offset })}>
      <div className="aspect-video w-full overflow-hidden bg-black">
        <iframe
          src={toEmbedUrl(videoUrl)}
          title={videoTitle}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>
      {caption && (
        <h3 className={captionVariants({ textColor })}>
          <span className={underlineVariants({ textColor })}>{caption}</span>
        </h3>
      )}
    </div>
  );
};

export default VideoEmbed;
