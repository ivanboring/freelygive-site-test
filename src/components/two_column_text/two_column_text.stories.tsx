import React from 'react';
import Button from '@/components/button';
import TwoColumnText from '@/components/two_column_text';
import { tables } from '@/stories/argtypes';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Two Column Text',
  component: TwoColumnText,
  parameters: {
    docs: {
      description: {
        component:
          'A two-column section pairing a text column (pre-heading, heading, body text, and a buttons slot) with an optional side image. The columns can be left-aligned side by side or stacked and centred.',
      },
    },
  },
  argTypes: {
    layout: {
      control: 'select',
      options: ['Left aligned', 'Centered'],
      description:
        'Arrangement of the columns: left-aligned side by side or stacked and centred.',
      table: tables.CANVAS,
    },
    preHeading: {
      control: 'text',
      description: 'Small text displayed above the main heading.',
      table: tables.CANVAS,
    },
    heading: {
      control: 'text',
      description: 'Main heading text.',
      table: tables.CANVAS,
    },
    headingElement: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      description: 'HTML heading element (h1–h6) rendered for the heading.',
      table: tables.CANVAS,
    },
    headingSize: {
      control: 'select',
      options: ['Extra Large', 'Large', 'Medium', 'Small'],
      description:
        'Visual size preset for the heading, independent of its HTML element.',
      table: tables.CANVAS,
    },
    text: {
      control: 'text',
      description: 'Body text content; supports inline HTML markup.',
      table: tables.CANVAS,
    },
    textColor: {
      control: 'select',
      options: ['Dark', 'Light'],
      description:
        'Colour theme for the heading and body text, for use on light or dark backgrounds.',
      table: tables.CANVAS,
    },
    image: {
      control: 'object',
      description: 'Side image with src, alt, width, and height.',
      table: tables.CANVAS,
    },
    buttons: {
      control: false,
      description: 'Call-to-action buttons dropped into the slot.',
      table: tables.SLOT,
    },
    rightColumn: {
      control: false,
      description: 'JSX-composition node rendered in the right column.',
      table: tables.INTERNAL,
    },
    textShadow: {
      control: 'select',
      options: ['Light', 'Medium', 'Heavy'],
      description: 'Text shadow intensity.',
      table: tables.INTERNAL,
    },
  },
} satisfies Meta<typeof TwoColumnText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LeftAligned: Story = {
  args: {
    layout: 'Left aligned',
    preHeading: 'Mission',
    heading: 'This space deserves a hero.',
    headingElement: 'h2',
    headingSize: 'Large',
    text: 'This is a space to welcome visitors to the site. Grab their attention with copy that clearly states what the site is about.',
    textColor: 'Dark',
    image: {
      src: 'https://placehold.co/800x600',
      alt: 'Featured image',
      width: 800,
      height: 600,
    },
    buttons: (
      <>
        <Button text="Get Started" />
        <Button text="Learn More" variant="Outline Dark" />
      </>
    ),
  },
};

export const Centered: Story = {
  args: {
    layout: 'Centered',
    preHeading: 'About Us',
    heading: 'Our Story',
    headingElement: 'h2',
    headingSize: 'Large',
    text: 'Learn about our journey and what drives us to deliver exceptional results for our clients.',
    textColor: 'Dark',
    buttons: <Button text="Read More" />,
  },
};

export const WithImage: Story = {
  args: {
    layout: 'Left aligned',
    preHeading: 'Features',
    heading: 'What we offer',
    headingElement: 'h2',
    headingSize: 'Large',
    text: 'Discover our comprehensive suite of services designed to help your business grow and succeed.',
    textColor: 'Dark',
    image: {
      src: 'https://placehold.co/800x600',
      alt: 'Features illustration',
      width: 800,
      height: 600,
    },
    buttons: <Button text="Explore Features" />,
  },
};

export const Light: Story = {
  args: {
    layout: 'Left aligned',
    preHeading: 'Welcome',
    heading: 'Light theme content',
    headingElement: 'h2',
    headingSize: 'Large',
    text: 'This variation uses light text colors suitable for dark backgrounds.',
    textColor: 'Light',
    buttons: <Button text="Learn More" variant="Outline Light" />,
  },
};

export const WithTextShadow: Story = {
  args: {
    layout: 'Left aligned',
    preHeading: 'Featured',
    heading: 'Text with shadow effect',
    headingElement: 'h2',
    headingSize: 'Large',
    text: 'This variation applies a text shadow for improved readability over busy backgrounds.',
    textColor: 'Light',
    textShadow: 'Medium',
    image: {
      src: 'https://placehold.co/800x600/333333/333333',
      alt: 'Dark background image',
      width: 800,
      height: 600,
    },
    buttons: <Button text="Get Started" variant="Outline Light" />,
  },
};
