<script lang="ts">
    import OptionButton from "../components/Generic/Buttons/OptionButton.svelte";
    import ReccomendedButton from "../components/Generic/Buttons/ReccomendedButton.svelte";
import ScoreBar from "../components/Generic/ScoreBar.svelte";
    import { lessons } from "../lib/lesson/data"
</script>

<style lang="scss">
    p {
        display: inline-block;
        margin: 0;
    }

    h4 {
        margin: 0;
        margin-top: 15px;
    }

    .task {
        display: flex;
        justify-content: space-between;
        margin-bottom: 7px;
        padding-left: 15px;

        .button {
            align-self: center;
        }
    }
</style>

<h2>{lessons[0].name}</h2>

{#each lessons[0].sections as section}
    <div class="section">
        <div class="description">
            <h3>Bars {section.startBar}-{section.endBar}</h3>
            {#each section.hands as hand}
                <div>
                    <h4>{hand.hand}</h4>

                    {#each hand.speeds as speed}
                        <div class="task">
                            <div>
                                <p>{speed.speed}</p>
                                <ScoreBar value={speed.progress}></ScoreBar>
                            </div>
                            <div class="button">
                                <OptionButton text="Learn"></OptionButton>
                            </div>
                        </div>
                    {/each}
                </div>
            {/each}
        </div>
    </div>
{/each}
