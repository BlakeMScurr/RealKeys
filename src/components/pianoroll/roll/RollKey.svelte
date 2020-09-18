<script lang="ts">
    export let white:Boolean;
    export let rightBorder:Boolean;
    export let width:String;
    export let height:String;

    console.log(rightBorder)
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
        display: inline-block;
    }

    .nonBorder {
        width: var(--width);
    }

    .border {
        border-right: 1px solid white;
        width: calc(var(--width) - 1px);
    }

</style>

{#if white}
    {#if rightBorder}
        <div style="--width: {width}; --height: {height}" class="white border"></div>
    {:else}
        <div style="--width: {width}; --height: {height}" class="white nonBorder"></div>
    {/if}
{:else}
    <div style="--width: {width}; --height: {height}" class="black nonBorder"></div>
{/if}