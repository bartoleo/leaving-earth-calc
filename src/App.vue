
<script setup>
import { ref, defineProps, onMounted, computed } from 'vue';
import { store } from './store.js';
import NewGame from './components/NewGame.vue';
import Game from './components/Game.vue';
import Config from './components/Config.vue';
import NotFound from './components/NotFound.vue';

const routes = {
  '/': NewGame,
  '/game': Game,
  '/config': Config,
  //'/about': About,
};

const currentPath = ref('');

const currentView = computed(() => {
  return routes[currentPath.value.slice(1) || '/'] || NotFound;
});

onMounted(() => {

  if (!store.initialized){
    store.load();
  }

  if (store.mass != 0) {
    window.location.hash = '/game';
  } else {
    window.location.hash = '/';
  }

  if (window.location.search.indexOf("debug")>=0){
    document.getElementById("app").classList.add('debugEnabled');
  }

  currentPath.value = window.location.hash;
  window.addEventListener('hashchange', () => {
    document.getElementById("app").classList.remove('page-fade-in');
    document.getElementById("app").classList.add('page-fade-out');
    setTimeout(function(){
      document.getElementById("app").classList.remove('page-fade-out');
      document.getElementById("app").classList.add('page-fade-in');
      currentPath.value = window.location.hash;
    }, 300);
  });
});
</script>

<template>
<component :is="currentView" />
</template>

<style scoped></style>
