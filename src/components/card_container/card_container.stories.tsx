import React from 'react';
import Card from '@/components/card';
import CardContainer from '@/components/card_container';
import { tables } from '@/stories/argtypes';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Layout/Card Container',
  component: CardContainer,
  parameters: {
    docs: {
      description: {
        component:
          'Section wrapper that pairs an optional heading block with a configurable multi-column grid. Its `content` slot holds the child components (typically Cards), which are laid out across the columns defined by the chosen layout.',
      },
    },
  },
  argTypes: {
    preHeading: {
      control: 'text',
      description: 'Small text displayed above the heading.',
      table: tables.CANVAS,
    },
    heading: {
      control: 'text',
      description: 'Section heading text.',
      table: tables.CANVAS,
    },
    headingLevel: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      description: 'HTML heading element used to render the heading.',
      table: tables.CANVAS,
    },
    headingSize: {
      control: 'select',
      options: ['Extra Large', 'Large', 'Medium', 'Small'],
      description: 'Size preset for the heading.',
      table: tables.CANVAS,
    },
    headingPosition: {
      control: 'select',
      options: ['Left aligned', 'Center aligned', 'Right aligned'],
      description: 'Horizontal alignment of the heading block.',
      table: tables.CANVAS,
    },
    textColor: {
      control: 'select',
      options: ['Dark', 'Light'],
      description: 'Color theme for the heading text.',
      table: tables.CANVAS,
    },
    layout: {
      control: 'select',
      options: ['50-50', '33-33-33', '50-25-25', '25-25-50', '25-25-25-25'],
      description: 'Grid column ratio layout for the card columns.',
      table: tables.CANVAS,
    },
    content: {
      control: false,
      description: 'Slot for the card column children (typically Cards).',
      table: tables.SLOT,
    },
    className: {
      control: 'text',
      description: 'Extra CSS classes appended to the outer element.',
      table: tables.INTERNAL,
    },
  },
} satisfies Meta<typeof CardContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThreeColumns: Story = {
  args: {
    preHeading: 'Featured services',
    heading: 'What we offer.',
    headingSize: 'Large',
    textColor: 'Dark',
    headingPosition: 'Center aligned',
    headingLevel: 'h2',
    layout: '33-33-33',
    content: (
      <>
        <Card
          heading="Feature or benefit"
          headingElement="h3"
          image={{
            alt: 'Example image placeholder',
            height: 300,
            src: 'https://placehold.co/300',
            width: 300,
          }}
          layout="Left aligned"
          link="/"
          linkLabel="Learn more"
          linkVariant="Link"
          text="Help people become familiar with the organization and its offerings, creating a sense of connection and trust."
        />
        <Card
          heading="Feature or benefit"
          headingElement="h3"
          image={{
            alt: 'Example image placeholder',
            height: 300,
            src: 'https://placehold.co/300',
            width: 300,
          }}
          layout="Left aligned"
          link="/"
          linkLabel="Learn more"
          linkVariant="Link"
          text="Help people become familiar with the organization and its offerings, creating a sense of connection and trust."
        />
        <Card
          heading="Feature or benefit"
          headingElement="h3"
          image={{
            alt: 'Example image placeholder',
            height: 300,
            src: 'https://placehold.co/300',
            width: 300,
          }}
          layout="Left aligned"
          link="/"
          linkLabel="Learn more"
          linkVariant="Link"
          text="Help people become familiar with the organization and its offerings, creating a sense of connection and trust."
        />
      </>
    ),
  },
};

export const TwoColumns: Story = {
  args: {
    preHeading: 'Our services',
    heading: 'How we can help.',
    headingSize: 'Large',
    textColor: 'Dark',
    headingPosition: 'Left aligned',
    headingLevel: 'h2',
    layout: '50-50',
    content: (
      <>
        <Card
          heading="Feature or benefit"
          headingElement="h3"
          image={{
            alt: 'Example image placeholder',
            height: 500,
            src: 'https://placehold.co/500',
            width: 500,
          }}
          layout="Left aligned"
          link="/"
          linkLabel="Learn more"
          linkVariant="Link"
          text="Help people become familiar with the organization and its offerings, creating a sense of connection and trust."
        />
        <Card
          heading="Feature or benefit"
          headingElement="h3"
          image={{
            alt: 'Example image placeholder',
            height: 500,
            src: 'https://placehold.co/500',
            width: 500,
          }}
          layout="Left aligned"
          link="/"
          linkLabel="Learn more"
          linkVariant="Link"
          text="Help people become familiar with the organization and its offerings, creating a sense of connection and trust."
        />
      </>
    ),
  },
};

export const FourColumns: Story = {
  args: {
    preHeading: 'Partners',
    heading: 'Trusted by industry leaders.',
    headingSize: 'Medium',
    textColor: 'Dark',
    headingPosition: 'Center aligned',
    headingLevel: 'h2',
    layout: '25-25-25-25',
    content: (
      <>
        <Card
          heading="Feature"
          headingElement="h3"
          image={{
            alt: 'Example image placeholder',
            height: 300,
            src: 'https://placehold.co/300',
            width: 300,
          }}
          layout="Left aligned"
          text="Brief description here."
        />
        <Card
          heading="Feature"
          headingElement="h3"
          image={{
            alt: 'Example image placeholder',
            height: 300,
            src: 'https://placehold.co/300',
            width: 300,
          }}
          layout="Left aligned"
          text="Brief description here."
        />
        <Card
          heading="Feature"
          headingElement="h3"
          image={{
            alt: 'Example image placeholder',
            height: 300,
            src: 'https://placehold.co/300',
            width: 300,
          }}
          layout="Left aligned"
          text="Brief description here."
        />
        <Card
          heading="Feature"
          headingElement="h3"
          image={{
            alt: 'Example image placeholder',
            height: 300,
            src: 'https://placehold.co/300',
            width: 300,
          }}
          layout="Left aligned"
          text="Brief description here."
        />
      </>
    ),
  },
};

export const Light: Story = {
  args: {
    preHeading: 'Featured services',
    heading: 'What we offer.',
    headingSize: 'Large',
    textColor: 'Light',
    headingPosition: 'Center aligned',
    headingLevel: 'h2',
    layout: '33-33-33',
    content: (
      <>
        <Card
          heading="Feature or benefit"
          headingElement="h3"
          image={{
            alt: 'Example image placeholder',
            height: 300,
            src: 'https://placehold.co/300',
            width: 300,
          }}
          layout="Left aligned"
          link="/"
          linkLabel="Learn more"
          linkVariant="Link"
          text="Help people become familiar with the organization."
        />
        <Card
          heading="Feature or benefit"
          headingElement="h3"
          image={{
            alt: 'Example image placeholder',
            height: 300,
            src: 'https://placehold.co/300',
            width: 300,
          }}
          layout="Left aligned"
          link="/"
          linkLabel="Learn more"
          linkVariant="Link"
          text="Help people become familiar with the organization."
        />
        <Card
          heading="Feature or benefit"
          headingElement="h3"
          image={{
            alt: 'Example image placeholder',
            height: 300,
            src: 'https://placehold.co/300',
            width: 300,
          }}
          layout="Left aligned"
          link="/"
          linkLabel="Learn more"
          linkVariant="Link"
          text="Help people become familiar with the organization."
        />
      </>
    ),
  },
};
