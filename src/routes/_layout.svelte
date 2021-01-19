<script lang="ts">
    import { addFetchListener } from "../lib/thirdPartyCaching"
    import { onMount } from 'svelte';
    import Nav from "../components/generic/Nav.svelte"

    onMount(()=>{
        addFetchListener()
    })
</script>

<style lang="scss">
    div {
        padding: 0px 30px 30px 30px;
    }
</style>

<Nav></Nav>

<div>
    <slot></slot>
</div>