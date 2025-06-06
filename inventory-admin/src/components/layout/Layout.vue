<template>
  <div class="min-h-screen bg-gray-50">
    <nav-bar />
    <div class="flex h-[calc(100vh-64px)]">
      <side-bar class="w-64 flex-shrink-0" />
      <main class="flex-1 overflow-auto p-8">
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import NavBar from './Navbar.vue'
import SideBar from './Sidebar.vue'
</script>