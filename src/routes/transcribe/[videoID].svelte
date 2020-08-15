<script context="module">
	export function preload(page) {
		return { videoID: page.params.videoID }
	}
</script>

<script>
	import { Howl } from 'howler';
	import { stores } from '@sapper/app';
	import AudioPlayer from '../../components/AudioPlayer.svelte'

	const { page } = stores();
	export let videoID

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
</script>

<style>
	.thumbnail {
		display: inline;
				vertical-align: middle;

	}
	.title {
		display: inline;
				vertical-align: middle;

	}

	.titleHolder {
		vertical-align: middle;
	}
</style>

<svelte:head>
	<title>Sapper project template</title>
</svelte:head>

<label>
	YouTube Link
	<input bind:value={url}>
</label>

<hr>

{#await getAssets(videoID) then assets}
	<div class="titleHolder">
		<img class="thumbnail" src={assets.thumbnail} alt="YouTube Thumbnail">
		<h2 class="title">{assets.title}</h2>
	</div>
	<br>

	<AudioPlayer videoID={videoID}></AudioPlayer>

{:catch error}
	<p>Invalid video URL</p>
{/await}