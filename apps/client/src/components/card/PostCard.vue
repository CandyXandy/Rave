<script setup>
/*
  This component exists solely so that the feedView doesn't have to discriminate between
  what's an announcement or an event.
*/
import AnnouncementCard from "./AnnouncementCard.vue";
import EventCard from "./EventCard.vue";

const props = defineProps({
  club: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
  updatedAt: {
    type: Date,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  isPublic: {
    type: Boolean,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: false,
    default: null,
  },
  isCancelled: {
    type: Boolean,
    required: false,
    default: null,
  },
  clubInfo: {
    type: Object,
    required: false,
    default: null,
  },
});
</script>

<template>
  <EventCard
    v-if="props.date != null"
    v-bind="props"
    :date="new Date(props.date)"
  />
  <AnnouncementCard v-else v-bind="props" />
</template>
