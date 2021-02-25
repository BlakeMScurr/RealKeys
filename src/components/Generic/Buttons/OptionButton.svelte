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
        min-width: 80px;
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
            height: 100%;

            h6 {
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
        <h6 class="robotic">{text.toLocaleUpperCase()}</h6>
    </div>
</div>