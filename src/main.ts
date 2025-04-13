import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import Toast from 'vue-toastification' 
import 'vue-toastification/dist/index.css'

import './assets/main.css';
import 'flowbite/dist/flowbite.min.css'; 

import App from './App.vue';

import Home from './views/Home.vue';
import Login from './views/Login.vue';
import Register from './views/Register.vue';
import Student from './views/Student.vue';
import Playground from './views/Playground.vue';
import Grade from './views/Grade.vue';
import Course from './views/Course.vue';
import Enrollment from './views/Enrollment.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/students', component: Student },
    { path: '/grades', component: Grade },
    { path: '/courses', component: Course },
    { path: '/enrollments', component: Enrollment },

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
  console.log("esto es currentuser",currentUser)


  if ((to.path === '/') && !currentUser) {
    next({ path: '/login' });
  } else if ((to.path === '/login' || to.path === '/register') && currentUser) {
    next({ path: '/' });
  } else {
    console.log("here")
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

const options = {
  position: "top-right", // Posición común para toasts
  timeout: 4000,         // Duración en ms (4 segundos)
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false
};

app.use(Toast, options)

app.use(router);
app.mount('#app');
