import { reactive, effect } from './reactive'

console.log('分支切换问题 1:')

{
  const state = reactive({ a: 10, enable: false })

  effect(() => {
    console.log(state.enable ? state.a : null)
  })

  state.enable = true
  state.a = 20
  state.a = 30
}

console.log()
console.log('分支切换问题 2:')

{
  const state = reactive({ a: 10, enable: true })

  effect(() => {
    console.log(state.enable ? state.a : null)
  })

  state.enable = false
  state.a = 20
  state.a = 30
}

console.log()
console.log('this 指向修正 3:')

{
  const target = {
    foo: 1,
    get value() {
      return this.foo // 这里this会指向原始对象，实际上读取原始对象并不会触发响应性，必须得触发响应式对象才能触发依赖收集
    },
  }
  const state = reactive(target)

  effect(() => {
    console.log(state.value)
  }) // print 1

  state.foo++ // 期待打印 2
}
