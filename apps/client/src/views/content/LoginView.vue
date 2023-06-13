<script setup>
import { useRouter } from "vue-router";
import { Chrome, Facebook } from "lucide-vue-next";
import { reactive, ref } from "vue";

import BaseButton from "~/components/base/BaseButton.vue";
import BaseInput from "~/components/base/BaseInput.vue";
import BaseLabel from "~/components/base/BaseLabel.vue";
import BaseLink from "~/components/base/BaseLink.vue";

// #region Constants

const PROVIDERS = [
  {
    id: "google",
    displayName: "Google",
    icon: Chrome,
  },
  {
    id: "facebook",
    displayName: "Facebook",
    icon: Facebook,
  },
];

// #region Routing

const router = useRouter();

// #endregion

// #region State

const state = reactive({ email: "", password: "" });
const error = ref(null);

// #endregion

// #region Event Handlers

const handleProvider = async (provider) => {
  window.location.href = `/api/session/${provider}`;
};

const handleSubmit = async () => {
  const response = await fetch("/api/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(state),
  });

  if (response.status === 401) {
    error.value = "Incorrect email or password. Try again.";
    return;
  }

  await router.push({ name: "feed", query: { invalidate: true } });
};

// #endregion
</script>

<template>
  <section class="container">
    <article class="card">
      <h1>Welcome back!</h1>

      <div>
        <BaseButton
          v-for="provider in PROVIDERS"
          :key="provider.id"
          type="submit"
          variant="primary"
          @click="() => handleProvider(provider.id)"
        >
          <component :is="provider.icon" size="16" />
          <p>
            Continue with <strong>{{ provider.displayName }}</strong>
          </p>
        </BaseButton>
      </div>

      <p class="divider">OR</p>

      <!-- [html-validate-disable-next wcag/h32] -->
      <form class="form" @submit.prevent="handleSubmit">
        <BaseLabel>
          Email
          <BaseInput v-model="state.email" type="email" required />
        </BaseLabel>

        <BaseLabel>
          Password
          <BaseInput v-model="state.password" type="password" required />
        </BaseLabel>

        <BaseButton type="submit" variant="primary">
          <strong>Log In</strong>
        </BaseButton>

        <p v-if="error !== null" class="form-error">
          {{ error }}
        </p>
      </form>

      <p class="login-card-signup">
        Not a member yet?&nbsp;
        <BaseLink :to="{ name: 'signup' }">Sign Up</BaseLink>
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

  div {
    width: 100%;

    .button:last-child {
      margin-bottom: 0;
    }
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

.divider {
  display: flex;
  flex-direction: row;

  width: 100%;

  &:before,
  &:after {
    flex-grow: 1;

    content: "";

    border-bottom: 2px solid currentColor;

    margin: auto;
  }

  &:before {
    margin-right: 1rem;
  }
  &:after {
    margin-left: 1rem;
  }
}
</style>
