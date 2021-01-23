<script lang="ts">
    import { addFetchListener } from "../lib/thirdPartyCaching"
    import { onMount } from 'svelte';
    import Nav from "../components/generic/Nav.svelte"

    onMount(()=>{
        addFetchListener()
    })
</script>

<style lang="scss">
</style>

<Nav></Nav>
<slot></slot>