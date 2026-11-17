import Video from '@/components/video';
import { tables } from '@/stories/argtypes';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Assets/Video',
  component: Video,
  parameters: {
    docs: {
      description: {
        component:
          'Renders a full-width HTML5 video player with native browser controls for the provided video source.',
      },
    },
  },
  argTypes: {
    video: {
      control: 'object',
      description:
        'Video source object providing the src (and optional poster) for the player.',
      table: tables.CANVAS,
    },
  },
} satisfies Meta<typeof Video>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    video: {
      src: 'https://www.w3schools.com/html/mov_bbb.mp4',
    },
  },
};
