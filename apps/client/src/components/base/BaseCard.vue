<script setup>
import { Lock, Unlock } from "lucide-vue-next";
import { onMounted, onUnmounted, ref } from "vue";

import session from "~/stores/session";

// #region Props

const props = defineProps({
  heading: {
    type: String,
    required: true,
  },
  subheading: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: false,
    default: null,
  },
  isPublic: {
    type: Boolean,
    required: false,
    default: null,
  },
  icon: {
    type: undefined,
    required: false,
    default: null,
  },
  image: {
    type: undefined,
    required: false,
    default: null,
  },
  id: {
    type: String,
    required: false,
    default: null,
  },
  clubInfo: {
    type: Object,
    required: false,
    default: null,
  },
  rsvpList: {
    type: Array,
    required: false,
    default: null,
  },
});

// #endregion

// #region Emits

const emit = defineEmits(["intersectionEnter", "intersectionLeave"]);

// #endregion

// #region State

const intersectionObserver = new IntersectionObserver(([entry]) =>
  emit(entry.isIntersecting ? "intersectionEnter" : "intersectionLeave")
);
const element = ref(null);

// #endregion

// #region Lifecycle Hooks

onMounted(() => {
  intersectionObserver.observe(element.value);
});
onUnmounted(() => {
  intersectionObserver.disconnect();
});

// #endregion
</script>

<template>
  <div ref="element" class="card">
    <!-- Left Side -->
    <div class="leftSide">
      <!-- Title Area-->
      <div class="header">
        <div class="headerWrapper">
          <p class="headerTitle">{{ props.heading }}</p>
          <p v-if="props.label != null" class="headerDate">
            Created at {{ props.subheading }}
          </p>
          <p v-else class="headerDate">Category: {{ props.subheading }}</p>
        </div>
      </div>
      <!-- End Title Area -->

      <!-- Post Content Area -->
      <slot />
      <!-- End Post Content Area -->
    </div>
    <!-- End Left -->

    <!-- Right Side -->
    <div class="rightSide">
      <!-- Announcement/Event -->
      <div v-if="props.label !== null" class="Label">{{ props.label }}</div>
      <!-- Lock Image Here -->
      <div v-if="props.isPublic !== null" class="privacy">
        <Lock v-if="!props.isPublic" />
        <Unlock v-if="props.isPublic" />
      </div>
      <div v-if="props.label == 'Event'" class="table">
        <table v-if="session.user.data?.id !== null">
          <thead>
            <tr>
              <th scope="col">Participants</th>
              <th scope="col">Going?</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rsvp of rsvpList" :key="rsvp.user.id">
              <td>{{ rsvp.user.displayName }}</td>
              <td v-if="rsvp.isAccepted">Going</td>
              <td v-else>Can't Go!</td>
            </tr>
          </tbody>
        </table>
        <p v-else>Log in to see responses!</p>
      </div>
    </div>
    <!-- End Right -->
  </div>
</template>

<style lang="scss" scoped>
.card {
  font-size: 1vw;
  box-sizing: border-box;
  width: 100%;
  margin-bottom: 16px;
  height: fit-content;
  flex-direction: row;
  display: flex;
  border: #{$gray-300} 2px solid;
  border-radius: 10px;

  @media (prefers-color-scheme: "dark") {
    border-color: #{$gray-700};
  }
}
.leftSide {
  display: flex;
  flex-direction: column;
  width: 50%;
  height: fit-content;
  justify-content: space-between;
}
.header {
  display: flex;
  flex-direction: row;
  height: fit-content;
  max-width: 100%;
  margin: 1em;
}
.headerTitle {
  font-size: 24px;
  word-wrap: break-word;
  word-break: break-word;
}
.headerWrapper {
  display: flex;
  flex-direction: column;
  line-height: 0.01;
  font-size: 60;
}
.headerDate {
  opacity: 60%;
}
.rightSide {
  font-size: large;
  display: flex;
  flex-direction: column;
  justify-content: right;
  align-items: flex-end;
  width: 50%;
}
.Label {
  padding: 0.2em 0.7em;
  margin: 1em;
  background: #{$primary};
  text-align: center;
  border-radius: 8px;
  user-select: none;
}
.privacy {
  margin-right: 8px;
}

.table {
  width: 100%;
  height: 60%;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: flex-start;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
  padding: 0;
}

table {
  border-collapse: collapse;
  border-spacing: 10px;
  width: 100%;
  max-height: 100%;
  text-align: left;
}

th {
  border-bottom: 1px solid #{$gray-300};
  align-items: left;

  @media (prefers-color-scheme: "dark") {
    border-bottom-color: #{$gray-700};
  }
}
</style>
