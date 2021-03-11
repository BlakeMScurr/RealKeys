<script lang="ts">
    import {onMount} from "svelte"
    import { modeName } from "../lib/gameplay/mode/mode";
    import { plainToClass } from 'class-transformer';
    import 'reflect-metadata';
import { mapStringifyReplacer, mapStringifyReviver } from "../lib/util";

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

    let startBar = 0;
    let endBar = 10000;
    let musicXMLInput
    let fileInput
    let osmdModule
    let xmlfiles = new Map<string, string>();
    let sections: Map<string, Array<section>> = new Map([["mock", []]])
    let currentFile = "mock"
    function handleMusicXMLInput() {    
        if (mounted) {
            let x = async () => {
                let priorState
                // apparently this breaks server side rendering if we import it at the top level
                osmdModule = await import("opensheetmusicdisplay")

                Array.from(musicXMLInput.files).forEach((file: File, i: number) => {
                    let reader = new FileReader()
                    reader.onload = function() {
                        if (file.name.includes(".txt")) {
                            priorState = <Map<string, Array<section>>>JSON.parse(<string>reader.result, mapStringifyReviver)
                            sections = priorState
                        } else if (file.name.includes(".musicxml")){
                            let parser = new DOMParser();
                            let xmlDoc = parser.parseFromString(<string>reader.result, "text/xml");
    
                            let theseSections = []
                            let firstBar = 0
                            Array.from(xmlDoc.getElementsByTagName("measure")).forEach((measure) => {
                                try {
                                    let bs = measure.getElementsByTagName("bar-style")[0]
                                    if (bs.textContent === "light-light" || bs.textContent === "light-heavy") {
                                        let endOfMeasure = parseInt(measure.getAttribute("number"))
                                        theseSections.push(new section(firstBar, endOfMeasure))
                                        firstBar = endOfMeasure
                                        measure.removeAttribute("number") // TODO: remove this hack - numbers are rendered wrongly too
                                        measure.removeChild(measure.getElementsByTagName("barline")[0]) // TODO: remove this hack, which is just here because the barlines aren't rendered correctly
                                    }
                                } catch (e) {
                                    console.warn(e)
                                } // do big deal here, just shitty programming
                            })
    
                            if (!priorState) {
                                sections.set(file.name, theseSections)
                                sections = sections
                            }
    
                            xmlfiles.set(file.name, new XMLSerializer().serializeToString(xmlDoc))
                            xmlfiles = xmlfiles
    
                            if (i === 0) {
                                currentFile = file.name
                                draw()
                            }
                        }
                    };
                    
                    reader.readAsText(file);
                })
            }
            x()
        }
    }

    function draw() {
        let str = xmlfiles.get(currentFile)
        var osmd = new osmdModule.OpenSheetMusicDisplay("osmdContainer");

        osmd.setOptions({
            backend: "svg",
            drawTitle: true,
            // TODO: this doesn't seem to be applying
            drawingParameters: "thumbnail", // don't display title, composer etc., smaller margins
            drawFromMeasureNumber: startBar + 1,
            drawUpToMeasureNumber: endBar,
        });
        osmd
            .load(str)
            .then(
                function() {
                    osmd.render();
                }
            );
    }


    let dltext = ""
    function download(text, name, type) {
        var exporter = <HTMLAnchorElement>document.getElementById("exporter");
        var file = new Blob([text], {type: type});
        exporter.href = URL.createObjectURL(file);
        exporter.download = name;
        dltext = "Click here to download your file"
    }

    let editingSection = -1
    let textEdit = ""
    let editMode = modeName.wait

    function rerender() {
        sections = sections
        xmlfiles = xmlfiles
        draw()
    }

    $: {
        console.log(textEdit)
    }
</script>

<style lang="scss">
    p {
        white-space: pre-wrap;
    }

    #osmdContainer {
        height: 100%;
        min-height: 1000px; // just so that when we redraw we don't generally lose our vertical place in the scrren
        width: 100%;
    }

    .files {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        grid-gap: 4px;
        padding: 5px;
        div {
            background-color: #eee;
            &:hover {
                background-color: #ddd;
            }
        }
    }

    .textinput {
        display: inline-block;
        border: solid 1px black;
        background-color: white;
        width: 100%;
        margin: 1em 0 1em 0;
    }

    .sections {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
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

    .btn {
        height: 23px;
        min-width: 82px;
        border-radius: 2px;
        background-color: #38A3FA;
        border: none;
        display: inline-block;
        color: white;
        padding: 5px;
        margin: 5px;

        &:hover {
            color: white;
            background-color: #1d5b8d;
        }
    }

    .fileinput {
        display: none;
    }
</style>

<div>
    <label for="musicxml" class="btn">Import</label>
    <input type="file" class="fileinput" id="musicxml" multiple={true} on:input={handleMusicXMLInput} bind:this={musicXMLInput}>

    <div class="btn" on:click={()=>{download(JSON.stringify(sections, mapStringifyReplacer), 'tutorial.txt', 'text/plain')}}>Export</div>
    <a href="" id="exporter">{dltext}</a>
</div>

{#if xmlfiles.size !== 0}
    <h1>Files</h1>
{/if}
<div class="files">
    {#each Array.from(xmlfiles.keys()) as file }
        <div on:click={()=>{
            currentFile = file;
            rerender();
        }}>{file}</div>
    {/each}
</div>


{#if sections.get(currentFile).length !== 0}
    <h1>Sections</h1>
{/if}
<div class="sections">
    {#each sections.get(currentFile) as section, i}
        <div class="section">
            <h3>From {section.startBar} to {section.endBar}</h3>

            {#if editingSection === i}
                <select name="mode" id="mode" bind:value={editMode}>
                    <option value={modeName.wait}>{modeName.wait}</option>
                    <option value={modeName.atSpeed}>{modeName.atSpeed}</option>
                    <option value={modeName.pause}>{modeName.pause}</option>
                    <option value={modeName.play}>{modeName.play}</option>
                </select>
                <br>

                <span class="textinput" contenteditable="true" type="text" bind:innerHTML={textEdit}></span>

                <button on:click={()=>{
                    sections.get(currentFile)[editingSection].text = textEdit.replaceAll("\<br\>", "\r\n")
                    sections.get(currentFile)[editingSection].mode = editMode
                    textEdit = ""
                    editingSection = -1;
                    startBar = 0;
                    endBar = 10000;
                    rerender();
                }}>Save</button>
            {:else}
                <h4>{section.mode} mode</h4>

                <p>{section.text}<p>

                <button on:click={()=>{
                    editingSection = i;
                    textEdit = section.text;
                    startBar = section.startBar;
                    endBar = section.endBar;
                    rerender();
                }}>Edit</button>
            {/if}
        </div>
    {/each}
</div>



<div id="osmdContainer"></div>