<script lang="ts">
    import ReccomendedButton from "../components/Generic/Buttons/ReccomendedButton.svelte";
    import { abstractNotes, NewAbstractNote } from "../lib/music/theory/notes"
    import { allScales } from "../lib/music/theory/scales";
    import { goto } from '@sapper/app'
    import { level } from "../lib/level";
    import { objToURLArgs } from "../lib/util";

    let key = NewAbstractNote("C")
    let tonality = "Major"
    let phraseLength = 2
    let notePoolSize = 2
    let maxInterval = 2

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
        <ReccomendedButton text="Go" on:click={goto("play?" + objToURLArgs(new level(key.enharmonicEquivalent(), tonality, phraseLength, notePoolSize, maxInterval)))}></ReccomendedButton>
    </div>
</div>