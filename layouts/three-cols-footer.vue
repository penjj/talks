<template>
  <div class="slidev-layout">
    <div flex="~ gap-x-4">
      <div flex-1>
        <slot/>
      </div>
      <div flex-1>
        <slot name="center" />
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