import { watch } from './watch'
import { reactive } from '../4-reactive/reactive'

const state = reactive({ id: 1 })

const wait500 = () => new Promise(r => setTimeout(() => r(true), 500))

watch(
  () => state.id,
  async (newVal, _, onCleanup) => {
    let isClear = false

    // 每当一个新的 state.id 修改触发watch，如果上一个副作用函数还没有执行完，将触发回调，修改
    // 上一个副作用函数的 isClear
    onCleanup(() => {
      isClear = true
    })

    const res = await wait500()

    // 如果当前副作用没有被清理
    if (!isClear) {
      console.log('result=', res, ' 当前副作用 id=', newVal)
    } else {
      console.log('当前副作用已过期 id=', newVal)
    }
  }
)

state.id = 2
state.id = 3
