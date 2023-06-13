import { reactive } from "vue";

// #region User

const user = reactive({
  data: null,
  isLoading: false,
  async invalidate() {
    this.isLoading = true;

    this.data = await fetch("/api/session").then((response) =>
      response.status !== 204 ? response.json() : null
    );

    this.isLoading = false;
  },
});

// #endregion

// #region Members

const members = reactive({
  data: null,
  isLoading: false,
  async invalidate() {
    this.isLoading = true;

    this.data =
      user.data !== null
        ? await fetch(`/api/user/${user.data.id}/member`).then((response) =>
            response.json()
          )
        : null;

    this.isLoading = false;
  },
});

// #endregion

// #region Store

const store = reactive({
  user,
  members,
  async invalidate() {
    await this.user.invalidate();
    await this.members.invalidate();
  },
});

export default store;

// #endregion
