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
  <component
    :is="$attrs.type === 'textarea' ? 'textarea' : 'input'"
    class="input"
    :value="props.default && modelValue === null ? props.default : modelValue"
    @input="
      $emit(
        'update:modelValue',
        props.default && $event.target.value === props.default
          ? null
          : $event.target.value
      )
    "
  />
</template>

<style lang="scss" scoped>
.input {
  box-sizing: border-box;

  width: 100%;

  color: inherit;
  line-height: 1.5;

  background-color: #{$gray-200};

  margin-top: 0.25rem;

  padding: 0.5rem 0.75rem;

  border: none;
  border-radius: 0.5rem;

  outline: none;

  resize: vertical;

  @media (prefers-color-scheme: "dark") {
    background-color: #{$gray-900};
  }
}
</style>
