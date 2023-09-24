import { reactive, effect } from './reactive'

console.log('SCOPE 1:')

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
console.log('SCOPE 2:')

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
console.log('SCOPE 3:')

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

console.log()
console.log('SCOPE 4:')

{
  const target = {
    foo: 1,
    value() {
      return this.foo // 这里this会指向原始对象，实际上读取原始对象并不会触发响应性，必须得触发响应式对象才能触发依赖收集
    },
  }
  const state = reactive(target)

  effect(() => {
    console.log(state.value())
  }) // print 1

  state.foo++ // 期待打印 2
}
