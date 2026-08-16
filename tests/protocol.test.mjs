import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_CONFIG, TRILIUM_API, TRILIUM_API_BASE } from '../lib/protocol.js'

test('DEFAULT_CONFIG has no user-specific defaults', () => {
  assert.equal(DEFAULT_CONFIG.baseUrl, '')
  assert.equal(DEFAULT_CONFIG.memoryNoteId, '')
  assert.equal(DEFAULT_CONFIG.timeoutMs, 15000)
  assert.equal(DEFAULT_CONFIG.autoInject, true)
  assert.equal(DEFAULT_CONFIG.deleteConfirm, true)
  assert.equal(DEFAULT_CONFIG.announceToAgent, true)
})

test('route paths live under one base', () => {
  for (const value of Object.values(TRILIUM_API)) {
    assert.ok(value.startsWith(TRILIUM_API_BASE + '/'), value + ' should be under ' + TRILIUM_API_BASE)
  }
})
