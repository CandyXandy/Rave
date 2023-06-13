<script setup>
import { computed } from "vue";

import abbreviate from "~/lib/abbreviate";

// #region Constants

const VARIANTS = ["primary", "success", "info", "warning", "danger"];

// #endregion

// #region Props

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
});

// #endregion

// #region State

const variant = computed(() =>
  VARIANTS.at(
    [...props.name].reduce((sum, char) => sum + char.charCodeAt(0), 0) %
      VARIANTS.length
  )
);

// #endregion
</script>

<template>
  <div :class="['avatar', `avatar-${variant}`]">
    {{ abbreviate(name) }}
  </div>
</template>

<style lang="scss" scoped>
.avatar {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 48px;
  height: 48px;

  color: #{$white};

  border-radius: 24px;

  &.avatar-primary {
    background-color: #{$primary};
  }

  &.avatar-success {
    background-color: #{$success};
  }

  &.avatar-info {
    color: #{$gray-900};

    background-color: #{$info};
  }

  &.avatar-warning {
    color: #{$gray-900};

    background-color: #{$warning};
  }

  &.avatar-danger {
    background-color: #{$danger};
  }
}
</style>
