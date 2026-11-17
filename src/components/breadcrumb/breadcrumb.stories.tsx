import Breadcrumb from '@/components/breadcrumb';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Header/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    docs: {
      description: {
        component:
          'Navigation breadcrumb trail for the current page. It takes no props: the trail is read from the current page data via `getPageData()`. The final item renders as plain text (the current page) while all preceding items render as links.',
      },
    },
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HomePage: Story = {
  decorators: [
    (Story) => {
      window.drupalSettings.canvasData.v0.breadcrumbs = [
        { key: '<front>', text: 'Home' },
      ];
      return <Story />;
    },
  ],
};
