import Blockquote from '@/components/blockquote';
import Footer from '@/components/footer';
import GridContainer from '@/components/grid_container';
import Header from '@/components/header';
import Heading from '@/components/heading';
import ImageBlock from '@/components/image';
import ImageTile from '@/components/image_tile';
import Logo from '@/components/logo';
import LogoCard from '@/components/logo_card';
import MainNavigation from '@/components/main_navigation';
import Section from '@/components/section';
import Spacer from '@/components/spacer';
import Text from '@/components/text';
import VideoEmbed from '@/components/video_embed';
import {
  clientClinks,
  clientEnders,
  clientEsp,
  clientNcjaa,
  clientPeak,
  crmLaptop,
  crmPhone,
  logoMonogram,
  logoWordmark,
  tileAi,
  tileTalks,
  tileWork,
} from '@/stories/assets/freelygive';
import {
  footerBadges,
  footerContact,
  footerLinks,
  footerSocial,
  navLinks,
} from '@/stories/shared/freelygive';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * Like-for-like rebuild of the freelygive.io homepage. The page carries its
 * own header and footer, so it does not use the starter PageLayout.
 */
const meta = {
  title: 'Example pages/FreelyGive Home',
  tags: ['!autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const FreelyGiveHome: Story = {
  render: () => (
    <>
      <Header
        colorScheme="dark"
        logo={<Logo image={logoWordmark} />}
        menu={
          <MainNavigation
            links={navLinks}
            colorScheme="dark"
            mobileMenu="fullscreen"
          />
        }
      />

      {/* Intro */}
      <Section
        width="Full"
        colorScheme="navy_dark"
        bottomEdge="curve"
        bottomEdgeColor="navy"
        spacing="medium"
        content={
          <GridContainer
            layout="50-50"
            gap="Medium"
            flushEdges
            content={
              <>
                <Heading
                  heading="Full Stack CRM with AI solutions that your users will love"
                  headingElement="h1"
                  headingSize="Lead"
                  headingWeight="regular"
                  textColor="Accent"
                  layout="Left aligned"
                />
                <Text
                  text="<p>We’re a team of Drupal Specialists, C# developers &amp; AI enthusiasts. <br>Delivering rapid user-focused solutions with a heart 💖<br>Adding AI to the mix to make all the difference.&nbsp;</p>"
                  textSize="Lead"
                  textColor="Light"
                  spacing="none"
                />
              </>
            }
          />
        }
      />

      {/* AI */}
      <Section
        width="Full"
        colorScheme="navy"
        spacing="small"
        content={
          <>
            <Heading
              heading="Improving your CRM with Artificial Intelligence"
              headingElement="h2"
              headingSize="Display"
              headingWeight="bold"
              textColor="Accent"
              layout="Center aligned"
            />
            <Spacer height="Small" />
            <GridContainer
              layout="33-33-33"
              gap="Medium"
              flushEdges
              content={
                <>
                  <VideoEmbed
                    videoUrl="https://www.youtube.com/embed/RUI66lKljdE?list=PLpeDXSh4nHjRt1HwomCkiVF-kLaOqs-Td"
                    videoTitle="Using Drupal’s AI module to power your Drupal websites and potential plans for Starshot"
                    caption="Drupal’s AI module to power websites for Starshot"
                    textColor="Light"
                    offset="none"
                  />
                  <VideoEmbed
                    videoUrl="https://www.youtube.com/embed/1r0m5jH51D4?feature=oembed"
                    videoTitle="Using a Chatbot to change the design of text in Drupal"
                    caption="Chatbot to change text using AI"
                    textColor="Light"
                    offset="small"
                  />
                  <VideoEmbed
                    videoUrl="https://www.youtube.com/embed/LjdAsguNwJQ?feature=oembed"
                    videoTitle="Controlling Drupal via ChatGPT: Is Drupal coming for your Job?"
                    caption="Controlling Drupal via ChatGPT"
                    textColor="Light"
                    offset="large"
                  />
                </>
              }
            />
            <Spacer height="Small" />
            <Blockquote
              variant="centered"
              leadIn="When it comes to embeddings and vector search it’s simply…"
              text="<p>“A way of capturing and scoring what something means”</p>"
              textColor="Light"
              name="James Abrahams"
              title="Director, FreelyGive"
            />
          </>
        }
      />

      {/* CRM solutions */}
      <Section
        width="Full"
        colorScheme="navy"
        spacing="small"
        content={
          <>
            <Heading
              heading="Our CRM Solutions"
              headingElement="h2"
              headingSize="Display"
              headingWeight="bold"
              textColor="Accent"
              layout="Center aligned"
            />
            <GridContainer
              layout="50-50"
              gap="Extra Large"
              flushEdges
              content={
                <>
                  <ImageBlock
                    image={crmPhone}
                    alignment="center"
                    maxWidth="medium"
                  />
                  <ImageBlock
                    image={crmLaptop}
                    alignment="center"
                    maxWidth="large"
                  />
                </>
              }
            />
            <Blockquote
              variant="centered"
              text={`<p>“FreelyGive are an excellent partner – they not only deliver our requirements very efficiently and professionally, they also anticipate our needs and are pro-active in suggesting system improvements working both with us and our clients"</p>`}
              textColor="Light"
              name="Lesley Stewart"
              title="previous Business Development Director, Journeycall Ltd."
            />
          </>
        }
      />

      {/* Tiles and clients */}
      <Section
        width="Full"
        colorScheme="navy"
        bottomEdge="chevron"
        bottomEdgeColor="navy_dark"
        spacing="small"
        content={
          <>
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
            <Spacer height="Medium" />
            <Heading
              heading="Our Clients"
              headingElement="h2"
              headingSize="Display"
              headingWeight="bold"
              textColor="Accent"
              layout="Center aligned"
            />
            <Spacer height="Small" />
            <GridContainer
              layout="Centered wrap"
              gap="Huge"
              flushEdges
              content={
                <>
                  <LogoCard
                    image={clientClinks}
                    link="/work/clinks-online-directories-using-the-power-of-drupal-crm"
                    variant="plain"
                    size="small"
                    trimWhitespace
                  />
                  <LogoCard
                    image={clientEnders}
                    link="/work/enders-analysis-sugarcrm-migration-to-drupal-crm"
                    variant="plain"
                    size="large"
                    trimWhitespace
                  />
                  <LogoCard
                    image={clientNcjaa}
                    link="/work"
                    variant="plain"
                    size="medium"
                    trimWhitespace
                  />
                  <LogoCard
                    image={clientPeak}
                    link="/work"
                    variant="plain"
                    size="medium"
                    trimWhitespace
                  />
                  <LogoCard
                    image={clientEsp}
                    link="/work/journeycall-esp-group-rail-delay-repay-native-drupal-crm"
                    variant="plain"
                    size="medium"
                    trimWhitespace
                  />
                </>
              }
            />
          </>
        }
      />

      <Footer
        colorScheme="dark"
        logo={logoMonogram}
        text="©  2026 FreelyGive Ltd"
        contactHeading="Happy to help"
        links={footerLinks}
        contact={footerContact}
        social={footerSocial}
        badges={footerBadges}
      />
    </>
  ),
};
