import Vue from 'vue';
import capitalize from './capitalize';
import toCurrency from './toCurrency';

Vue.filter('capitalize', capitalize);
Vue.filter('toCurrency', toCurrency);
