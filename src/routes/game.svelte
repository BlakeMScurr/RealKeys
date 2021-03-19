<script lang="ts">
    import { stores } from "@sapper/app";
    import Game from "../components/Game.svelte";
    import { urlToTask } from "../lib/gameplay/curriculum/task";
    import type { task } from "../lib/gameplay/curriculum/task";

    const { page } = stores();
    const query = $page.query;
    let currentTask: task = urlToTask(query)

    
</script>

<Game currentTask={currentTask}></Game>
