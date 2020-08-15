<script context="module">
	export function preload(page) {
		return { videoID: page.params.videoID }
	}
</script>

<script>
	import { Howl } from 'howler';

	import { stores } from '@sapper/app';
	const { page } = stores();
	export let videoID
	console.log("videoID: " + videoID)

	const ytPrefix = 'https://www.youtube.com/watch?v='
	let url = ytPrefix + videoID
	$: videoID = url.startsWith(ytPrefix)? url.replace(ytPrefix, ""): "";
	$: thumbnailURL = "http://img.youtube.com/vi/" + videoID + "/0.jpg" ;

	let audioChosen = false

	async function getAssets(videoID) {
		let title;
		let thumbnail;
		if (typeof fetch !== 'undefined') {
			// get thumbnail
			let response = await fetch("getYTAsset/thumbnail/" + videoID, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/octet-stream'
				},
			})
			const image = await response.blob()

			let data = await image.arrayBuffer()
			let base64String = btoa(String.fromCharCode(...new Uint8Array(data)));
			
			thumbnail = 'data:image/jpeg;base64,' + base64String;

			// get title
			response = await fetch("getYTAsset/title/" + videoID, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
			})

			const json = await response.json()
			title = json.title;
		}
		return {thumbnail: thumbnail, title: title}
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

		return howlPromise;
	}
</script>

<svelte:head>
	<title>Sapper project template</title>
</svelte:head>

{#if audioChosen}
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

	<hr>

	{#await getAssets(videoID) then assets}
		<h1>{assets.title}</h1>
		<img src={assets.thumbnail} alt="YouTube Thumbnail">
	{/await}
{/if}