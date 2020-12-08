<script>
    import { onMount } from "svelte";
    import { goto } from '@sapper/app';
    import { joinURL } from "../lib/util";

    let lessons = []

    onMount(()=> {
        fetch(joinURL(["api", "lessons"]), {
            method: "GET",
        }).then((res) => {
            return res.json()
        }).then((json) => {
            lessons = json
        })
    })
</script>

<style lang="scss">
    .result {
        border: 1px solid grey;
        margin: 2px;
        padding: 5px;

        &:hover {
            background-color: #667ED4;
            cursor: pointer;
            color: white;
        }
    }
 </style>

<h1>Lessons</h1>

{#each lessons as lesson}
    <div class="result" on:click={()=>{goto(lesson.lesson_name)}}>
        <h1>{ lesson.lesson_name }</h1>
        <h3>{ lesson.artist }</h3>
    </div>
{/each}

