---
theme: vuetiful
clicks: 1
altCover: false 
---

# VUE源码解析
响应式原理

---
layout: quote
---
WeakMap 和 Map 区别

---
layout: two-cols
---
Map深引用
```js
const map = new Map()

let obj = {}

map.set(obj, 'map')

console.log(map.get(obj)) // 'map'

obj = null // 主动回收

// 原来的对象被删除了，Map仍然持有一份原对象的引用
console.log(map.get(obj)) // 'map'
```

::right::
WeakMap浅引用
```js
const weakmap = new WeakMap()

let obj = {}

weakmap.set(obj, 'weakmap')

console.log(weakmap.get(obj)) // 'weakmap'

obj = null // 主动回收

// WeakMap不会保持对原对象引用，引用对象被回收就会将返回undefined
console.log(weakmap.get(obj)) // undefined
```

---
layout: section
---

# 源码结构

```bash
├── packages
│   ├── compiler-core # 编译器核心
│   ├── compiler-dom # 编译客户端渲染代码
│   ├── compiler-ssr # 编译服务端渲染
│   ├── compiler-sfc # 编译器主入口
│   ├── reactivity # 响应性核心
|   ├── reactivity-transform # 响应式转换
│   ├── runtime-core # 运行时核心
│   ├── runtime-dom # 运行时和dom相关操作
│   ├── server-renderer # 服务端渲染器
│   ├── shared # 公共代码
│   ├── vue # 入口包
│   ├── vue-compat # vue option api兼容包

```
<div v-click>
```mermaid
graph TD
    B[vue]
    B-->C[@vue/compiler-sfc]
    B-->D[@vue/reactivity];
    B-->E(@vue/runtime-dom);
```
</div>

<img
  v-click
  class="absolute bottom-8.5 left-56 w-56"
  src="/arrow-bottom-left.svg"
/>

<p v-after class="absolute bottom-38 left-110 c-#5bbd8f transform -rotate-10">今天主要分享内容</p>


---
layout: outro
---

# @vue/reactivity

<div class="flex">
  <div class="flex-1">
    <h2 v-click>1. 什么是响应式编程？</h2>
    <img v-click class="w-80" src="/reactivity-spreadsheet.gif"/>
  </div>
  <div class="flex-1">
    <h2 v-click>2. VUE响应性原理是什么？</h2>
    <div text-sm>
      <div v-click mb-2>1. vue2 基于发布订阅模式，拦截对象的存、取操作。</div>
      <div v-click>2. vue3 基于观察者模式，利用Proxy提供的元编程能力, 拦截对象的增、删、存、取操作。vue3实现了一个最小响应式单元，所有的响应性只在effect域中有效。</div>
    </div>
  </div>
</div>



<style>
  .slidev-vclick-target {
    transition: all 500ms ease;
  }

  .slidev-vclick-hidden {
    transform: scale(0);
    transition-origin: left center;
  }
</style>

---
layout: big-points
---
# 最小响应单元
```js
import { reactive, effect } from 'vue'

const state = reactive({ a: 1})

effect(() => {
  console.log(state.a)
})

state.a = 10
```

<Counter/>

---
layout: default
---

```js {monaco} { editorOptions: { wordWrap:'on'}, height: '540px' }
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

/**
 * vue响应源和副作用函数关联存储结构图
 *
 * 响应式对象桶
 *
 * WeakMap<
 *  ReactiveObject, // 响应式对象是key
 *  Map<            // 值是Map类型
 *    key,          // 响应式对象的键是key
 *    Set<effect>   // 存储所有依赖于当前key 的 effect
 *  >
 * >
 */
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
```


<codicon-debug-start 
  class="text-xs c-black absolute left-2 top-10"
  @click="$slidev.nav.openInEditor('./examples/1-reactive/demo.js')"
/>

<style>
  .slidev-layout {
    padding-top: 0px;
    padding-bottom: 0px;
  }
</style>


---
layout: section
---
# 逻辑分支管理
<codicon-debug-start 
  v-click
  class="text-xs c-black absolute left-2 bottom-70 z-1"
  @click="$slidev.nav.openInEditor('./examples/1-reactive/issues.js')"
/>


<h3 v-click relative z-1>1. 初始化响应式数据源时分支未激活，导致部分依赖错过收集期</h3>
<h3 v-click>2. 当一个分支暂时失焦时，没有清理该分支内数据源</h3>
<h3 v-click relative z-1>
3. Proxy类构造了一个新的代理对象，只有触发代理对象的set、get才能进行依赖收集和依赖更新
</h3>


<style>
  .slidev-layout {
    padding-top: 0px;
    padding-bottom: 0px;
  }
  .slidev-layout h3 {
    font-weight: 400;
    color: rgba(0, 0, 0, 0.75);
  }
</style>

---

# Reflect & Proxy
<div v-click>
在一些强类型语言里面，Reflect（反射）是用来在运行时观测对象，并且能修改或读取对象的一种机制。
```java
Class clz = Class.forName("com.chenshuyi.reflect.Apple"); // java
Method method = clz.getMethod("setPrice", int.class);
Constructor constructor = clz.getConstructor();
Object object = constructor.newInstance();
method.invoke(object, 4);
```
</div>

<div v-click>
js, 高级动态脚本语言, 不需要这种机制，只要对象有属性，属性是个方法。在es11的可选链语法下，能更安全且方便的来操作运行时的对象。
```js
window.sayHello?.() // javascript
```
</div>

<div v-click>
Reflect在ES6中被设计成一个专门用来操作对象的类，并且它的方法基本和Proxy能拦截的属性一致, 甚至参数数量都一致
```js
Reflect.get      Proxy({ get: () => {} })
Reflect.set      Proxy({ set: () => {} })
Reflect.deleteProperty   Proxy({ deleteProperty: () => {} })
Reflect.defineProperty Proxy({ defineProperty: () => {} })
...
```
</div>


<style>
  .slidev-layout {
    padding-top: 40px;
    padding-bottom: 0px;
  }
</style>


---

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

// 使用数组结构储存多个 effect
const effectStack = []

// 副作用函数
export function effect(fn) {
  const effectFn = () => {
    try {
      cleanup(effectFn)
      activeEffect = effectFn
      effectStack.push(effectFn)
      fn()
    } finally {
      // 执行完后，把当前执行effect 推出栈
      effectStack.pop()
      // 把上一个还没有运行完的effect 给激活，如果没有上一个，说明副作用栈已经运行完了
      activeEffect = effectStack[effectStack.length - 1]
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
  }
</style>

<codicon-debug-start 
  v-click
  class="text-xs c-black absolute left-2 bottom-70 z-1"
  @click="$slidev.nav.openInEditor('./examples/2-reactive/demo.js')"
/>

---
layout: two-cols
---

<template v-slot:default>
创建一段最小响应性单元
```js
const state = reactive({ foo: 1, bar: 2 })

effect(function fnA() {
  console.log(state.foo)
})

effect(function fnB() {
  console.log(state.foo + state.bar)
})
```
</template>

<template v-slot:right>
原来的单向关联数据结构
```ts
TargetMap<{
  state: {
    foo: [fnA, fnB],
    bar: [fnB]
  }
}>
```

双向关联的数据结构
```ts
TargetMap<{
  state: {
    foo: [
      Effect<fnB, TargetMap[state][foo]>,
      Effect<fnA, TargetMap[state][foo]>
    ],
    bar: [
      Effect<fnB, TargetMap[state][bar]>
    ]
  }
}>

interface Effect<Fn, Deps> {
  effectFn: Fn
  deps: Deps
}

```
</template>

---

# 响应性颗粒度

Q：Vue性能为什么比React好？

<div v-click>
```jsx {monaco-diff}
import { useState } from 'react'

const Display = (props) => <div>{props.state}</div>

const RenderLogger = <div>{console.log('rerender')}</div>

const ReactApp = () => {
  const [state, setState] = useState(1)
  return (
    <div>
      <Display state={state}/> 
      <RenderLogger/>
      <button onClick={() => setState(state + 1)}>add</button>
    </div>
  )
}
~~~
import { ref } from 'vue'

const Display = (props) => <div>{props.state}</div>

const RenderLogger = <div>{console.log('rerender')}</div>

const VueApp = () => {
    const state = ref(1)
    return () => (
      <div>
        <Display state={state}/>
        <RenderLogger/>
        <button onClick={() => state.value ++}>add</button>
      </div>
    )
  }
```
</div>

<a href="/vue-vs-react.html" target="_blank">
  <ic-round-open-in-new
    v-after
    class="text-xs c-black absolute left-2 top-40"
    @click="$slidev.nav.openInEditor('./examples/1-reactive/demo.js')"
  />
</a>
---
# 最小颗粒度响应性

不管是Vue还是React，都会有嵌套渲染的问题。React响应性颗粒度无法像Vue一样高，所以只能按虚拟DOM树逐级
渲染，即使页面没有改变。而Vue借助于最小响应单元。能实现颗粒度非常高的渲染。

```jsx
const Foo = {
  render() {
    return <Bar/>
  }
}

const Bar = {
  render() {
    return <div></div>
  }
}

effect(() => {
  Foo.render() // 调用父组件的render，会同步调用子组件的render, 即形成了一条嵌套effect链
  effect(() => {
    Bar.render()
  })
})
```

<span v-click class="text-xs absolute left-2 p-4px px-8px bottom-20 z-1" border="~ solid main" @click="$slidev.nav.openInEditor('./examples/2-reactive/issues.js')">运行</span>

---

# Effect栈

TODO: diff 增加栈结构和之前的代码

---

# 可调度性
嵌套effect为什么多执行了一次？在vue中连续赋值，为什么页面不会渲染多次？computed是如何实现懒执行的？watch又是怎么观测的？

---

# computed 实现

---

# watch 实现

---
# ref实现

---

# 你很少用到，但是能性能提升的hooks

## shallowRef/shallowReactive

## toRaw/markRaw

shallowUnwrapRef/readonly/shallowReadonly