<script lang="ts">
    import { createEventDispatcher, onDestroy, onMount } from "svelte";
    import { fade } from 'svelte/transition';
import { getSettings, inputType } from "../../../lib/storage";

    let dispatch = createEventDispatcher()
    function handleClick() {
        dispatch("click")
    }

    export let text: string;
    export let defaultAction: boolean = false;

    let lowerText;
    function keyBoardShortCutCatcher(event) {
        if (event.key === "Enter") {
            dispatch("click")
        }
    }
    onMount(()=>{
        if (defaultAction && getSettings() !== inputType.touch) {
            document.addEventListener("keypress", keyBoardShortCutCatcher)
            setTimeout(() => {
                lowerText = "(enter)"
            }, 10000);
        }
    })

    onDestroy(() => {
        document.removeEventListener("keypress", keyBoardShortCutCatcher)
    })
</script>

<style lang="scss">
    .parent {
        position: relative;
        div.button {
            height: 23px;
            min-width: 82px;
            border-radius: 2px;
            background-color: #38A3FA;
            border: none;
            display: inline-block;

            &:hover {
                color: white;
                background-color: #1d5b8d;
            }
            
            div {
                height: 23px;
                min-width: 82px;
                display: flex;
                justify-content: center;

                h6 {
                    margin: 0;
                    padding-top: 0;
                    padding-bottom: 0;
                    color: white;
                    align-self: center;
                    padding: 10px;
                }
            }
        }
        
        .textHolder {
            height: 16px;
            position: absolute;
            width: 100%;
            p {
                text-align: center;
                margin: 0;
                color: grey;
            }
        }

    }

</style>

<div class="parent">
    <div class="button" on:click={handleClick}>
        <div>
            <h6 class="robotic">{text.toLocaleUpperCase()}</h6>
        </div>
    </div>
    {#if defaultAction}
        <div class="textHolder">
            {#if lowerText}
                <p in:fade>{lowerText}</p>
            {/if}
        </div>
    {/if}
</div>