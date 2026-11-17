import LogoCard from '@/components/logo_card';
import { tables } from '@/stories/argtypes';
import {
  badgeCyberEssentials,
  clientEnders,
  iconYoutube,
} from '@/stories/assets/freelygive';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Logo Card',
  component: LogoCard,
  parameters: {
    docs: {
      description: {
        component:
          'Displays a brand logo image contained within a rounded card on a neutral background. The logo is rendered with the Canvas responsive image renderer and scaled to fit the card.',
      },
    },
  },
  argTypes: {
    image: {
      control: 'object',
      description:
        'Logo image object providing the source URL, alt text, and intrinsic width and height.',
      table: tables.CANVAS,
    },
    link: {
      control: 'text',
      description: 'Optional destination URL; the whole logo becomes a link.',
      table: tables.CANVAS,
    },
    openInNewTab: {
      control: 'boolean',
      description:
        'Open the link in a new tab (adds an "opens in a new tab" cue for screen readers).',
      table: tables.CANVAS,
    },
    variant: {
      control: 'select',
      options: ['card', 'plain'],
      description: 'Presentation: a neutral rounded card, or the bare logo.',
      table: tables.CANVAS,
    },
    size: {
      control: 'select',
      options: ['icon', 'x_small', 'small', 'medium', 'large'],
      description: 'Display size of a plain logo.',
      table: tables.CANVAS,
    },
    trimWhitespace: {
      control: 'boolean',
      description:
        'Crop away the transparent margin around a plain logo (centred 600:264 band).',
      table: tables.CANVAS,
    },
  },
} satisfies Meta<typeof LogoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    image: {
      src: 'https://placehold.co/200x80?text=Logo',
      alt: 'Partner logo',
      width: 200,
      height: 80,
    },
  },
};

export const PlainTrimmedLink: Story = {
  args: {
    image: clientEnders,
    link: '/work/enders-analysis-sugarcrm-migration-to-drupal-crm',
    variant: 'plain',
    size: 'large',
    trimWhitespace: true,
  },
  globals: { backgrounds: { value: 'dark' } },
};

export const PlainBadgeNewTab: Story = {
  args: {
    image: badgeCyberEssentials,
    link: 'https://registry.blockmarktech.com/certificates/f64a0e05-153d-435c-92e4-13122c1b6f8b/?source=WEB',
    openInNewTab: true,
    variant: 'plain',
    size: 'x_small',
  },
  globals: { backgrounds: { value: 'dark' } },
};

export const PlainIcon: Story = {
  args: {
    image: iconYoutube,
    link: 'https://www.youtube.com/@FreelyGive',
    variant: 'plain',
    size: 'icon',
  },
  globals: { backgrounds: { value: 'dark' } },
};
