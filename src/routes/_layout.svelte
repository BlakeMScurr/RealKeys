<script lang="ts">
    import { addFetchListener } from "../lib/thirdPartyCaching"
    import { onMount } from 'svelte';
    import Nav from "../components/Generic/Nav.svelte";

    onMount(()=>{
        addFetchListener()
    })
</script>

<style lang="scss">
</style>

<!-- TODO: set title in each page -->
<svelte:head> 
	<title>RealKeys</title>
</svelte:head>

<Nav></Nav>
<slot></slot>

