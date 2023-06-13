<script setup>
import { useAttrs } from "vue";

// #region Props

const props = defineProps({
  modelValue: {
    type: [Boolean, Set],
    required: true,
  },
});

const attrs = useAttrs();

// #endregion

// #region Emits

const emit = defineEmits(["update:modelValue"]);

// #endregion

// #region Event Handlers

const handleChange = (event) => {
  emit(
    "update:modelValue",
    typeof props.modelValue === "object"
      ? new Set(
          [...props.modelValue.values(), attrs.value].filter(
            (value) => value !== attrs.value || event.target.checked
          )
        )
      : event.target.checked
  );
};

// #endregion
</script>

<template>
  <!-- [html-validate-disable-next element-required-attributes, input-missing-label] -->
  <input
    class="input"
    :checked="
      typeof modelValue === 'object' ? modelValue.has($attrs.value) : modelValue
    "
    @change="handleChange($event)"
  />
</template>

<style lang="scss" scoped>
.input {
  display: inline-block;

  box-sizing: border-box;

  width: 1.25rem;
  height: 1.25rem;

  appearance: none;

  color: inherit;
  line-height: 1.5;

  background-color: #{$gray-200};

  margin-right: 0.75rem;

  border: none;
  border-radius: 0.25rem;

  outline: none;

  cursor: pointer;

  &:checked {
    background-color: #{$primary};

    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(255, 255, 255)' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");
    background-position: center;
    background-size: 0.75rem auto;
    background-repeat: no-repeat;
  }

  @media (prefers-color-scheme: "dark") {
    background-color: #{$gray-900};
  }
}
</style>
