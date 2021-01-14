<script>
    import { goto } from '@sapper/app';
    import { onMount } from 'svelte';

    onMount(()=> {
        // TODO:
        // - go to /landing if not logged in
        // - go to /tutorials if unfinished
        // - go to /search otherwise
        goto('/learn/%2FClassical_mfiles.co.uk_MIDIRip%2Ftwinkle-twinkle-little-star.mid')
    })
</script>