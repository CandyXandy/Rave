<script setup>
import { RouterView } from "vue-router";
import { onMounted } from "vue";

import session from "~/stores/session";

// #region Lifecycle Hooks

onMounted(async () => {
  await session.invalidate();
});

// #endregion
</script>

<template>
  <RouterView v-slot="{ Component }" name="sidebar">
    <nav v-if="Component" id="sidebar">
      <component :is="Component" />
    </nav>
  </RouterView>

  <RouterView v-slot="{ Component }" name="section">
    <nav v-if="Component" id="section">
      <component :is="Component" />
    </nav>
  </RouterView>

  <RouterView v-slot="{ Component }" name="content">
    <main v-if="Component" id="content">
      <component :is="Component" />
    </main>
  </RouterView>
</template>

<style lang="scss">
body {
  display: flex;
  flex-direction: row;

  color: #{$gray-900};

  background-color: #{$white};

  overflow: hidden;

  @media (prefers-color-scheme: "dark") {
    color: #{$gray-100};

    background-color: #{$gray-800};
  }
}
</style>

<style lang="scss" scoped>
nav {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

  flex: 0 0 auto;

  box-sizing: border-box;

  height: 100vh;

  padding-top: 12px;
  padding-bottom: 12px;

  overflow: scroll;

  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    width: 0;

    background: transparent;
  }
}

#sidebar {
  width: 72px;

  background-color: #{$gray-200};

  @media (prefers-color-scheme: "dark") {
    background-color: #{$gray-900};
  }
}

#section {
  width: 240px;

  background-color: #{$gray-100};

  @media (prefers-color-scheme: "dark") {
    background-color: #{mix($gray-800, $gray-900, 50%)};
  }
}

#content {
  width: 100%;
  height: 100vh;
}
</style>
