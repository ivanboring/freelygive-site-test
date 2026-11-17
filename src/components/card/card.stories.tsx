import Card from '@/components/card';
import { tables } from '@/stories/argtypes';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    docs: {
      description: {
        component:
          'Content card with an optional image, heading, body text, and call-to-action link button. Content alignment and color theme are configurable, and the card background (and hover state) can be tinted with custom colors.',
      },
    },
  },
  argTypes: {
    image: {
      control: 'object',
      description: 'Card image source and metadata (src, alt, width, height).',
      table: tables.CANVAS,
    },
    heading: {
      control: 'text',
      description: 'Card heading text.',
      table: tables.CANVAS,
    },
    headingElement: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      description: 'HTML heading element used to render the heading.',
      table: tables.CANVAS,
    },
    layout: {
      control: 'select',
      options: ['Left aligned', 'Center aligned', 'Right aligned'],
      description: 'Content alignment within the card.',
      table: tables.CANVAS,
    },
    link: {
      control: 'text',
      description: 'Destination URL for the call-to-action button.',
      table: tables.CANVAS,
    },
    linkLabel: {
      control: 'text',
      description: 'Label text for the call-to-action button.',
      table: tables.CANVAS,
    },
    linkVariant: {
      control: 'select',
      options: ['Solid', 'Outline Dark', 'Link', 'Link Underline'],
      description: 'Button style variant for the call-to-action.',
      table: tables.CANVAS,
    },
    text: {
      control: 'text',
      description: 'Body copy displayed below the heading (supports HTML).',
      table: tables.CANVAS,
    },
    className: {
      control: 'text',
      description: 'Extra CSS classes appended to the outer element.',
      table: tables.INTERNAL,
    },
    textColor: {
      control: 'select',
      options: ['Default', 'Dark', 'Light'],
      description: 'Text color theme for the card content.',
      table: tables.INTERNAL,
    },
  },
} satisfies Meta<typeof Card>;

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
    layout: 'Left aligned',
    heading: 'Feature or benefit',
    headingElement: 'h3',
    text: 'Help people become familiar with the organization and its offerings, creating a sense of connection and trust.',
    link: '/',
    linkLabel: 'Learn more',
    linkVariant: 'Link',
  },
};

export const CenterAligned: Story = {
  args: {
    image: {
      src: 'https://placehold.co/800x600',
      alt: 'Example image placeholder',
      width: 800,
      height: 600,
    },
    layout: 'Center aligned',
    heading: 'Feature or benefit',
    headingElement: 'h3',
    text: 'Help people become familiar with the organization and its offerings, creating a sense of connection and trust.',
    link: '/',
    linkLabel: 'Learn more',
    linkVariant: 'Solid',
  },
};

export const RightAligned: Story = {
  args: {
    image: {
      src: 'https://placehold.co/800x600',
      alt: 'Example image placeholder',
      width: 800,
      height: 600,
    },
    layout: 'Right aligned',
    heading: 'Feature or benefit',
    headingElement: 'h3',
    text: 'Help people become familiar with the organization and its offerings, creating a sense of connection and trust.',
    link: '/',
    linkLabel: 'Learn more',
    linkVariant: 'Link Underline',
  },
};

export const LightText: Story = {
  args: {
    image: {
      src: 'https://placehold.co/800x600',
      alt: 'Example image placeholder',
      width: 800,
      height: 600,
    },
    layout: 'Left aligned',
    textColor: 'Light',
    heading: 'Light colored text',
    headingElement: 'h3',
    text: 'This card uses light colored text, suitable for dark backgrounds.',
  },
};
