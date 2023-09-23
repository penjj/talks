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
