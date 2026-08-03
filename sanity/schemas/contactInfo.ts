export const contactInfoSchema = {
  name: 'contactInfo',
  title: 'Contact Information',
  type: 'document',
  fields: [
    { name: 'address', title: 'Office & Processing Address', type: 'text', rows: 3 },
    { name: 'phonePrimary', title: 'Primary Phone', type: 'string' },
    { name: 'phoneSecondary', title: 'Secondary / Export Phone', type: 'string' },
    { name: 'emailSales', title: 'Sales / Export Email', type: 'string' },
    { name: 'emailSupport', title: 'General Info Email', type: 'string' },
    { name: 'whatsAppNumber', title: 'WhatsApp Number', type: 'string' },
    { name: 'exportInquiryDetails', title: 'Export Inquiry Notice', type: 'text' },
    { name: 'mapEmbedUrl', title: 'Google Maps Embed URL', type: 'url' },
  ],
};
