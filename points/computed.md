```js {monaco} {height: '540px'}
import { effect, track, trigger } from '../4-reactive/reactive'

/**
 * vue 中 computed 有几个特性
 * 1. computed 默认都是懒加载的，只有当访问到的时候才会执行依赖收集
 * 2. computed 有缓存值的功能，只有当值改变才会触发更新
 */
export function computed(getter) {
  let value
  // 用来标记是否需要重新计算, 如果为true，表示当前计算属性依赖的值发生了变化，需要重新计算
  let dirty = true

  const effectFn = effect(getter, {
    // 计算属性不会立即执行，只有当读取.value时，才会触发触次执行
    // 新增了lazy属性，如果为true, effect将不会进行初次的依赖收集
    lazy: true,
    scheduler: () => {
      // 调度器中，不执行effect，只会去标记当前值脏了，需要重新计算
      // 并主动调用trigger触发依赖更新
      dirty = true
      // 这里不用执行副作用函数了，而是触发响应性 交由 get value 来执行
      trigger(obj, 'value')
    },
  })

  const obj = {
    // 初次依赖收集发生在 get value 时
    get value() {
      // 如果当前值是脏的，就执行effect，执行完刷新dirty状态，当下次依赖变更时，才会重新计算
      if (dirty) {
        value = effectFn()
        dirty = false
      }
      // 读取时才收集依赖
      track(obj, 'value')
      return value
    },
  }

  return obj
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
  @click="$slidev.nav.openInEditor('./examples/3-reactive/demo.js')"
/>
