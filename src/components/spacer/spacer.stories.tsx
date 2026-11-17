import React from 'react';
import Spacer from '@/components/spacer';
import { tables } from '@/stories/argtypes';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Layout/Spacer',
  component: Spacer,
  parameters: {
    docs: {
      description: {
        component:
          'Renders an empty vertical block that inserts blank space between components. The height is chosen from a set of named presets.',
      },
    },
  },
  argTypes: {
    height: {
      control: 'select',
      options: ['Small', 'Medium', 'Large', 'Extra Large'],
      description:
        'Vertical height of the empty space, chosen from named presets.',
      table: tables.CANVAS,
    },
  },
  decorators: [
    (Story) => (
      <SpacerDemo>
        <Story />
      </SpacerDemo>
    ),
  ],
} satisfies Meta<typeof Spacer>;

export default meta;
type Story = StoryObj<typeof meta>;

const SpacerDemo = ({ children }: { children: React.ReactNode }) => (
  <>
    <div
      style={{
        backgroundColor: '#e2e8f0',
        padding: '1rem',
        textAlign: 'center',
      }}
    >
      Content Above
    </div>
    {children}
    <div
      style={{
        backgroundColor: '#e2e8f0',
        padding: '1rem',
        textAlign: 'center',
      }}
    >
      Content Below
    </div>
  </>
);

export const Small: Story = {
  args: {
    height: 'Small',
  },
};

export const Medium: Story = {
  args: {
    height: 'Medium',
  },
};

export const Large: Story = {
  args: {
    height: 'Large',
  },
};

export const ExtraLarge: Story = {
  args: {
    height: 'Extra Large',
  },
};
