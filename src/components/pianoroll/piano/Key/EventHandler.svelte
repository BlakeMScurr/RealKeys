<script lang="ts">
    export let active: Boolean;

    // touchDevice devices seem to have both touch, and click events, but the click events fire much slower.
    // So if we're on a touchDevice device, we use the touch and ignore the mouse event
    let touchDevice = false
    function handlemousedown() {
        if (!touchDevice) {
            active = true
        } else {
            touchDevice = false // reset just in case the user wants to use keyboard input later. Microsoft Surface use case, for example.
        }
    }

    function handlemouseup() {
        active = false
    }

    function handlemouseleave() {
        active = false
    }

    function handletouchstart(e) {
        e.preventDefault() // prevent touch from highlighting the key like a word on iOS
        active = true
        touchDevice = true
    }

    function handletouchend() {
        active = false
    }

</script>

<style>
    div {
        position: absolute;
        width: 100%;
        height: 100%;
        border: none;
        opacity: 0;
    }
</style>

<div on:mousedown={handlemousedown}
        on:mouseup={handlemouseup}
        on:mouseleave={handlemouseleave}
        on:touchstart={handletouchstart}
        on:touchend={handletouchend}>
</div>