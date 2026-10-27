import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitepress'
import { elLanguage } from './el-grammar'

export default defineConfig({
  title: 'EL — A Small Systems Programming Language',
  description: 'A small, statically typed, garbage-collected systems programming language',
  lang: 'en-US',
  cleanUrls: true,
  head: [
    ['meta', { name: 'theme-color', content: '#3b82f6' }],
  ],
  markdown: {
    languages: [elLanguage],
  },
  vite: {
    resolve: {
      alias: [
        {
          find: /^.*\/VPHomeHero\.vue$/,
          replacement: fileURLToPath(
            new URL('./theme/components/VPHomeHero.vue', import.meta.url),
          ),
        },
      ],
    },
  },
  themeConfig: {
    siteTitle: false,
    outline: {
      level: [2, 3],
      label: 'On this page',
    },
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
            { text: 'Operators', link: '/getting-started/operators' },
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
            { text: 'ANSI', link: '/std/ansi' },
            { text: 'Array', link: '/std/array' },
            { text: 'Assert', link: '/std/assert' },
            { text: 'Bits', link: '/std/bits' },
            { text: 'Buffer', link: '/std/buffer' },
            { text: 'Bytes', link: '/std/bytes' },
            { text: 'Enum', link: '/std/enum' },
            { text: 'File', link: '/std/file' },
            { text: 'Format', link: '/std/format' },
            { text: 'Heap', link: '/std/heap' },
            { text: 'Http', link: '/std/http' },
            { text: 'IO', link: '/std/io' },
            { text: 'Json', link: '/std/json' },
            { text: 'List', link: '/std/list' },
            { text: 'Log', link: '/std/log' },
            { text: 'Map', link: '/std/map' },
            { text: 'Math', link: '/std/math' },
            { text: 'Native FFI', link: '/std/ffi' },
            { text: 'Net', link: '/std/net' },
            { text: 'Numeric conversions', link: '/std/numeric' },
            { text: 'OS', link: '/std/os' },
            { text: 'Path', link: '/std/path' },
            { text: 'Process', link: '/std/process' },
            { text: 'Queue', link: '/std/queue' },
            { text: 'Random', link: '/std/random' },
            { text: 'Rune', link: '/std/rune' },
            { text: 'Set', link: '/std/set' },
            { text: 'Slice', link: '/std/slice' },
            { text: 'String', link: '/std/string' },
            { text: 'Time', link: '/std/time' },
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
      message: 'EL — a small systems programming language built for developer experience',
      copyright: 'Documentation for the EL programming language',
    },
    socialLinks: [],
    search: {
      provider: 'local',
    },
  },
})
