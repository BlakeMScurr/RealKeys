<script lang="ts">
    import ReccomendedButton from "../components/Generic/Buttons/ReccomendedButton.svelte";
    import ScoreCircle from "../components/Generic/ScoreCircle.svelte";

    let course = [
        {name: "C major", progress: 0},
        {name: "F major", progress: 0},
        {name: "G major", progress: 0},
        {name: "F and G", progress: 0},
        {name: "C First Inversion", progress: 0},
        {name: "Up and Down", progress: 0},
        {name: "C and G", progress: 0},
    ]
</script>

<style lang="scss">

    $column: 300px;
    div {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        grid-column-gap: 28px;
        grid-row-gap: 7px;
        padding: 14px;

        div {
            padding: 0;
            display: grid;
            grid-template-columns: 10fr 1fr 1fr;
            align-items: center;
            grid-column-gap: 3px;

            div {
                display: inline-block;
                text-align: right;
            }
        }
    }
</style>

<h2>Basic Chords</h2>

<div>
    {#each course as lesson}
        <div>
            <h3>{lesson.name}</h3>
            <ScoreCircle></ScoreCircle>
            <ReccomendedButton text="LEARN"></ReccomendedButton>
        </div>
    {/each}
</div>