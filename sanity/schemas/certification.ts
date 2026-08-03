export const certificationSchema = {
  name: 'certification',
  title: 'Certifications & Accreditations',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Certification Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'issuingBody',
      title: 'Issuing Organization / Authority',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    },
    {
      name: 'logo',
      title: 'Certification Badge / Logo',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'validUntil',
      title: 'Validity / License Reference',
      type: 'string',
    },
    {
      name: 'isVerified',
      title: 'Verified Badge',
      type: 'boolean',
      initialValue: true,
    },
  ],
};
