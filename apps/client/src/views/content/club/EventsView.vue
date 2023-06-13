<script setup>
import { PencilIcon, PlusIcon, RotateCcwIcon, SaveIcon } from "lucide-vue-next";
import { computed, onBeforeMount, reactive, ref } from "vue";

import session from "~/stores/session";

import BaseButton from "~/components/base/BaseButton.vue";
import ContentContainer from "~/components/content/ContentContainer.vue";
import EventCard from "~/components/card/EventCard.vue";
import EventEditCard from "~/components/card/EventEditCard.vue";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const sessionMember = computed(
  () =>
    session.members.data?.find((member) => member.club.id === props.id) ?? null
);

const clubEventsUrl = `/api/club/${props.id}/Event`;
const originalEvents = ref([]);
const events = ref([]);
const club = ref({});

const getData = async () => {
  try {
    const response = await fetch(clubEventsUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const responseJson = await response.json();
    originalEvents.value = JSON.parse(JSON.stringify(responseJson));
    events.value = Array.from(responseJson);
    club.value = events.value[0].club;
  } catch (error) {
    // error
  }
};

// controls if reloading info box will be shown and text shown in box
const reloading = reactive({
  is: false,
  text: "",
});
// controls if we're currently in edit mode
const edit = reactive({
  edit: false,
});
// holds all of the posts we're editing
let changes = reactive([{}]);
// controls if we're making a new post
const newPostFlag = reactive({
  newPost: false,
});
// holds our newPost changes. Need to reference by the 0th index to keep reactivity, not sure why.
const newPostObj = reactive([{}]);

/**
 * Sends changes to server and reloads page.
 */
async function sendChanges() {
  await Promise.all(
    changes.map(async (change) => {
      try {
        const json = {
          title: change.title,
          description: change.description,
          isPublic: change.public,
          date: Date.parse(change.date),
          isCancelled: change.isCancelled,
        };
        const response = await fetch(`${clubEventsUrl}/${change.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(json),
        });
        if (response.ok) {
          // console.log(`PATCH request sent`);
          reloading.is = true;
          reloading.text = "Changes sent off!";
        } else {
          reloading.is = true;
          reloading.text = "Changes failed, most likely due to a server issue.";
          // console.error(`Error sending PATCH request`);
        }
      } catch (error) {
        // console.error(`Error sending PATCH request`, error);
        reloading.is = true;
        reloading.text = "Changes failed, most likely due to a server issue.";
      }
    })
  );
  if (newPostFlag.newPost) {
    const json = {
      title: newPostObj[0].title,
      description: newPostObj[0].description,
      isPublic: newPostObj[0].isPublic,
      date: Date.parse(newPostObj[0].date),
      isCancelled: false,
    };
    const response = await fetch(`${clubEventsUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json),
    });
    if (response.ok) {
      reloading.text += "New post made.";
      // console.log(`POST request sent`);
    } else {
      // console.error(`Error sending POST request`);
    }
    // reset new post states
    newPostFlag.newPost = false;
    newPostObj[0] = {};
  }

  await getData();
  reloading.is = false;
}

/**
 * undoChanges
 */
function undoChanges() {
  events.value = JSON.parse(JSON.stringify(originalEvents.value));

  if (newPostFlag.newPost) {
    newPostFlag.newPost = !newPostFlag.newPost;
    newPostObj[0] = {};
  }
  changes = [{}];
}

/**
 *
 */
function startEditing() {
  for (let i = 0; i < events.value.length; i += 1) {
    changes[i] = {
      id: events.value[i].id,
      title: events.value[i].title,
      description: events.value[i].description,
      public: events.value[i].public,
      date: events.value[i].date.toLocaleString().slice(0, -1),
      updatedAt: new Date().toLocaleString(),
      isCancelled: events.value[i].isCancelled,
    };
  }
  edit.edit = true;
}

/**
 * @param {bool} saveChanges : toggles changes saved
 */
function finishEditing(saveChanges) {
  edit.edit = false;
  if (saveChanges) {
    sendChanges();
  } else {
    undoChanges();
  }
}

const deleteEvent = async (id) => {
  try {
    const response = await fetch(`${clubEventsUrl}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      reloading.is = true;
      reloading.text = "Post deleted!";
      // console.log(`Event Deleted!`);
    } else {
      reloading.is = true;
      reloading.text = "Delete failed, most likely due to a server issue.";
      // console.error(`Issue deleting event`);
    }
  } catch (error) {
    reloading.is = true;
    reloading.text = "Delete failed, most likely due to a server issue.";
    // console.error(`Issue deleting Event`, error);
  }

  await getData();
  reloading.is = false;
};

/**
 * fill out our newPostObj with placeholder data
 * and set the flag.
 */
function makeNewPost() {
  const defaultDate = new Date();

  defaultDate.setMonth(defaultDate.setMonth() + 1);

  newPostObj[0] = {
    id: "newPost",
    title: "Enter title here",
    description: "Enter content here",
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    date: defaultDate.toISOString().slice(0, -1), // remove last char to conform to format
  };
  newPostFlag.newPost = true;
}

onBeforeMount(getData);
</script>

<template>
  <ContentContainer>
    <template #default>
      <template v-for="(event, index) in events" :key="index">
        <EventEditCard
          v-if="edit.edit"
          v-bind="event"
          v-model:title="changes[index].title"
          v-model:description="changes[index].description"
          v-model:date="changes[index].date"
          :created-at="new Date(event.createdAt)"
          :updated-at="new Date(event.updatedAt)"
          @change-privacy="changes[index].public = !changes[index].public"
          @delete-this="deleteEvent(event.id)"
          @cancel-this="
            changes[index].isCancelled = !changes[index].isCancelled
          "
        />
        <EventCard
          v-else
          v-bind="event"
          :created-at="new Date(event.createdAt)"
          :updated-at="new Date(event.updatedAt)"
          :club="club.displayName"
          :club-info="club"
          :date="new Date(event.date)"
        />
      </template>
      <EventEditCard
        v-if="newPostFlag.newPost"
        v-bind="newPostObj[0]"
        v-model:title="newPostObj[0].title"
        v-model:description="newPostObj[0].description"
        v-model:date="newPostObj[0].date"
        :is-cancelled="false"
        @change-privacy="newPostObj[0].public = !newPostObj[0].public"
        @delete-this="
          newPostObj[0] = {};
          newPostFlag.newPost = false;
        "
        @cancel-this="
          newPostObj[0] = {};
          newPostFlag.newPost = false;
        "
      />
    </template>

    <template v-if="edit.edit" #controls>
      <BaseButton type="button" circle variant="success" @click="makeNewPost()">
        <PlusIcon size="16" />
      </BaseButton>

      <BaseButton
        type="button"
        circle
        variant="danger"
        @click="finishEditing(false)"
      >
        <RotateCcwIcon size="16" />
      </BaseButton>

      <BaseButton
        type="button"
        circle
        variant="success"
        @click="finishEditing(true)"
      >
        <SaveIcon size="16" />
      </BaseButton>
    </template>
    <!-- prettier-ignore-attribute v-else-if -->
    <template
      v-else-if="
        ['moderator', 'owner'].includes(sessionMember?.role) ||
          session.user.data?.isAdmin
      "
      #controls
    >
      <BaseButton
        type="button"
        circle
        variant="primary"
        @click="startEditing()"
      >
        <PencilIcon size="16" />
      </BaseButton>
    </template>
  </ContentContainer>
</template>

<style lang="scss" scoped>
.card:last-of-type {
  margin-bottom: 0;
}
</style>
