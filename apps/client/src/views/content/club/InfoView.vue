<script setup>
import { useRouter } from "vue-router";
import { PencilIcon, RotateCcwIcon, SaveIcon } from "lucide-vue-next";
import { computed, reactive, ref, watch } from "vue";

import session from "~/stores/session";

import BaseAvatar from "~/components/base/BaseAvatar.vue";
import BaseButton from "~/components/base/BaseButton.vue";
import BaseCheck from "~/components/base/BaseCheck.vue";
import BaseInput from "~/components/base/BaseInput.vue";
import BaseLabel from "~/components/base/BaseLabel.vue";
import BaseSelect from "~/components/base/BaseSelect.vue";
import BaseTable from "~/components/base/BaseTable.vue";
import ContentContainer from "~/components/content/ContentContainer.vue";

import { capitalise, omitNull } from "~/lib";

// #region Routing

const router = useRouter();

// #endregion

// #region Props

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

// #endregion

// #region State

const isEditing = reactive([props.id === "create", false]);

const club = reactive({
  displayName: null,
  category: props.id !== "create" ? null : "Skills",
  description: null,
});
const clubDefaults = ref(null);

const members = ref(null);
const membersDefaults = ref(null);
const membersToDelete = ref(new Set());

const sessionMember = computed(
  () =>
    session.members.data?.find((member) => member.club.id === props.id) ?? null
);

// #endregion

// #region Helpers

const queryClub = async () => {
  const data = await fetch(`/api/club/${props.id}`).then((response) =>
    response.json()
  );

  clubDefaults.value = data;
};

const queryMembers = async () => {
  const data = await fetch(`/api/club/${props.id}/member`).then((response) =>
    response.json()
  );

  members.value = data.map(() => ({ role: null }));
  membersDefaults.value = data;
};

// #endregion

// #region Watchers

watch(
  () => props.id,
  async () => {
    if (props.id !== "create") await queryClub();
    if (props.id !== "create") await queryMembers();

    isEditing[0] = props.id === "create";
    isEditing[1] = false;
  },
  {
    immediate: true,
  }
);

watch(
  () => session.members.data,
  async () => {
    if (props.id !== "create") await queryMembers();
  }
);

// #endregion

// #region Event Handlers

const handleCancelL = () => {
  Object.keys(club).forEach((key) => {
    club[key] = null;
  });

  isEditing[0] = false;
};

const handleSubmitL = async () => {
  const clubData = omitNull(club);

  if (Object.keys(clubData).length === 0) return;

  if (props.id === "create") {
    const clubId = await fetch(`/api/club`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clubData),
    }).then((response) => response.text());

    await router.push({ params: { id: clubId } });
  } else {
    await fetch(`/api/club/${props.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(clubData),
    });
  }

  await session.members.invalidate();

  isEditing[0] = false;

  await queryClub();
  await queryMembers();

  handleCancelL();
};

const handleCancelR = () => {
  members.value = membersDefaults.value.map(() => ({ role: null }));
  membersToDelete.value = new Set();

  isEditing[1] = false;
};

const handleSubmitR = async () => {
  await Promise.all(
    members.value
      .map((member) => omitNull(member))
      .map((member, index) =>
        Object.keys(member).length !== 0
          ? fetch(
              `/api/club/${props.id}/member/${membersDefaults.value[index].user.id}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(member),
              }
            )
          : null
      )
  );

  await Promise.all(
    [...membersToDelete.value].map((id) =>
      fetch(`/api/club/${props.id}/member/${id}`, {
        method: "DELETE",
      })
    )
  );

  isEditing[1] = false;

  await queryMembers();

  handleCancelR();
};

const handleDelete = async () => {
  await fetch(`/api/club/${props.id}`, {
    method: "DELETE",
  });

  await router.push({ name: "feed", query: { invalidate: true } });
};

// #endregion
</script>

<template>
  <ContentContainer split>
    <template #l>
      <template v-if="!isEditing[0]">
        <header class="header">
          <BaseAvatar :name="clubDefaults?.displayName ?? ''" />
          <h1>
            {{ clubDefaults?.displayName }}
          </h1>
        </header>

        <h2>Category</h2>
        <p>
          {{ clubDefaults?.category }}
        </p>

        <h2>Description</h2>
        <p>
          {{ clubDefaults?.description }}
        </p>
      </template>
      <!-- [html-validate-disable-next wcag/h32] -->
      <form v-else id="club-form" @submit.prevent="handleSubmitL">
        <BaseLabel>
          Display Name
          <BaseInput
            v-model="club.displayName"
            type="text"
            required
            :default="clubDefaults?.displayName"
          />
        </BaseLabel>

        <BaseLabel>
          Category
          <BaseSelect v-model="club.category" :default="clubDefaults?.category">
            <option>Skills</option>
            <option>Faith &amp; Religion</option>
            <option>Culture &amp; Language</option>
            <option>Activities</option>
            <option>Politics</option>
          </BaseSelect>
        </BaseLabel>

        <BaseLabel>
          Description
          <BaseInput
            v-model="club.description"
            type="textarea"
            :rows="10"
            required
            :default="clubDefaults?.description"
          />
        </BaseLabel>

        <BaseButton
          v-if="props.id !== 'create' && sessionMember?.role === 'owner'"
          type="button"
          variant="danger"
          @click="handleDelete"
        >
          Delete Club
        </BaseButton>
      </form>
    </template>

    <template v-if="isEditing[0]" #l-controls>
      <BaseButton
        v-if="props.id !== 'create'"
        type="button"
        circle
        variant="danger"
        @click="handleCancelL"
      >
        <RotateCcwIcon size="16" />
      </BaseButton>

      <BaseButton type="submit" form="club-form" circle variant="success">
        <SaveIcon size="16" />
      </BaseButton>
    </template>
    <!-- prettier-ignore-attribute v-else-if -->
    <template
      v-else-if="
        ['moderator', 'owner'].includes(sessionMember?.role) ||
          session.user.data?.isAdmin
      "
      #l-controls
    >
      <BaseButton
        type="button"
        circle
        variant="primary"
        @click="isEditing[0] = true"
      >
        <PencilIcon size="16" />
      </BaseButton>
    </template>

    <template v-if="id !== 'create'" #r>
      <BaseTable>
        <template #thead>
          <tr>
            <th scope="col" />
            <th scope="col">Display Name</th>
            <th scope="col">Role</th>
            <th v-if="isEditing[1]" scope="col">Remove?</th>
          </tr>
        </template>

        <template #tbody>
          <tr
            v-for="(memberDefaults, index) in membersDefaults"
            :key="memberDefaults.user.id"
          >
            <td>
              <BaseAvatar :name="memberDefaults.user.displayName" />
            </td>

            <td>
              {{ memberDefaults.user.displayName }}
            </td>

            <td v-if="isEditing[1]">
              <!-- prettier-ignore-attribute v-if -->
              <template
                v-if="
                  session.user.data.id === memberDefaults.user.id ||
                    sessionMember?.role !== 'owner'
                "
              >
                {{ capitalise(memberDefaults.role) }}
              </template>
              <template v-else>
                <BaseSelect
                  v-model="members[index].role"
                  :default="memberDefaults.role"
                >
                  <option value="owner">Owner</option>
                  <option value="moderator">Moderator</option>
                  <option value="member">Member</option>
                </BaseSelect>
              </template>
            </td>
            <td v-else>
              {{ capitalise(memberDefaults.role) }}
            </td>

            <td v-if="isEditing[1]">
              <div>
                <BaseCheck
                  v-if="session.user.data.id !== memberDefaults.user.id"
                  v-model="membersToDelete"
                  type="checkbox"
                  :value="memberDefaults.user.id"
                />
              </div>
            </td>
          </tr>
        </template>
      </BaseTable>
    </template>

    <template v-if="isEditing[1]" #r-controls>
      <BaseButton type="button" circle variant="danger" @click="handleCancelR">
        <RotateCcwIcon size="16" />
      </BaseButton>

      <BaseButton type="button" circle variant="success" @click="handleSubmitR">
        <SaveIcon size="16" />
      </BaseButton>
    </template>
    <!-- prettier-ignore-attribute v-else-if -->
    <template
      v-else-if="
        ['moderator', 'owner'].includes(sessionMember?.role) ||
          session.user.data?.isAdmin
      "
      #r-controls
    >
      <BaseButton
        type="button"
        circle
        variant="primary"
        @click="isEditing[1] = true"
      >
        <PencilIcon size="16" />
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
