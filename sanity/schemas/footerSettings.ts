import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'footerSettings',
  title: 'Footer Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'companyName',
      title: 'Company Name',
      type: 'string',
      description: 'Company name for copyright notice',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'copyrightText',
      title: 'Copyright Text',
      type: 'text',
      description: 'Additional copyright text (optional). Year will be added automatically.',
    }),
    defineField({
      name: 'appDescription',
      title: 'App Description',
      type: 'text',
      description: 'Brief description shown in footer',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'version',
      title: 'Version Number',
      type: 'string',
      description: 'Current version of the application (e.g., "1.0.0")',
    }),
    defineField({
      name: 'supportEmail',
      title: 'Support Email',
      type: 'string',
      description: 'Email address for general support',
      validation: Rule => Rule.email(),
    }),
    defineField({
      name: 'privacyEmail',
      title: 'Privacy Email',
      type: 'string',
      description: 'Email address for privacy-related questions',
      validation: Rule => Rule.email(),
    }),
    defineField({
      name: 'legalLinks',
      title: 'Legal Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Link Title',
              type: 'string',
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'string',
              description: 'Internal path (e.g., "/privacy") or external URL',
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'isExternal',
              title: 'External Link',
              type: 'boolean',
              description: 'Check if this links to an external website',
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'url',
            },
          },
        },
      ],
      description: 'Links to legal pages like Privacy Policy, Terms of Service, etc.',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  {title: 'Twitter', value: 'twitter'},
                  {title: 'LinkedIn', value: 'linkedin'},
                  {title: 'GitHub', value: 'github'},
                  {title: 'Facebook', value: 'facebook'},
                  {title: 'Instagram', value: 'instagram'},
                  {title: 'YouTube', value: 'youtube'},
                  {title: 'Other', value: 'other'},
                ],
              },
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: Rule => Rule.required(),
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'Custom label (only needed if platform is "Other")',
            }),
          ],
          preview: {
            select: {
              title: 'platform',
              subtitle: 'url',
            },
          },
        },
      ],
      description: 'Social media links (optional)',
    }),
    defineField({
      name: 'showSecurityBadge',
      title: 'Show Security Badge',
      type: 'boolean',
      description: 'Show "Secured with HTTPS" badge in footer',
      initialValue: true,
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Is this the active footer settings?',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'companyName',
      subtitle: 'appDescription',
    },
  },
})
