import { ref, onMounted } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';

const currentUser = ref<User | null>(null);

export function localAuth() {
  const auth = getAuth();

  onMounted(() => {
    onAuthStateChanged(auth, (user) => {
      currentUser.value = user;
    });
  });

  return { currentUser };
}
