<script setup>
import { useRouter } from "vue-router";
import { reactive, ref } from "vue";

import BaseButton from "~/components/base/BaseButton.vue";
import BaseInput from "~/components/base/BaseInput.vue";
import BaseLabel from "~/components/base/BaseLabel.vue";
import BaseLink from "~/components/base/BaseLink.vue";

import omit from "~/lib/omit";

// #region Routing

const router = useRouter();

// #endregion

// #region State

const state = reactive({
  displayName: "",
  email: "",
  password: "",
  passwordConfirm: "",
});
const error = ref(null);

// #endregion

// #region Event Handlers

const handleSubmit = async () => {
  if (state.password !== state.passwordConfirm) {
    error.value = "Passwords do not match.";
    return;
  }

  const response = await fetch("/api/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(omit(state, "passwordConfirm")),
  });

  if (response.status === 409) {
    error.value = "There is already an account with that email address.";
    return;
  }

  await fetch("/api/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(omit(state, "displayName", "passwordConfirm")),
  });

  await router.push({ name: "feed", query: { invalidate: true } });
};

// #endregion
</script>

<template>
  <section class="container">
    <article class="card">
      <h1>Create an Account</h1>

      <!-- [html-validate-disable-next wcag/h32] -->
      <form class="form" @submit.prevent="handleSubmit">
        <BaseLabel>
          Display Name
          <BaseInput v-model="state.displayName" type="text" required />
        </BaseLabel>

        <BaseLabel>
          Email
          <BaseInput v-model="state.email" type="email" required />
        </BaseLabel>

        <BaseLabel>
          Password
          <BaseInput
            v-model="state.password"
            type="password"
            required
            minlength="8"
          />
        </BaseLabel>

        <BaseLabel>
          Password (Confirm)
          <BaseInput
            v-model="state.passwordConfirm"
            type="password"
            required
            minlength="8"
          />
        </BaseLabel>

        <BaseButton type="submit" variant="primary">
          <strong>Sign Up</strong>
        </BaseButton>

        <p v-if="error !== null" class="form-error">
          {{ error }}
        </p>
      </form>

      <p>
        Already have an account?&nbsp;
        <BaseLink :to="{ name: 'login' }">Log In</BaseLink>
      </p>
    </article>
  </section>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  height: 100%;
}

.card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  width: 420px;

  background-color: #{$gray-100};

  padding: 1rem;

  border-radius: 0.5rem;

  @media (prefers-color-scheme: "dark") {
    background-color: #{mix($gray-800, $gray-900, 50%)};
  }
}

.form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  width: 100%;

  .form-error {
    color: #{$danger};

    margin-top: 0;
  }
}

.button {
  gap: 1rem;

  margin-bottom: 0.75rem;

  p {
    margin: 0;
  }
}
</style>
