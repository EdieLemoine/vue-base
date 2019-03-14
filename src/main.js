import '@/services/filters';
import '@/services/properties';
import '@/services/registerServiceWorker';
import '@/services/vuelidate';
import router from '@/services/router';
import store from '@/services/store';
import Vue from 'vue';
import App from './App.vue';

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
