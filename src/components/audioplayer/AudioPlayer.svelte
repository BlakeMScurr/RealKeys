<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Player } from './audioplayer';
    import { position, repeats } from '../stores';
    import { renderSeconds } from '../../lib/util';
    import { Howl } from 'howler';

    export let audioPlayer;

    let positionPercentage = 0;
    position.subscribe((value) => {
        positionPercentage = value
    })

    let duration = audioPlayer.Duration()

    let playing = false;
    let speed = 1;
    let lastTickPlayer = 0;

    let startRepeat = 0;
    let endRepeat = 1;
    repeats.subscribe((r)=>{
        startRepeat = r.start
        endRepeat = r.end
    })

    document.addEventListener("keydown", event => {
        switch (event.keyCode) {
            case 32:
                if (playing) {
                    pause()
                } else {
                    play()
                }
                break;
            case 37: // left arrow
                let newLeftPos = audioPlayer.CurrentTime() - 0.5
                if (newLeftPos < 0) newLeftPos = 0
                // TODO: make sure we don't get multiple intervals running when there is an error setting the current time out of bounds
                position.set(newLeftPos / duration)
                audioPlayer.Seek(newLeftPos)
                // TODO: why is repetition broken by hitting the left or right arrows?
                setRepeatIntervals(audioPlayer.CurrentTime())
                break;
            case 39: // right arrow
                let newRightPos = audioPlayer.CurrentTime() + 0.5
                if (newRightPos > duration) newRightPos = duration
                position.set(newRightPos / duration)
                audioPlayer.Seek(newRightPos)
                setRepeatIntervals(audioPlayer.CurrentTime())
                break;
        }
    });

    let positionInterval
    let repeatTimeout
    let repeatInterval
    function play() {
        clearInterval(positionInterval)
        positionInterval = setInterval(()=>{
            position.increment((1/100 * speed) / duration)
        }, 10)
        playing = true
        let t = audioPlayer.CurrentTime()
        audioPlayer.Play()
        setRepeatIntervals(t)
    }

    function setRepeatIntervals(ct) {
        // time argument is a workaround for https://github.com/goldfire/howler.js/issues/1189
        // as we have to seek before called play() on the howler object in our play function, for whatever reason
        if (isNaN(ct)) {
            ct = audioPlayer.CurrentTime()
        }
        if (playing) {
            clearInterval(repeatInterval)
            clearTimeout(repeatTimeout)
            if (ct < endRepeat * duration) {
                repeatTimeout = setTimeout(()=>{
                    audioPlayer.Seek(startRepeat * duration)
                    position.set(startRepeat)
                    clearInterval(repeatInterval)
                    repeatInterval = setInterval(() => {
                        audioPlayer.Seek(startRepeat * duration)
                        position.set(startRepeat)
                    }, ((endRepeat - startRepeat) * duration) * 1000);
                }, (endRepeat * duration - ct) * 1000)
            }
        }
    }

    function pause() {
        clearInterval(positionInterval)
        clearInterval(repeatInterval)
        clearTimeout(repeatTimeout)
        playing = false
        audioPlayer.Pause()
    }
</script>

<style>
    button {
        width: 100px;
    }

    #positionDuration {
        display: inline;
    }
</style>

{#if playing}
    <button on:click={pause}>Pause</button>
{:else}
    <button on:click={play}>Play</button>
{/if}
<p id="positionDuration">{renderSeconds( $position * duration )}/{renderSeconds( duration )}</p>