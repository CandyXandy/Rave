<script setup>
import { RouterLink } from "vue-router";

import BaseCard from "~/components/base/BaseCard.vue";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const goToUrl = `/club/${props.id}`;
</script>

<template>
  <BaseCard :heading="props.displayName" :subheading="props.category">
    <div class="wrapper">
      <p class="content">
        {{ props.description }}
      </p>
    </div>
    <RouterLink id="link" :to="goToUrl">
      <div class="goToButton">Go to {{ props.displayName }}</div>
    </RouterLink>
  </BaseCard>
</template>

<style lang="scss" scoped>
.wrapper {
  margin: 0.5em 1em;
}
.content {
  word-wrap: break-word;
  word-break: break-word;
  font-size: 14px;
  width: 100%;
}
.goToButton {
  padding: 4px 0;
  margin: 0.5em;
  background: #{$primary};
  border-radius: 8px;
  text-align: center;
  width: 100%;
  user-select: none;
  font-size: 16px;
}
.goToButton:hover {
  opacity: 50%;
}
.goToButton:active {
  opacity: 100%;
}
#link {
  text-decoration: none;
  color: #{$white};
}
</style>
