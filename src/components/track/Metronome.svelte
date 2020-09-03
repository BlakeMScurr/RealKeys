<script>
    import { Howl } from 'howler';

    export let time; // Current time in the track
    export let ticks; // times when we should tick
    export let playing; // whether the audio is currently playing
    export let seeked; // whether a new position was recently jumped to using seek (yes I know the past tense would generally be sought)

    let tickSound = new Howl({
        src: ['getSound/tick'],
        format: 'mp3',
    });

    let tickTimeouts = []; // timeouts that will play a tick
    let reset = true;

    $: {
        if (seeked) {
            resetTimeouts()
        }
    }

    $: {
        if (playing) {
            if (reset) {
                ticks.forEach(tick => {
                    if (time <= tick) {
                        tickTimeouts.push(setTimeout(() => {
                            tickSound.play()
                        }, (tick - time)*1000))
                    }
                });
                reset = false;
            }
        } else {
            resetTimeouts()
        }
    }

    function resetTimeouts() {
        tickTimeouts.forEach((tick)=>{
                clearTimeout(tick)
            })
            reset = true
    }
</script>