/**
 * Shared FreelyGive site content (copied verbatim from freelygive.io), reused
 * across the navigation, header and homepage stories.
 */
import Button from '@/components/button';
import LogoCard from '@/components/logo_card';
import NavLink from '@/components/nav_link';
import {
  badgeAcquiaPartner,
  badgeCyberEssentials,
  badgeDrupalAssociation,
  badgeIasme,
  iconEmail,
  iconPhone,
  iconTwitter,
  iconYoutube,
} from '@/stories/assets/freelygive';

/** The main menu, in source order, as `nav_link` slot children. */
export const navLinks = (
  <>
    <NavLink title="Home" link="/" />
    <NavLink title="About us" link="/about" />
    <NavLink title="Subscriptions" link="/subscriptions" />
    <NavLink title="Services" link="/services" />
    <NavLink title="AI" link="/artificial-intelligence" />
    <NavLink title="Our CRM" link="/crm" />
    <NavLink title="Jobs" link="/jobs" />
    <NavLink title="Blog" link="/blog" />
    <NavLink title="Contact us" link="/contact-us" />
  </>
);

/** Footer legal links. */
export const footerLinks = (
  <>
    <Button variant="Link Muted" text="Privacy Policy" link="/privacy-policy" />
  </>
);

/** Footer contact links. */
export const footerContact = (
  <>
    <Button
      variant="Link Accent"
      text="+44 2039207023"
      link="tel:+44%202039207023"
      icon={iconPhone}
    />
    <Button
      variant="Link Accent"
      text="hello@freelygive.io"
      link="mailto:hello@freelygive.io"
      icon={iconEmail}
    />
  </>
);

/** Footer social icon links. */
export const footerSocial = (
  <>
    <LogoCard
      image={iconYoutube}
      link="https://www.youtube.com/@FreelyGive"
      variant="plain"
      size="icon"
    />
    <LogoCard
      image={iconTwitter}
      link="https://twitter.com/freelygiveltd"
      variant="plain"
      size="icon"
    />
  </>
);

/** Footer accreditation badges. */
export const footerBadges = (
  <>
    <LogoCard
      image={badgeCyberEssentials}
      link="https://registry.blockmarktech.com/certificates/f64a0e05-153d-435c-92e4-13122c1b6f8b/?source=WEB"
      openInNewTab
      variant="plain"
      size="x_small"
    />
    <LogoCard
      image={badgeDrupalAssociation}
      link="https://www.drupal.org/freelygive"
      variant="plain"
      size="x_small"
    />
    <LogoCard
      image={badgeIasme}
      link="https://registry.blockmarktech.com/certificates/279e9506-0c90-4cd7-b142-82051a1a68b7/?source=WEB"
      openInNewTab
      variant="plain"
      size="medium"
    />
    <LogoCard
      image={badgeAcquiaPartner}
      link="/blog/acquia-source-partner-of-the-year-2025"
      variant="plain"
      size="small"
    />
  </>
);
