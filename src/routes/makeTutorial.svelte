<script lang="ts">
    import {onMount} from "svelte"
    import { modeName } from "../lib/gameplay/mode/mode";
    import { mapStringifyReplacer, mapStringifyReviver } from "../lib/util";
    import Dependencies from "../components/editor/Dependencies.svelte";
    import { rangeDefintion, section } from "../lib/gameplay/curriculum/methodology/builder";
    import Range from "../components/editor/Range.svelte";
import { NewNote } from "../lib/music/theory/notes";

    let mounted
    onMount(() => {
        mounted = true
    })

    // TODO: make these part of a blueprints object
    // The trouble is that would make `bind:curriculae` into `bind:bp.curriculumNames` which is impossible in svelte
    let deps = new Array<[number, number]>();
    let curriculae = new Array<string>();
    let sections: Map<string, Array<section>> = new Map([["mock", []]])
    let sequential = new Map<string, boolean>();
    let ranges = new Map<string, rangeDefintion>();

    let startBar = 0;
    let endBar = 10000;
    let musicXMLInput
    let osmdModule
    let xmlfiles = new Map<string, string>();
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
                            priorState = JSON.parse(<string>reader.result, mapStringifyReviver)
                            if (priorState.sections) sections = <Map<string, Array<section>>>priorState.sections
                            if (priorState.curriculae) curriculae = priorState.curriculae
                            if (priorState.deps) deps = priorState.deps
                            if (priorState.sequential) sequential = priorState.sequential
                            if (priorState.ranges) ranges = priorState.ranges
                        } else if (file.name.includes(".musicxml")){
                            // TODO: make musicxml rendering component
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
    
                            let filename = file.name.replace(".musicxml", "")
                            if (!priorState) {
                                sections.set(filename, theseSections)
                                sections = sections
                                curriculae = Array.from(xmlfiles.keys())
                            }
    
                            xmlfiles.set(filename, new XMLSerializer().serializeToString(xmlDoc))
                            xmlfiles = xmlfiles
    
                            if (i === 0) {
                                currentFile = filename
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

    let currSequential = false
    $: {
        sequential.set(currentFile, currSequential)
    }


    // Range stuff
    let currRange
    $: {
        if (ranges.has(currentFile)) {
            currRange = ranges.get(currentFile)
        } else {
            currRange = new rangeDefintion(true, "c", 4, "c", 5)
        }
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

    <div class="btn" on:click={()=>{download(JSON.stringify({sections: sections, deps: deps, curriculae: curriculae, sequential: sequential, ranges: ranges}, mapStringifyReplacer, "\t"), 'tutorial.txt', 'text/plain')}}>Export</div>
    <a href="" id="exporter">{dltext}</a>
</div>

<Dependencies bind:deps bind:curriculae on:select={(e)=>{currSequential=sequential.get(e.detail); currentFile = e.detail; rerender()}}></Dependencies>

<Range defaultRange={currRange.defaultRange} highest={NewNote(currRange.highestPitch, currRange.highestOctave)} lowest={NewNote(currRange.lowestPitch, currRange.lowestOctave)} on:edit={(e) => {
    ranges.set(currentFile, e.detail);
}}></Range>

{#if sections.get(currentFile).length !== 0}
    <h1>Sections</h1>

    <label for="sequential">Sequential</label>
    <input id="sequential" type="checkbox" bind:checked={currSequential}>
{/if}

<!-- TODO: show an indication of the task breakdown if it is sequential -->
{#if !currSequential}
    <div class="sections">
        {#each sections.get(currentFile) as section, i}
            <div class="section">
                <h3>From {section.startBar} to {section.endBar}</h3>

                {#if editingSection === i}
                    <select name="mode" id="mode" bind:value={editMode}>
                        <option value={modeName.wait}>{modeName.wait}</option>
                        <option value={modeName.atSpeed}>{modeName.atSpeed}</option>
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
{/if}


<div id="osmdContainer"></div>