import Button from '@/components/button';
import Card from '@/components/card';
import CardContainer from '@/components/card_container';
import Heading from '@/components/heading';
import Hero from '@/components/hero';
import Section from '@/components/section';
import Spacer from '@/components/spacer';
import TwoColumnText from '@/components/two_column_text';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { PageLayout } from '../layouts/PageLayout.stories';

const meta = {
  title: 'Example pages/Home',
  tags: ['!autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Home: Story = {
  render: () => (
    <PageLayout>
      {/* Hero Section */}
      <Hero
        backgroundImage={{
          src: 'https://placehold.co/1920x800',
          alt: 'Hero background',
          width: 1920,
          height: 800,
        }}
        layout="Centered"
        headingElement="h1"
        headingSize="Large"
        heading="Welcome to Our Site"
        text="A brief introduction to your organization and what makes you unique. Capture your visitors' attention with compelling copy."
        textColor="Light"
        buttons={
          <>
            <Button text="Get Started" />
            <Button text="Learn More" variant="Outline Light" />
          </>
        }
      />

      <Spacer height="Large" />

      {/* Features Section */}
      <Section
        width="Wide"
        content={
          <CardContainer
            preHeading="What We Offer"
            heading="Our Services"
            headingSize="Large"
            textColor="Dark"
            headingPosition="Center aligned"
            headingLevel="h2"
            layout="33-33-33"
            content={
              <>
                <Card
                  image={{
                    src: 'https://placehold.co/400x300',
                    alt: 'Service 1',
                    width: 400,
                    height: 300,
                  }}
                  heading="Service One"
                  headingElement="h3"
                  layout="Center aligned"
                  text="A brief description of the first service or feature you offer."
                  link="/"
                  linkLabel="Learn more"
                  linkVariant="Link"
                />
                <Card
                  image={{
                    src: 'https://placehold.co/400x300',
                    alt: 'Service 2',
                    width: 400,
                    height: 300,
                  }}
                  heading="Service Two"
                  headingElement="h3"
                  layout="Center aligned"
                  text="A brief description of the second service or feature you offer."
                  link="/"
                  linkLabel="Learn more"
                  linkVariant="Link"
                />
                <Card
                  image={{
                    src: 'https://placehold.co/400x300',
                    alt: 'Service 3',
                    width: 400,
                    height: 300,
                  }}
                  heading="Service Three"
                  headingElement="h3"
                  layout="Center aligned"
                  text="A brief description of the third service or feature you offer."
                  link="/"
                  linkLabel="Learn more"
                  linkVariant="Link"
                />
              </>
            }
          />
        }
      />

      <Spacer height="Large" />

      {/* About Section */}
      <TwoColumnText
        layout="Left aligned"
        image={{
          src: 'https://placehold.co/800x600',
          alt: 'About us',
          width: 800,
          height: 600,
        }}
        preHeading="About Us"
        heading="Our Story"
        headingElement="h2"
        headingSize="Large"
        text="Share your organization's history, mission, or values. This is an opportunity to connect with visitors and build trust."
        textColor="Dark"
        buttons={<Button text="Read More" variant="Outline Dark" />}
      />

      <Spacer height="Large" />

      {/* News/Updates Section */}
      <Section
        width="Wide"
        content={
          <>
            <Heading
              heading="Latest Updates"
              headingSize="Large"
              layout="Center aligned"
              headingElement="h2"
              textColor="Dark"
            />
            <Spacer height="Medium" />
            <CardContainer
              layout="50-50"
              content={
                <>
                  <Card
                    image={{
                      src: 'https://placehold.co/600x400',
                      alt: 'News 1',
                      width: 600,
                      height: 400,
                    }}
                    heading="Recent News Title"
                    headingElement="h3"
                    layout="Left aligned"
                    text="A brief preview of recent news or an update from your organization."
                    link="/"
                    linkLabel="Read More"
                    linkVariant="Link"
                  />
                  <Card
                    image={{
                      src: 'https://placehold.co/600x400',
                      alt: 'News 2',
                      width: 600,
                      height: 400,
                    }}
                    heading="Another Update"
                    headingElement="h3"
                    layout="Left aligned"
                    text="Another brief preview of news or updates from your organization."
                    link="/"
                    linkLabel="Read More"
                    linkVariant="Link"
                  />
                </>
              }
            />
          </>
        }
      />

      <Spacer height="Extra Large" />
    </PageLayout>
  ),
};
