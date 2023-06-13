<script setup>
import { useRoute } from "vue-router";
import { onMounted, ref } from "vue";

import ClubCard from "~/components/card/ClubCard.vue";
import ContentContainer from "~/components/content/ContentContainer.vue";

// #region Routing

const route = useRoute();

// #endregion

// #region State

const clubs = ref([]);

// #endregion

// #region  Helpers

const getData = async () => {
  const data = await fetch(`/api/club`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => response.json());

  clubs.value = data;
};

// #endregion

// #region Lifecycle Hooks

onMounted(async () => {
  await getData();
});

// #endregion
</script>

<template>
  <ContentContainer>
    <ClubCard
      v-for="club of clubs.filter((club) =>
        route.query.category ? club.category === route.query.category : true
      )"
      :key="club.id"
      v-bind="club"
    />
  </ContentContainer>
</template>
