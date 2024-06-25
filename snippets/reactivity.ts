// #region effect
let activeEffect = null

export function effect(fn) {
  activeEffect = fn
  fn()
  activeEffect = null
}
// #endregion effect


// #region track
const targetMap = new WeakMap()

function track(target, key) {
  if (!activeEffect) return
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

function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  const deps = depsMap.get(key)
  if (deps) {
    deps.forEach(fn => fn())
  }
}
// #endregion track


// #region reactive
export function reactive(target) {
  return new Proxy(target, {
    get(obj, key) {
      const res = obj[key]
      track(obj, key)
      return res
    },
    set(obj, key, value) {
      obj[key] = value
      trigger(obj, key)
    },
  })
}
// #endregion reactive