<script lang="ts">
    import { stores } from "@sapper/app";
    import OptionButton from "../components/Generic/Buttons/OptionButton.svelte";
    import ReccomendedButton from "../components/Generic/Buttons/ReccomendedButton.svelte";
    import ScoreBar from "../components/Generic/ScoreBar.svelte";
import { handDesc, makeHand } from "../lib/lesson/lesson";

    const { page } = stores();
    const query = $page.query;

    const score = parseInt(query.score)
    console.log(query.hand)
    console.log(makeHand(query.hand))
    console.log(handDesc(makeHand(query.hand)))

    const heading = score === 100 ? "Congratulations!" : "Almost there!"
    const paragraph = score === 100 ? `You learned ${handDesc(makeHand(query.hand))} of bars ${query.startBar}-${query.endBar}` : undefined
</script>

<style lang="scss">
    h4 {
        text-align: center;
        margin-top: 0;
    }

    .holder {
        display: flex;
        flex-direction: column;

        div {
            margin: 60px 0 0 0;
            align-self: center;
            p {
                display: inline-block;
                width: 50px; // keeps the two types of score 
                text-align: right;
            }

            div {
                display: inline-block;
            }
        }
    }
</style>

<div class="holder">
    <h2>{heading}</h2>
    {#if paragraph}
        <h4>{paragraph}</h4>
    {/if}
    <div>
        <ScoreBar value={score} showValue={true} size={"medium"}></ScoreBar>
    </div>
    <div>
        <OptionButton text="Select Level"></OptionButton>
        <ReccomendedButton text="Next Level"></ReccomendedButton>
    </div>
</div>