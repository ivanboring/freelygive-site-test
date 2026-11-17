import Logo from '@/components/logo';
import { tables } from '@/stories/argtypes';
import { logoWordmark } from '@/stories/assets/freelygive';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Assets/Logo',
  component: Logo,
  parameters: {
    docs: {
      description: {
        component:
          'Site branding logo that renders an inline SVG mark (or an uploaded logo image) wrapped in a link to the home page, with the site name exposed for accessibility. The home URL and site name are read from getSiteData().branding.',
      },
    },
  },
  argTypes: {
    image: {
      control: 'object',
      description:
        'Optional logo image that replaces the built-in SVG mark. Its alt text names the link.',
      table: tables.CANVAS,
    },
  },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OnDarkBackground: Story = {
  decorators: [
    (Story) => (
      <div className="bg-gray-800 p-8">
        <Story />
      </div>
    ),
  ],
};

export const WithImage: Story = {
  args: {
    image: logoWordmark,
  },
  globals: { backgrounds: { value: 'dark' } },
};
