<script lang="ts">
    import { goto } from "@sapper/app";
    import { onMount } from "svelte";
    import OptionButton from "../components/Generic/Buttons/OptionButton.svelte";
    import ReccomendedButton from "../components/Generic/Buttons/ReccomendedButton.svelte";
    import type { Curriculum } from "../lib/gameplay/curriculum/curriculum";
    import { emptyProgress, getProgress } from "../lib/storage";
    import { getCookie, handleErrors, QWERTYCookie } from "../lib/util";

    function handleClick(name: string) {
        return () => {
            goto("lesson?lesson=" + name)
        }
    }

    let lessons: Curriculum = emptyProgress()

    // Detects a touch event from the home page and disables the letters on the keyboard
    onMount(()=>{
        handleErrors(window)

        if (getCookie(QWERTYCookie, document.cookie) === undefined) {
            document.cookie = QWERTYCookie + "=" + true
            document.addEventListener("touchstart", ()=> {
                document.cookie = QWERTYCookie + "=" + false
            })
        }

        lessons = getProgress()
    })
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
    .lessonholder {
        padding: 0px 30px 30px 30px;

        display: flex; // TODO: display: grid;
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

<h2>Learn Piano without Sheet Music</h2>

<div class="lessonholder">
    {#each lessons.getLessons() as lesson, i}
        <div class="lesson">
            <div class="description">
                <h4>{lesson}</h4>
                <p class="Beginner">Beginner</p>
                <!-- TODO: show how far through a lesson you are -->
            </div>
            <div class="button">
                {#if i === 0}
                    <!-- TODO: reccomend the next one you haven't tried yet -->
                    <ReccomendedButton text="Learn" on:click={handleClick(lesson)}></ReccomendedButton>
                {:else}
                    <OptionButton text="Learn" on:click={handleClick(lesson)}></OptionButton>
                {/if}
            </div>
        </div>
    {/each}

    <!-- hack to allow us to space evenly while retaining a grid -->
    {#each new Array(20) as _} 
        <div class="lesson ghost"></div>
    {/each}
</div>