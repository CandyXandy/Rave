<script setup>
// #region Props

const props = defineProps({
  modelValue: {
    type: String,
    required: false,
    default: null,
  },
  default: {
    type: String,
    required: false,
    default: null,
  },
});

// #endregion

// #region Emits

defineEmits(["update:modelValue"]);

// #endregion
</script>

<template>
  <!-- [html-validate-disable-next  input-missing-label] -->
  <select
    class="select"
    :value="props.default && modelValue === null ? props.default : modelValue"
    @input="
      $emit(
        'update:modelValue',
        props.default && $event.target.value === props.default
          ? null
          : $event.target.value
      )
    "
  >
    <slot />
  </select>
</template>

<style lang="scss" scoped>
.select {
  box-sizing: border-box;

  width: 100%;

  appearance: none;

  color: inherit;
  line-height: 1.5;

  background-color: #{$gray-200};
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(33, 37, 41)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-position: center right 0.75rem;
  background-size: 1rem auto;
  background-repeat: no-repeat;

  margin-top: 0.25rem;

  padding: 0.5rem 0.75rem;

  border: none;
  border-radius: 0.5rem;

  outline: none;

  @media (prefers-color-scheme: "dark") {
    background-color: #{$gray-900};
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(248, 249, 250)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  }
}
</style>
