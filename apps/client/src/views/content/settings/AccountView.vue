<script setup>
import { useRouter } from "vue-router";
import { RotateCcwIcon, SaveIcon } from "lucide-vue-next";
import { reactive, ref } from "vue";

import session from "~/stores/session";

import BaseButton from "~/components/base/BaseButton.vue";
import BaseDivider from "~/components/base/BaseDivider.vue";
import BaseInput from "~/components/base/BaseInput.vue";
import BaseLabel from "~/components/base/BaseLabel.vue";
import ContentContainer from "~/components/content/ContentContainer.vue";

import { omit, omitNull } from "~/lib";

// #region Routing

const router = useRouter();

// #endregion

// #region State

const state = reactive({
  displayName: null,
  email: null,
  password: null,
  passwordConfirm: null,
});
const error = ref(null);

// #endregion

// #region Event Handlers

const handleCancel = () =>
  Object.keys(state).forEach((key) => {
    state[key] = null;
  });

const handleSubmit = async () => {
  const data = omitNull(state);

  if (Object.keys(data).length === 0) return;

  if ("password" in data && data.password !== data.passwordConfirm) {
    error.value = "Passwords do not match.";
    return;
  }

  const response = await fetch(`/api/user/${session.user.data.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(omit(data, "passwordConfirm")),
  });

  if (response.status === 409) {
    error.value = "There is already an account with that email address.";
    return;
  }

  await session.invalidate();

  handleCancel();
};

const handleDelete = async () => {
  await fetch(`/api/user/${session.user.data.id}`, {
    method: "DELETE",
  });

  await router.push({ name: "feed", query: { invalidate: true } });
};

// #endregion
</script>

<template>
  <ContentContainer split>
    <template #l>
      <BaseLabel>
        Display Name
        <BaseInput
          v-model="state.displayName"
          type="text"
          required
          :default="session.user.data.displayName"
        />
      </BaseLabel>

      <BaseLabel>
        Email
        <BaseInput
          v-model="state.email"
          type="email"
          required
          :default="session.user.data.email"
        />
      </BaseLabel>

      <BaseLabel>
        Password
        <BaseInput v-model="state.password" type="password" :default="null" />
      </BaseLabel>

      <BaseLabel>
        Password (Confirm)
        <BaseInput
          v-model="state.passwordConfirm"
          type="password"
          :default="null"
        />
      </BaseLabel>

      <p v-if="error !== null" class="form-error">
        {{ error }}
      </p>

      <BaseDivider />

      <BaseButton type="button" variant="danger" @click="handleDelete">
        Delete Account
      </BaseButton>
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

<style lang="scss" scoped>
.form-error {
  color: #{$danger};

  margin-top: 0;
}
</style>
