import Blockquote from '@/components/blockquote';
import { tables } from '@/stories/argtypes';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Blockquote',
  component: Blockquote,
  parameters: {
    docs: {
      description: {
        component:
          'Styled blockquote with a left accent bar and an optional attribution name and title displayed beneath the quote. The quote body accepts HTML and the whole block can be themed for dark or light backgrounds.',
      },
    },
  },
  argTypes: {
    text: {
      control: 'text',
      description: 'Rich text content of the quote (supports HTML).',
      table: tables.CANVAS,
    },
    textColor: {
      control: 'select',
      options: ['Dark', 'Light'],
      description:
        'Color theme applied to the quote, name, and title. Use "Light" on dark backgrounds.',
      table: tables.CANVAS,
    },
    name: {
      control: 'text',
      description: 'Attribution name displayed below the quote.',
      table: tables.CANVAS,
    },
    title: {
      control: 'text',
      description: 'Attribution title or role displayed below the name.',
      table: tables.CANVAS,
    },
    variant: {
      control: 'select',
      options: ['bar', 'centered'],
      description:
        'Layout: a left accent bar, or a large centred pull quote with a "— name, title —" attribution.',
      table: tables.CANVAS,
    },
    leadIn: {
      control: 'text',
      description:
        'Introductory line shown before a centred quote (left aligned on wide screens, with the quote offset to the right).',
      table: tables.CANVAS,
    },
  },
} satisfies Meta<typeof Blockquote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dark: Story = {
  args: {
    text: 'Insert a quote...',
    textColor: 'Dark',
    name: 'John Doe',
    title: 'CEO, Company Inc.',
  },
};

export const Light: Story = {
  args: {
    text: 'Insert a quote...',
    textColor: 'Light',
    name: 'Jane Smith',
    title: 'Director of Operations',
  },
};

export const CenteredWithLeadIn: Story = {
  args: {
    variant: 'centered',
    leadIn: 'When it comes to embeddings and vector search it’s simply…',
    text: '<p>“A way of capturing and scoring what something means”</p>',
    textColor: 'Light',
    name: 'James Abrahams',
    title: 'Director, FreelyGive',
  },
  globals: { backgrounds: { value: 'dark' } },
};

export const Centered: Story = {
  args: {
    variant: 'centered',
    text: '<p>“FreelyGive are an excellent partner – they not only deliver our requirements very efficiently and professionally, they also anticipate our needs and are pro-active in suggesting system improvements working both with us and our clients"</p>',
    textColor: 'Light',
    name: 'Lesley Stewart',
    title: 'previous Business Development Director, Journeycall Ltd.',
  },
  globals: { backgrounds: { value: 'dark' } },
};
