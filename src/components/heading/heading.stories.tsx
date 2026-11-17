import Heading from '@/components/heading';
import { tables } from '@/stories/argtypes';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Heading',
  component: Heading,
  parameters: {
    docs: {
      description: {
        component:
          'Renders a heading with an optional pre-heading label above it. The rendered HTML element, visual size, alignment, and light/dark color theme are all configurable independently.',
      },
    },
  },
  argTypes: {
    preHeading: {
      control: 'text',
      description: 'Optional smaller label shown above the main heading.',
      table: tables.CANVAS,
    },
    heading: {
      control: 'text',
      description: 'Main heading text.',
      table: tables.CANVAS,
    },
    textColor: {
      control: 'select',
      options: ['Dark', 'Light', 'Accent'],
      description:
        'Text colour: dark, light, or the brand accent (yellow) for use on navy backgrounds.',
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
      options: ['Small', 'Medium', 'Large', 'Lead', 'Extra Large', 'Display'],
      description:
        'Visual size of the heading, independent of its element. Lead and Display are responsive brand sizes for intro and section headings.',
      table: tables.CANVAS,
    },
    headingWeight: {
      control: 'select',
      options: ['bold', 'regular'],
      description: 'Font weight of the heading text.',
      table: tables.CANVAS,
    },
    layout: {
      control: 'select',
      options: ['Left aligned', 'Center aligned', 'Right aligned'],
      description: 'Horizontal alignment of the text.',
      table: tables.CANVAS,
    },
    textShadow: {
      control: 'select',
      options: ['Light', 'Medium', 'Heavy'],
      description: 'Text shadow intensity.',
      table: tables.INTERNAL,
    },
    className: {
      control: 'text',
      description: 'Extra CSS classes appended to the outer element.',
      table: tables.INTERNAL,
    },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ExtraLarge: Story = {
  args: {
    preHeading: 'Welcome',
    heading: 'Enter a heading...',
    textColor: 'Dark',
    headingElement: 'h1',
    headingSize: 'Extra Large',
    layout: 'Left aligned',
  },
};

export const Large: Story = {
  args: {
    preHeading: 'About Us',
    heading: 'Our Mission',
    textColor: 'Dark',
    headingElement: 'h2',
    headingSize: 'Large',
    layout: 'Left aligned',
  },
};

export const Medium: Story = {
  args: {
    heading: 'Section Title',
    textColor: 'Dark',
    headingElement: 'h3',
    headingSize: 'Medium',
    layout: 'Left aligned',
  },
};

export const Small: Story = {
  args: {
    heading: 'Subsection',
    textColor: 'Dark',
    headingElement: 'h4',
    headingSize: 'Small',
    layout: 'Left aligned',
  },
};

export const Centered: Story = {
  args: {
    preHeading: 'Featured',
    heading: 'Center Aligned Heading',
    textColor: 'Dark',
    headingElement: 'h2',
    headingSize: 'Large',
    layout: 'Center aligned',
  },
};

export const RightAligned: Story = {
  args: {
    preHeading: 'Section',
    heading: 'Right Aligned Heading',
    textColor: 'Dark',
    headingElement: 'h2',
    headingSize: 'Large',
    layout: 'Right aligned',
  },
};

export const Light: Story = {
  args: {
    preHeading: 'Welcome',
    heading: 'Light Theme Heading',
    textColor: 'Light',
    headingElement: 'h1',
    headingSize: 'Extra Large',
    layout: 'Left aligned',
  },
};

export const WithTextShadow: Story = {
  args: {
    preHeading: 'Featured',
    heading: 'Heading with Shadow',
    textColor: 'Light',
    headingElement: 'h1',
    headingSize: 'Extra Large',
    layout: 'Left aligned',
    textShadow: 'Medium',
  },
};

export const AccentDisplay: Story = {
  args: {
    heading: 'Improving your CRM with Artificial Intelligence',
    textColor: 'Accent',
    headingElement: 'h2',
    headingSize: 'Display',
    headingWeight: 'bold',
    layout: 'Center aligned',
  },
  globals: { backgrounds: { value: 'dark' } },
};

export const AccentLead: Story = {
  args: {
    heading: 'Full Stack CRM with AI solutions that your users will love',
    textColor: 'Accent',
    headingElement: 'h1',
    headingSize: 'Lead',
    headingWeight: 'regular',
    layout: 'Left aligned',
  },
  globals: { backgrounds: { value: 'dark' } },
};
