<template>
  <div id="app">
    <Game />
  </div>
</template>

<script>
import Game from '@/views/Game';

export default {
  name: 'App',
  components: {Game},
};
</script>

<style lang="scss">
  @import './assets/scss/app';
</style>
