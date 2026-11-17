import VideoEmbed from '@/components/video_embed';
import { tables } from '@/stories/argtypes';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Assets/Video Embed',
  component: VideoEmbed,
  parameters: {
    docs: {
      description: {
        component:
          'Responsive 16:9 embedded YouTube or Vimeo player (watch, share or embed links are all accepted) with an optional caption underlined by a hand-drawn stroke. Place several in a Grid Container and set Offset to stagger them on wide screens.',
      },
    },
  },
  argTypes: {
    videoUrl: {
      control: 'text',
      description: 'YouTube or Vimeo link (watch, share or embed URL).',
      table: tables.CANVAS,
    },
    videoTitle: {
      control: 'text',
      description:
        'Accessible title of the embedded player, usually the video title.',
      table: tables.CANVAS,
    },
    caption: {
      control: 'text',
      description: 'Caption shown under the video.',
      table: tables.CANVAS,
    },
    textColor: {
      control: 'select',
      options: ['Dark', 'Light'],
      description: 'Caption colour, for light or dark backgrounds.',
      table: tables.CANVAS,
    },
    offset: {
      control: 'select',
      options: ['none', 'small', 'large'],
      description:
        'Push the video down on wide screens to stagger a row (small ≈ 77px, large ≈ 154px).',
      table: tables.CANVAS,
    },
  },
} satisfies Meta<typeof VideoEmbed>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    videoUrl: 'https://www.youtube.com/embed/1r0m5jH51D4?feature=oembed',
    videoTitle: 'Using a Chatbot to change the design of text in Drupal',
    caption: 'Chatbot to change text using AI',
    textColor: 'Light',
  },
  globals: { backgrounds: { value: 'dark' } },
};

export const DarkCaption: Story = {
  args: {
    videoUrl: 'https://www.youtube.com/watch?v=LjdAsguNwJQ',
    videoTitle:
      'Controlling Drupal via ChatGPT: Is Drupal coming for your Job?',
    caption: 'Controlling Drupal via ChatGPT',
    textColor: 'Dark',
  },
};
