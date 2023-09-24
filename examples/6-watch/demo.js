import { watch } from './watch'
import { reactive } from '../4-reactive/reactive'

const state = reactive({ a: 1 })

watch(state, (newVal, oldVal) => {
  console.log('观察响应式对象', newVal, oldVal)
})

watch(
  () => state.a,
  (newVal, oldVal) => {
    console.log('观察响应式字段', newVal, oldVal)
  }
)

watch(
  () => state.a,
  (newVal, oldVal) => {
    console.log('初始执行一次', newVal, oldVal)
  },
  {
    immediate: true,
  }
)

state.a = 2
