<script lang="ts">
    import { addFetchListener } from "../lib/thirdPartyCaching"
    import { onMount } from 'svelte';

    onMount(()=>{
        addFetchListener()
    })
</script>

<slot></slot>