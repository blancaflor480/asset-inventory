import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('user', () => {
  const user = ref(null as null | { id: number, email: string, username: string, role: string });
  const token = ref<string | null>(null);

  // Load from storage immediately when store is created
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');
  if (storedUser && storedToken) {
    user.value = JSON.parse(storedUser);
    token.value = storedToken;
  }

  function setUser(userData: any) {
    user.value = userData;
    localStorage.setItem('user', JSON.stringify(userData));
  }

  function setToken(userToken: string) {
    token.value = userToken;
    localStorage.setItem('token', userToken);
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  function loadUserFromStorage() {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      user.value = JSON.parse(storedUser);
      token.value = storedToken;
    }
  }

  return {
    user,
    token,
    setUser,
    setToken,
    logout,
    loadUserFromStorage,
  };
});