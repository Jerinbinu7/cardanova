export const quoteRequestSchema = {
  name: 'quoteRequest',
  title: 'B2B Quote Request',
  type: 'document',
  fields: [
    { name: 'fullName', title: 'Customer Name', type: 'string', validation: (Rule: any) => Rule.required() },
    { name: 'companyName', title: 'Company Name', type: 'string' },
    { name: 'country', title: 'Country / Region', type: 'string' },
    { name: 'email', title: 'Email Address', type: 'string' },
    { name: 'phone', title: 'Phone / WhatsApp', type: 'string' },
    { name: 'selectedProducts', title: 'Products / Grade Requested', type: 'string' },
    { name: 'quantityKg', title: 'Target Quantity (kg / Metric Tons)', type: 'string' },
    { name: 'message', title: 'Message / Trade Specifications', type: 'text' },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending 🟡', value: 'pending' },
          { title: 'Contacted 🔵', value: 'contacted' },
          { title: 'Closed 🟢', value: 'closed' },
        ],
      },
      initialValue: 'pending',
    },
    { name: 'submittedAt', title: 'Submission Date', type: 'datetime' },
  ],
};
