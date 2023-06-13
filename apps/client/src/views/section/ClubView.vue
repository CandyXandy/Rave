<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import {
  CalendarIcon,
  DoorClosedIcon,
  DoorOpenIcon,
  InfoIcon,
  MegaphoneIcon,
} from "lucide-vue-next";

import session from "~/stores/session";

import BaseLinkList from "~/components/base/BaseLinkList.vue";
import SectionLink from "~/components/section/SectionLink.vue";

// #region Props

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

// #endregion

// #region Route

const route = useRoute();

// #endregion

// #region State

const sessionMember = computed(
  () =>
    session.members.data?.find((member) => member.club.id === props.id) ?? null
);

// #endregion

// #region Event Handlers

const handleJoin = async () => {
  await fetch(`/api/club/${props.id}/member/${session.user.data.id}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role: "member" }),
  });

  await session.members.invalidate();
};

const handleLeave = async () => {
  await fetch(`/api/club/${props.id}/member/${session.user.data.id}`, {
    method: "DELETE",
  });

  await session.members.invalidate();
};

// #endregion
</script>

<template>
  <BaseLinkList>
    <SectionLink :to="{ name: 'club' }">
      <template #icon>
        <InfoIcon size="16" />
      </template>

      Info
    </SectionLink>

    <SectionLink
      v-if="route.params.id !== 'create'"
      :to="{ name: 'club-announcements' }"
    >
      <template #icon>
        <MegaphoneIcon size="16" />
      </template>

      Announcements
    </SectionLink>

    <SectionLink
      v-if="route.params.id !== 'create'"
      :to="{ name: 'club-events' }"
    >
      <template #icon>
        <CalendarIcon size="16" />
      </template>

      Events
    </SectionLink>

    <template v-if="route.params.id !== 'create'">
      <template v-if="session.user.data !== null">
        <SectionLink
          v-if="!sessionMember"
          variant="success"
          @click="handleJoin()"
        >
          <template #icon>
            <DoorOpenIcon size="16" />
          </template>

          Join
        </SectionLink>
        <SectionLink v-else variant="danger" @click="handleLeave()">
          <template #icon>
            <DoorClosedIcon size="16" />
          </template>

          Leave
        </SectionLink>
      </template>
    </template>
  </BaseLinkList>
</template>
