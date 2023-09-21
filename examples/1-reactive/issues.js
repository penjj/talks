import { reactive, effect } from './reactive'

console.log('SCOPE 1:')

{
  const state = reactive({ a: 10 })

  effect(() => {
    console.log(state.a)
  })

  state.a = 10
  state.a = 10
}

console.log()
console.log('SCOPE 2:')

{
  const state = reactive({ a: 10, enable: false })

  effect(() => {
    console.log('  ', state.enable ? state.a : null)
  })

  state.enable = true
  state.a = 20
  state.a = 30
}

console.log()
console.log('SCOPE 3:')

{
  const state = reactive({ a: 10, enable: true })

  effect(() => {
    console.log('  ', state.enable ? state.a : null)
  })

  state.enable = false
  state.a = 20
  state.a = 30
}
