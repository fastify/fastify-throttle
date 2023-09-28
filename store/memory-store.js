'use strict'

const { lru } = require('tiny-lru')

const defaultEntry = { startTime: null, bytes: null, allowedBytes: null, allowedTtl: null }

function MemoryStore(app, cache, ttl = 60 * 60 * 1000) {
  this.lru = new lru(cache || 5000, ttl)
  this.app = app
  this.ttl = ttl
}

MemoryStore.prototype.setAllowedBytes = function (key, value) {
  const entry = this.lru.get(key) || {...defaultEntry}
  const now = Date.now()

  if (
    entry.allowedTtl === null ||
    (now - entry.allowedTtl) > 1000
  ) {
    entry.allowedBytes = value
    entry.allowedTtl = now
    this.lru.set(key, entry)
    console.log({op: 'setAllowedBytes', entry })
    return value
  }

  console.log({op: 'setAllowedBytes', entry })
  return entry.allowedBytes
}

MemoryStore.prototype.getAllowedBytes = function (key) {
  const entry = this.lru.get(key) || defaultEntry
  console.log({op: 'getAllowedBytes', entry })
  return entry.allowedBytes || 0
}

MemoryStore.prototype.decreaseAllowedBytes = function (key, value) {
  const entry = this.lru.get(key)
  entry.allowedBytes -= value

  this.lru.set(key, entry)

  console.log({op: 'decreaseAllowedBytes', entry })
  return entry.allowedBytes
}

MemoryStore.prototype.setStartTime = async function (key, value) {
  const entry = this.lru.get(key) || { ...defaultEntry }
  if (entry.startTime === null) {
    entry.startTime = value
    this.lru.set(key, entry)
  }
  console.log({op: 'setStartTime', entry })
  return entry.startTime
}

MemoryStore.prototype.initBytes = async function (key) {
  const entry = this.lru.get(key) || { ...defaultEntry }
  if (entry.bytes === null) {
    entry.bytes = 0
    this.lru.set(key, entry)
  }
  console.log({op: 'initBytes', entry })
  return entry.bytes
}

MemoryStore.prototype.getBytes = async function (key) {
  const entry =this.lru.get(key) || defaultEntry

  console.log({op: 'getBytes', entry })
  return entry.bytes || 0
}

MemoryStore.prototype.increaseBytes = async function (key, value) {
  const entry = this.lru.get(key) || { ...defaultEntry }
  if (entry.bytes === null) {
    entry.bytes = value
  } else {
    entry.bytes += value
  }

  this.lru.set(key, entry)
  console.log({op: 'increaseBytes', entry })
  return entry.bytes
}

MemoryStore.prototype.child = async function (routeOptions) {
  return new MemoryStore(this.app, routeOptions.cache, routeOptions.ttl)
}

module.exports = {
  MemoryStore
}
