<script setup>
import { Calendar, Newspaper } from "lucide-vue-next";

import BaseLinkList from "~/components/base/BaseLinkList.vue";
import SectionLink from "~/components/section/SectionLink.vue";

import session from "~/stores/session";
</script>

<template>
  <BaseLinkList>
    <SectionLink :to="{ name: 'feed' }">
      <template #icon>
        <Newspaper size="16" />
      </template>

      Feed
    </SectionLink>

    <SectionLink v-if="session.user.data != null" :to="{ name: 'upcoming' }">
      <template #icon>
        <Calendar size="16" />
      </template>

      Upcoming
    </SectionLink>
  </BaseLinkList>
</template>
