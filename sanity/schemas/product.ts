export const productSchema = {
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Cardamom', value: 'cardamom' },
          { title: 'Pepper', value: 'pepper' },
          { title: 'Turmeric', value: 'turmeric' },
          { title: 'Other Spices', value: 'other' },
        ],
      },
    },
    {
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 2,
    },
    {
      name: 'description',
      title: 'Full Description',
      type: 'text',
      rows: 4,
    },
    {
      name: 'images',
      title: 'Product Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [{ name: 'alt', title: 'Alt Text', type: 'string' }],
        },
      ],
    },
    {
      name: 'specifications',
      title: 'Specifications',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', title: 'Specification Label', type: 'string' },
            { name: 'value', title: 'Value', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'grades',
      title: 'Grades Available',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'gradeName', title: 'Grade Name', type: 'string' },
            { name: 'sizeMm', title: 'Size (mm)', type: 'string' },
            { name: 'density', title: 'Bulk Density (g/L)', type: 'string' },
            { name: 'description', title: 'Grade Description', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'packagingOptions',
      title: 'Packaging Options',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'isFeatured',
      title: 'Featured Product',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'seoTitle',
      title: 'SEO Meta Title',
      type: 'string',
    },
    {
      name: 'seoDescription',
      title: 'SEO Meta Description',
      type: 'text',
      rows: 2,
    },
  ],
};
