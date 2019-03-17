<template>
  <b-col
    cols="12">
    <hr v-if="index >= 1">
    <h6><slot /></h6>

    <b-btn-group v-if="level !== 'MAXED'">
      <b-button
        v-for="amount in [1, 5, 10]"
        :key="`buy-${amount}`"
        size="sm"
        :variant="canAfford(amount) ? 'primary' : 'outline-primary'"
        :disabled="!canAfford(amount)"
        @click="$emit('buyUpgrade', { name: upgrade.name, amount })">
        x{{ amount }} – {{ upgradePrice(amount) | toCurrency }}
      </b-button>
    </b-btn-group>
    <div v-else>
      <b-button
        size="sm"
        variant="light"
        disabled>
        MAXED
      </b-button>
    </div>
  </b-col>
</template>

<script>
export default {
  name: 'Upgrade',
  props: {
    level: {
      type: Number,
      default: 0,
    },
    upgrade: {
      type: Object,
      default: null,
    },
    index: {
      type: Number,
      default: 0,
    },
  },
  methods: {
    canAfford(amount) {
      return this.$parent.money >= this.upgradePrice(amount);
    },

    upgradePrice(amount) {
      let { price, multiplier } = this.upgrade;
      if (amount === 1) {
        multiplier = 1;
      }

      const calculateCost = (price) => price * multiplier;
      // 25 * 1.2 = 30

      // const cost = calculateCost();
      let cost = price;
      let newCost;

      for (let i = 0; i < amount; i++) {
        cost += cost * multiplier;
        // cost += price * ((1 + multiplier) ** amount);
      }

      return Math.round(cost);
    },
  },
};
</script>
