<script>
    import { goto } from '@sapper/app';
    import { spotifyRedirectURI } from '../../lib/util';

    function handleClick() {
        var scopes = 'user-read-private user-read-email';
        goto('https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + '9985cfc25fad4e3e82794d87f23823ef' +
        (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
        '&redirect_uri=' + encodeURIComponent(spotifyRedirectURI()));
        }
</script>

<button on:click={handleClick}>
    Log in with Spotify
</button>