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
        height: 23px;
        min-width: 72px;
        border-radius: 2px;
        background-color: #38A3FA;
        border: none;
        display: inline-block;

        &:hover {
            color: white;
            background-color: #1d5b8d;
        }
        
        div {
            display: flex;
            justify-content: center;

            h5 {
                margin: 0;
                padding-top: 0;
                padding-bottom: 0;
                color: white;
                align-self: center;
                padding: 10px;
            }
        }
    }

</style>

<div on:click={handleClick}>
    <div>
        <h5 class="robotic">{text.toLocaleUpperCase()}</h5>
    </div>
</div>