<script setup lang="ts">
import { reactive } from 'vue'

const state = reactive({ a: 1 })

state.a = 10
</script>

<template>
  <div flex justify-center items-center gap-10 w="min">
    <button
      p="2"
      font="mono"
      w-10
      outline="!none"
      hover:bg="gray-400 opacity-20"
      border="~ main rounded-md"
      @click="state.a--"
    >
      -
    </button>
    <button
      p="2"
      font="mono"
      w-10
      outline="!none"
      hover:bg="gray-400 opacity-20"
      border="~ main rounded-md"
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
