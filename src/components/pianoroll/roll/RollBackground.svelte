<script lang="ts">
    import type { Note } from "../../../lib/music/theory/notes";

    export let keys: Array<Note>;
</script>

<style lang="scss">

    .holder {
        display: flex;
        height: 100%;

        div {
            flex-grow: 1;
        }
    
        .white {
            background: linear-gradient(180deg, #FFFFFF 0%, #E6E6E6 55.73%, #FFFFFF 100%);
        }
    
        .black {
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.36) 0%, #BCBCBC 39.06%, #A4A4A4 100%);
        }

        .sepholder {
            display: flex;
            div {
                height: 100%;
            }

            .white {
                width: calc(100% - 2px);
            }

            .separator {
                background: white;
                width: 2px;
            }
        }

    }
</style>

<div class="holder">
    {#each keys as key, i}
        {#if key.abstract.accidental}
            <div class="black"></div>
        {:else if i > 0 && !keys[i-1].abstract.accidental}
            <div class="sepholder">
                <div class="separator"></div>
                <div class="white"></div>
            </div>
        {:else}
            <div class="white"></div>
        {/if}
    {/each}
</div>