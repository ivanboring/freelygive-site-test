import NavLink from '@/components/nav_link';
import { tables } from '@/stories/argtypes';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Header/Nav Link',
  component: NavLink,
  parameters: {
    docs: {
      description: {
        component:
          'A single main-menu link, placed in the `links` slot of Main Navigation. Its colour and size are set by the parent menu, and it underlines itself when it points at the page being viewed.',
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Link label.',
      table: tables.CANVAS,
    },
    link: {
      control: 'text',
      description: 'Destination URL.',
      table: tables.CANVAS,
    },
  },
} satisfies Meta<typeof NavLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'About us',
    link: '/about',
  },
};
