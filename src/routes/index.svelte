<script>
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
			console.log(json.title)
			return json.title;
		}
	}

	async function getYTAudio() {
		console.log("calling getYTAudio")
		const response = await ytAPI("getYTAudio")
		const audioFile = await response.text()

		audioLoaded = true
		console.log(audioFile)
		return Promise.resolve(audioFile);
	}

	function ytAPI(method) {
		return fetch(method, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({videoID: videoID})
		})
	}
</script>

<svelte:head>
	<title>Sapper project template</title>
</svelte:head>

{#if audioLoaded}
	<h1>audio is loaded</h1>
	{#await getYTAudio() then audioFile}
		<p>{audioFile}</p>
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