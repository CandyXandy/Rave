<template>
  <div class="icon-group">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.icon-group {
  display: flex;
  flex-direction: row;

  position: absolute;
  bottom: 0;
  right: 0;

  :deep(.button) {
    width: 3rem;
    height: 3rem;

    margin-left: 0.5rem;
  }
}
</style>
