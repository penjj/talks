import { effect, reactive } from './reactivity'

const state = reactive({ a: 10, flag: true })

effect(() => {
  console.log(state.flag ? state.a : null)
})

state.flag = false
state.a = 20
state.a = 30