import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'logo',
  title: 'Logo',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Name of the logo variant (e.g., "Expanded Regular", "Collapsed Dark")',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'variant',
      title: 'Variant',
      type: 'string',
      options: {
        list: [
          {title: 'Expanded Regular', value: 'expanded-regular'},
          {title: 'Expanded Dark', value: 'expanded-dark'},
          {title: 'Collapsed Regular', value: 'collapsed-regular'},
          {title: 'Collapsed Dark', value: 'collapsed-dark'},
        ],
        layout: 'radio',
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Logo Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'altText',
      title: 'Alt Text',
      type: 'string',
      description: 'Alternative text for accessibility',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Is this logo currently active/in use?',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
      variant: 'variant',
    },
    prepare(selection) {
      const {title, media, variant} = selection
      return {
        title: title,
        subtitle: variant,
        media: media,
      }
    },
  },
})