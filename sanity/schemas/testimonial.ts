export const testimonialSchema = {
  name: 'testimonial',
  title: 'Client Testimonial',
  type: 'document',
  fields: [
    { name: 'clientName', title: 'Client Name', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'company', title: 'Company / Importer Name', type: 'string' },
    { name: 'country', title: 'Country', type: 'string' },
    { name: 'quote', title: 'Testimonial Quote', type: 'text', rows: 3 },
    { name: 'rating', title: 'Rating Stars (1-5)', type: 'number', initialValue: 5 },
    { name: 'isFeatured', title: 'Featured on Homepage', type: 'boolean', initialValue: true },
  ],
};
