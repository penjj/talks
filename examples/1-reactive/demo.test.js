import { test, vi, expect } from 'vitest'
import { reactive, effect } from './reactive'

test('Effect should respond to reactive', () => {
  const fn = vi.fn()
  const state = reactive({ a: 10 })

  effect(() => {
    fn(state.a)
  })

  expect(fn).lastCalledWith(10)

  state.a = 11

  expect(fn).lastCalledWith(11)

  expect(fn).toHaveBeenCalledTimes(2)
})
