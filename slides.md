---
theme: vuetiful
clicks: 1
altCover: false 
---

# VUE源码解析

响应式原理


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

<img
  v-click
  class="absolute bottom-5 left-56 w-56"
  src="/arrow-bottom-left.svg"
/>

<p v-after class="absolute bottom-35 left-110 c-#5bbd8f transform -rotate-10">今天主要分享内容</p>

```mermaid
graph TD
    B["vue@3.3.4"]
    B-->C[@vue/compiler-sfc]
    B-->D[@vue/reactivity];
    B-->E(@vue/runtime-dom);
```

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
    <div>
      <div v-click>vue2 基于发布订阅模式，拦截对象的存、取操作</div>
      <div v-click>vue3 实现了最小响应式单元，基于Proxy提供的元编程能力, 拦截对象的增、删、存、取操作。这种响应式单元，计算机领域一般称之为Signal(信道)。</div>
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

# 最小响应单元
```js {monaco} { height: '250px' }
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

```js {monaco} { editorOptions: { wordWrap:'on'}, height: '470px' }
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

<span class="text-xs" p-4px px-8px border="~ main rounded-md" @click="$slidev.nav.openInEditor('./examples/1-reactive/demo.js')">运行</span>
<style>
  .slidev-layout {
    padding-top: 0px;
    padding-bottom: 0px;
  }
</style>


---
layout: section
---
# 最小化核心，但有缺陷
<span class="text-xs z-1 relative" p-4px px-8px border="~ main rounded-md" @click="$slidev.nav.openInEditor('./examples/1-reactive/issues.js')">查看</span>

<h3 v-click>1. 重复设置值缺少过滤机制，造成多余性能开销</h3>
<h3 v-click relative z-1>2. 初始化响应式数据源时分支未激活，导致部分依赖错过收集期</h3>
<h3 v-click>3. 当一个分支暂时失焦时，没有清理该分支内数据源</h3>

---

```js
var a = 0

```

<span class="text-xs" p-4px px-8px border="~ main rounded-md" @click="$slidev.nav.openInEditor('./examples/1-reactive/demo.js')">运行</span>
<style>
  .slidev-layout {
    padding-top: 0px;
    padding-bottom: 0px;
  }
</style>

---

# 亘古不变的问题，this指向


---

# Reflect & Proxy，天生一对
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
    padding-top: 10px;
    padding-bottom: 0px;
  }
</style>