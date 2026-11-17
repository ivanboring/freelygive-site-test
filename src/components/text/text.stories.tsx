import Text from '@/components/text';
import { tables } from '@/stories/argtypes';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Text',
  component: Text,
  parameters: {
    docs: {
      description: {
        component:
          'Renders a block of rich HTML text with configurable font size, color theme, and optional shadow. The HTML markup is output via the FormattedText component.',
      },
    },
  },
  argTypes: {
    text: {
      control: 'text',
      description: 'Rich text body content; supports inline HTML markup.',
      table: tables.CANVAS,
    },
    textSize: {
      control: 'select',
      options: [
        'Extra Small',
        'Small',
        'Normal',
        'Large',
        'Extra Large',
        'Lead',
      ],
      description:
        'Font size preset applied to the text. Lead is a larger, light-weight intro size with relaxed line height.',
      table: tables.CANVAS,
    },
    textColor: {
      control: 'select',
      options: ['Dark', 'Light'],
      description:
        'Colour theme for the text, for use on light or dark backgrounds.',
      table: tables.CANVAS,
    },
    spacing: {
      control: 'select',
      options: ['normal', 'none'],
      description:
        'Vertical margin around the text. None lines its top up with a heading beside it.',
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
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    text: 'Enter some text...',
    textSize: 'Normal',
    textColor: 'Dark',
  },
};

export const ExtraSmall: Story = {
  args: {
    text: 'Extra small text for captions and fine print.',
    textSize: 'Extra Small',
    textColor: 'Dark',
  },
};

export const Small: Story = {
  args: {
    text: 'Small text for secondary content and metadata.',
    textSize: 'Small',
    textColor: 'Dark',
  },
};

export const Large: Story = {
  args: {
    text: 'Large text for introductions and lead paragraphs.',
    textSize: 'Large',
    textColor: 'Dark',
  },
};

export const ExtraLarge: Story = {
  args: {
    text: 'Extra large text for prominent statements.',
    textSize: 'Extra Large',
    textColor: 'Dark',
  },
};

export const Light: Story = {
  args: {
    text: 'Light colored text for dark backgrounds.',
    textSize: 'Normal',
    textColor: 'Light',
  },
};

export const WithHTML: Story = {
  args: {
    text: '<p>This text contains <strong>bold</strong> and <em>italic</em> formatting, as well as <a href="#">links</a>.</p>',
    textSize: 'Normal',
    textColor: 'Dark',
  },
};

export const WithTextShadow: Story = {
  args: {
    text: 'Text with shadow effect for improved readability over busy backgrounds.',
    textSize: 'Large',
    textColor: 'Light',
    textShadow: 'Medium',
  },
};

export const Lead: Story = {
  args: {
    text: '<p>We’re a team of Drupal Specialists, C# developers &amp; AI enthusiasts.<br>Delivering rapid user-focused solutions with a heart 💖<br>Adding AI to the mix to make all the difference.</p>',
    textSize: 'Lead',
    textColor: 'Light',
  },
  globals: { backgrounds: { value: 'dark' } },
};
