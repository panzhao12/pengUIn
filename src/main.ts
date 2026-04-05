import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

import './assets/main.css';

const app = createApp(App);

app.use(createPinia());

app.mount('#app');

// Console logo 🐧
console.log(
  `%c
    .--.
   |o_o |
   |:_/ |
  //   \\ \\
 (|     | )
/'\\_   _/\`\\
\\___)=(___/

   %cHola!%c
`,
  'color: #000; font-family: monospace; font-size: 14px;',
  'color: #000; font-weight: bold; font-size: 18px;',
  'color: #999; font-size: 12px;'
);
