<script setup>
import { Bell, LogOut, Settings, Users } from "lucide-vue-next";

import session from "~/stores/session";

import BaseLinkList from "~/components/base/BaseLinkList.vue";
import SectionLink from "~/components/section/SectionLink.vue";
</script>

<template>
  <BaseLinkList>
    <SectionLink :to="{ name: 'settings-account' }">
      <template #icon>
        <Settings size="16" />
      </template>

      Account
    </SectionLink>

    <SectionLink :to="{ name: 'settings-notifications' }">
      <template #icon>
        <Bell size="16" />
      </template>

      Notifications
    </SectionLink>

    <SectionLink
      v-if="session.user.data?.isAdmin"
      :to="{ name: 'settings-users' }"
    >
      <template #icon>
        <Users size="16" />
      </template>

      Users
    </SectionLink>

    <SectionLink :to="{ name: 'logout' }" variant="danger">
      <template #icon>
        <LogOut size="16" />
      </template>

      Log Out
    </SectionLink>
  </BaseLinkList>
</template>
