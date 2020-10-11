<script lang="ts">
    import type { Player } from './audioplayer';
    import { currentSong, playingStore, position, repeats, songDuration } from '../stores';
    import { renderSeconds } from '../../lib/util';

    export let audioPlayer:Player;

    songDuration.set(audioPlayer.Duration())

    let positionPercentage = 0;
    position.subscribe((value) => {
        if (positionPercentage != value) {
            positionPercentage = value
            audioPlayer.Seek(positionPercentage*audioPlayer.Duration())
        }
    })

    // wrapper on store's naked set and increment methods which allow us to distinguish between
    // changes caused by us and 
    function setPosition (val: number) {
        positionPercentage = val
        position.set(val)
    }

    function incrementPosition (val: number) {
        positionPercentage += val
        position.increment(val)
    }
    
    let duration = audioPlayer.Duration()

    let playing = false;
    let speed = 1;

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
                setPosition(newLeftPos / duration)
                audioPlayer.Seek(newLeftPos)
                // TODO: why is repetition broken by hitting the left or right arrows?
                setRepeatIntervals(audioPlayer.CurrentTime())
                break;
            case 39: // right arrow
                let newRightPos = audioPlayer.CurrentTime() + 0.5
                if (newRightPos > duration) newRightPos = duration
                setPosition(newRightPos / duration)
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
            incrementPosition((1/100 * speed) / duration)
        }, 10)
        playing = true
        let t = audioPlayer.CurrentTime()
        audioPlayer.Play()
        setRepeatIntervals(t)
        playingStore.play()
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
                    setPosition(startRepeat)
                    clearInterval(repeatInterval)
                    repeatInterval = setInterval(() => {
                        audioPlayer.Seek(startRepeat * duration)
                        setPosition(startRepeat)
                    }, ((endRepeat - startRepeat) * duration) * 1000);
                }, (endRepeat * duration - ct) * 1000)
            }
        }
    }

    let volume = 1;
    $: {
        audioPlayer.Volume(volume)
    }

    function pause() {
        clearInterval(positionInterval)
        clearInterval(repeatInterval)
        clearTimeout(repeatTimeout)
        playing = false
        audioPlayer.Pause()
        playingStore.pause()
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

<input type=range bind:value={volume} min=0 max=1 step=0.05>

<p id="positionDuration">{renderSeconds( $position * duration )}/{renderSeconds( duration )}</p>