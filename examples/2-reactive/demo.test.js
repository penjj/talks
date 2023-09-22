import { test, expect, vi } from 'vitest'
import { reactive, effect } from './reactive'

test('Should responsive branches condition when initial falsy branch', () => {
  const fn = vi.fn()
  const state = reactive({ a: 10, enable: false })

  effect(() => {
    fn(state.enable ? state.a : null)
  })
  expect(fn).toHaveBeenLastCalledWith(null)

  state.enable = true
  expect(fn).toHaveBeenLastCalledWith(10)

  state.a = 20
  expect(fn).toHaveBeenLastCalledWith(20)

  state.a = 30
  expect(fn).toHaveBeenLastCalledWith(30)

  expect(fn).toHaveBeenCalledTimes(4)
})

test('Should responsive branches condition when initial truthy branch', () => {
  const fn = vi.fn()
  const state = reactive({ a: 10, enable: true })

  effect(() => {
    fn(state.enable ? state.a : null)
  })
  expect(fn).toHaveBeenLastCalledWith(10)

  state.enable = false
  expect(fn).toHaveBeenLastCalledWith(null)

  // 这两次不应该触发响应式
  state.a = 20
  state.a = 30
  expect(fn).toHaveBeenCalledTimes(2)
})

test('Should responsive when target getter has `this` pointer', () => {
  const fn = vi.fn()
  const target = {
    foo: 1,
    get value() {
      return this.foo
    },
  }
  const state = reactive(target)

  effect(() => {
    fn(state.value)
  })
  expect(fn).toHaveBeenLastCalledWith(1)

  state.foo++
  expect(fn).toHaveBeenLastCalledWith(2)
})
