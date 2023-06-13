<script setup>
// #region Props

const props = defineProps({
  vertical: {
    type: Boolean,
    default: false,
  },
});

// #endregion
</script>

<template>
  <hr :class="['divider', props.vertical && 'divider-vertical']" />
</template>

<style lang="scss" scoped>
.divider {
  background-color: #{$gray-300};

  border: 0;

  @media (prefers-color-scheme: "dark") {
    background-color: #{$gray-700};
  }

  &:not(.divider-vertical) {
    height: 2px;

    margin: 0.75rem auto;
  }

  &.divider-vertical {
    width: 2px;
    height: 100%;

    margin: auto 0.75rem;
  }
}
</style>
