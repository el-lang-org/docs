# EL Documentation

Documentation site for the [EL] programming language, built with [VitePress].

## Prerequisites

- [Node.js](https://nodejs.org) (18+)
- [npm](https://www.npmjs.com)

## Getting started

Install dependencies:

```sh
npm install
```

Start the local dev server with hot reload:

```sh
npm run dev
```

Build the static site into `docs/.vitepress/dist`:

```sh
npm run build
```

Preview the production build locally:

```sh
npm run preview
```

## Project structure

```text
docs/
  index.md             Home page
  getting-started/     Tutorials and language fundamentals
  std/                 Core standard-library reference
  contributing/        Architecture and building documentation
  .vitepress/          VitePress config and site theme
```

Content is written in Markdown; code samples use the `el` language. The
normative specifications live in the [el-lang] repository.

## Contributing

See [contributing](/contributing/) for guidelines.

[EL]: https://github.com/el-lang-org/el
[el-lang]: https://github.com/el-lang-org/el
[VitePress]: https://vitepress.dev
