<script>
	import {Howl, Howler} from 'howler';

	let url = "https://www.youtube.com/watch?v=reLjhAAPsPc";
	const ytPrefix = 'https://www.youtube.com/watch?v='
	$: videoID = url.startsWith(ytPrefix)? url.replace(ytPrefix, ""): "";
	$: thumbnailURL = "http://img.youtube.com/vi/" + videoID + "/0.jpg" ;
	$: videoTitlePromise = getYTTitle(videoID)

	let audioLoaded = false

	async function getYTTitle() {
		if (typeof fetch !== 'undefined') {
			const response = await ytAPI("getYTTitle")
			const json = await response.json()
			return json.title;
		}
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
			});
		})

		audioLoaded = true
		return howlPromise;
	}

	function ytAPI(method) {
		return fetch(method, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify()
		})
	}
</script>

<svelte:head>
	<title>Sapper project template</title>
</svelte:head>

{#if audioLoaded}
	{#await getYTAudio()} 
		<h1>Waiting on audio processing . . .</h1>
	{:then audioPlayer}
		<button on:click={()=>audioPlayer.play()}>Play</button>
	{/await}
{:else}
	<label>
		YouTube Link
		<input bind:value={url}>
	</label>

	<button on:click={getYTAudio}>
		Prepare Audio
	</button>

	<hr>

	{#await videoTitlePromise then videoTitle}
		<h1>{videoTitle}</h1>
	{/await}
	<img src={thumbnailURL} alt="YouTube Thumbnail">
{/if}