<script>
    import { createEventDispatcher } from 'svelte';
    import { Howl } from 'howler';
    import { positions } from '../bars/bars.js'
    import Wrapper from '../bars/Wrapper.svelte'
    import Bars from '../bars/Bars.svelte'
    import Metronome from '../track/Metronome.svelte'

    export let videoID;
    export let bars;
    export let editable;

    let audioPlayer;
    let audioLoaded = false;
    let playing = false
    let positionPercentage = 0;
    let duration = 0;
    let speed = 1;
    let lastTickPlayer = 0;
    let seeked = false;

    let loop = true;
    let startRepeat = 0;
    let endRepeat = 1;

    const dispatch = createEventDispatcher();
    function forward(event) {
        dispatch(event.type, event.detail);
    }

    document.addEventListener("keydown", event => {
        switch (event.keyCode) {
            case 32:
                if (audioLoaded) {
                    if (playing) {
                        pause()
                    } else {
                        play()
                    }
                }
                break;
            case 37: // left arrow
                let newLeftPos = audioPlayer.seek() - 0.5
                if (newLeftPos < 0) newLeftPos = 0
                positionPercentage = newLeftPos / duration
                seek(newLeftPos)
                break;
            case 39: // right arrow
                let newRightPos = audioPlayer.seek() + 0.5
                if (newRightPos > duration) newRightPos = duration
                positionPercentage = newRightPos / duration
                seek(newRightPos)
                break;
        }
    });

    function handleSeek(event) {
        positionPercentage = event.detail.position
        seek(positionPercentage * duration)
        setRepeatIntervals()
    }

    function handleNewRepeats(event) {
        startRepeat = event.detail.start
        endRepeat = event.detail.end
        setRepeatIntervals()
    }

    // seeks a time in seconds
    function seek(time) {
        audioPlayer.seek(time)
        seeked = true
    }

    function renderSeconds(seconds) {
        seconds = seconds.toFixed(1)
        if (seconds < 60) {
            return seconds.toString()
        }

        let minutes = Math.floor(seconds / 60)
        seconds = seconds % 60
        if (minutes < 60) {
            return minutes + ":" + seconds
        }

        let hours = Math.floor(minutes / 60)
        minutes = minutes % 60
        return hours + ":" + minutes + ":" + seconds
    }

    let positionInterval
    let repeatTimeout
    let repeatInterval
    function play() {
        positionInterval = setInterval(()=>{
            positionPercentage += (1/100 * speed) / duration
            seeked = false
        }, 10)
        playing = true
        let t = audioPlayer.seek()
        audioPlayer.play()
        setRepeatIntervals(t)
    }

    function setRepeatIntervals(ct) {
        // time argument is a workaround for https://github.com/goldfire/howler.js/issues/1189
        // as we have to seek before called play() on the howler object in our play function, for whatever reason
        if (isNaN(ct)) {
            ct = audioPlayer.seek()
        }
        if (playing) {
            clearInterval(repeatInterval)
            clearTimeout(repeatTimeout)
            if (ct < endRepeat * duration) {
                repeatTimeout = setTimeout(()=>{
                    seek(startRepeat * duration)
                    positionPercentage = startRepeat
                    repeatInterval = setInterval(() => {
                        seek(startRepeat * duration)
                        positionPercentage = startRepeat
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
        audioPlayer.pause()
    }

    function setAudio(node, player) {
        audioLoaded = true
        audioPlayer = player
        duration = audioPlayer.duration()
    }

	async function getYTAudio() {
		let howlPromise = new Promise((resolve, reject) => {
			let sound;
			sound = new Howl({
                src: ['getYTAudio/' + videoID],
				format: 'mp3',
				onload: () => {
                    resolve(sound)
                },
                onend: () => {
                    pause()
                    positionPercentage = 0;
                },
                html5: true, // html5 being forced gives us rate change without pitch increase as per https://github.com/goldfire/howler.js/issues/586#issuecomment-237240859
			});
		})

		return howlPromise;
    }
</script>

<style>
    button {
        width: 100px;
    }

    #hack {
        display: none;
    }

    #positionDuration {
        display: inline;
    }

    #playbackArea {
        width: 100%;
    }    
</style>

{#if !audioPlayer}
    <button on:click={play} disabled>Play</button>
{:else if playing}
    <button on:click={pause}>Pause</button>
{:else}
    <button on:click={play}>Play</button>
{/if}

{#await getYTAudio(videoID)}
	<h3>Loading Audio . . .</h3>
{:then loadedPlayer}
    <p id="hack" use:setAudio={loadedPlayer}></p> <!-- TODO: remove hack designed to pass the audio to the component's state once the promise is ready -->
        <div id="playbackArea">
        <Wrapper bind:bars={bars} position={positionPercentage} on:seek={handleSeek} on:repeat={handleNewRepeats} songLength={duration} on:save={forward} {editable}></Wrapper>
        <Metronome time={positionPercentage*duration} playing={playing} ticks={positions(bars).slice(1, bars.length).map((x)=>{return x * duration})} seeked={seeked}></Metronome>
    </div>
    <p id="positionDuration">{renderSeconds(positionPercentage*duration)}/{renderSeconds(duration)}</p>
{/await}