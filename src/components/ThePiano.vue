<script setup lang="ts">
import { ref } from 'vue';
import keys from '../25key.json';
import * as Tone from 'tone';
import { addKeyBoardEvents } from '@/keyBoardEvents';

// define the piano sampler
const sampler = new Tone.Sampler({
  urls: {
    A0: 'A0.mp3',
    C1: 'C1.mp3',
    'D#1': 'Ds1.mp3',
    'F#1': 'Fs1.mp3',
    A1: 'A1.mp3',
    C2: 'C2.mp3',
    'D#2': 'Ds2.mp3',
    'F#2': 'Fs2.mp3',
    A2: 'A2.mp3',
    C3: 'C3.mp3',
    'D#3': 'Ds3.mp3',
    'F#3': 'Fs3.mp3',
    A3: 'A3.mp3',
    C4: 'C4.mp3',
    'D#4': 'Ds4.mp3',
    'F#4': 'Fs4.mp3',
    A4: 'A4.mp3',
    C5: 'C5.mp3',
    'D#5': 'Ds5.mp3',
    'F#5': 'Fs5.mp3',
    A5: 'A5.mp3',
    C6: 'C6.mp3',
    'D#6': 'Ds6.mp3',
    'F#6': 'Fs6.mp3',
    A6: 'A6.mp3',
    C7: 'C7.mp3',
    'D#7': 'Ds7.mp3',
    'F#7': 'Fs7.mp3',
    A7: 'A7.mp3',
    C8: 'C8.mp3'
  },
  release: 1,
  baseUrl: 'https://tonejs.github.io/audio/salamander/'
}).toDestination();

addKeyBoardEvents(sampler);

function playKey(key: string) {
  sampler.triggerAttack(key);
}

function releaseKey(key: string) {
  sampler.triggerRelease(key);
}
</script>

<template>
  <div class="keys">
    <div
      v-for="(key, index) in keys"
      :key="index"
      :class="key.type === 0 ? `keys__white-key` : `keys__black-key`"
      :data-key="key.name"
      @mousedown="playKey(key.name)"
      @mouseup="releaseKey(key.name)"
    ></div>
  </div>
</template>

<style scoped lang="scss">
.keys {
  z-index: 1; //TODO
  display: flex;
  padding: 2px 0 0 2px;
  overflow: hidden;
  background: #000;
  border-radius: 0 0 4px 4px;

  &__white-key {
    float: left;
    position: relative;
    width: 50px;
    height: 180px;
    margin: 0 2px 2px 0;
    background: #fff;
    border-radius: 0 0 4px 4px;

    &:active {
      background: #f4f3f3;
      box-shadow: inset 3px 2px 3px #999, inset -3px 2px 3px #999;
    }
  }

  &__black-key {
    width: 0;
    margin: 0;
    z-index: 2;
    left: -20px;

    &::after {
      content: '';
      position: absolute;
      top: -2px;
      display: block;
      width: 32px;
      height: 117px;
      background: red;
      border-radius: 0 0 4px 4px;
      box-shadow: 1px 1px 0 #555, 2px 2px 0 #555;
    }

    &:active::after {
      background-color: rgb(36, 33, 33);
      box-shadow: inset 3px 2px 3px rgb(58, 58, 58),
        inset -3px 2px 3px rgb(58, 58, 58);
    }
  }
}
</style>
