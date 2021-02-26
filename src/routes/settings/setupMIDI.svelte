<script lang="ts">
    import Loader from "../../components/loader/Loader.svelte";
</script>

<style lang="scss">
    .vert {
        display: flex;
        align-items: center;
        margin: 0 14px 0 14px;
        flex-direction: column;
        justify-content: space-around;
        height: calc(100% - 50px);

        div {
            display: flex;
            align-items: center;
            flex-direction: column;
        }  
    }
</style>

<h2>Connect Keyboard</h2>
<div class="vert">
    <div>
        <h3>Connect a MIDI keyboard to your device, usually with a usb cable</h3>
        <Loader text="Listening for connection"></Loader>
    </div>
</div>