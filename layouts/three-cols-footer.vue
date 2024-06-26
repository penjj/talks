<template>
  <div class="slidev-layout" flex="~ gap-x-4">
    <div flex-1>
      <div>
        <slot />
      </div>
      <div flex="~ gap-x-2" mt-2>
        <div flex-1>
          <slot name="left" />
        </div>
        <div flex-1>
          <slot name="center" />
        </div>
      </div>
    </div>
    <div flex-1>
      <slot name="right" />
    </div>
  </div>
</template>
