<template>
  <label class="label">
    <slot />
  </label>
</template>

<style lang="scss" scoped>
.label {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;

  width: 100%;

  text-align: left;

  margin-bottom: 0.75rem;
}
</style>
