import Footer from '@/components/footer';
import { tables } from '@/stories/argtypes';
import { logoMonogram } from '@/stories/assets/freelygive';
import {
  footerBadges,
  footerContact,
  footerLinks,
  footerSocial,
} from '@/stories/shared/freelygive';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Footer/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Site footer. On its own it displays legal or copyright text in a bordered bar spanning the page width; with a logo, contact heading, or content in its slots (or the dark brand scheme) it lays out three columns: brand and legal links, contact and social links, and accreditation badges.',
      },
    },
  },
  argTypes: {
    text: {
      control: 'text',
      description: 'Legal or copyright text shown in the footer.',
      table: tables.CANVAS,
    },
    colorScheme: {
      control: 'select',
      options: ['light', 'dark'],
      description:
        'Colour scheme: the default light footer, or the dark navy brand footer.',
      table: tables.CANVAS,
    },
    logo: {
      control: 'object',
      description: 'Brand logo shown at the start of the footer.',
      table: tables.CANVAS,
    },
    contactHeading: {
      control: 'text',
      description: 'Heading shown above the contact links.',
      table: tables.CANVAS,
    },
    links: {
      control: false,
      description: 'Legal links (e.g. Button) shown under the footer text.',
      table: tables.SLOT,
    },
    contact: {
      control: false,
      description: 'Contact links, e.g. Buttons with an icon.',
      table: tables.SLOT,
    },
    social: {
      control: false,
      description: 'Social media icon links (e.g. plain Logo Cards).',
      table: tables.SLOT,
    },
    badges: {
      control: false,
      description: 'Accreditation badges and partner logos (e.g. Logo Cards).',
      table: tables.SLOT,
    },
  },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: '© 2024 Company Name. All rights reserved.',
  },
};

export const WithLinks: Story = {
  args: {
    text: '© 2024 Company Name. All rights reserved. | Privacy Policy | Terms of Service',
  },
};

export const Dark: Story = {
  args: {
    colorScheme: 'dark',
    logo: logoMonogram,
    text: '©  2026 FreelyGive Ltd',
    contactHeading: 'Happy to help',
    links: footerLinks,
    contact: footerContact,
    social: footerSocial,
    badges: footerBadges,
  },
};
