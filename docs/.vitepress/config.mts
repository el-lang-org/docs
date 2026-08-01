import { defineConfig } from 'vitepress'
import { elLanguage } from './el-grammar'

export default defineConfig({
  title: 'EL',
  description: 'A small, statically typed, garbage-collected systems programming language',
  lang: 'en-US',
  cleanUrls: true,
  head: [
    ['meta', { name: 'theme-color', content: '#3b82f6' }],
  ],
  markdown: {
    languages: [elLanguage],
  },
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started/' },
      { text: 'Standard Library', link: '/std/' },
      { text: 'Contributing', link: '/contributing/' },
    ],
    sidebar: {
      '/getting-started/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/getting-started/' },
            { text: 'Basic types', link: '/getting-started/basic-types' },
            { text: 'Lists and tuples', link: '/getting-started/lists-and-tuples' },
            { text: 'Pattern matching', link: '/getting-started/pattern-matching' },
            { text: 'Conditionals and loops', link: '/getting-started/control-flow' },
            { text: 'Strings, bytes, and bitstrings', link: '/getting-started/text' },
            { text: 'Maps', link: '/getting-started/maps' },
            { text: 'Modules and functions', link: '/getting-started/modules-and-functions' },
            { text: 'Structs', link: '/getting-started/structs' },
            { text: 'Unions and Type Aliases', link: '/getting-started/unions' },
            { text: 'Enumerables', link: '/getting-started/enumerables' },
            { text: 'Protocols', link: '/getting-started/protocols' },
            { text: 'IO and the file system', link: '/getting-started/io-and-the-file-system' },
            { text: 'Dependencies', link: '/getting-started/dependencies' },
            { text: 'CLI reference', link: '/getting-started/cli' },
          ],
        },
      ],
      '/std/': [
        {
          text: 'Standard Library',
          items: [
            { text: 'Overview', link: '/std/' },
            { text: 'Array', link: '/std/array' },
            { text: 'Bits', link: '/std/bits' },
            { text: 'Buffer', link: '/std/buffer' },
            { text: 'Bytes', link: '/std/bytes' },
            { text: 'Enum', link: '/std/enum' },
            { text: 'File', link: '/std/file' },
            { text: 'IO', link: '/std/io' },
            { text: 'List', link: '/std/list' },
            { text: 'Map', link: '/std/map' },
            { text: 'Numeric conversions', link: '/std/numeric' },
            { text: 'Process', link: '/std/process' },
            { text: 'Rune', link: '/std/rune' },
            { text: 'Slice', link: '/std/slice' },
            { text: 'String', link: '/std/string' },
          ],
        },
      ],
      '/contributing/': [
        {
          text: 'Contributing',
          items: [
            { text: 'Overview', link: '/contributing/' },
            { text: 'Building from Source', link: '/contributing/building' },
            { text: 'Compiler Architecture', link: '/contributing/architecture' },
          ],
        },
      ],
    },
    footer: {
      message: 'EL — a small, predictable systems programming language',
      copyright: 'Documentation for the EL programming language',
    },
    socialLinks: [],
    search: {
      provider: 'local',
    },
  },
})
