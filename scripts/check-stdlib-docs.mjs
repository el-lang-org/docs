import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const apiPath = resolve(root, 'scripts/stdlib-api.json')

try {
  main()
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}

function main() {
  const args = process.argv.slice(2)
  let source
  let writeApi = false
  for (let index = 0; index < args.length; index++) {
    if (args[index] === '--source' && args[index + 1]) {
      source = resolve(args[++index])
    } else if (args[index] === '--write-api') {
      writeApi = true
    } else {
      throw new Error('Usage: node scripts/check-stdlib-docs.mjs [--source PATH] [--write-api]')
    }
  }
  if (writeApi && !source) throw new Error('--write-api requires --source PATH')
  const inventory = source ? collectPublicApi(source) : JSON.parse(readFileSync(apiPath, 'utf8'))
  if (writeApi) writeFileSync(apiPath, JSON.stringify(inventory, null, 2) + '\n')
  const errors = auditReferences(inventory)
  if (errors.length) {
    console.error(errors.join('\n'))
    process.exitCode = 1
    return
  }
  const count = Object.values(inventory).reduce((total, names) => total + names.length, 0)
  console.log(`Standard-library reference coverage passed: ${count} functions across ${Object.keys(inventory).length} pages.`)
}

function auditReferences(inventory) {
  const errors = []
  const config = readFileSync(resolve(root, 'docs/.vitepress/config.mts'), 'utf8')
  if (!/level:\s*\[2,\s*3\]/.test(config)) errors.push('The right-hand outline must include heading levels 2 and 3.')
  for (const [page, names] of Object.entries(inventory)) {
    const path = `docs/std/${page}.md`
    let markdown
    try {
      markdown = readFileSync(resolve(root, path), 'utf8')
    } catch {
      errors.push(`${path}: missing reference page`)
      continue
    }
    if (!config.includes(`link: '/std/${page}'`)) errors.push(`${path}: missing sidebar link`)
    // Code examples can contain # comments that must not become Markdown headings.
    const masked = markdown.replace(/^```[^\n]*\n[\s\S]*?^```/gm, (block) => block.replace(/[^\n]/g, ' '))
    const headings = [...masked.matchAll(/^(#{1,6})\s+(.+)$/gm)]
    for (const name of names) {
      const matches = headings.filter((heading) => heading[2].trim() === name)
      if (matches.length !== 1 || !['##', '###'].includes(matches[0][1])) {
        errors.push(`${path}: ${name} needs one level-2 or level-3 heading for its outline entry`)
        continue
      }
      const heading = matches[0]
      const next = headings.find((candidate) => candidate.index > heading.index)
      const body = markdown.slice(heading.index + heading[0].length, next?.index ?? markdown.length)
      const blocks = [...body.matchAll(/^```el\n([\s\S]*?)^```/gm)].map((match) => match[1])
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const signature = new RegExp(`^${escaped}(?:\\[.*?\\])?\\(`, 'm')
      if (!blocks[0] || !signature.test(blocks[0]) || !blocks[0].includes('->')) {
        errors.push(`${path}: ${name} is missing its signature`)
      }
      const prose = body.replace(/^```[^\n]*\n[\s\S]*?^```/gm, '').trim()
      if (prose.length < 20 || !/[a-zA-Z]{3}/.test(prose)) errors.push(`${path}: ${name} is missing its introduction`)
      const call = new RegExp(`${escaped}\\(`)
      if (!blocks.slice(1).some((code) => call.test(code))) errors.push(`${path}: ${name} is missing a usage example`)
    }
  }
  return errors
}

function collectPublicApi(source) {
  const names = new Set()
  const stdlib = resolve(source, 'stdlib')
  for (const file of readdirSync(stdlib).filter((name) => name.endsWith('.ell')).sort()) {
    const text = readFileSync(resolve(stdlib, file), 'utf8')
    const module = text.match(/^module\s+(\w+)/m)?.[1]
    if (!module) throw new Error(`Missing module in ${file}`)
    // Indented protocol/impl methods, private functions, and native_* implementation
    // helpers are not exported module functions for callers to document.
    for (const declaration of text.matchAll(/^fn\s+(\w+)/gm)) {
      if (!declaration[1].startsWith('native_')) names.add(`${module}.${declaration[1]}`)
    }
  }
  const intrinsics = readFileSync(resolve(source, 'crates/el-types/src/intrinsics.rs'), 'utf8')
  for (const constant of ['STANDARD_FUNCTIONS', 'COLLECTION_FUNCTIONS']) {
    const block = intrinsics.match(new RegExp(`const ${constant}[^=]*= &\\[([\\s\\S]*?)\\];`))?.[1]
    if (!block) throw new Error(`Missing compiler inventory ${constant}`)
    for (const match of block.matchAll(/"([A-Z]\w*\.\w+)"/g)) {
      if (!match[1].includes('.native_')) names.add(match[1])
    }
  }
  for (const match of intrinsics.matchAll(/names\.push\("([A-Z]\w*\.\w+)"/g)) names.add(match[1])
  const modules = intrinsics.match(/for module in \[([\s\S]*?)\]/)?.[1]
  const operations = intrinsics.match(/for function in \[([\s\S]*?)\]/)?.[1]
  if (!modules || !operations) throw new Error('Missing compiler wrapping-function inventory')
  for (const module of [...modules.matchAll(/"(\w+)"/g)].map((match) => match[1])) {
    for (const operation of [...operations.matchAll(/"(\w+)"/g)].map((match) => match[1])) names.add(`${module}.${operation}`)
  }
  const helpers = readFileSync(resolve(source, 'crates/el-types/src/checker/helpers.rs'), 'utf8')
  for (const helper of ['integer_type_from_name', 'float_type_from_name']) {
    const body = helpers.match(new RegExp(`fn ${helper}\\([\\s\\S]*?\\n\\}`))?.[0]
    if (!body) throw new Error(`Missing conversion inventory ${helper}`)
    for (const match of body.matchAll(/"(\w+)"\s*=>/g)) names.add(match[1])
  }
  const calls = readFileSync(resolve(source, 'crates/el-types/src/checker/calls.rs'), 'utf8')
  if (calls.includes('Some("rune")')) names.add('rune')
  const inventory = {}
  for (const name of [...names].sort()) {
    const module = name.split('.')[0]
    const page = !name.includes('.') || /^(I8|I16|I32|I64|Isize|U8|U16|U32|U64|Usize)$/.test(module) ? 'numeric' : module.toLowerCase()
    const functions = inventory[page] ??= []
    functions.push(name)
  }
  return Object.fromEntries(Object.entries(inventory).sort(([left], [right]) => left.localeCompare(right)))
}
