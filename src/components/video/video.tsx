import type { CanvasVideo } from '@freelygive/canvas-utils/types';

interface VideoProps {
  /** Video source object. */
  video: CanvasVideo;
}

/**
 * Simple HTML5 video player with native controls and an empty captions track.
 */
const Video = ({ video }: VideoProps) => {
  return (
    <video className="w-full" controls>
      <source src={video.src} />
      <track kind="captions" />
    </video>
  );
};

export default Video;
