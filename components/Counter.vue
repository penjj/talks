<script setup lang="ts">
import { reactive } from 'vue'

const state = reactive({ a: 1 })

state.a = 10
</script>

<template>
  <div flex items-center gap-10 mt-4 c-gray-500>
    <button
      font="mono"
      w-8
      h-8
      hover:bg="gray-400 opacity-20"
      border="~ main rounded-full"
      @click="state.a--"
    >
      -
    </button>
    <button
      font="mono"
      w-8
      h-8
      outline="!none"
      hover:bg="gray-400 opacity-20"
      border="~ main rounded-full"
      @click="state.a++"
    >
      +
    </button>
    <div flex c-gray>
      Print:
      <span ml-2 c-dark>{{ state.a }}</span>
    </div>
  </div>
</template>
