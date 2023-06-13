<script setup>
import { computed, onMounted, ref } from "vue";

import session from "~/stores/session";

import ContentContainer from "~/components/content/ContentContainer.vue";
import PostCard from "~/components/card/PostCard.vue";

// #region Constants

const PAGE_SIZE = 5;

// #endregion

// #region State

const announcements = ref([]);
const announcementsPage = ref(1);

const events = ref([]);
const eventsPage = ref(1);

const posts = computed(() =>
  [...announcements.value, ...events.value].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )
);

const routePrefix = computed(() =>
  session.user.data !== null
    ? `/api/user/${session.user.data.id}/feed`
    : `/api/user/feed`
);

// #endregion

// #region Helpers

const getAnnouncements = async () => {
  if (announcementsPage.value === null) return;

  const page = announcementsPage.value;
  announcementsPage.value += 1;

  const data = await fetch(
    `${routePrefix.value}/announcement?page=${page}&size=${PAGE_SIZE}`
  ).then((response) => response.json());

  if (data.length !== PAGE_SIZE) announcementsPage.value = null;

  announcements.value = [
    ...announcements.value,
    ...data.map((announcement) => ({
      ...announcement,
      type: "announcement",
      createdAt: new Date(announcement.createdAt),
      updatedAt: new Date(announcement.updatedAt),
    })),
  ];
};

const getEvents = async () => {
  if (eventsPage.value === null) return;

  const page = eventsPage.value;
  eventsPage.value += 1;

  const data = await fetch(
    `${routePrefix.value}/event?page=${page}&size=${PAGE_SIZE}`
  ).then((response) => response.json());

  if (data.length !== PAGE_SIZE) eventsPage.value = null;

  events.value = [
    ...events.value,
    ...data.map((event) => ({
      ...event,
      type: "event",
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.updatedAt),
    })),
  ];
};

// #endregion

// #region Lifecycle Hooks

onMounted(async () => {
  await getAnnouncements();
  await getEvents();
});

// #endregion

// #region Event Handlers

const handleIntersectionEnter = async (post) => {
  if (post.type === "announcement") {
    const index = announcements.value.indexOf(post);

    if (index !== announcements.value.length - PAGE_SIZE) return;

    await getAnnouncements();
  } else {
    const index = events.value.indexOf(post);

    if (index !== events.value.length - PAGE_SIZE) return;

    await getEvents();
  }
};

// #endregion
</script>

<template>
  <ContentContainer>
    <PostCard
      v-for="post in posts"
      :key="post.id"
      v-bind="post"
      :club="post.club.displayName"
      :club-info="post.club"
      @intersection-enter="handleIntersectionEnter(post)"
    >
      {{ post.title }}<br />
      {{ post.type }}<br />
    </PostCard>
  </ContentContainer>
</template>

<style lang="scss" scoped>
.card:last-of-type {
  margin-bottom: 0;
}
</style>
