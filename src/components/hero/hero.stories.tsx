import React from 'react';
import Button from '@/components/button';
import Hero from '@/components/hero';
import { tables } from '@/stories/argtypes';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Hero',
  component: Hero,
  parameters: {
    docs: {
      description: {
        component:
          'Full-width hero section that renders a heading, pre-heading, body text, and call-to-action buttons over a background image. It composes TwoColumnText for its content and can dim the image for improved text contrast.',
      },
    },
  },
  argTypes: {
    backgroundImage: {
      control: 'object',
      description:
        'Background image (src, alt, width, height) covering the hero.',
      table: tables.CANVAS,
    },
    layout: {
      control: 'select',
      options: ['Left aligned', 'Centered'],
      description: 'Alignment of the hero content.',
      table: tables.CANVAS,
    },
    preHeading: {
      control: 'text',
      description: 'Optional smaller label shown above the heading.',
      table: tables.CANVAS,
    },
    headingElement: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      description: 'HTML heading element (h1–h6) to render.',
      table: tables.CANVAS,
    },
    headingSize: {
      control: 'select',
      options: ['Extra Large', 'Large', 'Medium', 'Small'],
      description: 'Visual size of the heading.',
      table: tables.CANVAS,
    },
    heading: {
      control: 'text',
      description: 'Main heading text.',
      table: tables.CANVAS,
    },
    text: {
      control: 'text',
      description: 'Hero body text (supports HTML).',
      table: tables.CANVAS,
    },
    textColor: {
      control: 'select',
      options: ['Dark', 'Light'],
      description: 'Light or dark color theme for the text.',
      table: tables.CANVAS,
    },
    darkenImage: {
      control: 'boolean',
      description:
        'Applies a brightness overlay to the background image for better text contrast.',
      table: tables.CANVAS,
    },
    buttons: {
      control: false,
      description: 'Slot for the call-to-action buttons.',
      table: tables.SLOT,
    },
  },
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LeftAligned: Story = {
  args: {
    backgroundImage: {
      src: 'https://placehold.co/1920x1080',
      alt: 'Hero background',
      width: 1920,
      height: 1080,
    },
    layout: 'Left aligned',
    preHeading: 'Mission',
    headingElement: 'h1',
    headingSize: 'Large',
    heading: 'This space deserves a hero.',
    text: 'This is a space to welcome visitors to the site. Grab their attention with copy that clearly states what the site is about.',
    textColor: 'Light',
    buttons: (
      <>
        <Button text="Get Started" />
        <Button text="Learn More" variant="Outline Light" />
      </>
    ),
  },
};

export const Centered: Story = {
  args: {
    backgroundImage: {
      src: 'https://placehold.co/1920x1080',
      alt: 'Hero background',
      width: 1920,
      height: 1080,
    },
    layout: 'Centered',
    preHeading: 'Welcome',
    headingElement: 'h1',
    headingSize: 'Large',
    heading: 'Centered Hero Layout',
    text: 'A centered hero layout works great for landing pages and promotional content.',
    textColor: 'Light',
    buttons: <Button text="Call to Action" />,
  },
};

export const DarkText: Story = {
  args: {
    backgroundImage: {
      src: 'https://placehold.co/1920x1080/f1f5f9/f1f5f9',
      alt: 'Light hero background',
      width: 1920,
      height: 1080,
    },
    layout: 'Left aligned',
    preHeading: 'About Us',
    headingElement: 'h1',
    headingSize: 'Large',
    heading: 'Dark Text on Light Background',
    text: 'Use dark text when you have a light background image.',
    textColor: 'Dark',
    buttons: <Button text="Learn More" />,
  },
};

export const WithDarkenedImage: Story = {
  args: {
    backgroundImage: {
      src: 'https://placehold.co/1920x1080',
      alt: 'Hero background with overlay',
      width: 1920,
      height: 1080,
    },
    layout: 'Centered',
    preHeading: 'Featured',
    headingElement: 'h1',
    headingSize: 'Large',
    heading: 'Darkened Background Image',
    text: 'The darken image option applies an overlay for better text contrast over busy images.',
    textColor: 'Light',
    darkenImage: true,
    buttons: (
      <>
        <Button text="Get Started" />
        <Button text="Learn More" variant="Outline Light" />
      </>
    ),
  },
};
