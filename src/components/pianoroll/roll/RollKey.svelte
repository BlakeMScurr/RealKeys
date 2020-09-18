<script lang="ts">
    export let white:Boolean;
    export let width:String;
    export let height:String;
</script>

<style>
    .white {
        background-color: #8D8C8C;
    }

    .black {
        background-color: #5A5757;
    }

    div {
        height: var(--height);
        width: var(--width)
    }
</style>

{#if white}
    <div style="--width: {width}; --height: {height}" class="white"></div>
{:else}
    <div style="--width: {width}; --height: {height}" class="black"></div>
{/if}