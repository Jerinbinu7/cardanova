export const aboutSchema = {
  name: 'aboutPage',
  title: 'About Page Content',
  type: 'document',
  fields: [
    { name: 'heroTitle', title: 'About Hero Title', type: 'string' },
    { name: 'storyHeading', title: 'Our Story Heading', type: 'string' },
    { name: 'storyBody', title: 'Our Story Body', type: 'text', rows: 6 },
    { name: 'mission', title: 'Mission Statement', type: 'text', rows: 3 },
    { name: 'vision', title: 'Vision Statement', type: 'text', rows: 3 },
    {
      name: 'coreValues',
      title: 'Core Values',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Value Title', type: 'string' },
            { name: 'description', title: 'Description', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'founders',
      title: 'Founders & Leadership',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', title: 'Name', type: 'string' },
            { name: 'role', title: 'Role / Designation', type: 'string' },
            { name: 'bio', title: 'Short Bio', type: 'text' },
            { name: 'image', title: 'Photo', type: 'image', options: { hotspot: true } },
          ],
        },
      ],
    },
  ],
};
