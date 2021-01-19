<script lang="ts">
    import OptionButton from "../components/Generic/Buttons/OptionButton.svelte";
    import ReccomendedButton from "../components/Generic/Buttons/ReccomendedButton.svelte";
    import { lessons } from "../lib/lesson/data"

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

    .lesson {
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
</style>

<h2>Lessons</h2>

{#each lessons as lesson, i}
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
