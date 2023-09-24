```js {monaco} {height: '540px'}
import { effect, isObject } from '../4-reactive/reactive'

export function isFunction(fn) {
  return typeof fn === 'function'
}

/**
 * 递归遍历响应式属性，读取一次，触发依赖收集
 *
 * seen 用来过滤循环引用，如：
 * const objA = {}
 * objA.a = objA
 *
 * const state = reactive(objA)
 */
export function traverse(value, seen = new Set()) {
  // 过滤掉循环引用
  if (seen.has(value) || !isObject(value)) {
    return
  }
  seen.add(value)

  // 递归读取对象的每一个属性
  for (const key in value) {
    traverse(value[key], seen)
  }

  return value
}

export function watch(source, cb, options = {}) {
  // 只处理了 reactive 类型，并且是 object 的情况
  let getter = isFunction(source) ? source : () => traverse(source)

  // 用来解决竞态环境下过期副作用问题
  let cleanup
  const onCleanup = fn => {
    cleanup = fn
  }

  let oldValue

  const effectFn = effect(getter, {
    lazy: true,
    scheduler: () => {
      // options.flush 能传入三种调度时机
      // 但pre post调度时机高度依赖runtime，所以这里只实现了 sync，同步调度
      job()
    },
  })

  const job = () => {
    // 重新执行副作用函数
    const newValue = effectFn()
    cb(newValue, oldValue, onCleanup)
    cleanup && cleanup()
    oldValue = newValue
  }

  if (options.immediate) {
    job()
  } else {
    oldValue = effectFn()
  }
}
```

<style>
  .slidev-layout {
    padding-top: 0px;
    padding-bottom: 0px;
    padding-left: 20px;
    padding-right: 20px;
  }
</style>

<codicon-debug-start 
  v-click
  class="text-xs c-black absolute left-2 bottom-70 z-1"
  @click="$slidev.nav.openInEditor('./examples/6-watch/demo.js')"
/>
