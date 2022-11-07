<script setup lang="ts">
import { ref } from 'vue';
import TextSticker from './TextSticker.vue';

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
    <h2>Block1</h2>
    <ul>
      <li v-for="(msg, index) in messagesB1" :key="index">
        {{ msg }}
      </li>
    </ul>
  </div>

  <div id="b2-5">
    <div id="penguin">
      <img src="p.png" alt="penguin" @click="addMsg" />
    </div>
    <div id="piano">
      <img src="piano.png" alt="piano" />
    </div>
  </div>

  <div id="b3">
    <h2>Block3</h2>
    <ul>
      <li v-for="(msg, index) in messagesB3" :key="index">
        {{ msg }}
      </li>
    </ul>
  </div>

  <div id="b4">
    <h2>Block4</h2>
    <ul>
      <li v-for="(msg, index) in messagesB4" :key="index">
        {{ msg }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
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
