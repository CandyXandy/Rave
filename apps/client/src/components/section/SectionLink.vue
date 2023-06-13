<script setup>
import BaseLink from "~/components/base/BaseLink.vue";

// #region Props

const props = defineProps({
  variant: {
    type: String,
    validator(value) {
      return ["success", "danger"].includes(value);
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
    <BaseLink
      v-if="$attrs.to"
      v-bind="$attrs"
      :class="['section-link', props.variant && `section-link-${variant}`]"
    >
      <slot name="icon" />
      <slot />
    </BaseLink>
    <button
      v-else
      type="button"
      v-bind="$attrs"
      :class="['section-link', props.variant && `section-link-${variant}`]"
    >
      <slot name="icon" />
      <slot />
    </button>
  </li>
</template>

<style lang="scss" scoped>
.section-link {
  display: flex;
  justify-content: start;
  align-items: center;

  box-sizing: border-box;

  width: 216px;

  color: inherit;
  text-decoration: none;

  background-color: transparent;

  padding: 12px;

  border: none;
  border-radius: 8px;

  cursor: pointer;

  &:hover {
    color: inherit;
  }

  &.router-link-exact-active:not([data-match-query]),
  &.router-link-query-active,
  &:hover {
    background-color: #{$gray-200};

    @media (prefers-color-scheme: "dark") {
      background-color: #{$gray-800};
    }
  }

  :deep(.lucide) {
    margin-right: 0.75rem;
  }
}

.section-link-success,
.section-link-success:hover {
  color: #{$success};
}

.section-link-danger,
.section-link-danger:hover {
  color: #{$danger};
}
</style>
