#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const PROJECT_ROOT = join(__dirname, '..')

// Configuration
const DEFAULT_VERSION = 'canary'
const DEFAULT_OUTPUT = 'AGENTS.md'
const DOCS_DIR = '.next-docs'
const NEXT_JS_REPO = 'https://github.com/vercel/next.js.git'

// Marker comments for injection
const START_MARKER = '<!-- NEXTJS-DOCS-START -->'
const END_MARKER = '<!-- NEXTJS-DOCS-END -->'

class AgentsMD {
  constructor(options = {}) {
    this.version = options.version || this.detectNextVersion() || DEFAULT_VERSION
    this.output = options.output || DEFAULT_OUTPUT
    this.interactive = options.interactive ?? true
    this.projectRoot = PROJECT_ROOT
    this.docsPath = join(this.projectRoot, DOCS_DIR)
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

  async run() {
    try {
      console.log('🤖 Next.js Documentation Index Generator for AI Agents')
      console.log('====================================================\n')

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
      console.log(`📦 Detected Next.js version: ${this.version || 'Not found'}`)
      const versionInput = await question(`Enter Next.js version (default: ${this.version}): `)
      if (versionInput.trim()) {
        this.version = versionInput.trim()
      }

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
    console.log(`📦 Using Next.js version: ${this.version}`)
    console.log(`📄 Output file: ${this.output}`)
    await this.execute()
  }

  async execute() {
    // Step 1: Download documentation
    console.log(`\n📥 Downloading Next.js v${this.version} documentation...`)
    await this.downloadDocs()

    // Step 2: Generate index
    console.log('📋 Generating documentation index...')
    const index = await this.generateIndex()

    // Step 3: Update agents file
    console.log(`📝 Updating ${this.output}...`)
    await this.updateAgentsFile(index)

    // Step 4: Update .gitignore
    console.log('📁 Updating .gitignore...')
    await this.updateGitignore()
  }

  async downloadDocs() {
    // Remove existing docs directory if it exists
    if (existsSync(this.docsPath)) {
      await this.execCommand('rm', ['-rf', this.docsPath])
    }

    // Create docs directory
    mkdirSync(this.docsPath, { recursive: true })

    // Initialize git repository
    await this.execCommand('git', ['init'], { cwd: this.docsPath })

    // Add remote
    await this.execCommand('git', ['remote', 'add', 'origin', NEXT_JS_REPO], { cwd: this.docsPath })

    // Configure sparse-checkout
    await this.execCommand('git', ['config', 'core.sparseCheckout', 'true'], { cwd: this.docsPath })

    // Set sparse-checkout patterns
    const sparseCheckoutPath = join(this.docsPath, '.git', 'info', 'sparse-checkout')
    writeFileSync(sparseCheckoutPath, 'docs/\n')

    // Fetch specific version/branch
    const ref = this.version === 'canary' ? 'canary' : `v${this.version}`
    await this.execCommand('git', ['fetch', '--depth=1', 'origin', ref], { cwd: this.docsPath })

    // Checkout
    await this.execCommand('git', ['checkout', 'FETCH_HEAD'], { cwd: this.docsPath })
  }

  async generateIndex() {
    const docsSourcePath = join(this.docsPath, 'docs')

    if (!existsSync(docsSourcePath)) {
      throw new Error('Documentation not found. Download may have failed.')
    }

    const index = this.scanDirectory(docsSourcePath, docsSourcePath)
    return this.formatIndex(index)
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

  formatIndex(index, level = 0) {
    let result = ''
    const indent = '  '.repeat(level)

    // Add files in current directory
    if (index.files.length > 0) {
      for (const file of index.files.sort((a, b) => a.name.localeCompare(b.name))) {
        const fileSize = (file.size / 1024).toFixed(1)
        result += `${indent}- [${file.name}](${DOCS_DIR}/${file.path}) (${fileSize}KB)\n`
      }
    }

    // Add subdirectories
    const sortedDirs = Object.keys(index.directories).sort()
    for (const dirName of sortedDirs) {
      if (
        Object.keys(index.directories[dirName].directories).length > 0 ||
        index.directories[dirName].files.length > 0
      ) {
        result += `${indent}- **${dirName}/**: \n`
        result += this.formatIndex(index.directories[dirName], level + 1)
      }
    }

    return result
  }

  async updateAgentsFile(index) {
    const outputPath = join(this.projectRoot, this.output)
    let content = ''

    // Read existing file or create new one
    if (existsSync(outputPath)) {
      content = readFileSync(outputPath, 'utf8')
    } else {
      content = `# AI Agent Documentation\n\nThis file contains documentation indexes for AI coding agents.\n\n`
    }

    // Create the documentation section
    const docsSection = `${START_MARKER}

## Next.js Documentation Index (v${this.version})

The following Next.js documentation files are available in the \`${DOCS_DIR}/\` directory:

${index.trim()}

**Usage**: Reference these files when answering Next.js-related questions. The files contain comprehensive documentation for Next.js features, APIs, and best practices.

**Last Updated**: ${new Date().toISOString()}

${END_MARKER}`

    // Replace existing section or append new one
    const startIndex = content.indexOf(START_MARKER)
    const endIndex = content.indexOf(END_MARKER)

    if (startIndex !== -1 && endIndex !== -1) {
      // Replace existing section
      content =
        content.slice(0, startIndex) + docsSection + content.slice(endIndex + END_MARKER.length)
    } else {
      // Append new section
      content += '\n\n' + docsSection
    }

    writeFileSync(outputPath, content)
  }

  async updateGitignore() {
    const gitignorePath = join(this.projectRoot, '.gitignore')
    let gitignoreContent = ''

    if (existsSync(gitignorePath)) {
      gitignoreContent = readFileSync(gitignorePath, 'utf8')
    }

    // Check if .next-docs/ is already ignored
    if (!gitignoreContent.includes('.next-docs/') && !gitignoreContent.includes('.next-docs')) {
      gitignoreContent += '\n# Next.js documentation for AI agents\n.next-docs/\n'
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
  }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--version':
      case '-v':
        options.version = args[++i]
        options.interactive = false
        break
      case '--output':
      case '-o':
        options.output = args[++i]
        options.interactive = false
        break
      case '--help':
      case '-h':
        console.log(`
Usage: pnpm run agents-md [options]

Options:
  -v, --version <version>    Next.js version to download (default: auto-detect)
  -o, --output <file>        Output file name (default: AGENTS.md)
  -h, --help                 Show this help message

Examples:
  # Interactive mode (prompts for input)
  pnpm run agents-md

  # Non-interactive mode
  pnpm run agents-md -- --version 15.4.11 --output CLAUDE.md

  # Auto-detect version, specify output
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
