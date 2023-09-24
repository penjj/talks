import { reactive, effect } from '../4-reactive/reactive'

const jobQueue = new Set()
const p = Promise.resolve()

let isFlushing = false

function flushJob() {
  if (isFlushing) {
    return
  }
  // 标记正在清空任务队列，防止多次清空队列
  // 微任务会在同步任务之后执行，所以之后同步执行的代码触发了调度器
  // 也只会将当前effect推入任务队列，并且调用flushJob也会被这里阻挡
  isFlushing = true
  p.then(() => {
    jobQueue.forEach(job => job())
    isFlushing = false
    jobQueue.clear()
  })
}

const state = reactive({ a: 1 })

effect(
  () => {
    console.log(state.a)
  },
  {
    scheduler(fn) {
      jobQueue.add(fn)
      flushJob()
    },
  }
)

state.a = 2
state.a = 3
state.a = 4
state.a = 5
Promise.resolve().then(() => {
  state.a = 100
})
