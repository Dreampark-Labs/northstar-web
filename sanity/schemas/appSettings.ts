import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'appSettings',
  title: 'Application Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'appName',
      title: 'Application Name',
      type: 'string',
      description: 'The name of your application (e.g., "Northstar")',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'appDescription',
      title: 'Application Description',
      type: 'text',
      description: 'Brief description of your application for metadata and SEO',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      description: 'Upload your favicon (preferably 32x32 or 16x16 pixels)',
      options: {
        hotspot: true,
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'appleTouchIcon',
      title: 'Apple Touch Icon',
      type: 'image',
      description: 'Upload your Apple touch icon (preferably 180x180 pixels)',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      description: 'Title for browser tabs and search engines (leave empty to use App Name + Description)',
    }),
    defineField({
      name: 'metaKeywords',
      title: 'Meta Keywords',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Keywords for SEO (optional)',
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Is this the active application settings?',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'appName',
      subtitle: 'appDescription',
      media: 'favicon',
    },
  },
})
