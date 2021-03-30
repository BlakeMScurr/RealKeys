<script lang="ts">
    import { stores } from "@sapper/app";
    import { levelFromURL } from "../lib/level";
    
    const { page } = stores();
    const query = $page.query;
    let level = levelFromURL(query)

</script>

{Object.entries(level)}