import Image from '@/components/image';
import { tables } from '@/stories/argtypes';
import { crmPhone } from '@/stories/assets/freelygive';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Assets/Image',
  component: Image,
  parameters: {
    docs: {
      description: {
        component:
          'Renders a full-width responsive image with vertical margin, using the Canvas responsive image renderer to serve appropriately sized sources.',
      },
    },
  },
  argTypes: {
    image: {
      control: 'object',
      description:
        'Image object providing the source URL, alt text, and intrinsic width and height.',
      table: tables.CANVAS,
    },
    alignment: {
      control: 'select',
      options: ['left', 'center'],
      description: 'Horizontal placement of the image within its container.',
      table: tables.CANVAS,
    },
    maxWidth: {
      control: 'select',
      options: ['none', 'small', 'medium', 'large'],
      description:
        'Upper limit on the displayed width from the medium breakpoint up (small 20rem, medium 30rem, large 40rem).',
      table: tables.CANVAS,
    },
  },
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    image: {
      src: 'https://placehold.co/800x600',
      alt: 'Example image placeholder',
      width: 800,
      height: 600,
    },
  },
};

export const Wide: Story = {
  args: {
    image: {
      src: 'https://placehold.co/1200x400',
      alt: 'Wide image placeholder',
      width: 1200,
      height: 400,
    },
  },
};

export const Square: Story = {
  args: {
    image: {
      src: 'https://placehold.co/600x600',
      alt: 'Square image placeholder',
      width: 600,
      height: 600,
    },
  },
};

export const Portrait: Story = {
  args: {
    image: {
      src: 'https://placehold.co/400x600',
      alt: 'Portrait image placeholder',
      width: 400,
      height: 600,
    },
  },
};

export const CenteredMedium: Story = {
  args: {
    image: crmPhone,
    alignment: 'center',
    maxWidth: 'medium',
  },
};
