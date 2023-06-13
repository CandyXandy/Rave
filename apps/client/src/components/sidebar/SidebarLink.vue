<script setup>
import BaseLink from "~/components/base/BaseLink.vue";

// #region Props

const props = defineProps({
  variant: {
    type: String,
    validator(value) {
      return ["primary", "success", "wrapper"].includes(value);
    },
    default: null,
  },
});

// #endregion
</script>

<script>
export default {
  inheritAttrs: false,
};
</script>

<template>
  <li>
    <BaseLink :class="props.variant" v-bind="$attrs">
      <slot />
    </BaseLink>
  </li>
</template>

<style lang="scss" scoped>
a {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 48px;
  height: 48px;

  color: inherit;
  text-decoration: none;

  background-color: #{$gray-100};

  border-radius: 24px;

  @media (prefers-color-scheme: "dark") {
    background-color: #{mix($gray-800, $gray-900, 50%)};
  }

  &:hover {
    color: inherit;
  }

  &.primary {
    color: #{$primary};
  }

  &.success {
    color: #{$success};
  }

  &.wrapper {
    :deep(.avatar) {
      border-radius: 24px;
    }
  }

  &.router-link-active,
  &:hover {
    border-radius: 16px;

    &.primary {
      color: #{$gray-100};

      background-color: #{$primary};
    }

    &.success {
      color: #{$white};

      background-color: #{$success};
    }

    &.wrapper {
      :deep(.avatar) {
        border-radius: 16px;
      }
    }
  }
}
</style>
