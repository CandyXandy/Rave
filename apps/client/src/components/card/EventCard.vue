<script setup>
import { computed, onBeforeMount, reactive, ref } from "vue";

import session from "~/stores/session";

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
  date: {
    type: Date,
    required: true,
  },
  isCancelled: {
    type: Boolean,
    required: true,
  },
  clubInfo: {
    type: Object,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
});

/**
 * Is activated when the event has been responsed to and displays
 * text on the event card.
 */
const accepted = reactive({ is: "", text: "" });

/**
 * Get the current user id
 *
 * @returns {GUID} null if not logged in
 */
const getUserId = computed(() => session.user.data?.id ?? null);

const rsvpUrl = `/api/user/${getUserId.value}/rsvp/${props.id}`;
const getRsvpListUrl = `/api/club/${props.clubInfo.id}/event/${props.id}/rsvp`;
const rsvpList = ref([]);

/**
 * get a list of all users attending this event
 *
 * Only fires if the BaseCard is of Event type
 */
async function getParticipants() {
  const response = await fetch(getRsvpListUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const responseJSON = await response.json();

  rsvpList.value = Array.from(responseJSON);
}

/**
 * Compares the userID with that of those who have
 * accepted an event, determining if we need to make
 * a POST or a PATCH request.
 *
 * @returns {boolean} false if not found
 */
function compareRsvp() {
  for (let i = 0; i < rsvpList.value.length; i += 1) {
    if (rsvpList.value[i].user.id === getUserId.value) {
      return true;
    }
  }
  return false;
}

/**
 * Makes a request to accept an event.
 */
async function acceptEvent() {
  const flag = compareRsvp();
  let doMethod;
  if (flag) doMethod = "PATCH";
  else doMethod = "POST";

  const json = { isAccepted: true };
  const response = await fetch(rsvpUrl, {
    method: doMethod,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(json),
  });
  if (response.ok) {
    // console.log("POST request successful!");
    accepted.text = `Event has been accepted!`;
  } else if (response.status === 409) {
    accepted.text = `Already accepted event!`;
  } else {
    accepted.text = `Issue accepting event, try again later!`;
    // console.error("ISSUE WITH POST REQUEST");
  }
  accepted.is = "accepted";
  getParticipants();
}

/**
 * Makes a request to decline an event
 */
async function declineEvent() {
  const flag = compareRsvp();
  let doMethod;
  if (flag) doMethod = "PATCH";
  else doMethod = "POST";
  const json = { isAccepted: false };
  const response = await fetch(rsvpUrl, {
    method: doMethod,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(json),
  });
  if (response.ok) {
    // console.log("POST REQUEST SUCCESSFUL!");
    accepted.text = `Event has been declined!`;
  } else if (response.status === 409) {
    accepted.text = `Already declined event!`;
  } else {
    accepted.text = `Issue declining event, try again later!`;
    // console.error("ISSUE WITH POST REQUEST");
  }
  accepted.is = "declined";
  getParticipants();
}

onBeforeMount(getParticipants);
</script>

<template>
  <BaseCard
    v-bind="props"
    :heading="props.club"
    :subheading="props.createdAt.toDateString()"
    label="Event"
    :rsvp-list="rsvpList"
  >
    <div class="wrapper">
      <p class="title">{{ props.title }}</p>
      <p v-if="props.isCancelled" class="cancelled">CANCELLED</p>
      <p class="eventDate">{{ props.date.toLocaleString() }}</p>
      <div class="content">
        <p>{{ props.description }}</p>
      </div>
      <div class="eventWrapper">
        <div class="eventButton" @click="acceptEvent()">Accept</div>
        <div class="eventButton" @click="declineEvent()">Decline</div>
      </div>
    </div>
    <p
      v-if="accepted.is == 'accepted' || accepted.is == 'declined'"
      class="infoText"
    >
      {{ accepted.text }}
    </p>
  </BaseCard>
</template>

<style lang="scss" scoped>
.wrapper {
  margin: 0.5em 1em;
}
.content {
  word-wrap: break-word;
  word-break: break-word;
  font-size: 14px;
  width: 100%;
}
.title {
  font-size: 20px;
  max-height: 35%;
  max-width: 100%;
}
.cancelled {
  font-size: 20px;
  color: #{$danger};
}
.eventWrapper {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: fit-content;
}
.eventButton {
  margin: 0.5em 0.5em;
  background: #{$primary};
  border-radius: 8px;
  text-align: center;
  width: 50%;
  user-select: none;
  font-size: 16px;
}
.eventButton:hover {
  opacity: 50%;
  cursor: pointer;
}
.eventButton:active {
  opacity: 100%;
}
.eventDate {
  opacity: 60%;
}
.infoText {
  color: #{$success};
  font-size: 16px;
  text-align: center;
  width: 100%;
}
</style>
