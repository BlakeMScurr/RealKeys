<script lang="ts">
    import type { Bars } from "../pianoroll";

    export let bars: Bars;
    export let startPercentage: number;
    export let endPercentage: number;

    let truncatedBars = bars.truncate(startPercentage, endPercentage)
</script>