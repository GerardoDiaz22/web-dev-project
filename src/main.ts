import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';

import './assets/main.css';
import 'flowbite/dist/flowbite.min.css'; 

import App from './App.vue';

import Home from './views/Home.vue';
import Login from './views/Login.vue';
import Register from './views/Register.vue';
import Student from './views/Student.vue';
import Playground from './views/Playground.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/students', component: Student },

    // { path: 'students', component: Students, meta: { requiresAuth: true } },
    { path: '/playground', component: Playground },
  ],
});

const getCurrentUser = () =>
  new Promise((resolve) => {
    const removeListener = onAuthStateChanged(getAuth(), (user) => {
      removeListener();
      resolve(user);
    });
  });

router.beforeEach(async (to, from, next) => {
  const currentUser = await getCurrentUser();

  if (to.matched.some((record) => record.meta.requiresAuth) && !currentUser) {
    next({ path: '/login' });
  } else if ((to.path === '/login' || to.path === '/register') && currentUser) {
    next({ path: '/' });
  } else {
    next();
  }
});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};

initializeApp(firebaseConfig);

const app = createApp(App);
app.use(router);
app.mount('#app');
