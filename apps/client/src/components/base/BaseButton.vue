<script setup>
// #region Props

const props = defineProps({
  circle: {
    type: Boolean,
  },
  variant: {
    type: String,
    validator(value) {
      return ["primary", "success", "danger"].includes(value);
    },
    required: true,
  },
});

// #endregion
</script>

<template>
  <!-- [html-validate-disable-next element-required-attributes] -->
  <button
    :class="[
      'button',
      props.circle && 'button-circle',
      `button-${props.variant}`,
    ]"
  >
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.button {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  width: 100%;

  background-color: transparent;

  padding: 8px;

  border: none;
  border-radius: 8px;

  cursor: pointer;

  &.button-circle {
    border-radius: 50%;
  }

  &.button-primary {
    color: #{$white};

    background-color: #{$primary};

    &:hover {
      background-color: #{mix($black, $primary, 15%)};
    }
  }

  &.button-success {
    color: #{$white};

    background-color: #{$success};

    &:hover {
      background-color: #{mix($black, $success, 15%)};
    }
  }

  &.button-danger {
    color: #{$white};

    background-color: #{$danger};

    &:hover {
      background-color: #{mix($black, $danger, 15%)};
    }
  }
}
</style>
