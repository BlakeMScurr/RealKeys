<script>
    export let videoID;
    let audioPlayer;

    let playing = false

    function play() {
        playing = true
        audioPlayer.play()
    }

    function pause() {
        playing = false
        audioPlayer.pause()
    }

    function setAudio(node, player) {
        audioPlayer = player
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
                    playing = false
                }
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
{/await}

