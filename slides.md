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
src: /points/reactivity.md
---
---
layout: section
---
# 逻辑分支管理

<v-click>

```js
const state = reactive({ a: 10, flag: false })

effect(() => {
  console.log(state.flag ? state.a : null)
})

state.flag = true
state.a = 20
state.a = 30

```
</v-click>


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
src: /points/branch&reflect.md
---
---
layout: two-cols
---

响应性代码
```js
const state = reactive({ foo: 1, bar: 2 })

effect(function fnA() {
  console.log(state.foo)
})

effect(function fnB() {
  console.log(state.foo + state.bar)
})
```

原来的单向关联数据结构
```ts
TargetMap<{
  state: {
    foo: [fnA, fnB],
    bar: [fnB]
  }
}>
```

::right::
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
---
layout: two-cols
---
<div mr-6>

<h1>嵌套Effect</h1>

组件树是如何渲染的？
```jsx
const Foo = {
  render() {
    return <Bar/>
  }
}

const Bar = {
  render() {
    return <div>hello</div>
  }
}
createApp(Foo).mount('#app')
```

</div>

::right::
<div v-click>
渲染顺序
```mermaid
graph LR
    B[createApp]
    B-->C[Foo.render]
    C-->D[Bar.render];
```
</div>
<div v-click text-xs bg-gray-100 p-2 mb-4>
vue render方法产生了一份VDOM，而VDOM是响应式主要依赖，为了能让VDOM有响应性。实际上每个render
都会在effect中执行
</div>

<v-click>

```js
effect(() => {
  Foo.render()
  effect(() => {
    Bar.render()
  })
})
```

</v-click>

<div v-click mt-4>
为啥是嵌套effect而不是扁平effect？
</div>

<ul text-xs>
  <li v-click>1. 存在props的情况下，子effect是依赖于父级effect的</li>
  <li v-click>2. vue render过程是同步的</li>
</ul>

<codicon-debug-start 
  v-click
  class="text-xs c-black absolute left-2 bottom-6 z-1"
  @click="$slidev.nav.openInEditor('./examples/2-reactive/issues.js')"
/>

---
src: /points/effect-stack.md
---

---
layout: outro
---

# 可调度性
嵌套effect为什么多执行了一次？

在vue中连续赋值，为什么页面不会渲染多次？

computed是如何实现懒执行的？

watch又是怎么观测的？


---
src: /points/vue&react.md
---

---
src: /points/scheduler.md
---

---
layout: section
---
# computed

computed 和 effect 共同点
* 能响应响应式数据源变化

不同点
* computed 不会立即执行一次
* computed 有缓存，当值没有发生变化不会重新计算

```js
const state = reactive({ a: 1 })

const double = computed(() => state.a * 2)

effect(() => {
  console.log(double.value)
})

state.a ++
```


---
src: /points/computed.md
---

---
layout: section
---
# watch

watch 和 effect实际上也非常相似，区别是watch能观测到上一次值、和控制响应时机
```js
const state = reactive({ a: 1 })

watch(() => state.a, (newVal, oldVal) => {
  console.log(newVal, oldVal)
})

state.a ++
```

---
src: /points/watch.md
---


---
layout: two-cols
---
# 竞态问题

<div text-xs>
  在多线程编程语言中，竞态是一个经常被提及的问题，比如线程之间同时写入数据库，并且也有一些配套的解决方案。
</div>
<div text-xs mt-4>
  前端只有单线程，所以竞态问题常常被忽略。那么前端是不是不存在竞态问题呢？
</div>

<v-click>

```js
const state = reactive({ id: 1 })
const data = ref()

watch(state, async (newVal) => {
  const res = await fetch('/user/' + newVal.id)
  data.value = res.data
})

state.id = 2
state.id = 3
```
</v-click>

<div v-click text-xs mt-4>
如上代码所示，我们无法确定 data.value 具体会是哪一次网络请求的执行结果。vue对于watch api
的清理过期副作用给出了一个解决方案
</div>

::right::
<div v-click ml-8>

```js

const state = reactive({ id: 1 })
const data = ref()

watch(state, (newVal, _, onCleanup) => {
  let isClear = false

  // 每当一个新的 state.id 修改触发watch，如果上一个副作用函数还没有执行完，将触发回调，修改
  // 上一个副作用函数的 isClear
  onCleanup(() => {
    isClear = true
  })

  const result = await fetch('/user/' + newVal.id)

  // 如果当前副作用没有被清理
  if (!isClear) {
    data.value = res.data
  }
})

state.id = 2
state.id = 3
```
</div>

---
layout: section
---

<div flex>

  <div flex-1 mr-8>
  <h2>过滤同步值</h2>

  ```js
  const state = reactive({ a: 1 })

  effect(() => {
    // 这里会打印四次，但是vue在同步代码中，对数据进
    // 行多次赋值，只会取最后更新的一次来对页面进行渲染
    // 以节省性能开销
    console.log(state.a) 
  })

  state.a ++
  state.a ++
  state.a ++
  ```
  </div>

  <div flex-1 v-click relative z1>
  
  ```js {monaco}
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

  effect(() => {
    console.log(state.a)
  }, {
    scheduler(fn) {
      jobQueue.add(fn)
      flushJob()
    }
  })

  state.a ++
  state.a ++
  ```
  </div>
</div>

<style>
  .slidev-code {
    zoom: .85;
  }
</style>
---
# ref实现

---

# 你很少用到，但是能性能提升的hooks

## shallowRef/shallowReactive

## toRaw/markRaw

shallowUnwrapRef/readonly/shallowReadonly