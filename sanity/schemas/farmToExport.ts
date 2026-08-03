export const farmToExportSchema = {
  name: 'farmToExport',
  title: 'Farm to Export Journey',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Section Title',
      type: 'string',
      initialValue: 'Farm to Export Journey',
    },
    {
      name: 'steps',
      title: 'Process Steps',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'stepNumber', title: 'Step Number', type: 'number' },
            { name: 'title', title: 'Step Title', type: 'string' },
            { name: 'subtitle', title: 'Subtitle / Location', type: 'string' },
            { name: 'description', title: 'Detailed Description', type: 'text' },
            { name: 'icon', title: 'Icon or Emoji', type: 'string' },
            { name: 'image', title: 'Step Photo', type: 'image', options: { hotspot: true } },
          ],
        },
      ],
    },
  ],
};
