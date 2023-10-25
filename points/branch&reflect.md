
```js {monaco-diff} { height: '540px' }
export function isObject(target) {
  return typeof target === 'object' && target !== null
}

// 判断是否是响应式对象
export function isReactive(target) {
  return target && target.__v_isReactive
}

// 创建响应式对象
// 通过 Proxy 代理对象，拦截对象的读取和设置操作，并通过 track 和 trigger 函数收集和触发依赖
export function reactive(target) {
  // 如果 target 不是对象，直接返回
  if (!isObject(target)) {
    return target
  }

  // 如果 target 已经是响应式对象，直接返回, 避免重复代理
  if (isReactive(target)) {
    return target
  }

  return new Proxy(target, {
    get(obj, key) {
      // 提供给 isReactive 方法使用
      if (key === '__v_isReactive') {
        return true
      }
      const res = obj[key]
      // 当effect中运行函数触发响应式对象读取时，就会触发依赖收集，并按照effect进行分组
      track(obj, key)
      // 递归处理嵌套对象, 这也是vue2 和 vue3 响应式主要区别之一，只有当读取到对象的键值时，
      // 才会将对象类型的值转换为响应式对象
      // 这样也解决了 vue2 需要 $set 才能动态给对象添加响应式属性的问题
      return isObject(res) ? reactive(res) : res
    },
    set(obj, key, value) {
      obj[key] = value
      trigger(obj, key) // 触发依赖
      return true
    },
  })
}

// 当前激活的 effect
let activeEffect = null

// 副作用函数
export function effect(fn) {
  activeEffect = fn
  fn()
  activeEffect = null
}

const targetMap = new WeakMap()

/**
 * 收集响应式依赖，将当前激活的 effect 函数收集到依赖中
 * 这个方法通常是在 reactive 函数中的 Proxy 的 get 拦截器中自动触发的
 */
export function track(target, key) {
  if (!activeEffect) {
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect)
}

/**
 * 触发依赖，当响应式对象的值发生变化时，触发依赖
 * 这个方法通常是在 reactive 函数中的 Proxy 的 set 拦截器中自动触发的
 */
export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  const deps = depsMap.get(key)
  if (deps) {
    deps.forEach(fn => fn())
  }
}
~~~
export function isObject(target) {
  return typeof target === 'object' && target !== null
}

// 判断是否是响应式对象
export function isReactive(target) {
  return target && target.__v_isReactive
}

// 创建响应式对象
// 通过 Proxy 代理对象，拦截对象的读取和设置操作，并通过 track 和 trigger 函数收集和触发依赖
export function reactive(target) {
  // 如果 target 不是对象，直接返回
  if (!isObject(target)) {
    return target
  }

  // 如果 target 已经是响应式对象，直接返回, 避免重复代理
  if (isReactive(target)) {
    return target
  }

  return new Proxy(target, {
    get(obj, key, receiver) {
      // 提供给 isReactive 方法使用
      if (key === '__v_isReactive') {
        return true
      }
      // receiver 是一个指向当前proxy的指针，Reflect.get 能传入第三个参数this指针
      const res = Reflect.get(obj, key, receiver)
      track(obj, key)
      // 递归处理嵌套对象, 这也是vue2 和 vue3 响应式主要区别之一，只有当读取到对象的键值时，
      // 才会将对象类型的值转换为响应式对象
      // 这样也解决了 vue2 需要 $set 才能动态给对象添加响应式属性的问题
      return isObject(res) ? reactive(res) : res
    },
    set(obj, key, value, receiver) {
      const res = Reflect.set(obj, key, value, receiver)
      trigger(obj, key)
      return res
    },
  })
}

/**
 * 清除 dep 和 effectFn 之间的响应性关联
 * 在track中，记录响应性时，把effect和dep双向关联了起来，为了解决分支问题
 * 在每次响应性开始运行时，会检索双端关联，并清除关联
 */
export function cleanup(effectFn) {
  const { deps } = effectFn
  deps.forEach(dep => dep.delete(effectFn))
  deps.length = 0
}

/**
 * 每次创建一个副作用函数，把activeEffect和副作用绑定起来，每次运行都会设置activeEffect,
 * 这样运行时都能触发依赖收集
 */

// 当前激活的 effect
let activeEffect = null

// 副作用函数
export function effect(fn) {
  const effectFn = () => {
    try {
      cleanup(effectFn)
      activeEffect = effectFn
      fn()
    } finally {
      activeEffect = null
    }
  }
  effectFn.deps = []
  effectFn()
}

const targetMap = new WeakMap()

/**
 * 收集响应式依赖，将当前激活的 effect 函数收集到依赖中
 * 这个方法通常是在 reactive 函数中的 Proxy 的 get 拦截器中自动触发的
 */
export function track(target, key) {
  if (!activeEffect) {
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }

  deps.add(activeEffect)
  // 建立effect 和 deps 间的双端关联关系
  activeEffect.deps.push(deps)
}

/**
 * 触发依赖，当响应式对象的值发生变化时，触发依赖
 * 这个方法通常是在 reactive 函数中的 Proxy 的 set 拦截器中自动触发的
 */
export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  const deps = depsMap.get(key)
  const effectToRun = new Set(deps)
  effectToRun.forEach(fn => {
    // 如果当前正在收集器的effect和运行的副作用函数不是同一个，才会执行
    // 否则会造成死循环
    if (fn !== activeEffect) {
      fn()
    }
  })
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
  @click="$slidev.nav.openInEditor('./examples/2-reactive/demo.js')"
/>
