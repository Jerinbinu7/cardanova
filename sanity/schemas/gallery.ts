export const gallerySchema = {
  name: 'galleryItem',
  title: 'Gallery Item',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Cultivation & Estate', value: 'cultivation' },
          { title: 'Processing & Curing', value: 'processing' },
          { title: 'Quality Inspection', value: 'quality' },
          { title: 'Export & Shipment', value: 'export' },
        ],
      },
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', title: 'Alt Text', type: 'string' }],
    },
    {
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
    },
  ],
};
