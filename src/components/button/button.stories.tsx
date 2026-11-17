import Button from '@/components/button';
import { tables } from '@/stories/argtypes';
import { iconEmail, iconPhone } from '@/stories/assets/freelygive';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          'Link-styled button rendered as an anchor tag, so it always navigates to a URL rather than submitting a form. Offers a range of visual variants, from solid and outline buttons through to plain and underlined text links.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'Solid',
        'Outline Dark',
        'Outline Light',
        'Ghost',
        'Ghost Neutral',
        'Ghost Light',
        'Link',
        'Link Underline',
        'Link Dark',
        'Link Light',
        'Link Accent',
        'Link Muted',
        'Nav Link Dark',
      ],
      description: 'Visual style variant for the button.',
      table: tables.CANVAS,
    },
    text: {
      control: 'text',
      description: 'Button label text.',
      table: tables.CANVAS,
    },
    link: {
      control: 'text',
      description: 'Destination URL the button navigates to.',
      table: tables.CANVAS,
    },
    icon: {
      control: 'object',
      description:
        'Small decorative image shown before the label (the label provides the accessible name).',
      table: tables.CANVAS,
    },
    children: {
      control: false,
      description: 'React nodes rendered inside the component.',
      table: tables.INTERNAL,
    },
    className: {
      control: 'text',
      description: 'Extra CSS classes appended to the outer element.',
      table: tables.INTERNAL,
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Solid: Story = {
  args: {
    text: 'Button',
    variant: 'Solid',
    link: '#',
  },
};

export const OutlineDark: Story = {
  args: {
    text: 'Button',
    variant: 'Outline Dark',
    link: '#',
  },
};

export const OutlineLight: Story = {
  args: {
    text: 'Button',
    variant: 'Outline Light',
    link: '#',
  },
};

export const Ghost: Story = {
  args: {
    text: 'Button',
    variant: 'Ghost',
    link: '#',
  },
};

export const GhostNeutral: Story = {
  args: {
    text: 'Button',
    variant: 'Ghost Neutral',
    link: '#',
  },
};

export const GhostLight: Story = {
  args: {
    text: 'Button',
    variant: 'Ghost Light',
    link: '#',
  },
};

export const Link: Story = {
  args: {
    text: 'Button',
    variant: 'Link',
    link: '#',
  },
};

export const LinkUnderline: Story = {
  args: {
    text: 'Button',
    variant: 'Link Underline',
    link: '#',
  },
};

export const LinkDark: Story = {
  args: {
    text: 'Button',
    variant: 'Link Dark',
    link: '#',
  },
};

export const LinkLight: Story = {
  args: {
    text: 'Button',
    variant: 'Link Light',
    link: '#',
  },
};

export const NavLinkDark: Story = {
  args: {
    text: 'Button',
    variant: 'Nav Link Dark',
    link: '#',
  },
};

export const LinkAccentWithIcon: Story = {
  args: {
    variant: 'Link Accent',
    text: '+44 2039207023',
    link: 'tel:+44%202039207023',
    icon: iconPhone,
  },
  globals: { backgrounds: { value: 'dark' } },
};

export const LinkAccentEmail: Story = {
  args: {
    variant: 'Link Accent',
    text: 'hello@freelygive.io',
    link: 'mailto:hello@freelygive.io',
    icon: iconEmail,
  },
  globals: { backgrounds: { value: 'dark' } },
};

export const LinkMuted: Story = {
  args: {
    variant: 'Link Muted',
    text: 'Privacy Policy',
    link: '/privacy-policy',
  },
  globals: { backgrounds: { value: 'dark' } },
};
