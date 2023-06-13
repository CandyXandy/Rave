<script setup>
import { RotateCcwIcon, SaveIcon } from "lucide-vue-next";
import { onMounted, ref } from "vue";

import session from "~/stores/session";

import BaseAvatar from "~/components/base/BaseAvatar.vue";
import BaseButton from "~/components/base/BaseButton.vue";
import BaseCheck from "~/components/base/BaseCheck.vue";
import BaseInput from "~/components/base/BaseInput.vue";
import BaseSelect from "~/components/base/BaseSelect.vue";
import BaseTable from "~/components/base/BaseTable.vue";
import ContentContainer from "~/components/content/ContentContainer.vue";

import { omitNull } from "~/lib";

// #region State

const users = ref(null);
const usersDefaults = ref(null);
const usersToDelete = ref(new Set());

// #endregion

// #region Helpers

const queryUsers = async () => {
  const data = await fetch(`/api/user`).then((response) => response.json());

  users.value = data.map(() => ({ displayName: null, isAdmin: null }));
  usersDefaults.value = data;
};

// #endregion

// #region Lifecycle Hooks

onMounted(async () => {
  await queryUsers();
});

// #endregion

// #region Event Handlers

const handleCancel = () => {
  users.value = usersDefaults.value.map(() => ({
    displayName: null,
    isAdmin: null,
  }));
  usersToDelete.value = new Set();
};

const handleSubmit = async () => {
  await Promise.all(
    users.value
      .map((user) => ({
        ...user,
        isAdmin: user.isAdmin ? user.isAdmin === "true" : null,
      }))
      .map((user) => omitNull(user))
      .map((user, index) =>
        Object.keys(user).length !== 0
          ? fetch(`/api/user/${usersDefaults.value[index].id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(user),
            })
          : null
      )
  );

  await Promise.all(
    [...usersToDelete.value].map((id) =>
      fetch(`/api/user/${id}`, { method: "DELETE" })
    )
  );

  await queryUsers();

  handleCancel();
};

// #endregion
</script>

<template>
  <ContentContainer>
    <template #default>
      <BaseTable>
        <template #thead>
          <tr>
            <th scope="col" />
            <th scope="col">Display Name</th>
            <th scope="col">Email</th>
            <th scope="col">Role</th>
            <th scope="col">Remove?</th>
          </tr>
        </template>

        <template #tbody>
          <tr
            v-for="(userDefaults, index) in usersDefaults"
            :key="userDefaults.id"
          >
            <td>
              <BaseAvatar :name="userDefaults.displayName" />
            </td>

            <td>
              <BaseInput
                v-model="users[index].displayName"
                type="text"
                required
                :default="userDefaults?.displayName"
              />
            </td>

            <td>
              {{ userDefaults.email }}
            </td>

            <td>
              <BaseSelect
                v-model="users[index].isAdmin"
                :default="userDefaults.isAdmin.toString()"
              >
                <option value="true">Administrator</option>
                <option value="false">User</option>
              </BaseSelect>
            </td>

            <td>
              <div>
                <BaseCheck
                  v-if="session.user.data.id !== userDefaults.id"
                  v-model="usersToDelete"
                  type="checkbox"
                  :value="userDefaults.id"
                />
              </div>
            </td>
          </tr>
        </template>
      </BaseTable>
    </template>

    <template #controls>
      <BaseButton type="button" circle variant="danger" @click="handleCancel">
        <RotateCcwIcon size="16" />
      </BaseButton>

      <BaseButton type="button" circle variant="success" @click="handleSubmit">
        <SaveIcon size="16" />
      </BaseButton>
    </template>
  </ContentContainer>
</template>

<style lang="scss" scoped>
.table td div {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.table td input,
.table td select {
  margin-top: 0;
}
</style>
