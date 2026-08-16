import { test } from 'node:test'
import assert from 'node:assert/strict'
import { patchConfig, toView, validatePatch, readConfig, writeConfig, storePath } from '../lib/store.js'
import { DEFAULT_CONFIG } from '../lib/protocol.js'
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// The store reads ~/.dsh/dsh-trilium.json — redirect HOME into a sandbox.
function withSandbox(fn) {
  const sandbox = mkdtempSync(join(tmpdir(), 'dsh-trilium-test-'))
  const previous = process.env.HOME
  process.env.HOME = sandbox
  try {
    fn()
  } finally {
    process.env.HOME = previous
    rmSync(sandbox, { recursive: true, force: true })
  }
}

test('readConfig returns defaults when no store file exists', () => {
  withSandbox(() => {
    const config = readConfig()
    assert.equal(config.baseUrl, DEFAULT_CONFIG.baseUrl)
    assert.equal(config.memoryNoteId, '')
    assert.equal(config.tokenSet, false)
    assert.equal(config.timeoutMs, 15000)
  })
})

test('writeConfig persists atomically and readConfig round-trips', () => {
  withSandbox(() => {
    const config = readConfig()
    config.token = 'secret-token'
    writeConfig(config)
    const reread = readConfig()
    assert.equal(reread.token, 'secret-token')
    assert.equal(reread.tokenSet, true)
    assert.equal(reread.autoInject, true)
  })
})

test('patchConfig: empty token keeps the stored token; provided token replaces', () => {
  withSandbox(() => {
    const config = readConfig()
    config.token = 'stored'
    const kept = patchConfig(config, { baseUrl: 'https://x/etapi', token: '' })
    assert.equal(kept.token, 'stored')
    assert.equal(kept.baseUrl, 'https://x/etapi')
    const replaced = patchConfig(config, { token: 'new' })
    assert.equal(replaced.token, 'new')
  })
})

test('patchConfig: booleans and timeout are honored, invalid timeout ignored', () => {
  withSandbox(() => {
    const config = readConfig()
    const patched = patchConfig(config, { autoInject: false, deleteConfirm: false, timeoutMs: 99999 })
    assert.equal(patched.autoInject, false)
    assert.equal(patched.deleteConfirm, false)
    assert.equal(patched.timeoutMs, 99999)
    const invalid = patchConfig(config, { timeoutMs: -5 })
    assert.equal(invalid.timeoutMs, config.timeoutMs)
  })
})

test('validatePatch rejects bad shapes', () => {
  assert.ok(validatePatch(null) !== undefined)
  assert.ok(validatePatch({ baseUrl: 42 }) !== undefined)
  assert.ok(validatePatch({ baseUrl: '' }) !== undefined)
  assert.ok(validatePatch({ autoInject: 'yes' }) !== undefined)
  assert.ok(validatePatch({ timeoutMs: 0 }) !== undefined)
  assert.equal(validatePatch({ baseUrl: 'https://x/etapi', token: 't', autoInject: true }), undefined)
})

test('toView never leaks the token', () => {
  const view = toView({ ...readConfig(), token: 'secret' })
  assert.equal('token' in view, false)
  assert.equal(view.tokenSet, true)
})