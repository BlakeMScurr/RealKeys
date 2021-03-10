<script lang="ts">
    import {onMount} from "svelte"
    import { modeName } from "../lib/gameplay/mode/mode";

    let mounted
    onMount(() => {
        mounted = true
    })

    class section {
        startBar: number;
        endBar: number;
        text: string;
        mode: modeName;

        constructor(startBar: number, endBar: number) {
            this.startBar = startBar
            this.endBar = endBar
            this.text = ""
            this.mode = modeName.wait
        }
    }

    let startBar = 1;
    let endBar = 10000;
    let input
    let draw = () => {}
    let sections = []
    let loaded = false
    function handleInput() {
        if (mounted) {
            let x = async () => {
                // apparently this breaks server side rendering
                let module = await import("opensheetmusicdisplay")

                var osmd = new module.OpenSheetMusicDisplay("osmdContainer");
                

                let reader = new FileReader()
                reader.onload = function(){
                    let parser = new DOMParser();
                    let xmlDoc = parser.parseFromString(<string>reader.result, "text/xml");

                    let firstBar = 1
                    Array.from(xmlDoc.getElementsByTagName("measure")).forEach((measure) => {
                        try {
                            if (measure.getElementsByTagName("bar-style")[0].textContent === "light-light") {
                                let endOfMeasure = parseInt(measure.getAttribute("number"))
                                sections.push(new section(firstBar, endOfMeasure))
                                firstBar = endOfMeasure
                            }
                        } catch (e) {} // do big deal here, just shitty programming
                    })

                    sections = sections
                    loaded = true

                    draw = () => {
                        osmd.setOptions({
                            backend: "svg",
                            drawTitle: true,
                            // TODO: this doesn't seem to be applying
                            drawingParameters: "thumbnail", // don't display title, composer etc., smaller margins
                            drawFromMeasureNumber: startBar,
                            drawUpToMeasureNumber: endBar -1,
                        });
                        osmd
                            .load(<string>reader.result)
                            .then(
                                function() {
                                    osmd.render();
                                }
                            );
                    }
                    draw()
                };
                reader.readAsText(input.files[0]);
            }
            x()
        }
    }

    function addSection() {
        draw()
        sections.push(new section(startBar, endBar))
        sections = sections
    }



    let editingSection = -1
    let textEdit = ""
    let editMode = modeName.wait
</script>

<style lang="scss">
    .osmdContainer {
        height: 100%;
        width: 100%;
    }

    .sections {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
        grid-gap: 20px;
        padding: 20px;

        .section {
            background-color: lightgrey;
            border-radius: 4px;
            padding: 4px;
        }
    }

    h3, h4 {
        margin: 0;
    }
</style>

{#if !loaded}
<!-- TODO: make this better -->
    <!-- <label for="musicxml">Select MusicXML file</label> -->
    <input type="file" id="musicxml" on:input={handleInput} bind:this={input}>

    
{/if}

{#if editingSection != -1}
    <input type="text" bind:value={textEdit}>

    <label for="mode">Choose a mode:</label>
    <select name="mode" id="mode" bind:value={editMode}>
        <option value={modeName.wait}>{modeName.wait}</option>
        <option value={modeName.atSpeed}>{modeName.atSpeed}</option>
        <option value={modeName.pause}>{modeName.pause}</option>
        <option value={modeName.play}>{modeName.play}</option>
    </select>

    <button on:click={()=>{
        sections[editingSection].text = textEdit
        sections[editingSection].mode = editMode
        textEdit = ""
        editingSection = -1;
        startBar = 1;
        endBar = 10000;
        draw();
    }}>Save</button>

    <hr>
{/if}

<div class="sections">
    {#each sections as section, i}
        <div class="section">
            <h3>From {section.startBar} to {section.endBar}</h3>
            <h4>{section.mode} mode</h4>

            <p>{section.text}<p>
            <button on:click={()=>{
                editingSection = i;
                textEdit = section.text;
                startBar = section.startBar;
                endBar = section.endBar;
                draw();
            }}>Edit</button>
        </div>
    {/each}
</div>

<div id="osmdContainer"></div>