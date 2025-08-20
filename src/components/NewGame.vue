<script setup>
import { ref } from 'vue';
import { store } from '../store.js';

defineProps({
  title: String,
});

const audio = ref(store.audio);

const config = () => {
  window.location.hash = '/config';
}

const startGame = () => {

  store.setValues({
    initialized: true
  });

  if (store.audio){
    const audioFile = new Audio('sounds/click.wav');
    audioFile.volume = store.audioVolume;
    audioFile.play();
  }

  window.location.hash = '/game';
};

const toggleAudio = () => {
  audio.value = !audio.value;
  store.setValues({
    audio: audio.value
  });
}


const count = ref(0);
</script>

<template>
  <nav class="navbar sticky-top bg-dark">
    <div class="container-fluid">
        <span class="fs-4 text-light">Leaving Earth - Calc</span>
        <span class="game-button-bar">
          <button class="btn btn-primary-outline" type="button" @click="config"><i class="fas fa-gear"></i></button>
          <button class="btn btn-primary-outline" type="button" @click="toggleAudio"><i v-if="audio==true" class="fas fa-volume-high"></i><i v-if="audio==false" class="fas fa-volume-xmark"></i></button>
        </span>
    </div>
  </nav>

  <div class="card">
    <div class="card-body new-game-info" >
      Calculator for <a href="https://boardgamegeek.com/boardgame/173064/leaving-earth" target="_blank">Leaving Earth</a> by Joseph Fatula published by <a href="https://lumenaris.com/product/leaving-earth-base-221-0223/" target="_blank">Lumenaris</a>
    </div> 
  </div>

  <div class="card">
    <div class="card-body new-game-info new-game-buttons" >
       <button class="btn btn-primary" @click="startGame()">Start</button>
    </div> 
  </div>

</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
