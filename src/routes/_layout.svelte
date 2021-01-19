<script lang="ts">
    import { addFetchListener } from "../lib/thirdPartyCaching"
    import { onMount } from 'svelte';
    import Nav from "../components/generic/Nav.svelte"

    onMount(()=>{
        addFetchListener()
    })
</script>

<Nav></Nav>

<slot></slot>