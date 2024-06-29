<template>
  <slot @vue:mounted="getRawCode" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

console.log('run')

const getRawCode = (el) =>{
  console.log(el, 'el')
}
</script>