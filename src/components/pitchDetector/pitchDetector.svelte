<script>
    import { autoCorrelate } from "./algo"
    import { NewNote } from "../../lib/music/theory/notes";

    let pitch = "somepitch"
    let detectOn = false

    // from https://stackoverflow.com/questions/38282611/html-5-audiocontext-audiobuffer
    navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    // TODO: Figure out what else we need and give the user feedback if he doesn't
    // support microphone input.
    if (navigator.getUserMedia) {
        captureMicrophone();
    }

    // First Step - Capture microphone and process the input
    function captureMicrophone() {
        // process input from microphone
        const processAudio = ev =>
            processBuffer(ev.inputBuffer.getChannelData(CHANNEL));

        // setup media stream from microphone
        const microphoneStream = stream => {
            const microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(processor);
            // #1 If we don't pass through to speakers 'audioprocess' won't be triggerd
            processor.connect(mute);
        };
        // TODO: Handle error properly (see todo above - but probably more specific)
        const userMediaError = err => console.error(err);

        // Second step - Process buffer and output to speakers
        const processBuffer = buffer => {
            audioBuffer.getChannelData(CHANNEL).set(buffer);
            // We could move this out but that would affect audio quality
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            const float32Array = audioBuffer.getChannelData(0); // get a single channel of sound
            if (detectOn) {
                let frequency = autoCorrelate(float32Array, audioContext.sampleRate)
                
                if (frequency === -1) {
                    pitch = "no notes detected frequency"
                } else {
                    let index = 12*Math.log2(frequency/440)
                    // TODO: proper logarithmic rounding
                    pitch = NewNote("A", 4).jump(Math.trunc(index)).string() // get letter name per https://bit.ly/2TzjHBb (just a basic blog post)
                }
            }
            source.start();
        }

        const audioContext = new AudioContext();
        const speakers = audioContext.destination;
        // We currently only operate on this channel we might need to add a couple
        // lines of code if this fact changes
        const CHANNEL = 0;
        const CHANNELS = 1;
        const BUFFER_SIZE = 4096;
        const audioBuffer = audioContext.createBuffer(CHANNELS, BUFFER_SIZE, audioContext.sampleRate);

        const processor = audioContext.createScriptProcessor(BUFFER_SIZE, CHANNELS, CHANNELS);

        // #2 Not needed we could directly pass through to speakers since there's no
        // data anyway but just to be sure that we don't output anything
        const mute = audioContext.createGain();
        mute.gain.value = 0;
        mute.connect(speakers);

        processor.addEventListener('audioprocess', processAudio);
        navigator.getUserMedia({audio: true}, microphoneStream, userMediaError);
    }

</script>

<button on:click={()=>{detectOn=!detectOn}}>{#if detectOn}Stop Listening{:else}Listen{/if}</button>
{pitch}

