<script lang="ts">
    import { onMount } from "svelte";
    import { getCookie, handleErrors, QWERTYCookie } from "../lib/util";

    // TODO: this seems like a lot of work just to set a checkbox
    let setQWERTYCookie = (on: boolean) => {};
    let showQWERTY;

    onMount(() => {
        handleErrors(window)

        setQWERTYCookie = (on: boolean) => {
            document.cookie = QWERTYCookie + "=" + on
        }
        showQWERTY = getCookie(QWERTYCookie, document.cookie) === "true"
    })

    $: {
        if (showQWERTY !== undefined) {
            setQWERTYCookie(showQWERTY)
        }
    }
</script>

<h2>Settings</h2>

<style lang="scss">
    div {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 30px;
    }

    [type="checkbox"]
    {
        vertical-align:middle;
    }
</style>

<!-- TODO: add settings for input setup, and a helper to set up your MIDI keyboard -->
<div class="holder">
    <div>
        <label>Show QWERTY letters for keys
            <input type="checkbox" bind:checked={showQWERTY}>
        </label>
    </div>
</div>