<script lang="ts">
    import ReccomendedButton from "../components/Generic/Buttons/ReccomendedButton.svelte";
    import { abstractNotes, NewAbstractNote } from "../lib/music/theory/notes"
    import { allScales } from "../lib/music/theory/scales";
    import { goto } from '@sapper/app'
    import { historyKey, level } from "../lib/level";
    import { getSettings } from "../lib/storage";
    import { stores } from "@sapper/app";
    import { onMount } from "svelte";
import { iOS } from "../lib/util";

    const { session, page } = stores();

    let key = NewAbstractNote("C")
    let tonality = "Major"
    let phraseLength = 4
    let notePoolSize = 2
    let maxInterval = 2

    let ios = false
    onMount(() => {
        try {
            ios = iOS()
        } catch (e) {
            console.warn(e)
        }
        let historyStr = localStorage.getItem(historyKey)
        if (historyStr) {
            let history = JSON.parse(historyStr)
            let lastLevel = history.levels[history.levels.length -1]
            key = NewAbstractNote(lastLevel.key)
            tonality = lastLevel.tonality
            phraseLength = lastLevel.phraseLength
            notePoolSize = lastLevel.notePoolSize
            maxInterval = lastLevel.maxInterval
        }

    })

    function validate() {
        if (maxInterval > notePoolSize) maxInterval = notePoolSize
        if (phraseLength < 2) phraseLength = 2
        if (notePoolSize < 2) notePoolSize = 2
        if (maxInterval < 2) maxInterval = 2
        if (Math.floor(phraseLength) !== phraseLength) phraseLength = Math.floor(phraseLength)
        if (Math.floor(notePoolSize) !== notePoolSize) notePoolSize = Math.floor(notePoolSize)
        if (Math.floor(maxInterval) !== maxInterval) maxInterval = Math.floor(maxInterval)
    }
</script>

<style lang="scss">
    div {
        max-width: 450px;
        margin: 0 auto;
        padding: 0 20px 0 20px;

        div {
            display: flex;
            align-items: center;
            justify-content: space-between;

            // inheritance breakers
            margin: 0;
            padding: 0;

        }

        .btnHolder {
            display: flex;
            justify-content: center;
        }
    }
</style>

{#if ios}
    <h2>Sorry, RealKeys doesn't work on iOS</h2>
{:else}
    <h2>Train Your Ear</h2>

    <div>
        <div>
            <h3>Key</h3>
            <div>
                <select bind:value={key}>
                    {#each abstractNotes() as note}
                        <option value={note}>
                            {note.prettyString()}
                        </option>
                    {/each}
                </select>
                <select bind:value={tonality}>
                    {#each allScales() as scale}
                        <option value={scale}>
                            {scale}
                        </option>
                    {/each}
                </select>
            </div>
        </div>

        <div>
            <h3>Phrase Length</h3>
            <input bind:value={phraseLength} type="number" min=2 step=1 on:change={validate}>
        </div>

        <div>
            <h3>Note pool size</h3>
            <input bind:value={notePoolSize} type="number" min=2 step=1 on:change={validate}>
        </div>

        <div>
            <h3>Max interval</h3>
            <input bind:value={maxInterval} type="number" min=2 step=1 max={notePoolSize} on:change={validate}>
        </div>

        <div class="btnHolder">
            <ReccomendedButton text="Go" on:click={
                () => {
                    let nextStop = (new level(key.enharmonicEquivalent(), tonality, phraseLength, notePoolSize, maxInterval)).playURL()
                    if (getSettings()) {
                        goto(nextStop)
                    } else  {
                        session.set({"redirect": nextStop})
                        goto("/settings")
                    }
                }
            }></ReccomendedButton>
        </div>
    </div>
{/if}