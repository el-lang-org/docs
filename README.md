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

## Standard-library reference checks

Every public function has a level-two or level-three heading, its signature,
a description, and an EL usage example. The heading gives the function an
entry in the right-hand outline.

Check the reference against the checked-in API inventory:

```sh
npm run check:stdlib
```

The production build runs this check before VitePress. To compare the reference
with a local compiler checkout, run:

```sh
npm run check:stdlib -- --source ../el-lang
```

After an intentional public API change, refresh the inventory and update every
reported reference entry:

```sh
npm run check:stdlib -- --source ../el-lang --write-api
```

The source audit reads public module functions and compiler intrinsic tables.
It excludes private functions, protocol implementation methods, and
`native_*` implementation helpers. Numeric conversions and all integer wrapping
functions are included.

## Contributing

See [contributing](/contributing/) for guidelines.

[EL]: https://github.com/el-lang-org/el
[el-lang]: https://github.com/el-lang-org/el
[VitePress]: https://vitepress.dev
