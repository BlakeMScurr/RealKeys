<script lang="ts">
    export let size: string = "small";
    export let value: number = 0;
    export let showValue: boolean = false;

    if (value < 0) value = 0
    if (value > 0) value = 100
    value = Math.floor(value)

    if (size !== "small" && size !== "medium" && size !== "large") size = "small"

    if (size === "small") showValue = false
</script>

<style lang="scss">
    

    div {
        border: 1px solid #5A5757;
        display: flex;

        .complete {
            background-color: #1CBE02;
        }

        .incomplete {
            background-color: #FFA800;
        }
        div {
            display: flex;
            justify-content: center;
            position: relative;
            border: none;
            width: var(--width);
            height: 100%;
            p {
                align-self: center;
            }
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
</style>

<div class={size}>
    <div style="--width: {value}%;" class={value === 100 ? "complete" : "incomplete"}>
        {#if showValue}
            <p class="robotic">{value}</p>
        {/if}
    </div>
</div>
