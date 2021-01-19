<script lang="ts">
    import OptionButton from "../components/Generic/Buttons/OptionButton.svelte";
    import ReccomendedButton from "../components/Generic/Buttons/ReccomendedButton.svelte";

    enum difficulty {
        Beginner = "Beginner",
        Intermediate = "Intermediate",
        Advanced = "Advanced",
    }

    class lesson {
        level: difficulty;
        name: string;
        constructor(level: difficulty, name: string) {
            this.level = level
            this.name = name
        }
    }

    const lessons = [
        new lesson(difficulty.Beginner, "Mary Had a Little Lamb"),
        new lesson(difficulty.Beginner, "Twinkle Twinkle Little star"),
        new lesson(difficulty.Beginner, "Silent Night"),
        new lesson(difficulty.Intermediate, "Fur Elise"),
        new lesson(difficulty.Intermediate, "Piano Man"),
    ]
    
</script>

<h2>Lessons</h2>

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
        .description {
            display: inline-block;
        }
    }
</style>

{#each lessons as lesson, i}
    <div class="lesson">
        <div class="description">
            <h4>{lesson.name}</h4>
            <p class={lesson.level}>{lesson.level}</p>
        </div>
            {#if i === 0}
            <ReccomendedButton text="Learn"></ReccomendedButton>
            {:else}
            <OptionButton text="Learn"></OptionButton>
            {/if}
    </div>
{/each}
