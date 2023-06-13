<script setup>
import { computed } from "vue";
import { RouterLink, useLink, useRoute } from "vue-router";

import { includes, omit } from "~/lib";

// #region Props

const props = defineProps({
  ...RouterLink.props,
  matchQuery: Boolean,
});

// #endregion

// #region Route

const route = useRoute();
const link = useLink(props);

// #endregion

// #region State

const isQueryActive = computed(
  () =>
    props.matchQuery &&
    link.isExactActive.value &&
    (Object.keys(link.route.value.query).length === 0
      ? Object.keys(route.query).length === 0
      : includes(route.query, link.route.value.query))
);

// #endregion
</script>

<template>
  <RouterLink
    :class="{
      'router-link-query-active': isQueryActive,
    }"
    :data-match-query="matchQuery ? '' : undefined"
    v-bind="omit(props, 'matchQuery')"
  >
    <slot />
  </RouterLink>
</template>

<style lang="scss" scoped>
a {
  color: #{$primary};
  text-decoration: none;

  &:hover {
    color: #{mix($black, $primary, 15%)};
  }
}
</style>
