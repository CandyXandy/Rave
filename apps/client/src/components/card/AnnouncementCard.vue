<script setup>
import BaseCard from "~/components/base/BaseCard.vue";

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
});
</script>

<template>
  <BaseCard
    :heading="props.club"
    :subheading="props.createdAt.toDateString()"
    label="Announcement"
    :is-public="props.isPublic"
  >
    <div class="wrapper">
      <p class="title">{{ props.title }}</p>
      <div class="content">
        <p>{{ props.description }}</p>
      </div>
    </div>
  </BaseCard>
</template>

<style lang="scss" scoped>
.wrapper {
  margin: 0.5em 1em;
}
.content {
  word-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
  font-size: 14px;
  width: 100%;
}
.title {
  font-size: 20px;
  max-height: 35%;
  max-width: 100%;
}
</style>
