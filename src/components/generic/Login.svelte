<script>
    import { goto } from '@sapper/app';

    function handleClick() {
        var scopes = 'user-read-private user-read-email';
        var redirect_uri = 'http://realkeys.co/callback'
        goto('https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + '9985cfc25fad4e3e82794d87f23823ef' +
        (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
        '&redirect_uri=' + encodeURIComponent(redirect_uri));
        }
</script>

<button on:click={handleClick}>
    Log in with Spotify
</button>