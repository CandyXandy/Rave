<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";

// #region Routing

const router = useRouter();

// #endregion

// #region Lifecycle Hooks

onMounted(async () => {
  await fetch("/api/session", { method: "DELETE" });

  await router.push({ name: "feed", query: { invalidate: true } });
});

// #endregion
</script>

<template>
  <h1>Logging you out!</h1>
  <p>This shouldn't take too long.</p>
</template>
