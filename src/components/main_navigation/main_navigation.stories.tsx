import MainNavigation from '@/components/main_navigation';
import { tables } from '@/stories/argtypes';
import { navLinks } from '@/stories/shared/freelygive';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Header/Main Navigation',
  component: MainNavigation,
  parameters: {
    docs: {
      description: {
        component:
          "Site's main menu, rendered as a horizontal list of links on desktop and either a toggleable drawer or a full-screen overlay on mobile. Links come from `nav_link` children in the `links` slot; when that slot is empty, menu items are fetched from the Drupal main menu via the JSON:API client and SWR.",
      },
    },
  },
  argTypes: {
    colorScheme: {
      control: 'select',
      options: ['light', 'dark'],
      description:
        'Colour of the menu links on wide screens: dark links for a light header, or light links for a dark header.',
      table: tables.CANVAS,
    },
    mobileMenu: {
      control: 'select',
      options: ['dropdown', 'fullscreen'],
      description:
        'How the menu opens on small screens: a dropdown drawer, or a full-screen white overlay with large links (closes on Escape).',
      table: tables.CANVAS,
    },
    links: {
      control: false,
      description:
        'Optional `nav_link` children. When empty, the Drupal main menu is fetched instead.',
      table: tables.SLOT,
    },
  },
} satisfies Meta<typeof MainNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLinks: Story = {
  args: {
    links: navLinks,
  },
};

export const DarkFullscreen: Story = {
  args: {
    links: navLinks,
    colorScheme: 'dark',
    mobileMenu: 'fullscreen',
  },
  globals: { backgrounds: { value: 'dark' } },
};
