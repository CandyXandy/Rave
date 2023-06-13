import { createApp, watch } from "vue";
import { createRouter, createWebHistory } from "vue-router";

import session from "./stores/session";

import App from "./components/App.vue";

import omit from "./lib/omit";

import "./index.scss";

// #region Routing

const router = createRouter({
  routes: [
    {
      path: "/",
      children: [
        {
          path: "",
          name: "feed",
          components: {
            sidebar: () => import("./views/sidebar/HomeView.vue"),
            section: () => import("./views/section/HomeView.vue"),
            content: () => import("./views/content/FeedView.vue"),
          },
        },
        {
          path: "upcoming",
          name: "upcoming",
          components: {
            sidebar: () => import("./views/sidebar/HomeView.vue"),
            section: () => import("./views/section/HomeView.vue"),
            content: () => import("./views/content/UpcomingView.vue"),
          },
          meta: {
            requireAuth: true,
          },
        },
      ],
    },
    {
      path: "/club/:id",
      children: [
        {
          path: "",
          name: "club",
          components: {
            sidebar: () => import("./views/sidebar/HomeView.vue"),
            section: () => import("./views/section/ClubView.vue"),
            content: () => import("./views/content/club/InfoView.vue"),
          },
          props: {
            section: true,
            content: true,
          },
        },
        {
          path: "announcements",
          name: "club-announcements",
          components: {
            sidebar: () => import("./views/sidebar/HomeView.vue"),
            section: () => import("./views/section/ClubView.vue"),
            content: () => import("./views/content/club/AnnouncementsView.vue"),
          },
          props: {
            section: true,
            content: true,
          },
        },
        {
          path: "events",
          name: "club-events",
          components: {
            sidebar: () => import("./views/sidebar/HomeView.vue"),
            section: () => import("./views/section/ClubView.vue"),
            content: () => import("./views/content/club/EventsView.vue"),
          },
          props: {
            section: true,
            content: true,
          },
        },
      ],
    },
    {
      path: "/club/search",
      name: "club-search",
      components: {
        sidebar: () => import("./views/sidebar/HomeView.vue"),
        section: () => import("./views/section/SearchView.vue"),
        content: () => import("./views/content/SearchView.vue"),
      },
    },
    {
      path: "/settings",
      children: [
        {
          path: "account",
          name: "settings-account",
          components: {
            sidebar: () => import("./views/sidebar/HomeView.vue"),
            section: () => import("./views/section/SettingsView.vue"),
            content: () => import("./views/content/settings/AccountView.vue"),
          },
          meta: {
            requireAuth: true,
          },
        },
        {
          path: "notifications",
          name: "settings-notifications",
          components: {
            sidebar: () => import("./views/sidebar/HomeView.vue"),
            section: () => import("./views/section/SettingsView.vue"),
            content: () =>
              import("./views/content/settings/NotificationsView.vue"),
          },
          meta: {
            requireAuth: true,
          },
        },
        {
          path: "users",
          name: "settings-users",
          components: {
            sidebar: () => import("./views/sidebar/HomeView.vue"),
            section: () => import("./views/section/SettingsView.vue"),
            content: () => import("./views/content/settings/UsersView.vue"),
          },
          meta: {
            requireAuth: true,
            isAdmin: true,
          },
        },
      ],
    },
    {
      path: "/signup",
      name: "signup",
      components: {
        content: () => import("./views/content/SignupView.vue"),
      },
      meta: {
        preventAuth: true,
      },
    },
    {
      path: "/login",
      name: "login",
      components: {
        content: () => import("./views/content/LoginView.vue"),
      },
      meta: {
        preventAuth: true,
      },
    },
    {
      path: "/logout",
      name: "logout",
      components: {
        sidebar: () => import("./views/sidebar/HomeView.vue"),
        content: () => import("./views/content/LogoutView.vue"),
      },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      components: {
        sidebar: () => import("./views/sidebar/HomeView.vue"),
        content: () => import("./views/content/NotFoundView.vue"),
      },
    },
  ],
  history: createWebHistory(import.meta.env.BASE_URL),
});

router.beforeEach(async (to) => {
  if (to.query.invalidate) {
    await session.invalidate();

    router.push({ ...to, query: omit(to.query, "invalidate") });
  }

  return true;
});

router.beforeEach(async (to) => {
  if (session.user.isLoading)
    await new Promise((resolve) => {
      const unwatch = watch(session.user, () => {
        if (!session.user.isLoading) {
          unwatch();
          resolve();
        }
      });
    });

  if (!to.meta.requireAuth && !to.meta.preventAuth) return true;

  if (to.meta.requireAuth && session.user.data === null)
    return { name: "feed" };
  if (to.meta.preventAuth && session.user.data !== null)
    return { name: "feed" };

  if (to.meta.isAdmin && !session.user.data.isAdmin) return { name: "feed" };

  return true;
});

// #endregion

// #region App

const app = createApp(App);

app.use(router);

app.mount(document.body);

// #endregion
