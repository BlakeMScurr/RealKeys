<script>
	let url = "https://www.youtube.com/watch?v=V1bFr2SWP1I";
	const ytPrefix = 'https://www.youtube.com/watch?v='
	$: videoID = url.startsWith(ytPrefix)? url.replace(ytPrefix, ""): "";
	$: thumbnailURL = "http://img.youtube.com/vi/" + videoID + "/0.jpg" ;
	$: videoTitlePromise = getYTTitle(videoID)

	// function getYTTitle() {
		// fetch('getYTTitle', {
		// 	method: 'GET',
		// 	headers: {
		// 		'Content-Type': "application/json"
		// 	},
		// 	body: JSON.stringify({videoID: videoID})
		// })

		// console.log(p)

		// return "asdfasdf"
		
	// }

	async function getYTTitle() {
		if (typeof fetch !== 'undefined') {
			const response = await ytAPI("getYTTitle")
			const json = await response.json()
			console.log(json.title)
			return json.title;
		}
	}

	function getYTAudio() {
		ytAPI("postYTLink")
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

<label>
	YouTube Link
	<input bind:value={url}>
</label>

<button on:click={getYTAudio}>
	Prepare Audio
</button>

	{#await videoTitlePromise then videoTitle}
		<h1>{videoTitle}</h1>
	{/await}
	<img src={thumbnailURL} alt="YouTube Thumbnail">

<!-- TODO: get title youtube https://stackoverflow.com/questions/10596745/fetching-youtube-video-title-from-known-video-id -->


