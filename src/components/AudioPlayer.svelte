<script>
    import { Howl } from 'howler';
    import ZoomArea from '../components/ZoomArea.svelte'
    import Bars from '../components/Bars.svelte'

    export let videoID;

    let audioPlayer;
    let audioLoaded = false;
    let playing = false
    let position = 0;
    let duration = 0;
    let speed = 1;
    let metronomeOn = true;

    let tick = new Howl({
        src: ['getSound/tick'],
        format: 'mp3',
    });

    let tickbars; // TODO: remove this huge absolutely fucking disgusting hack, I hate it
    let lastTickPlayer = 0;
    let tickRoundingFactor = 100;
    function playTick(position) {
        console.log(metronomeOn && tickbars != undefined)
        console.log(tickbars)
        if (metronomeOn && tickbars !== undefined && tickbars.includes(Math.round((position) * tickRoundingFactor) / tickRoundingFactor)) {
            tick.play()
            console.log("playing tick")
        }
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
            playTick(position)
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
                    position = 0;
                },
                html5: true, // html5 being forced gives us rate change without pitch increase as per https://github.com/goldfire/howler.js/issues/586#issuecomment-237240859
			});
		})

		return howlPromise;
    }

    async function getBeats(videoID) {
        let response = await fetch("getYTAudio/beats/" + videoID)
        let json = await response.json()
        return json
    }

    function makeBarLines(beats) {
        tickbars = beats.slice(0, beats.length-1).map(beat => { // TODO: remove rancid shit
            let rounded = Math.round((beat) * tickRoundingFactor) / tickRoundingFactor
            return rounded
        })

        // make bar ends proportion of total length
        // TODO: clarify beat/bar ambiguity
        // requires audioplayer to be loaded
        let duration = beats[beats.length-1]
        console.log("duration:", duration)
        let barEnds = beats.slice().map(bar => {
            return bar/duration
        })
        barEnds.push(1)

        
        // get bar lengths from ends
        let lastpos = 0;
        let barLengths = [];
        // TODO: idiomatic js array method, i.e., map(), reduce(), filter() etc
        for (let i = 0; i < barEnds.length; i++) {
            const end = barEnds[i];
            barLengths.push(end - lastpos)
            lastpos = end
        }

        // start final bar
        barLengths.push(0)

        // make bar structs
        let bars = barLengths.map(len => {
            return {
                type: "",
                length: len,
            }
        })

        // set bar types
        bars[0].type = "s"
        bars[bars.length-1].type = "e"

        return bars
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
{/await}

{#if !audioPlayer}
    <button on:click={play} disabled>Play</button>
{:else if playing}
    <button on:click={pause}>Pause</button>
{:else}
    <button on:click={play}>Play</button>
{/if}
<label>
Speed:
    <input type="number" min=0.5 max=4.0 step=0.25 on:change={audioPlayer.rate(speed)} bind:value={speed}>
</label>

<div id="playbackArea">
    <ZoomArea></ZoomArea>
    {#await getBeats(videoID)}
        <Bars></Bars>
    {:then beats}
        <!-- TODO: get actual bars, not just beats -->
        <Bars bars={makeBarLines(beats)}></Bars> 
        <label>
            Metronome:
            <input type="checkbox" bind:checked={metronomeOn}>
        </label>
    {/await}
    <label>
        <input id="timeSlider" type="range" min=0 max={duration} step="any" on:change={audioPlayer.seek(position)} bind:value={position}> <!-- TODO: visualise waveform with https://github.com/bbc/waveform-data.js or https://css-tricks.com/making-an-audio-waveform-visualizer-with-vanilla-javascript/ -->
    </label>
</div>
<p id="positionDuration">{renderSeconds(position)}/{renderSeconds(duration)}</p>


