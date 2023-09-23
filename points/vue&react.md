
# Vue性能为什么比React好？

<v-click>

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
</v-click>

<a v-click href="/vue-vs-react.html" target="_blank">
  <ic-round-open-in-new
    v-after
    class="text-xs c-black absolute left-2 top-40"
    @click="$slidev.nav.openInEditor('./examples/1-reactive/demo.js')"
  />
</a>