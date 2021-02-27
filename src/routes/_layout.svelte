<script lang="ts">
    import { addFetchListener } from "../lib/thirdPartyCaching"
    import { onMount } from 'svelte';
    import Nav from "../components/Generic/Nav.svelte";
    import { handleErrors, objToURLArgs } from "../lib/util";
    import { stores, goto } from "@sapper/app";
    import { getSettings } from "../lib/storage";
    
    const { page, session } = stores();

    onMount(()=>{
        handleErrors(window)
        addFetchListener()
        if (!$page.path.includes("/settings") && !getSettings()) {
            session.set({"redirect": $page.path + "?" + objToURLArgs($page.query)})
            goto("/settings")
        }
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

