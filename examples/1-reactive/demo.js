import { effect, reactive } from './reactive'

const state = reactive({ a: 10 })

effect(() => {
  console.log(state.a)
})

state.a = 11
