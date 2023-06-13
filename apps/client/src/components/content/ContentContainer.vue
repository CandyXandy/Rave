<script setup>
import BaseDivider from "~/components/base/BaseDivider.vue";
import ContentContainerControls from "./ContentContainerControls.vue";

// #region Props

defineProps({
  split: {
    type: Boolean,
    default: false,
  },
});

// #endregion
</script>

<template>
  <div :class="['container', split && 'container-split']">
    <template v-if="!split">
      <section>
        <div class="scroll">
          <slot />
        </div>

        <ContentContainerControls v-if="$slots['controls']">
          <slot name="controls" />
        </ContentContainerControls>
      </section>
    </template>
    <template v-else>
      <section>
        <div class="scroll">
          <slot name="l" />
        </div>

        <ContentContainerControls v-if="$slots['l-controls']">
          <slot name="l-controls" />
        </ContentContainerControls>
      </section>

      <BaseDivider vertical />

      <section>
        <div class="scroll">
          <slot name="r" />
        </div>

        <ContentContainerControls v-if="$slots['r-controls']">
          <slot name="r-controls" />
        </ContentContainerControls>
      </section>
    </template>
  </div>

  <div class="container-controls" />
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: row;

  height: 100%;

  box-sizing: border-box;

  padding: 0.75rem;

  section {
    position: relative;

    width: 100%;
    height: 100%;

    .scroll {
      height: 100%;

      overflow: scroll;

      scrollbar-width: none;
      -ms-overflow-style: none;

      &::-webkit-scrollbar {
        width: 0;

        background: transparent;
      }
    }
  }
}

.container-split {
  & > div {
    width: 50%;
  }
}
</style>
