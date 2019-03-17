import '@/services/filters';
// import '@/services/properties';
import '@/services/plugins';
import '@/services/registerServiceWorker';
// import '@/services/vuelidate';
// import router from '@/services/router';
import App from './App.vue';
import Vue from 'vue';
import store from '@/services/store';

new Vue({
  // router,
  store,
  render: (h) => h(App),
}).$mount('#app');
