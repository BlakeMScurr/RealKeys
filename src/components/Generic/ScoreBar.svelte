<script lang="ts">
    import { OneTo100 } from "../../lib/util";

    export let size: string = "small";
    export let value: number = 0;
    export let showValue: boolean = false;
    export let denominator: number = 100;

    $: v = OneTo100(value)

    if (size !== "small" && size !== "medium" && size !== "large" && size !== "flex") size = "small"
    if (size === "small") showValue = false
</script>

<style lang="scss">
    div {
        border: 1px solid #5A5757;
        display: flex;

        background: linear-gradient(90deg, var(--color) var(--width), #FFFFFF var(--width));
        p {
            align-self: center;
        }


        p {
            align-self: center;
            margin: auto;
        }
    }

    .small {
        height: 7px;
        width: 84px;
    }

    .medium {
        height: 18px;
        width: 105px;
    }

    .large {
        height: 19px;
        width: 150px; 
    }

    .flex {
        height: 100%;
        width: 100%;
    }
</style>

<div class={size} style="--width: {100*v/denominator}%; --color: {v >= denominator ? "#1CBE02" : "#FFA800"}">
    {#if showValue}
        <p class="robotic">{v}/{denominator}</p>
    {/if}
</div>
