<script>
    export let type = "";
</script>

<style>
    /* TODO: eliminate need for container, it's just required for storybook */
    #container {
        height: 50px;
        background-color: white;
    }

    #container:hover {
        cursor: move;
    }

    div {
        background-color: black;
        display: inline-block;
    }

    .thin {
        height: 100%;
        width: 1px;
    }

    .thick {
        height: 100%;
        width: 8px;
    }

    .dotholder {
        position: relative;
        height: 100%;
        background-color:rgba(255,255,255,0.0);
        width: 8px;
    }

    .dot {
        border-radius: 50%;
        height: 8px;
        width: 8px;
        display: inline-block;
        position: absolute;
    }

    .low {
        top: calc(18.75% + 2px);
    }
    .high {
        top: calc(81.25% - 12px)
    }
</style>

<div id="container" draggable={type != ""}> 
    {#if type == ""}
        <div class="thin"></div>
    {:else if type == "s"}
        <div class="thick"></div>
        <div class="thin"></div>
        <div class=dotholder>
            <div class="dot high"></div>
            <div class="dot low"></div>
        </div>
    {:else if type == "e"}
        <div class=dotholder>
            <div class="dot high"></div>
            <div class="dot low"></div>
        </div>
        <div class="thin"></div>
        <div class="thick"></div>
    {:else}
        <p>invalid barline type: {type}</p>
    {/if}
</div>