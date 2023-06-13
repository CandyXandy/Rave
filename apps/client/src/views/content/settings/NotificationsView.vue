<script setup>
import { ref } from "vue";
import { RotateCcwIcon, SaveIcon } from "lucide-vue-next";

import session from "~/stores/session";

import BaseButton from "~/components/base/BaseButton.vue";
import BaseCheck from "~/components/base/BaseCheck.vue";
import BaseTable from "~/components/base/BaseTable.vue";
import ContentContainer from "~/components/content/ContentContainer.vue";

// #region State

const notifications = ref(new Set(session.user.data.settings.notifications));

// #endregion

// #region Event Handlers

const handleCancel = () => {
  notifications.value = new Set(session.user.data.settings.notifications);
};

const handleSubmit = async () => {
  await fetch(`/api/user/${session.user.data.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      settings: {
        notifications: [...notifications.value],
      },
    }),
  });

  await session.invalidate();

  handleCancel();
};

// #endregion
</script>

<template>
  <ContentContainer split>
    <template #l>
      <!-- [html-validate-disable-next heading-level] -->
      <h2>Club Updates</h2>
      <BaseTable>
        <template #thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Enabled</th>
          </tr>
        </template>

        <template #tbody>
          <tr>
            <td>Club Update</td>
            <td>
              <BaseCheck
                v-model="notifications"
                type="checkbox"
                value="club-update"
              />
            </td>
          </tr>

          <tr>
            <td>New Announcement</td>
            <td>
              <BaseCheck
                v-model="notifications"
                type="checkbox"
                value="club-announcement-create"
              />
            </td>
          </tr>

          <tr>
            <td>New Event</td>
            <td>
              <BaseCheck
                v-model="notifications"
                type="checkbox"
                value="club-event-create"
              />
            </td>
          </tr>

          <tr>
            <td>Event Cancelled</td>
            <td>
              <BaseCheck
                v-model="notifications"
                type="checkbox"
                value="club-event-cancel"
              />
            </td>
          </tr>

          <tr>
            <td>Role Update</td>
            <td>
              <BaseCheck
                v-model="notifications"
                type="checkbox"
                value="member-update"
              />
            </td>
          </tr>
        </template>
      </BaseTable>

      <h2>Moderator</h2>
      <BaseTable>
        <template #thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Enabled</th>
          </tr>
        </template>

        <template #tbody>
          <tr>
            <td>Member Joined</td>
            <td>
              <BaseCheck
                v-model="notifications"
                type="checkbox"
                value="moderator-member-create"
              />
            </td>
          </tr>

          <tr>
            <td>Member Left</td>
            <td>
              <BaseCheck
                v-model="notifications"
                type="checkbox"
                value="moderator-member-delete"
              />
            </td>
          </tr>
        </template>
      </BaseTable>
    </template>

    <template #l-controls>
      <BaseButton type="button" circle variant="danger" @click="handleCancel">
        <RotateCcwIcon size="16" />
      </BaseButton>

      <BaseButton type="button" circle variant="success" @click="handleSubmit">
        <SaveIcon size="16" />
      </BaseButton>
    </template>
  </ContentContainer>
</template>
