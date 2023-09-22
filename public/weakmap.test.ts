import { expect, test } from 'vitest'

test('Map 强引用', () => {
  const map = new Map()

  let obj: any = {}

  map.set(obj, 'map')

  expect(map.get(obj)).toBe('map')
  expect(map.has(obj)).toBe(true)

  obj = null

  // map 保持了对对象的引用，即使被置为 null 也不会被垃圾回收
  expect(map.size).toBe(1)
  expect(map.keys().next().value).toEqual({})
})

test('Weakmap 浅引用', () => {
  const weakmap = new WeakMap()

  let obj: any = {}

  weakmap.set(obj, 'weakmap')

  expect(weakmap.get(obj)).toBe('weakmap')
  expect(weakmap.has(obj)).toBe(true)

  obj = null
  // 如果引用的键被清除了，那么 WeakMap 也会自动删除对应的键值对
  expect(weakmap.has(obj)).toBe(false)
})
