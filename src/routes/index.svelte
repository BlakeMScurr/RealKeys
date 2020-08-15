<script>
	import { Howl } from 'howler';

	let url = "https://www.youtube.com/watch?v=reLjhAAPsPc";
	const ytPrefix = 'https://www.youtube.com/watch?v='
	$: videoID = url.startsWith(ytPrefix)? url.replace(ytPrefix, ""): "";
	$: thumbnailURL = "http://img.youtube.com/vi/" + videoID + "/0.jpg" ;

	let audioLoaded = false

	async function getYTThumbnail(videoID) {
		if (typeof fetch !== 'undefined') {
			const response = await fetch("getYTAsset/thumbnail/" + videoID, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/octet-stream'
				},
			})
			const image = await response.blob()

			let data = await image.arrayBuffer()
			let base64String = btoa(String.fromCharCode(...new Uint8Array(data)));
			
			return 'data:image/jpeg;base64,' + base64String;
		}
	}

	async function getYTTitle(videoID) {
		if (typeof fetch !== 'undefined') {
			const response = await fetch("getYTAsset/title/" + videoID, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
			})

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

	{#await getYTTitle(videoID) then videoTitle}
		<h1>{videoTitle}</h1>
	{/await}

	{#await getYTThumbnail(videoID) then thumbnail}
		<img src={thumbnail} alt="YouTube Thumbnail">
	{/await}
{/if}