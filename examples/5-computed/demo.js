import { computed } from './computed'
import { effect, reactive } from '../4-reactive/reactive'

const state = reactive({ a: 1 })

const double = computed(() => {
  return state.a * 2
})

effect(() => {
  console.log(double.value)
  console.log(double.value)
})

state.a++
