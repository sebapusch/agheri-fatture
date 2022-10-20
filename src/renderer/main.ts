import { createApp } from 'vue';
import './scss/custom.scss';
import App from './App.vue';
import Toast from 'vue-toastification';

const app = createApp(App);

app.use(Toast, {});
app.mount('#app');

