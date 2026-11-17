import { Image } from 'drupal-canvas';
import type { CanvasImage } from '@freelygive/canvas-utils/types';

interface ImageTileProps {
  /** Background photo of the tile. */
  image: CanvasImage;
  /** Title shown on the tile's dark band; also the link text. */
  title: string;
  /** Destination URL. */
  link: string;
}

/**
 * Rounded photo tile linking to another page, with its title on a translucent
 * dark band across the bottom, underlined by a hand-drawn stroke. Inside a
 * "Spread wrap" grid it sizes to the grid: three abreast (up to 312px wide)
 * on wider screens, two abreast on phones.
 */
const ImageTile = ({ image, title, link }: ImageTileProps) => {
  const { src, width, height } = image;
  return (
    <a
      href={link}
      className="group relative mx-auto block aspect-[312/297] w-[19.5rem] max-w-full overflow-hidden rounded-[20px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white @max-2xl:mx-0 @max-2xl:w-[calc(50cqw-0.75rem)] @2xl:mx-0 @2xl:w-[min(19.5rem,calc(33.333cqw-0.75rem))]"
    >
      {/* Decorative: the title names the link. */}
      <Image
        {...{ src, width, height }}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <span className="absolute inset-x-0 bottom-0 flex h-[35%] items-center justify-center bg-black/55 px-4">
        <span className="text-center text-[1.7rem]/[1.35] font-bold text-white lg:text-[2.1rem]/[1.35]">
          <span className="underline-curve">{title}</span>
        </span>
      </span>
    </a>
  );
};

export default ImageTile;
