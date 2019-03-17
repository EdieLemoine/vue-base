<template>
  <span
    class="grid-item"
    :style="{
      backgroundColor: gridItemColor(value),
    }"
    @mouseover="mutableValue = 1" />
</template>
<script>
/* eslint-disable no-console */
import Color from 'color';

const randomAmount = (min, max) => {
  const range = (max - min);
  return (Math.random() * range) + min;
};

export default {
  name: 'GridItem',
  props: {
    value: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      mutableValue: this.value,
    }
  },
  computed: {
    gridItemValue() {
      return this.mutableValue;
    },
  },
  methods: {
    tick() {
      if (this.mutableValue < 5) {
        this.mutableValue = this.mutableValue + randomAmount(0.01, 0.25);
      }
    },
    gridItemColor() {
    let baseColor = Color('#697d49')
      .saturate(randomAmount(0.01, 0.1) * this.gridItemValue)
      .darken(randomAmount(0.01, 0.1) * this.gridItemValue);

    let color = baseColor.darken(.1 * this.gridItemValue);
    color = color.saturate(.1 * this.gridItemValue);
    // color = color.saturate(randomAmount(0.0001, 0.001) * this.gridItemValue);
    // this.gridItemValue

    return color;
  },
}
};
</script>

<style scoped lang="scss">

</style>
