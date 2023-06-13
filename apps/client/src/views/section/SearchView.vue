<script setup>
import {
  Activity,
  Briefcase,
  Church,
  Compass,
  Gavel,
  Globe,
} from "lucide-vue-next";

import BaseLinkList from "~/components/base/BaseLinkList.vue";
import SectionLink from "~/components/section/SectionLink.vue";

// #region Constants

const CATEGORIES = [
  { name: "Skills", icon: Briefcase },
  { name: "Faith & Religion", icon: Church },
  { name: "Culture & Language", icon: Globe },
  { name: "Activities", icon: Activity },
  { name: "Politics", icon: Gavel },
];

// #endregion
</script>

<template>
  <BaseLinkList>
    <SectionLink :to="{ query: {} }" match-query>
      <template #icon>
        <Compass size="16" />
      </template>

      All Clubs
    </SectionLink>

    <SectionLink
      v-for="category in CATEGORIES"
      :key="category.name"
      :to="{ query: { category: category.name } }"
      match-query
    >
      <template #icon>
        <component :is="category.icon" size="16" />
      </template>

      {{ category.name }}
    </SectionLink>
  </BaseLinkList>
</template>
