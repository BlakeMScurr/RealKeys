<script lang="ts">
    import OptionButton from "../components/Generic/Buttons/OptionButton.svelte";
    import ReccomendedButton from "../components/Generic/Buttons/ReccomendedButton.svelte";
    import { getLessons } from "../lib/lesson/data"
import { get } from "../lib/util";

</script>

<style lang="scss">
    p {
        display: inline-block;
        margin: 0;
    }

    h4 {
        margin: 0;
    }
    .Beginner {
        background-color: #1bbe024a;
    }
    .Intermediate {
        background-color: #ffaa0040;
    }

    .lessonholder {
        padding: 0px 30px 30px 30px;

        display: flex;
        justify-content: space-around;
        flex-wrap: wrap;
        // max-width: 
        .lesson {
            min-width: 250px;
            max-width: 250px;
            margin: 0 15px 0 15px;

            display: flex;
            justify-content: space-between;
            padding-bottom: 15px;
            .description {
                display: inline-block;
            }

            .button {
                align-self: center;
            }
        }
    }

// this sets the ghost heights to 0 so that they don't add extra screen
    .ghost {
        padding: 0 !important;
    }
</style>

<h2>Lessons</h2>

<div class="lessonholder">
    {#each get(getLessons()).lessons as lesson, i}
        <div class="lesson">
            <div class="description">
                <h4>{lesson.name}</h4>
                <p class={lesson.level}>{lesson.level}</p>
            </div>
            <div class="button">
                {#if i === 0}
                <ReccomendedButton text="Learn"></ReccomendedButton>
                {:else}
                <OptionButton text="Learn"></OptionButton>
                {/if}
            </div>
        </div>
    {/each}

    <!-- hack to allow us to space evenly while retaining a grid -->
    {#each new Array(20) as _} 
        <div class="lesson ghost"></div>
    {/each}
</div>