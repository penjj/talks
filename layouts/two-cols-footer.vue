<template>
  <div class="slidev-layout">
    <div mb2>
      <slot />
    </div>
    <div flex="~ gap-x-4">
      <div flex-1>
        <slot name="left"/>
      </div>
      <div flex-1>
        <slot name="right" />
      </div>
    </div>
    <div>
      <slot name="footer" />
    </div>
  </div>
</template>