<script setup>
import { reactive } from "vue";
import { Check, X } from "lucide-vue-next";

const props = defineProps({
  id: {
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
    type: String,
    required: true,
  },
  isCancelled: {
    type: Boolean,
    required: true,
  },
});
const privacy = reactive({ public: props.isPublic });
const cancelled = reactive({ is: props.isCancelled });
defineEmits([
  "update:title",
  "update:description",
  "change-privacy",
  "update:date",
  "delete-this",
  "cancel-this",
]);
</script>

<template>
  <div class="card">
    <div class="leftSide">
      <label for="title">Title</label>
      <input
        id="title"
        :value="title"
        type="text"
        class="title"
        placeholder="title"
        @input="$emit('update:title', $event.target.value)"
      />
      <label for="description">Content</label>
      <textarea
        id="description"
        :value="description"
        type="text"
        class="description"
        placeholder="description"
        @input="$emit('update:description', $event.target.value)"
      />
      <label id="dateLabel" for="date">Date</label>
      <input
        id="date"
        type="datetime-local"
        :value="date"
        class="date"
        step="60"
        @input="$emit('update:date', $event.target.value)"
      />
      <div class="bottom-wrap">
        <div class="public-wrap">
          <label id="public">Publicly Visible?</label>
          <div
            class="public-buttons"
            @click="
              privacy.public = !privacy.public;
              $emit('change-privacy');
            "
          >
            <Check v-if="privacy.public" id="check" size="24" />
            <X v-else id="x" size="24" />
          </div>
        </div>
        <!-- You can thank Prettier for these unreadable buttons-->
        <div
          v-if="!cancelled.is"
          class="deleteButton"
          @click="
            cancelled.is = true;
            $emit('cancel-this');
          "
        >
          Cancel Event
        </div>
        <div
          v-else
          class="deleteButton"
          @click="
            cancelled.is = false;
            $emit('cancel-this');
          "
        >
          Undo Cancel
        </div>
        <div class="deleteButton" @click="$emit('delete-this')">
          Delete Event
        </div>
      </div>
    </div>
    <!-- <div class="rightSide">
      <p id="imageLabel">Image</p>
      <div class="image" />
    </div> -->
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
  border: #{$gray-700} 1px solid;
  border-radius: 10px;
}
.leftSide {
  height: fit-content;
  width: 100%;
  margin: 8px;
}
.rightSide {
  display: flex;
  flex-direction: column;
  min-width: 50%;
  min-height: 100%;
}
label {
  opacity: 60%;
}
.title {
  margin: 0.5em;
  border-radius: 8px;
  border: none;
  color: #{$white};
  background-color: #{mix($gray-800, $gray-900, 50%)};
  width: calc(100% - 2em);
  padding: 0.6em 0.5em;
}
.description {
  background-color: #{mix($gray-800, $gray-900, 50%)};
  width: calc(100% - 2em);
  color: #{$white};
  margin: 0.5em;
  border-radius: 8px;
  border: none;
  padding: 0.6em 0.5em;
  height: 250px;
  resize: none;
}
.icon-wrap {
  display: flex;
  flex-direction: row;
}
.icon {
  cursor: pointer;
  &:hover {
    opacity: 60%;
  }
  &:active {
    opacity: 100;
  }
}
.bottom-wrap {
  display: flex !important;
  flex-direction: row;
  justify-content: space-between;
}
#date {
  border-radius: 8px;
  border: none;
  padding: 8px;
  color: white;
  background-color: #{mix($gray-800, $gray-900, 50%)};
}
#dateLabel {
  font-size: 24px;
  margin: 8px;
}
.public-wrap {
  display: flex;
  flex-direction: row;
  padding: 8px;
  width: 50%;
  justify-content: space-evenly;
}
#public {
  font-size: 24px;
}
.public-buttons {
  user-select: none;
  cursor: pointer;
}
.image {
  margin: 8px;
  background-color: #{$primary};
  min-height: 60%;
}
.deleteButton {
  font-size: 24px;
  margin: 0.5em;
  background-color: #{$danger};
  border-radius: 8px;
  text-align: center;
  user-select: none;
  padding: 4px 24px;

  &:hover {
    opacity: 50%;
    cursor: pointer;
  }
  &:active {
    opacity: 100%;
  }
}
#imageLabel {
  opacity: 60%;
  margin-top: 8px;
}

#check {
  color: green;
}
#x {
  color: red;
}
</style>
