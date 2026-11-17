import React from 'react';
import Header from '@/components/header';
import Logo from '@/components/logo';
import Navigation from '@/components/main_navigation';
import { tables } from '@/stories/argtypes';
import { logoWordmark } from '@/stories/assets/freelygive';
import { navLinks } from '@/stories/shared/freelygive';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Header/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Site header that lays out a logo and navigation menu, with an optional search button that reveals a full-width search overlay. It tracks its own height via a ResizeObserver so the overlay can be positioned directly beneath the bar.',
      },
    },
  },
  argTypes: {
    displaySearchForm: {
      control: 'boolean',
      description: 'Whether to show the search button and its overlay.',
      table: tables.CANVAS,
    },
    skipLink: {
      control: 'boolean',
      description:
        'Add a "Skip to Content" link, visible on keyboard focus, that jumps past the header.',
      table: tables.CANVAS,
    },
    colorScheme: {
      control: 'select',
      options: ['light', 'dark'],
      description:
        'Colour scheme: the default light bar, or the dark navy brand bar (brand font, larger logo, right-aligned menu).',
      table: tables.CANVAS,
    },
    logo: {
      control: false,
      description: 'Slot for the logo displayed at the start of the header.',
      table: tables.SLOT,
    },
    menu: {
      control: false,
      description: 'Slot for the navigation menu.',
      table: tables.SLOT,
    },
    backgroundColor: {
      control: 'color',
      description: 'Background colour of the header bar.',
      table: tables.INTERNAL,
    },
    className: {
      control: 'text',
      description: 'Extra CSS classes appended to the outer element.',
      table: tables.INTERNAL,
    },
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    logo: <Logo />,
    menu: <Navigation />,
  },
};

export const WithSearch: Story = {
  args: {
    logo: <Logo />,
    menu: <Navigation />,
    displaySearchForm: true,
  },
};

export const CustomBackground: Story = {
  args: {
    logo: <Logo />,
    menu: <Navigation />,
    backgroundColor: '#f1f5f9',
  },
};

export const Dark: Story = {
  args: {
    colorScheme: 'dark',
    skipLink: true,
    logo: <Logo image={logoWordmark} />,
    menu: (
      <Navigation links={navLinks} colorScheme="dark" mobileMenu="fullscreen" />
    ),
  },
};
