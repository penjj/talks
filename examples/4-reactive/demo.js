import { reactive, effect } from './reactive'

const state = reactive({ foo: 1, bar: 'a' })

effect(() => {
  effect(() => {
    console.log(state.bar)
  })
  console.log(state.foo)
})

state.foo++
state.bar = 'b'
