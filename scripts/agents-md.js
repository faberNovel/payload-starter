#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuration
const DEFAULT_NEXT_VERSION = 'canary'
const DEFAULT_PAYLOAD_VERSION = 'main'
const DEFAULT_OUTPUT = 'AGENTS.md'
const NEXTJS_DOCS_DIR = '.next-docs'
const PAYLOAD_DOCS_DIR = '.payload-docs'
const NEXT_JS_REPO = 'https://github.com/vercel/next.js.git'
const PAYLOAD_REPO = 'https://github.com/payloadcms/payload.git'

// Marker comments for injection
const NEXTJS_START_MARKER = '<!-- NEXTJS-DOCS-START -->'
const NEXTJS_END_MARKER = '<!-- NEXTJS-DOCS-END -->'
const PAYLOAD_START_MARKER = '<!-- PAYLOAD-DOCS-START -->'
const PAYLOAD_END_MARKER = '<!-- PAYLOAD-DOCS-END -->'

class AgentsMD {
  constructor(options = {}) {
    this.projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
    this.nextVersion = options.nextVersion || this.detectNextVersion() || DEFAULT_NEXT_VERSION
    this.payloadVersion =
      options.payloadVersion || this.detectPayloadVersion() || DEFAULT_PAYLOAD_VERSION
    this.output = options.output || DEFAULT_OUTPUT
    this.includeNext = options.includeNext ?? true
    this.includePayload = options.includePayload ?? true
    this.interactive = options.interactive ?? true
    this.nextDocsPath = join(this.projectRoot, NEXTJS_DOCS_DIR)
    this.payloadDocsPath = join(this.projectRoot, PAYLOAD_DOCS_DIR)
  }

  detectNextVersion() {
    try {
      const packageJsonPath = join(this.projectRoot, 'package.json')
      if (!existsSync(packageJsonPath)) return null

      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
      const nextVersion = packageJson.dependencies?.next || packageJson.devDependencies?.next

      if (nextVersion) {
        // Remove semver prefixes like ^, ~, >=
        return nextVersion.replace(/^[\^~>=]+/, '')
      }
    } catch (error) {
      console.warn('Could not detect Next.js version from package.json')
      console.warn('Error:', error.message)
    }
    return null
  }

  detectPayloadVersion() {
    try {
      const packageJsonPath = join(this.projectRoot, 'package.json')
      if (!existsSync(packageJsonPath)) return null

      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
      const payloadVersion =
        packageJson.dependencies?.payload || packageJson.devDependencies?.payload

      if (payloadVersion) {
        // Remove semver prefixes like ^, ~, >=
        return payloadVersion.replace(/^[\^~>=]+/, '')
      }
    } catch (error) {
      console.warn('Could not detect Payload version from package.json')
      console.warn('Error:', error.message)
    }
    return null
  }

  async run() {
    try {
      console.log('🤖 Documentation Index Generator for AI Agents')
      console.log('==============================================\n')

      if (this.interactive) {
        await this.runInteractive()
      } else {
        await this.runNonInteractive()
      }

      console.log('✅ Documentation index generated successfully!')
    } catch (error) {
      console.error('❌ Error:', error.message)
      process.exit(1)
    }
  }

  async runInteractive() {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    const question = (prompt) =>
      new Promise((resolve) => {
        rl.question(prompt, resolve)
      })

    try {
      console.log(`📦 Detected Next.js version: ${this.nextVersion || 'Not found'}`)
      console.log(`📦 Detected Payload version: ${this.payloadVersion || 'Not found'}`)

      const nextVersionInput = await question(
        `Enter Next.js version (default: ${this.nextVersion}): `,
      )
      if (nextVersionInput.trim()) {
        this.nextVersion = nextVersionInput.trim()
      }

      const payloadVersionInput = await question(
        `Enter Payload version (default: ${this.payloadVersion}): `,
      )
      if (payloadVersionInput.trim()) {
        this.payloadVersion = payloadVersionInput.trim()
      }

      const includeNextInput = await question(`Include Next.js documentation? (y/n): `)
      this.includeNext =
        includeNextInput.toLowerCase() === 'y' || includeNextInput.toLowerCase() === 'yes'

      const includePayloadInput = await question(`Include Payload documentation? (y/n): `)
      this.includePayload =
        includePayloadInput.toLowerCase() === 'y' || includePayloadInput.toLowerCase() === 'yes'

      const outputInput = await question(`Enter output file (default: ${this.output}): `)
      if (outputInput.trim()) {
        this.output = outputInput.trim()
      }

      await this.execute()
    } finally {
      rl.close()
    }
  }

  async runNonInteractive() {
    console.log(`📦 Using Next.js version: ${this.nextVersion}`)
    console.log(`📦 Using Payload version: ${this.payloadVersion}`)
    console.log(`📄 Output file: ${this.output}`)
    console.log(`📚 Include Next.js: ${this.includeNext ? 'Yes' : 'No'}`)
    console.log(`📚 Include Payload: ${this.includePayload ? 'Yes' : 'No'}`)
    await this.execute()
  }

  async execute() {
    const promises = []

    // Step 1: Download documentation
    if (this.includeNext) {
      console.log(`\n📥 Downloading Next.js v${this.nextVersion} documentation...`)
      promises.push(this.downloadNextDocs())
    }

    if (this.includePayload) {
      console.log(`\n📥 Downloading Payload v${this.payloadVersion} documentation...`)
      promises.push(this.downloadPayloadDocs())
    }

    await Promise.all(promises)

    // Step 2: Generate indexes
    console.log('\n📋 Generating documentation indexes...')
    const indexes = {}

    if (this.includeNext) {
      indexes.next = await this.generateNextIndex()
    }

    if (this.includePayload) {
      indexes.payload = await this.generatePayloadIndex()
    }

    // Step 3: Update agents file
    console.log(`📝 Updating ${this.output}...`)
    await this.updateAgentsFile(indexes)

    // Step 4: Update .gitignore
    console.log('📁 Updating .gitignore...')
    await this.updateGitignore()
  }

  async downloadNextDocs() {
    await this.downloadDocs(this.nextDocsPath, NEXT_JS_REPO, this.nextVersion, 'docs/')
  }

  async downloadPayloadDocs() {
    await this.downloadDocs(this.payloadDocsPath, PAYLOAD_REPO, this.payloadVersion, 'docs/')
  }

  async downloadDocs(docsPath, repoUrl, version, sparsePattern) {
    // Remove existing docs directory if it exists
    if (existsSync(docsPath)) {
      await this.execCommand('rm', ['-rf', docsPath])
    }

    // Create docs directory
    mkdirSync(docsPath, { recursive: true })

    // Initialize git repository
    await this.execCommand('git', ['init'], { cwd: docsPath })

    // Add remote
    await this.execCommand('git', ['remote', 'add', 'origin', repoUrl], { cwd: docsPath })

    // Configure sparse-checkout
    await this.execCommand('git', ['config', 'core.sparseCheckout', 'true'], { cwd: docsPath })

    // Set sparse-checkout patterns
    const sparseCheckoutPath = join(docsPath, '.git', 'info', 'sparse-checkout')
    writeFileSync(sparseCheckoutPath, sparsePattern)

    // Fetch specific version/branch
    const ref = version === 'canary' || version === 'main' ? version : `v${version}`
    await this.execCommand('git', ['fetch', '--depth=1', 'origin', ref], { cwd: docsPath })

    // Checkout
    await this.execCommand('git', ['checkout', 'FETCH_HEAD'], { cwd: docsPath })

    // Remove .git folder to avoid submodule issues
    const gitDir = join(docsPath, '.git')
    if (existsSync(gitDir)) {
      await this.execCommand('rm', ['-rf', gitDir])
    }
  }

  async generateNextIndex() {
    const docsSourcePath = join(this.nextDocsPath, 'docs')

    if (!existsSync(docsSourcePath)) {
      throw new Error('Next.js documentation not found. Download may have failed.')
    }

    const index = this.scanDirectory(docsSourcePath, docsSourcePath)
    return this.formatIndex(index, NEXTJS_DOCS_DIR)
  }

  async generatePayloadIndex() {
    const docsSourcePath = join(this.payloadDocsPath, 'docs')

    if (!existsSync(docsSourcePath)) {
      throw new Error('Payload documentation not found. Download may have failed.')
    }

    const index = this.scanDirectory(docsSourcePath, docsSourcePath)
    return this.formatIndex(index, PAYLOAD_DOCS_DIR)
  }

  scanDirectory(dirPath, basePath, relativePath = '') {
    const items = readdirSync(dirPath)
    const result = { files: [], directories: {} }

    for (const item of items) {
      const fullPath = join(dirPath, item)
      const itemRelativePath = relativePath ? join(relativePath, item) : item
      const stats = statSync(fullPath)

      if (stats.isDirectory()) {
        result.directories[item] = this.scanDirectory(fullPath, basePath, itemRelativePath)
      } else if (item.endsWith('.md') || item.endsWith('.mdx')) {
        result.files.push({
          name: item,
          path: itemRelativePath,
          size: stats.size,
        })
      }
    }

    return result
  }

  formatIndex(index, docsDir, level = 0) {
    let result = ''
    const indent = '  '.repeat(level)

    // Add files in current directory
    if (index.files.length > 0) {
      for (const file of index.files.sort((a, b) => a.name.localeCompare(b.name))) {
        const fileSize = (file.size / 1024).toFixed(1)
        result += `${indent}- [${file.name}](${docsDir}/${file.path}) (${fileSize}KB)\n`
      }
    }

    // Add subdirectories
    const sortedDirs = Object.keys(index.directories).sort()
    for (const dirName of sortedDirs) {
      if (
        Object.keys(index.directories[dirName].directories).length > 0 ||
        index.directories[dirName].files.length > 0
      ) {
        result += `${indent}- **${dirName}/**:\n`
        result += this.formatIndex(index.directories[dirName], docsDir, level + 1)
      }
    }

    return result
  }

  async updateAgentsFile(indexes) {
    const outputPath = join(this.projectRoot, this.output)
    let content = ''

    // Read existing file or create new one
    if (existsSync(outputPath)) {
      content = readFileSync(outputPath, 'utf8')
    } else {
      content = `# AI Agent Documentation\n\nThis file contains documentation indexes for AI coding agents.\n\n`
    }

    // Update Next.js section
    if (indexes.next) {
      const nextSection = `${NEXTJS_START_MARKER}

## Next.js Documentation Index (v${this.nextVersion})

The following Next.js documentation files are available in the \`${NEXTJS_DOCS_DIR}/\` directory:

${indexes.next.trim()}

**Usage**: Reference these files when answering Next.js-related questions. The files contain comprehensive documentation for Next.js features, APIs, and best practices.

**Last Updated**: ${new Date().toISOString()}

${NEXTJS_END_MARKER}`

      content = this.replaceOrAppendSection(
        content,
        nextSection,
        NEXTJS_START_MARKER,
        NEXTJS_END_MARKER,
      )
    }

    // Update Payload section
    if (indexes.payload) {
      const payloadSection = `${PAYLOAD_START_MARKER}

## Payload CMS Documentation Index (v${this.payloadVersion})

The following Payload CMS documentation files are available in the \`${PAYLOAD_DOCS_DIR}/\` directory:

${indexes.payload.trim()}

**Usage**: Reference these files when answering Payload CMS-related questions. The files contain comprehensive documentation for Payload CMS features, APIs, configuration, and best practices.

**Last Updated**: ${new Date().toISOString()}

${PAYLOAD_END_MARKER}`

      content = this.replaceOrAppendSection(
        content,
        payloadSection,
        PAYLOAD_START_MARKER,
        PAYLOAD_END_MARKER,
      )
    }

    writeFileSync(outputPath, content)
  }

  replaceOrAppendSection(content, section, startMarker, endMarker) {
    const startIndex = content.indexOf(startMarker)
    const endIndex = content.indexOf(endMarker)

    if (startIndex !== -1 && endIndex !== -1) {
      // Replace existing section
      return content.slice(0, startIndex) + section + content.slice(endIndex + endMarker.length)
    } else {
      // Append new section
      return content + '\n\n' + section
    }
  }

  async updateGitignore() {
    const gitignorePath = join(this.projectRoot, '.gitignore')
    let gitignoreContent = ''

    if (existsSync(gitignorePath)) {
      gitignoreContent = readFileSync(gitignorePath, 'utf8')
    }

    const docsToIgnore = []

    // Check if .next-docs/ is already ignored
    if (
      this.includeNext &&
      !gitignoreContent.includes('.next-docs/') &&
      !gitignoreContent.includes('.next-docs')
    ) {
      docsToIgnore.push('# Next.js documentation for AI agents', '.next-docs/')
    }

    // Check if .payload-docs/ is already ignored
    if (
      this.includePayload &&
      !gitignoreContent.includes('.payload-docs/') &&
      !gitignoreContent.includes('.payload-docs')
    ) {
      docsToIgnore.push('# Payload CMS documentation for AI agents', '.payload-docs/')
    }

    if (docsToIgnore.length > 0) {
      gitignoreContent += '\n' + docsToIgnore.join('\n') + '\n'
      writeFileSync(gitignorePath, gitignoreContent)
    }
  }

  execCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: 'pipe',
        ...options,
      })

      let stdout = ''
      let stderr = ''

      child.stdout?.on('data', (data) => {
        stdout += data.toString()
      })

      child.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      child.on('close', (code) => {
        if (code === 0) {
          resolve(stdout)
        } else {
          reject(new Error(`Command failed: ${command} ${args.join(' ')}\n${stderr}`))
        }
      })

      child.on('error', reject)
    })
  }
}

// CLI parsing
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    interactive: true,
    includeNext: true,
    includePayload: true,
  }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--next-version':
      case '-nv':
        options.nextVersion = args[++i]
        options.interactive = false
        break
      case '--payload-version':
      case '-pv':
        options.payloadVersion = args[++i]
        options.interactive = false
        break
      case '--output':
      case '-o':
        options.output = args[++i]
        options.interactive = false
        break
      case '--next-only':
        options.includeNext = true
        options.includePayload = false
        options.interactive = false
        break
      case '--payload-only':
        options.includeNext = false
        options.includePayload = true
        options.interactive = false
        break
      case '--no-next':
        options.includeNext = false
        options.interactive = false
        break
      case '--no-payload':
        options.includePayload = false
        options.interactive = false
        break
      case '--help':
      case '-h':
        console.log(`
Usage: pnpm run agents-md [options]

Options:
  -nv, --next-version <version>     Next.js version to download (default: auto-detect)
  -pv, --payload-version <version>  Payload version to download (default: auto-detect)
  -o, --output <file>               Output file name (default: AGENTS.md)
  --next-only                       Download only Next.js documentation
  --payload-only                    Download only Payload documentation
  --no-next                         Skip Next.js documentation
  --no-payload                      Skip Payload documentation
  -h, --help                        Show this help message

Examples:
  # Interactive mode (prompts for input)
  pnpm run agents-md

  # Download both with specific versions
  pnpm run agents-md -- --next-version 15.4.11 --payload-version 3.76.0

  # Download only Next.js documentation
  pnpm run agents-md -- --next-only --next-version 15.4.11

  # Download only Payload documentation
  pnpm run agents-md -- --payload-only --payload-version 3.76.0

  # Auto-detect versions, specify output
  pnpm run agents-md -- --output AGENTS.md
        `)
        process.exit(0)
        break
    }
  }

  return options
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const options = parseArgs()
  const agentsMD = new AgentsMD(options)
  agentsMD.run().catch(console.error)
}

export { AgentsMD }
