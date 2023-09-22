import { reactive, effect } from './reactive'

const state = reactive({ foo: 1, bar: 'a' })

effect(() => {
  console.log(state.foo)
  effect(() => {
    console.log(state.bar)
  })
})

state.foo++
state.bar = 'b'

// 期待打印 1 a 2 b
// 实际打印 1 a 2 a b b
