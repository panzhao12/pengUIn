<script setup lang="ts">
import { ref } from 'vue';
import Piano from './ThePiano.vue';

const messagesB1 = ref<Array<string>>([]);
const messagesB3 = ref<Array<string>>([]);
const messagesB4 = ref<Array<string>>([]);

function addMsg() {
  const messageBlock = Math.floor(Math.random() * 3);
  switch (messageBlock) {
    case 0:
      messagesB1.value.push('olga');
      break;
    case 1:
      messagesB3.value.push('olga');
      break;
    case 2:
      messagesB4.value.push('olga');
      break;
  }
}
</script>

<template>
  <div id="b1">
    <ul>
      <li v-for="(msg, index) in messagesB1" :key="index">
        {{ msg }}
      </li>
    </ul>
  </div>

  <div id="b2-5">
    <div id="penguin">
      <img src="/p.png" alt="penguin" @click="addMsg" />
    </div>
    <Piano />
  </div>

  <div id="b3">
    <ul>
      <li v-for="(msg, index) in messagesB3" :key="index">
        {{ msg }}
      </li>
    </ul>
  </div>

  <div id="b4">
    <ul>
      <li v-for="(msg, index) in messagesB4" :key="index">
        {{ msg }}
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
#b1 {
  grid-row-end: span 2;
}

#b2-5 {
  grid-row-end: span 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: center;
}

#b3 {
  grid-row-end: span 2;
}

#b4 {
  grid-column-end: span 3;
}

div {
  display: inline-grid;
}

#penguin img {
  width: 10rem;
  align-self: center;
}

#piano img {
  width: 30rem;
}
</style>
