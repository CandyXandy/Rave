<template>
  <ul>
    <slot />
  </ul>
</template>

<style lang="scss" scoped>
ul {
  margin: 0;
  padding: 0;

  list-style: none;

  &:deep() li:not(:last-of-type) {
    margin-bottom: 8px;
  }
}
</style>
