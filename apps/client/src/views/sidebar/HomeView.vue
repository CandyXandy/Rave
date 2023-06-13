<script setup>
import { LogIn, Plus, Search } from "lucide-vue-next";

import session from "~/stores/session";

import BaseAvatar from "~/components/base/BaseAvatar.vue";
import BaseLinkList from "~/components/base/BaseLinkList.vue";
import RaveIcon from "~/components/RaveIcon.vue";
import SidebarDivider from "~/components/sidebar/SidebarDivider.vue";
import SidebarLink from "~/components/sidebar/SidebarLink.vue";
</script>

<template>
  <div class="sidebar-group">
    <BaseLinkList>
      <SidebarLink variant="primary" :to="{ name: 'feed' }">
        <RaveIcon class="icon" :size="20" />
      </SidebarLink>
    </BaseLinkList>

    <SidebarDivider />

    <template v-if="session.members.data !== null">
      <BaseLinkList>
        <SidebarLink
          v-for="member in session.members.data"
          :key="member.club.id"
          variant="wrapper"
          :to="{ name: 'club', params: { id: member.club.id } }"
        >
          <BaseAvatar :name="member.club.displayName" />
        </SidebarLink>
      </BaseLinkList>

      <SidebarDivider v-if="session.members.data.length !== 0" />
    </template>

    <BaseLinkList>
      <SidebarLink
        v-if="session.user.data !== null"
        variant="success"
        :to="{ name: 'club', params: { id: 'create' } }"
      >
        <Plus size="16" />
      </SidebarLink>

      <SidebarLink variant="success" :to="{ name: 'club-search' }">
        <Search size="16" />
      </SidebarLink>
    </BaseLinkList>
  </div>

  <div class="sidebar-group">
    <BaseLinkList>
      <SidebarLink
        v-if="session.user.data !== null"
        variant="wrapper"
        :to="{ name: 'settings-account' }"
      >
        <BaseAvatar :name="session.user.data.displayName" />
      </SidebarLink>
      <SidebarLink v-else :to="{ name: 'login' }">
        <LogIn size="16" />
      </SidebarLink>
    </BaseLinkList>
  </div>
</template>

<style lang="scss" scoped>
.icon {
  color: #{$gray-900};

  margin-left: 1px;

  @media (prefers-color-scheme: "dark") {
    color: #{$gray-100};
  }
}

:deep(.router-link-active) .icon,
:deep(:hover) .icon {
  color: #{$gray-100};
}

.sidebar-group:not(:last-of-type) {
  margin-bottom: 8px;
}
</style>
