<script setup>
import session from "~/stores/session";

import ContentContainer from "~/components/content/ContentContainer.vue";
import PostCard from "~/components/card/PostCard.vue";

import { computed, onBeforeMount, ref } from "vue";

const eventsList = ref([]);

const getUserID = computed(() => session.user.data?.id ?? null);

/**
 * Get all the upcoming accepted events
 */
const queryEvents = async () => {
  // get all responded to events
  const data = await fetch(`/api/user/${getUserID.value}/rsvp`).then(
    (response) => response.json()
  );
  // make an array and then filter the events that are in the past
  let eventArray = Array.from(data);
  eventArray = eventArray.filter(
    (event) => new Date(event.clubEvent.date).getTime() > Date.now()
  );
  // grab all the events that are actually accepted
  const acceptedEvents = eventArray.filter(
    (event) => event.isAccepted === true
  );
  // push the actual event object from each event to our events prop
  acceptedEvents.forEach((event) => eventsList.value.push(event.clubEvent));
};
onBeforeMount(queryEvents);
</script>

<template>
  <ContentContainer>
    <PostCard
      v-for="event of eventsList"
      :key="event.id"
      v-bind="event"
      :created-at="new Date(event.createdAt)"
      :updated-at="new Date(event.updatedAt)"
      :club="event.club.displayName"
      :club-info="event.club"
    />
  </ContentContainer>
</template>

<style lang="scss" scoped>
strong {
  margin: 8px;
}
</style>
