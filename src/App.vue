<script setup lang="ts">
import Mainstage from './components/MainStage.vue';
</script>

<template>
  <header>
    <div>pengUIn</div>
  </header>

  <main>
    <Mainstage />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
  display: flex;
  place-items: flex-start;
  flex-wrap: wrap;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }
}
</style>
