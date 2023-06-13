# Rave

> Club management system for educational institutions.

## Introduction

Rave is a club management app, built with [Vue](https://vuejs.org/) and [Express](https://expressjs.com/).

It's designed to enable student clubs promote themselves, find new members, and keep their existing members updated.

The app persists data in a [PostgreSQL](https://www.postgresql.org/) database.

## Usage

This repository consists of the following apps and packages, managed with [Turborepo](https://turbo.build/repo):

- `api`: an [Express](https://expressjs.com/) server.
- `client`: an SPA, built with [Vue](https://vuejs.org/).
- `eslint-config-custom`: an [ESLint](https://eslint.org/) configuration, shared by both the `api` and `client` applications.

By default, running a script in the root directory will run it in all subprojects.\
To run a script in a single subproject, use the `workspace` option:

```sh
npm run <script> --workspace <subproject>
# OR
npm run <script> -w <subproject>
```

### Development

This repository includes a [Dev Container](https://containers.dev/) configuration for convenience.

In [Visual Studio Code](https://code.visualstudio.com/), install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) and select `Dev Containers: Reopen in Container` from the Command Palette (<kbd>F1</kbd>).

#### Scripts

To start a subproject in development mode:

```sh
npm run dev
# OR
npm run dev -w <subproject>
```

Running the script without specifying a subproject will start all subprojects simultaneously.

To lint the repository:

```sh
npm run lint
# OR
npm run lint -w <subproject>
```

#### Database

##### Syncing and Seeding

On startup, the server will automatically sync the necessary tables, as well as create a default administrator account.

However, scripts are also provided to sync the tables manually and seed them with test data.

To sync the tables:

```sh
npm run -w api script:sync
```

To seed the tables with dummy data:

```sh
npm run -w api script:seed
```

If the server has not yet been started, it is necessary to run both scripts.

Note: The seed script assumes the database is empty, so it is required to run the sync script beforehand.

##### Prompt

To start an interactive prompt:

```sh
docker run --interactive --tty --rm --network host postgres psql -h localhost -p 5432 -U rave
```

To execute the contents of a script:

```sh
docker run --interactive --rm --network host postgres psql -h localhost -p 5432 -U rave < <script.sql>
```

The above commands will work in the Dev Container without modification.

#### Diagrams

The [`/media`](./media/) directory contains a series of planning diagrams, which were created with [draw.io](https://drawio.com/).

To edit these diagrams, there are three recommended options:

- The [browser app](https://app.diagrams.net/), which supports [GitHub](https://github.com/) editing.
- The [desktop app](https://drawio.com/).
- The [integration for VS Code](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio), which is included in the Dev Container[^1].

[^1]: The integration can be accessed through the `Open with...` dialogue in the right-click menu.

### Production

#### Scripts

To bundle a subproject:

```sh
npm run build
# OR
npm run build -w <subproject>
```

To remove build artifacts:

```sh
npm run clean
# OR
npm run clean -w <subproject>
```
