<script>
    import { Howl } from 'howler';

    export let videoID;

    let audioPlayer;
    let playing = false
    let position = 0;
    let duration = 0;
    let speed = 1;

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
                let newLeftPost = audioPlayer.seek() - 0.5
                position = newLeftPost
                audioPlayer.seek(newLeftPost)
                break;
            case 39: // right arrow
                let newRightPos = audioPlayer.seek() + 0.5
                position = newRightPos
                audioPlayer.seek(newRightPos)
                break;
        }
    });

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
    function play() {
        positionInterval = setInterval(()=>{
            position += 0.01 * speed
        }, 10)
        playing = true
        audioPlayer.play()
    }

    function pause() {
        clearInterval(positionInterval)
        playing = false
        audioPlayer.pause()
    }

    function setAudio(node, player) {
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
                    position = 0;
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

    #timeSlider {
        width: 100%;
    }

    #playbackArea {
        width: 100%;
    }    
</style>

{#await getYTAudio(videoID)}
	<h3>Loading Audio . . .</h3>
{:then loadedPlayer}
    <p id="hack" use:setAudio={loadedPlayer}></p> <!-- TODO: remove hack designed to pass the audio to the component's state once the promise is ready -->
    {#if playing}
        <button on:click={pause}>Pause</button>
    {:else}
        <button on:click={play}>Play</button>
    {/if}
    <label>
    Speed:
        <input type="number" min=0.5 max=4.0 step=0.25 on:change={audioPlayer.rate(speed)} bind:value={speed}>
    </label>

    <div id="playbackArea">
        <label>
            <input id="timeSlider" type="range" min=0 max={duration} step="any" on:change={audioPlayer.seek(position)} bind:value={position}> <!-- TODO: visualise waveform with https://github.com/bbc/waveform-data.js or https://css-tricks.com/making-an-audio-waveform-visualizer-with-vanilla-javascript/ -->
        </label>
    </div>
    <p id="positionDuration">{renderSeconds(position)}/{renderSeconds(duration)}</p>
{/await}

