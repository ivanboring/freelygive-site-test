import Heading from '@/components/heading';
import Section from '@/components/section';
import Text from '@/components/text';
import { tables } from '@/stories/argtypes';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Layout/Section',
  component: Section,
  parameters: {
    docs: {
      description: {
        component:
          'Layout wrapper that centers its slot content and constrains it to a chosen maximum width. Used to give page content consistent horizontal margins, with a narrower option for text, a wider option for grids and galleries, and a full page-width option. Choosing a colour scheme or a bottom edge turns it into a full-width coloured band (in the brand font) with its own vertical spacing and an optional curved or chevron bottom edge that flows into the next section.',
      },
    },
  },
  argTypes: {
    width: {
      control: 'select',
      options: ['Normal', 'Wide', 'Full'],
      description:
        'Maximum width of the centered content: Normal (max-w-2xl), Wide (max-w-4xl) or Full (page width, up to 1440px, with side gutters).',
      table: tables.CANVAS,
    },
    colorScheme: {
      control: 'select',
      options: ['none', 'navy', 'navy_dark'],
      description:
        'Background colour. Any option other than none renders a full-width band.',
      table: tables.CANVAS,
    },
    bottomEdge: {
      control: 'select',
      options: ['none', 'curve', 'chevron'],
      description: 'Shape cut into the bottom of the band (none is straight).',
      table: tables.CANVAS,
    },
    bottomEdgeColor: {
      control: 'select',
      options: ['navy', 'navy_dark', 'white'],
      description:
        'Colour below the bottom edge shape, normally the next section’s colour.',
      table: tables.CANVAS,
    },
    spacing: {
      control: 'select',
      options: ['none', 'small', 'medium', 'large'],
      description:
        'Vertical padding inside the band. Applies when a colour scheme or bottom edge is set.',
      table: tables.CANVAS,
    },
    content: {
      control: false,
      description: 'Slot content rendered inside the centered section.',
      table: tables.SLOT,
    },
  },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    width: 'Normal',
    content: (
      <>
        <Heading
          heading="Normal Width Section"
          headingElement="h2"
          headingSize="Medium"
        />
        <Text
          text="This section has a normal width container (max-w-2xl). It's suitable for text-heavy content like articles and blog posts."
          textSize="Normal"
          textColor="Dark"
        />
      </>
    ),
  },
};

export const Wide: Story = {
  args: {
    width: 'Wide',
    content: (
      <>
        <Heading
          heading="Wide Width Section"
          headingElement="h2"
          headingSize="Medium"
        />
        <Text
          text="This section has a wide width container (max-w-4xl). It's suitable for content that needs more horizontal space like grids and galleries."
          textSize="Normal"
          textColor="Dark"
        />
      </>
    ),
  },
};

export const NavyBandWithCurve: Story = {
  args: {
    width: 'Full',
    colorScheme: 'navy_dark',
    bottomEdge: 'curve',
    bottomEdgeColor: 'navy',
    spacing: 'medium',
    content: (
      <>
        <Heading
          heading="Full Stack CRM with AI solutions that your users will love"
          headingElement="h2"
          headingSize="Lead"
          headingWeight="regular"
          textColor="Accent"
        />
        <Text
          text="<p>We’re a team of Drupal Specialists, C# developers &amp; AI enthusiasts.</p>"
          textSize="Lead"
          textColor="Light"
        />
      </>
    ),
  },
};

export const NavyBandWithChevron: Story = {
  args: {
    width: 'Full',
    colorScheme: 'navy',
    bottomEdge: 'chevron',
    bottomEdgeColor: 'navy_dark',
    spacing: 'medium',
    content: (
      <Heading
        heading="Our Clients"
        headingElement="h2"
        headingSize="Display"
        textColor="Accent"
        layout="Center aligned"
      />
    ),
  },
};
