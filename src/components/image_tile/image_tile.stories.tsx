import GridContainer from '@/components/grid_container';
import ImageTile from '@/components/image_tile';
import { tables } from '@/stories/argtypes';
import { tileAi, tileTalks, tileWork } from '@/stories/assets/freelygive';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Image Tile',
  component: ImageTile,
  parameters: {
    docs: {
      description: {
        component:
          'Rounded photo tile that links to another page, with its title on a translucent dark band across the bottom, underlined by a hand-drawn stroke. The photo is decorative; the title names the link. Arrange several in a Grid Container.',
      },
    },
  },
  argTypes: {
    image: {
      control: 'object',
      description: 'Background photo (cropped to fill the tile).',
      table: tables.CANVAS,
    },
    title: {
      control: 'text',
      description: 'Title on the tile, also the link text.',
      table: tables.CANVAS,
    },
    link: {
      control: 'text',
      description: 'Destination URL.',
      table: tables.CANVAS,
    },
  },
} satisfies Meta<typeof ImageTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    image: tileTalks,
    title: 'Talks',
    link: '/blog',
  },
  globals: { backgrounds: { value: 'dark' } },
};

export const SpreadWrapRow: Story = {
  args: {
    image: tileTalks,
    title: 'Talks',
    link: '/blog',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Three tiles in a Grid Container with the "Spread wrap" layout: one row spread across the width on wide screens, two abreast (the last centred) on phones.',
      },
    },
  },
  globals: { backgrounds: { value: 'dark' } },
  render: () => (
    <GridContainer
      layout="Spread wrap"
      gap="Medium"
      flushEdges
      content={
        <>
          <ImageTile
            image={tileAi}
            title="AI"
            link="/artificial-intelligence"
          />
          <ImageTile image={tileTalks} title="Talks" link="/blog" />
          <ImageTile image={tileWork} title="Work" link="/services" />
        </>
      }
    />
  ),
};
