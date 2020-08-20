<script>
    import { Howl } from 'howler';

    export let time; // Current time in the track
    export let ticks; // times when we should tick

    let metronomeOn = true;

    let tick = new Howl({
        src: ['getSound/tick'],
        format: 'mp3',
    });

    $: {
        if (metronomeOn && ticks !== undefined && ticks.includes(time)) {
            tick.play()
        }
    }
</script>

<label>
    Metronome:
    <input type="checkbox" bind:checked={metronomeOn}>
</label>