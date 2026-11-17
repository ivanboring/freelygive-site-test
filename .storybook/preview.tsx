import '../src/global.css';

const mockMenuItems = [
  { id: '1', title: 'Home', url: '#', expanded: false },
  { id: '2', title: 'About', url: '#', expanded: false },
  { id: '3', title: 'Services', url: '#', expanded: false },
  { id: '4', title: 'Contact', url: '#', expanded: false },
];

const mockSearchResults = [
  {
    title: 'Getting Started with Our Platform',
    path: { alias: '/getting-started' },
  },
  {
    title: 'How to Configure Your Account Settings',
    path: { alias: '/account-settings' },
  },
  {
    title: 'Best Practices for Content Management',
    path: { alias: '/best-practices' },
  },
  {
    title: 'Understanding Analytics and Reporting',
    path: { alias: '/analytics' },
  },
  {
    title: 'Troubleshooting Common Issues',
    path: { alias: '/troubleshooting' },
  },
];

export default {
  tags: ['autodocs'],
  parameters: {
    docs: {
      extractComponentDescription: (component: {
        __docgenInfo?: { description?: string };
      }) => {
        const desc: string = component?.__docgenInfo?.description || '';
        const before = desc.split(/\n\s*@/)[0].trim();
        return before.startsWith('@') ? '' : before;
      },
    },
    backgrounds: {
      options: {
        light: { name: 'Light', value: '#D1D5DCFF' },
        dark: { name: 'Dark', value: '#364153FF' },
        primary_light: { name: 'Primary (Light)', value: '#90A1B9FF' },
        primary_dark: { name: 'Primary (Dark)', value: '#1447E6FF' },
        white: { name: 'White', value: '#FFFFFFFF' },
        black: { name: 'Black', value: '#020618FF' },
      },
    },
    viewport: {
      // Match viewport sizes in Drupal Canvas.
      // @see https://git.drupalcode.org/project/canvas/-/blob/197f387af2bea7c073e91ddeded4039dfdc03031/ui/src/types/Preview.ts#L7
      options: {
        desktopLarge: {
          name: 'Large Desktop',
          styles: {
            width: '2560px',
            height: '1440px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1920px',
            height: '1080px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '1024px',
            height: '100%',
          },
        },
        mobile: {
          name: 'Mobile',
          styles: {
            width: '468px',
            height: '800px',
          },
        },
      },
    },
    initialGlobals: {
      background: { value: 'light' },
      viewport: { value: 'mobile' },
    },
    options: {
      storySort: {
        includeNames: true,
        order: [
          'Introduction',
          'Example pages',
          'Components',
          ['Header', 'Footer', 'Layout', 'Assets'],
        ],
      },
    },
  },
  async beforeEach() {
    const { JsonApiClient } =
      await import('@drupal-api-client/json-api-client');
    (
      JsonApiClient.prototype as unknown as Record<string, unknown>
    ).getResource = async (type: string, resourceId: string) => {
      if (type === 'menu_items' && resourceId === 'main') {
        return mockMenuItems;
      }
      throw Object.assign(new Error('Not Found'), { status: 404 });
    };
    (
      JsonApiClient.prototype as unknown as Record<string, unknown>
    ).getCollection = async (type: string) => {
      if (type === 'index--cms_content') {
        return mockSearchResults;
      }
      throw Object.assign(new Error('Not Found'), { status: 404 });
    };
  },
  initialGlobals: {
    viewport: { value: undefined, isRotated: false },
  },
  decorators: [
    (Story) => {
      // Ensure the drupalSettings structure exists
      window.drupalSettings = {
        ...window.drupalSettings,
        canvasData: {
          ...window.drupalSettings?.canvasData,
          v0: {
            ...window.drupalSettings?.canvasData?.v0,
            baseUrl: window.drupalSettings?.canvasData?.v0?.baseUrl || '/',
            jsonapiSettings: window.drupalSettings?.canvasData?.v0
              ?.jsonapiSettings || {
              apiPrefix: '/jsonapi',
            },
            pageTitle: 'Test Page',
            breadcrumbs: [
              { key: '<front>', text: 'Home', url: '/' },
              {
                key: 'page.section',
                text: 'Test Section',
                url: '/test-section',
              },
              { key: 'page.test', text: 'Test Page' },
            ],
            branding: {
              homeUrl: '/',
              siteName: 'Test Site',
              siteSlogan: 'Canvas + Storybook + AI',
            },
          },
        },
      };
      return <Story />;
    },
  ],
};
