<script>
    import { Howl } from 'howler';
    import ZoomBars from '../components/bars/zoom/ZoomBars.svelte'
    import Bars from '../components/bars/Bars.svelte'
    import Metronome from '../components/track/Metronome.svelte'

    export let videoID;

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
                positionPercentage = newLeftPost / duration
                seek(newLeftPost)
                break;
            case 39: // right arrow
                let newRightPos = audioPlayer.seek() + 0.5
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
                }, (ct - endRepeat * duration) * 1000)
            }
        }
    }

    function repeat() {
        if (!loop) {
            pause()
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

    async function getBeats(videoID) {
        let response = await fetch("getYTAudio/beats/" + videoID)
        let json = await response.json()
        return json
    }

    function makeBarLines(beats) {
        // make bar ends proportion of total length
        // TODO: clarify beat/bar ambiguity
        // requires audioplayer to be loaded
        let duration = beats[beats.length-1]
        let barEnds = beats.slice().map(bar => {
            return bar/duration
        })
        
        // get bar lengths from ends
        let lastpos = 0;
        let barWidths = [];
        // TODO: idiomatic js array method, i.e., map(), reduce(), filter() etc
        for (let i = 0; i < barEnds.length; i++) {
            const end = barEnds[i];
            if (end - lastpos != 0) {
                barWidths.push(end - lastpos)
            }
            lastpos = end
        }

        // start final bar
        barWidths.push(0)

        // make bar structs
        let bars = barWidths.map(width => {
            return {
                type: "",
                width: width,
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

<label>
Loop:
    <input type="checkbox" bind:value={loop}>
</label>

<div id="playbackArea">
    {#await getBeats(videoID) then beats}
        <!-- TODO: get actual bars, not just beats -->
        <ZoomBars bars={makeBarLines(beats)} position={positionPercentage} on:seek={handleSeek} on:repeat={handleNewRepeats}></ZoomBars>
        <Metronome time={positionPercentage*duration} playing={playing} ticks={beats.slice(1, beats.length - 1)} seeked={seeked}></Metronome>
    {/await}
</div>
<p id="positionDuration">{renderSeconds(positionPercentage*duration)}/{renderSeconds(duration)}</p>


