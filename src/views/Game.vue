<template>
  <b-container>
    <!--    <b-list-group>-->
    <!--      <b-list-group-item>Value of grid items: {{ baseValue }}</b-list-group-item>-->
    <!--      <b-list-group-item>Total value of grid: {{ baseValue * (grid**2) }}</b-list-group-item>-->
    <!--    </b-list-group>-->
    <!--    <br>-->

    <b-row>
      <b-col>
        <h4>Money: {{ money | toCurrency }}</h4>
      </b-col>
      <b-col>
        <b-btn
          class="float-right"
          :variant="justSaved ? 'outline-primary' : 'primary'"
          @click="saveProgress">
          <template v-if="justSaved">
            Game saved at {{ getTime(savedAt) }}
          </template>
          <template v-else>
            Save game
          </template>
        </b-btn>
      </b-col>
    </b-row>

    <b-row>
      <b-col cols="6">
        <template v-if="activeField">
          <h3>{{ activeField.machineName }}</h3>
          <b-row>
            <upgrade
              v-for="(upgrade, index) in availableUpgrades"
              :key="upgrade.name"
              :upgrade="upgrade"
              :index="index"
              :level="upgrades[upgrade.name]"
              @buyUpgrade="addUpgrade">
              {{ upgrade.displayName.replace('%machineName%', activeField.machineName) }} ({{ upgrades[upgrade.name]
              }}) – {{ text[upgrade.name] }}
            </upgrade>

            <b-col>
              <h2>Prestige</h2>
              <p>Mulch: {{ mulch }}</p>
              <p>Current Value Bonus: {{ valueBonus }}</p>
              <p>Current Growth Bonus: {{ growthBonus }}x</p>
            </b-col>
          </b-row>
        </template>
      </b-col>

      <b-col cols="6">
        <template v-if="activeField">
          <h2>{{ activeField.name }}</h2>
          <i><span class="h5">“</span>{{ activeField.description }}<span class="h5">”</span></i>
        </template>

        <canvas
          ref="canvas"
          :width="width"
          :height="height" />

        <b-row>
          <b-col>
            <b-btn-group v-if="areas.length > 2">
              <b-button
                variant="success"
                :disabled="unlockedFields < 1"
                @click="previous()">
                ◂
              </b-button>
              <b-button
                ref="unlock"
                variant="success"
                @click="unlockNext()">
                Unlock {{ nextField.name }} for ${{ nextField.price }}
              </b-button>
              <b-button
                variant="success"
                @click="next()">
                ▸
              </b-button>
            </b-btn-group>
            <b-button
              ref="prestigeMulch"
              class="float-right"
              variant="info"
              :disabled="nextMulch === 0"
              @click="attemptPrestige()">
              <template />
              Prestige for {{ nextMulch }} mulch
            </b-button>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
/* eslint-disable no-console,max-lines-per-function,max-params,no-magic-numbers,id-length */

import Upgrade from '@/views/Upgrade';

export default {
  name: 'Game',
  components: { Upgrade },

  data() {
    return {
      activeField: null,
      areas: [],
      baseColor: null,
      canvas: null,
      ctx: null,
      currentPosition: 0,
      currentlyPrestiging: false,
      desc: '',
      growthBonus: 0,
      height: 500,
      loadedGame: false,
      maxGrowth: 15,
      money: 500,
      mulch: 0,
      nextMulch: 0,
      savedAt: null,
      superTicks: 0,
      totalMoney: 0,
      totalMowed: 0,
      unlock: '',
      unlockedFields: 0,
      valueBonus: '',
      width: 500,

      defaults: {
        activeField: null,
        areas: [],
        baseColor: null,
        canvas: null,
        ctx: null,
        currentPosition: 0,
        currentlyPrestiging: false,
        desc: '',
        growthBonus: 0,
        height: 500,
        loadedGame: false,
        maxGrowth: 15,
        money: 500,
        mulch: 0,
        nextMulch: 0,
        savedAt: null,
        superTicks: 0,
        totalMoney: 0,
        totalMowed: 0,
        unlock: '',
        unlockedFields: 0,
        valueBonus: '',
        width: 500,
      },

      tileSizes: [50, 25, 20, 10, 5, 4, 2, 1],
      upgrades: {
        growthRate: 1,
        machineSize: 1,
        machineSpeed: 1,
        tickRate: 1,
        tileSize: 1,
      },
      multipliers: {
        growthRate: 1.2,
        mowerRate: 2.5,
        mowerSize: 1.5,
        tickRate: 1.2,
        tileSize: 3.5,
      },
      prices: {
        growth: 10,
        size: 75,
        speed: 50,
        tick: 5,
        tile: 150,
      },
      text: {
        growthRate: '',
        machineSize: '',
        machineSpeed: '',
        tickRate: '',
        tileSize: '',
      },
    };
  },

  computed: {
    justSaved() {
      if (!this.savedAt) {
        return false;
      }

      return this.getTime(new Date(this.savedAt)) === this.getTime(new Date());
    },

    availableUpgrades() {
      if (!this.activeField) {
        return;
      }

      const { upgrades } = this.activeField;
      return upgrades.reverse();
    },

    nextField() {
      return this.areas[this.unlockedFields + 1];
    },
  },

  async mounted() {
    await this.loadSavedGame();
    this.setup();
  },

  methods: {

    saveProgress() {
      const {
        activeField,
        areas,
        canvas,
        text,
        ctx,
        height,
        multipliers,
        prices,
        tileSizes,
        width,
        ...save
      } = this.$data;

      const saveData = {
        ...save,
      };

      localStorage.savedGame = JSON.stringify(saveData);
      this.savedAt = new Date();
    },

    getTime(date) {
      return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    },

    loadSavedGame() {
      if (!localStorage.savedGame) {
        return;
      }

      const savedGame = JSON.parse(localStorage.savedGame);

      for (const item in savedGame) {
        this.$data[item] = savedGame[item];
      }

      this.loadedGame = true;
    },

    addUpgrade(atts) {
      const { name, amount } = atts;
      for (let i = 0; i < amount; i++) {
        this.getUpgrade(this.activeField, name).buyUpgrade();
      }
    },

    updateTile(field, x, y) {
      const vm = this;
      const ratio = field.field[x][y] / this.maxGrowth;

      const { baseColor, grownColor, tileSize } = field;
      const [baseRed, baseGreen, baseBlue] = baseColor;
      const [grownRed, grownGreen, grownBlue] = grownColor;

      const red = baseRed + Math.round(ratio * (grownRed - baseRed));
      const green = baseGreen + Math.round(ratio * (grownGreen - baseGreen));
      const blue = baseBlue + Math.round(ratio * (grownBlue - baseBlue));

      vm.ctx.fillStyle = `rgb(${red},${green},${blue})`;
      vm.ctx.fillRect(
        x * vm.tileSizes[tileSize],
        y * vm.tileSizes[tileSize],
        vm.tileSizes[tileSize],
        vm.tileSizes[tileSize]
      );
    },

    newArea(attributes) {
      const vm = this;
      const { initialBuff, multiplierBuff } = attributes;
      const upgrades = [
        vm.newUpgrade({
          name: 'machineSpeed',
          price: vm.prices.speed * initialBuff,
          multiplier: vm.multipliers.mowerRate + multiplierBuff,
          onBuy: () => {
            vm.activeField.machineSpeed++;
          },
          displayText: '%tpt% tiles/tick',
          displayName: '%machineName% Speed',
          canBuy: () => vm.activeField.machineSpeed < 20,
        }),

        vm.newUpgrade({
          name: 'machineSize',
          price: vm.prices.size * initialBuff,
          multiplier: vm.multipliers.mowerSize + multiplierBuff,
          onBuy: () => {
            if (vm.activeField.machineWidth === vm.activeField.machineHeight) {
              vm.activeField.machineWidth++;
            } else {
              vm.activeField.machineHeight++;
            }
            vm.activeField.machineX = 0;
            vm.activeField.machineY = 0;
          },
          displayText: '%w%x%h%',
          displayName: '%machineName% Size',
          canBuy: () => {
            const { tileSize, machineHeight } = vm.activeField;
            return machineHeight < vm.height / vm.tileSizes[tileSize];
          },
        }),

        vm.newUpgrade({
          name: 'tileSize',
          price: vm.prices.tile * initialBuff,
          multiplier: vm.multipliers.tileSize + multiplierBuff,
          onBuy: () => {
            vm.activeField.tileSize = Math.min(vm.activeField.tileSize + 1, vm.tileSizes.length - 1);
            vm.activeField.regenerate();
          },
          displayText: '%sz%x%sz%',
          displayName: 'Tile Size',
          canBuy: () => vm.activeField.tileSize < vm.tileSizes.length - 1,
        }),

        vm.newUpgrade({
          name: 'growthRate',
          price: vm.prices.growth * initialBuff,
          multiplier: vm.multipliers.growthRate + multiplierBuff,
          onBuy: () => {
            vm.activeField.growthAmount += 2;
          },
          displayText: '%gr% growth/tick',
          displayName: 'Growth Rate',
          canBuy: () => vm.activeField.growthAmount < 100,
        }),

        vm.newUpgrade({
          name: 'tickRate',
          price: vm.prices.tick * initialBuff,
          multiplier: vm.multipliers.tickRate + multiplierBuff,
          onBuy: () => {
            vm.activeField.tickRate = Math.max(1, Math.floor(vm.activeField.tickRate * 0.9));
          },
          displayText: '%ms% ms',
          displayName: 'Tick Rate',
          canBuy: () => vm.activeField.tickRate > 5,
        }),
      ];

      let defaults = {};

      if (!this.loadedGame) {
        const { totalMowed, superTicks } = this.defaults;

        defaults = {
          superTicks,
          totalMowed,
          growthAmount: 4,
          machineHeight: 1,
          machineSpeed: 1,
          machineWidth: 1,
          tickRate: 1000,
          tileSize: 0,
        };
      } else {
        const {
          growthAmount,
          machineHeight,
          machineSpeed,
          machineWidth,
          tickRate,
          tileSize,
        } = this.activeField;

        defaults = {
          growthAmount,
          machineHeight,
          machineSpeed,
          machineWidth,
          tickRate,
          tileSize,
        };
      }

      return {
        ...attributes,
        upgrades,
        field: [],
        lastTick: null,
        machineGoingUp: false,
        machineX: 0,
        machineY: 0,
        superExtra: 0,
        superTicks: 0,
        totalMowed: 0,
        ...defaults,

        generateField() {
          for (let i = 0; i < vm.width / vm.tileSizes[this.tileSize]; i++) {
            this.field.push([]);

            for (let j = 0; j < vm.height / vm.tileSizes[this.tileSize]; j++) {

              const number = Math.floor(Math.random() * vm.maxGrowth);
              this.field[i].push(number);
              vm.updateTile(this, i, j);
            }
          }
          this.lastTick = +new Date();
        },

        unlockField() {
          if (vm.money >= this.unlockPrice) {
            vm.money -= this.unlockPrice;
            this.unlockedFields++;
            this.currentPosition = this.unlockedFields - 1;
            vm.activeField = this;
            this.generateField();
            vm.tick(this);
          }
        },

        getUpgradeText(upgrade) {
          return upgrade.displayText
            .replace('%tpt%', this.machineSpeed)
            .replace('%w%', this.machineWidth)
            .replace('%h%', this.machineHeight)
            .replace(/%sz%/g, vm.width / vm.tileSizes[this.tileSize])
            .replace('%ms%', this.tickRate)
            .replace('%machineName%', this.machineName)
            .replace('%gr%', this.growthAmount);
        },

        regenerate() {
          this.field = [];
          this.generateField();
        },

        machineTick() {
          const currentTime = +new Date();
          const timeDifference = currentTime - this.lastTick;
          this.lastTick = currentTime;
          this.superExtra += timeDifference - this.tickRate;

          if (this.superExtra > this.tickRate * 5) {
            this.superTicks += Math.floor(this.superExtra / 5 / this.tickRate);
            this.superExtra %= this.tickRate * 5;
          }

          for (let i = 0; i < this.machineSpeed; i++) {
            const cX = this.machineX;
            const cY = this.machineY;

            for (let x = 0; x < this.machineWidth; x++) {

              for (let y = 0; y < this.machineHeight; y++) {
                const tX = x + cX;
                const tY = y + cY;

                if (this.field[tX][tY] >= 5) {
                  this.field[tX][tY] = 0;
                  vm.money += this.value * (this.superTicks > 0 ? 5 : 1) * (1 + (vm.mulch / 100));
                  this.totalMoney += this.value * (this.superTicks > 0 ? 5 : 1) * (1 + (vm.mulch / 100));
                  this.superTicks = Math.max(0, this.superTicks - 1);
                  this.totalMowed++;
                }

                if (vm.activeField === this) {
                  vm.updateTile(this, tX, tY);
                }
              }
            }

            // if (vm.activeField === this) {
            //   this.totalMowed = this.message + this.totalMowed;
            // }

            vm.updateMoney();

            if (this.machineGoingUp) {
              if (this.machineY > 0) {
                this.machineY--;
              } else if (this.machineX >= (vm.width / vm.tileSizes[this.tileSize]) - this.machineWidth) {
                this.machineGoingUp = false;
                this.machineX = 0;
                this.machineY = 0;
              } else {
                this.machineX = Math.min(
                  this.machineX + this.machineWidth,
                  (vm.width / vm.tileSizes[this.tileSize]) - this.machineWidth
                );
                this.machineGoingUp = false;
              }
            } else if (this.machineY < (vm.height / vm.tileSizes[this.tileSize]) - this.machineHeight) {
              this.machineY++;
            } else if (this.machineX >= (vm.width / vm.tileSizes[this.tileSize]) - this.machineWidth) {
              this.machineGoingUp = false;
              this.machineX = 0;
              this.machineY = 0;
            } else {
              this.machineX
                  = Math.min(this.machineX + this.machineWidth,
                  (vm.width / vm.tileSizes[this.tileSize]) - this.machineWidth);
              this.machineGoingUp = true;
            }

            const updateTile = (tile) => {
              const { machineHeight, tileSize, machineY, machineX, machineColor, machineWidth } = tile;
              vm.ctx.fillStyle = machineColor;
              vm.ctx.fillRect(
                machineX * vm.tileSizes[tileSize],
                machineY * vm.tileSizes[tileSize],
                vm.tileSizes[tileSize] * machineWidth,
                vm.tileSizes[tileSize] * machineHeight
              );
              vm.ctx.fillStyle = null;
            };

            if (vm.activeField === this) {
              updateTile(this);
            }
          }
        },

        growthTick() {
          const x = Math.floor(Math.random() * vm.width / vm.tileSizes[this.tileSize]);
          const y = Math.floor(Math.random() * vm.height / vm.tileSizes[this.tileSize]);

          if (this.field[x][y] < vm.maxGrowth) {
            this.field[x][y] = Math.min(vm.maxGrowth, this.field[x][y] + 1 + vm.growthBonus);
          }

          if (vm.activeField === this) {

            vm.updateTile(this, x, y);
          }
        },
      };
    },

    newUpgrade(upgrade) {
      const vm = this;
      return {
        ...upgrade,
        buyUpgrade() {
          if (upgrade.canBuy() && vm.money >= this.price) {
            vm.money -= this.price;
            upgrade.onBuy();
            this.price = Math.round(this.price * this.multiplier);
            vm.upgrades[upgrade.name]++;
            vm.updateText();
            vm.updateMoney();
          }
        },
      };
    },

    updatePrestigeValues() {
      this.calculateGrowthBonus();
      this.nextMulch
        = Math.floor(Math.max(0, Math.pow(Math.max(0, (this.totalMoney / 10) - 7500), 0.575) - this.mulch));
      // this.mulch = `Mulch: ${this.mulch}`;
      this.valueBonus = this.mulch;
      this.growthBonus++;
    },

    calculateGrowthBonus() {
      this.growthBonus = Math.floor(Math.log(Math.max(1, this.mulch)) / Math.log(15));
    },

    attemptPrestige() {
      if (this.nextMulch > 0) {
        this.currentlyPrestiging = true;
        setTimeout(this.reset, 2000);
      }
    },

    reset() {
      const vm = this;
      vm.mulch += vm.nextMulch;
      vm.money = 0;
      vm.totalMoney = 0;

      vm.areas = [];
      vm.addFields();
      vm.activeField = vm.areas[0];
      vm.activeField.generateField();
      vm.ctx.fillStyle = 'green';
      vm.currentPosition = 0;
      vm.unlockedFields = 1;
      vm.currentlyPrestiging = false;
      vm.tick(vm.activeField);
      vm.updateText(vm.activeField);
    },

    getField(name) {
      for (let i = 0; i < this.areas.length; i++) {
        if (this.areas[i].name === name) {
          return this.areas[i];
        }
      }
      return this.areas[0];
    },

    getUpgrade(field, name) {
      for (let i = 0; i < field.upgrades.length; i++) {
        if (field.upgrades[i].name === name) {
          return field.upgrades[i];
        }
      }
      return field.upgrades[0];
    },

    next() {
      const vm = this;
      if (vm.currentPosition < vm.unlockedFields - 1) {
        vm.currentPosition++;
        vm.activeField = vm.areas[vm.currentPosition];
        vm.updateText();
        for (let x = 0; x < vm.activeField.field.length; x++) {
          for (let y = 0; y < vm.activeField.field[0].length; y++) {
            vm.updateTile(vm.activeField, x, y);
          }
        }
      }
      vm.desc = vm.activeField.description;
    },

    previous() {
      const vm = this;
      if (vm.currentPosition > 0) {
        vm.currentPosition--;
        vm.activeField = vm.areas[vm.currentPosition];
        vm.updateText();
        for (let x = 0; x < vm.activeField.field.length; x++) {
          for (let y = 0; y < vm.activeField.field[0].length; y++) {
            vm.updateTile(vm.activeField, x, y);
          }
        }
      }
      vm.desc = vm.activeField.description;
    },

    unlockNext() {
      const vm = this;
      if (vm.unlockedFields < vm.areas.length) {
        vm.areas[vm.unlockedFields].unlockField();
        if (vm.unlockedFields === vm.areas.length) {
          vm.unlock = 'All Fields Unlocked';
        } else {
          vm.unlock = `Unlock ${vm.areas[vm.unlockedFields].name} Field for $${vm.areas[vm.unlockedFields].unlockPrice}`;
        }
        vm.updateText();

      }
      vm.desc = vm.activeField.description;
    },

    updateText() {
      const vm = this;
      const field = vm.activeField;
      // const { name } = field;
      const { totalMowed, machineName } = vm.activeField;
      for (let i = 0; i < field.upgrades.length; i++) {

        const upgrade = field.upgrades[i];

        // vm.upgrades[upgrade.name]
        //     = upgrade.canBuy() ? `Upgrade ${upgrade.displayName
        //     .replace('%machineName%', machineName)} - $${upgrade.price}` : 'MAXED';

        vm.text[upgrade.name] = field.getUpgradeText(upgrade);
      }
      vm.totalMowed = totalMowed;
    },

    tick(field) {
      const vm = this;
      for (let i = 0; i < field.growthAmount; i++) {
        field.growthTick();
      }

      field.machineTick();
      if (!vm.currentlyPrestiging) {
        setTimeout(() => {
          vm.tick(field);
        }, field.tickRate);
      }
    },

    updateMoney() {
      const vm = this;

      // vm.money = Math.floor(vm.money);
      if (vm.activeField.superTicks > 0) {
        vm.superTicks = `Super Ticks: ${vm.activeField.superTicks}`;
      } else {
        vm.superTicks = '';
      }
    },

    addFields() {
      this.areas.push(this.newArea({
        name: 'Grass',
        multiplierBuff: 0,
        initialBuff: 1,
        baseColor: [0, 210, 0],
        grownColor: [0, 130, 0],
        machineColor: 'rgb(255,0,0)',
        unlockPrice: 0,
        message: 'Total Grass Mowed: ',
        value: 1,
        machineName: 'Lawnmower',
        description: 'Wow this lawn grows fast.',
      }));

      this.areas.push(this.newArea({
        name: 'Dirt',
        multiplierBuff: 0.15,
        initialBuff: 10,
        baseColor: [175, 175, 175],
        grownColor: [122, 96, 0],
        machineColor: 'rgb(68, 130, 206)',
        unlockPrice: 100000,
        message: 'Total Dirt Vacuumed: ',
        value: 5,
        machineName: 'Vacuum',
        description: 'Vroom, vroom',
      }));

      this.areas.push(this.newArea({
        name: 'Weed',
        multiplierBuff: 0.25,
        initialBuff: 50,
        baseColor: [239, 233, 112],
        grownColor: [145, 233, 124],
        machineColor: 'rgb(255,127,0)',
        unlockPrice: 1000000,
        message: 'Total Weeds Whacked: ',
        value: 20,
        machineName: 'Weed Whacker',
        description: 'Good thing you don\'t need to keep replacing the trimming stuff.',
      }));

      this.areas.push(this.newArea({
        name: 'Pumpkin',
        multiplierBuff: 0.35,
        initialBuff: 100,
        baseColor: [181, 155, 105],
        grownColor: [255, 188, 61],
        machineColor: 'rgb(119, 119, 119)',
        unlockPrice: 10000000,
        message: 'Total Pumpkins Thwacked: ',
        value: 50,
        machineName: 'Harvester',
        description: 'For when you can\'t find the hippogriff.',
      }));

      this.areas.push(this.newArea({
        name: 'Tree',
        multiplierBuff: 0.45,
        initialBuff: 500,
        baseColor: [122, 81, 0],
        grownColor: [54, 109, 0],
        machineColor: 'rgb(97, 175, 191)',
        unlockPrice: 100000000,
        message: 'Total Trees Chopped: ',
        value: 100,
        machineName: 'Chainsaw',
        description: 'No, it\'s only for trees.',
      }));

      this.areas.push(this.newArea({
        name: 'Fire',
        multiplierBuff: 0.55,
        initialBuff: 1000,
        baseColor: [255, 0, 0],
        grownColor: [255, 255, 0],
        machineColor: 'rgb(0,0,255)',
        unlockPrice: 1000000000,
        message: 'Total Fires Extinguished: ',
        value: 200,
        machineName: 'Wave',
        description: 'I\'m impressed that you know how to create a wave out of thin air.',
      }));

      this.areas.push(this.newArea({
        name: 'Stone',
        multiplierBuff: 0.65,
        initialBuff: 5000,
        baseColor: [255, 255, 255],
        grownColor: [124, 124, 124],
        machineColor: 'rgb(122, 73, 33)',
        unlockPrice: 10000000000,
        message: 'Total Stone Mined: ',
        value: 500,
        machineName: 'Wooden Pickaxe',
        description: 'I swear this one\'s not a reference to anything.',
      }));

      this.areas.push(this.newArea({
        name: 'Iron',
        multiplierBuff: 0.75,
        initialBuff: 10000,
        baseColor: [124, 124, 124],
        grownColor: [221, 206, 193],
        machineColor: 'rgb(100, 100, 100)',
        unlockPrice: 100000000000,
        message: 'Total Iron Mined: ',
        value: 1000,
        machineName: 'Stone Pickaxe',
        description: 'Nor is this one.',
      }));

      this.areas.push(this.newArea({
        name: 'Diamond',
        multiplierBuff: 0.85,
        initialBuff: 50000,
        baseColor: [124, 124, 124],
        grownColor: [124, 239, 228],
        machineColor: 'rgb(221, 206, 193)',
        unlockPrice: 1000000000000,
        message: 'Total Diamonds Mined: ',
        value: 2000,
        machineName: 'Iron Pickaxe',
        description: 'Ok - last one I swear.',
      }));

      this.areas.push(this.newArea({
        name: 'Gold',
        multiplierBuff: 0.95,
        initialBuff: 100000,
        baseColor: [138, 202, 216],
        grownColor: [211, 176, 0],
        machineColor: 'rgb(143, 158, 139)',
        unlockPrice: 10000000000000,
        message: 'Total Gold Panned: ',
        value: 5000,
        machineName: 'Pan',
        description: 'There\'s no rush ;)',
      }));

      this.areas.push(this.newArea({
        name: 'People',
        multiplierBuff: 0.65,
        initialBuff: 5000,
        baseColor: [255, 67, 50],
        grownColor: [255, 211, 168],
        machineColor: 'rgb(100, 100, 100)',
        unlockPrice: 100000000000000,
        message: 'Total People Killed: ',
        value: 10000,
        machineName: 'Terminator',
        description: 'I\'ll be back',
      }));
    },

    setup() {
      this.canvas = this.$refs.canvas;
      this.ctx = this.canvas.getContext('2d');
      this.ctx.fillStyle = 'green';

      this.addFields();
      this.activeField = this.areas[0];
      this.activeField.generateField();
      this.tick(this.activeField);
      this.updateText(this.activeField);
      setInterval(this.updatePrestigeValues, 500);
    },
  },
};
</script>

<style scoped lang="scss">
  @import '../assets/scss/game';
</style>
