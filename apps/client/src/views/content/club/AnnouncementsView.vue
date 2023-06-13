<script setup>
import { PencilIcon, PlusIcon, RotateCcwIcon, SaveIcon } from "lucide-vue-next";
import { computed, onBeforeMount, reactive, ref } from "vue";

import session from "~/stores/session";

import AnnouncementCard from "~/components/card/AnnouncementCard.vue";
import AnnouncementEditCard from "~/components/card/AnnouncementEditCard.vue";
import BaseButton from "~/components/base/BaseButton.vue";
import ContentContainer from "~/components/content/ContentContainer.vue";

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

const club = ref({});
const originalPosts = ref([]);
const posts = ref([]);
const clubAnnouncementsUrl = `/api/club/${props.id}/Announcement`;

const getData = async () => {
  try {
    const response = await fetch(clubAnnouncementsUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const responseJson = await response.json();
    originalPosts.value = JSON.parse(JSON.stringify(responseJson));
    posts.value = Array.from(responseJson);
    club.value = posts.value[0].club;
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
 * This patches every single post made by the club
 * and as such is very inefficient, but I'm not quite sure
 * what we do differently given the design.
 */
async function sendChanges() {
  await Promise.all(
    changes.map(async (change) => {
      try {
        const json = {
          title: change.title,
          description: change.description,
          isPublic: change.public,
        };
        const response = await fetch(`${clubAnnouncementsUrl}/${change.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(json),
        });
        if (response.ok) {
          reloading.is = true;
          reloading.text = "Changes sent off!";
          // console.log(`PATCH request sent`);
        } else {
          reloading.is = true;
          reloading.text = "Changes failed, most likely due to a server issue.";
          // console.error(`Error sending PATCH request`);
        }
      } catch (error) {
        // console.error(`Error sending Patch request`, error);
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
    };
    const response = await fetch(`${clubAnnouncementsUrl}`, {
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
    changes = [{}];
  }

  await getData();
  reloading.is = false;
}

/**
 * undoChanges
 */
function undoChanges() {
  posts.value = JSON.parse(JSON.stringify(originalPosts.value));

  if (newPostFlag.newPost) {
    newPostFlag.newPost = !newPostFlag.newPost;
    newPostObj[0] = {};
  }
  changes = [{}];
}

/**
 * @param {bool} saveChanges : toggle changes saved
 */
function finishEditing(saveChanges) {
  edit.edit = false;
  if (saveChanges) {
    sendChanges();
  } else {
    undoChanges();
  }
}

const startEditing = () => {
  for (let i = 0; i < posts.value.length; i += 1) {
    changes[i] = {
      id: posts.value[i].id,
      title: posts.value[i].title,
      description: posts.value[i].description,
      public: posts.value[i].public,
      updatedAt: new Date().toLocaleString(),
    };
  }
  edit.edit = true;
};

const deleteAnnouncement = async (id) => {
  try {
    const response = await fetch(`${clubAnnouncementsUrl}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      reloading.is = true;
      reloading.text = "Post deleted!";
      // console.log(`Announcement Deleted!`);
    } else {
      reloading.is = true;
      reloading.text = "Delete failed, most likely due to a server issue.";
      // console.error(`Issue deleting announcement`);
    }
  } catch (error) {
    reloading.is = true;
    reloading.text = "Delete failed, most likely due to a server issue.";
    // console.error(`Issue deleting announcement`, error);
  }

  await getData();
  reloading.is = false;
};

/**
 * fill out our newPostObj with placeholder data
 * and set the flag.
 */
function makeNewPost() {
  newPostObj[0] = {
    id: "newPost",
    title: "Enter title here",
    description: "Enter content here",
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  newPostFlag.newPost = true;
}

onBeforeMount(getData);
</script>

<template>
  <ContentContainer>
    <template #default>
      <template v-for="(post, index) in posts" :key="index">
        <AnnouncementEditCard
          v-if="edit.edit"
          v-bind="post"
          v-model:title="changes[index].title"
          v-model:description="changes[index].description"
          :created-at="new Date(post.createdAt)"
          :updated-at="new Date(post.updatedAt)"
          @change-privacy="changes[index].public = !changes[index].public"
          @delete-this="deleteAnnouncement(post.id)"
        />
        <AnnouncementCard
          v-else
          v-bind="post"
          :created-at="new Date(post.createdAt)"
          :updated-at="new Date(post.updatedAt)"
          :club="club.displayName"
        />
      </template>
      <AnnouncementEditCard
        v-if="newPostFlag.newPost"
        v-bind="newPostObj[0]"
        v-model:title="newPostObj[0].title"
        v-model:description="newPostObj[0].description"
        @change-privacy="newPostObj[0].public = !newPostObj[0].public"
        @delete-this="
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
