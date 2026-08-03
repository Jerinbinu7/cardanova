export const homepageSchema = {
  name: 'homepage',
  title: 'Homepage Content',
  type: 'document',
  fields: [
    {
      name: 'heroHeadline',
      title: 'Hero Main Headline',
      type: 'string',
    },
    {
      name: 'heroSubheadline',
      title: 'Hero Subheadline',
      type: 'text',
      rows: 2,
    },
    {
      name: 'ctaPrimaryText',
      title: 'Primary CTA Button Text',
      type: 'string',
    },
    {
      name: 'ctaSecondaryText',
      title: 'Secondary CTA Button Text',
      type: 'string',
    },
    {
      name: 'whyChooseTitle',
      title: 'Why Choose Section Title',
      type: 'string',
    },
    {
      name: 'whyChooseCards',
      title: 'Why Choose Cards',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Card Title', type: 'string' },
            { name: 'description', title: 'Description', type: 'text' },
            { name: 'icon', title: 'Icon Name or Emoji', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'statistics',
      title: 'Key Statistics',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'statValue', title: 'Stat Value (e.g. 30+)', type: 'string' },
            { name: 'label', title: 'Label', type: 'string' },
            { name: 'description', title: 'Subtext', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'exportExperienceTitle',
      title: 'Export Experience Section Title',
      type: 'string',
    },
    {
      name: 'exportExperienceText',
      title: 'Export Experience Description',
      type: 'text',
    },
    {
      name: 'globalStandardsTitle',
      title: 'Global Standards Title',
      type: 'string',
    },
    {
      name: 'globalStandardsText',
      title: 'Global Standards Description',
      type: 'text',
    },
    {
      name: 'footerTagline',
      title: 'Footer Tagline',
      type: 'string',
    },
  ],
};
