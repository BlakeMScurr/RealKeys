This document contains developer guidelines.

# Structure

## routes

This project is written in Svelte/Sapper and therefore has a routes directory where every .svelte file represents a page, and every .js file represents an endpoint on the server.

Further, every .js route should sit under the `routes/api` directory.

## components

Components should be as decoupled from one another as possible, therefore components generally shouldn't inherit one another. Component composition should happen at the page level.

Child components (ones that only exist to be used by their parents) live in directories starting with `child`. These should not be imported by anything other than their parent.

# Code

## Svelte

All svelte components should be written in typescript.

Svelte components should not contain much logic. They should only include svelte specific things like event dispatchers, accepting props, and calling external functions. Any further logic should be put in .ts files and be carefully tested.