<script lang="ts">
    import {onMount} from "svelte"

    let mounted
    onMount(() => {
        mounted = true
    })

    let startBar = 1;
    let endBar = 10000;
    let input
    let draw = () => {}
    let sections = new Array<section>();
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

    class section {
        startBar: number;
        endBar: number;
        text: string;

        constructor(startBar: number, endBar: number) {
            this.startBar = startBar
            this.endBar = endBar
            this.text = ""
        }
    }

    let editingSection = -1
    let textEdit = ""
</script>

<style>
    .osmdContainer {
        height: 100%;
        width: 100%;
    }
</style>

{#if !loaded}
    <input type="file" on:input={handleInput} bind:this={input}>
{/if}


<!-- Old code, maybe remove lol? -->
<!-- <hr> -->
<!-- <button on:click={addSection}>Add section</button>
<label for="startbar">Start bar</label>
<input id="startbar" type="number" bind:value={startBar}>
<label for="endbar">End bar</label>
<input id="endbar" type="number" bind:value={endBar}> -->


{#if editingSection != -1}
    <input type="text" bind:value={textEdit}>

    <button on:click={()=>{
        sections[editingSection].text = textEdit
        textEdit = ""
        editingSection = -1;
        startBar = 1;
        endBar = 10000;
        draw();
    }}>Save</button>

    <hr>
{/if}

{#each sections as section, i}
    <div class="section">
        From {section.startBar} to {section.endBar}

        <div class="text">{section.text}</div>
        <button on:click={()=>{
            editingSection = i;
            textEdit = section.text;
            startBar = section.startBar;
            endBar = section.endBar;
            draw();
        }}>Edit</button>
        <!-- Not necessary? -->
        <!-- <button on:click={()=>{
            sections.splice(i, 1);
            sections = sections;
        }}>Remove</button> -->
    </div>
{/each}

<div id="osmdContainer"></div>