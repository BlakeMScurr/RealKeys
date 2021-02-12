<script lang="ts">
    import { createEventDispatcher } from "svelte";

    let dispatch = createEventDispatcher()
    function handleClick() {
        dispatch("click")
    }

    export let text: string;
</script>

<style lang="scss">
    div {
        height: 21px;
        min-width: 70px;
        box-sizing: border-box;
        border-radius: 10px;
        border: 1px solid black;
        color: black;
        display: inline-block;
        
        &:hover {
            color: white;
            background-color: black;
        }

        div {
            display: flex;
            justify-content: center;
            border: none;

            h4 {
                margin: 0;
                padding-top: 0;
                padding-bottom: 0;
                align-self: center;
                padding: 10px;
            }
        }
    }

</style>

<div on:click={handleClick}>
    <div>
        <h4>{text}</h4>
    </div>
</div>