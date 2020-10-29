<script>
    import { goto, stores} from '@sapper/app';
    import { spotifyRedirectURI } from '../../lib/util';
    const { page } = stores();

    function handleClick() {
        document.cookie = `redirect=${$page.path};path=/`
        var scopes = 'streaming user-read-private'; 
        goto('https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + '9985cfc25fad4e3e82794d87f23823ef' +
        (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
        '&redirect_uri=' + encodeURIComponent(spotifyRedirectURI()));
    }
</script>

<style>
    button {
        /* Taken from https://developer.spotify.com/branding-guidelines/ */
        background-color: #1DB954;
        color: #FFFFFF;
        font-family: Circular,Helvetica,Arial,sans-serif;
        font-size: medium;
        padding: 10px 25px 10px 25px;
        border-radius: 40px;
        border: none;
    }
</style>

<button on:click={handleClick}>
    LOG IN WITH SPOTIFY
</button>