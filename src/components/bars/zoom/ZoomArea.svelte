<script>
    import { onMount } from 'svelte';
    import { getRelativePosition } from "../../../utils/dom.js"

    // start and end are the start and end of the content in the zoom area
    // they are given as percentages
    export let start = 0;
    export let end = 1;

    // startpx and endpx represent the starting and end points for the zoom area in terms of coordinates from the canvas
    let startpx;
    let endpx;

    let canvas;
    let ctx
    let minzoomarea = 30;
    onMount(() => {
        ctx = canvas.getContext('2d');
        setCanvasWidth(ctx)
        // set the width of the visible zoom window
        let w = canvas.getBoundingClientRect().width 
        endpx = w * end;
        startpx = w * start;

        // initial drawing
        drawZoomWindow()
    });

    // update external start/end
    $: {
        if (canvas !== undefined) {
            let w = canvas.getBoundingClientRect().width
            start = startpx/w
            end = endpx/w
        }
    }

    // TODO: run on resize
    function setCanvasWidth(ctx) {
        ctx.canvas.width  = canvas.offsetWidth;
        ctx.canvas.height = canvas.offsetHeight;
    }

    function drawZoomWindow() {
        // TODO: why use animation frames?
        // let frame;
        // frame = requestAnimationFrame(loop);
		// return () => {
		// 	cancelAnimationFrame(frame);
        // };
        ctx.fillStyle = "#888"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.strokeStyle = "#000"
        ctx.lineWidth = 5;
        ctx.strokeRect(startpx, 0, endpx-startpx, canvas.height)
    }

    let mouseDown = false;
    let lastMouseX;
    let lastMouseY;
    function handleMouseDown(event) {
        switch (event.button) {
            case 0:
                mouseDown = true;
                let pos = getRelativePosition(event.clientX, event.clientY, canvas)
                if (startpx > pos.x || endpx < pos.x) { // if the new centre is not in the current zoomarea
                    setZoomAreaToCentre(pos.x)
                    drawZoomWindow()
                }
                lastMouseX = pos.x
                lastMouseY = pos.y
                break;
            default:
                // only handle left clicks
        }
    }

    document.addEventListener("mousemove", (event) => {
        if (mouseDown) {
            event.preventDefault()
            let pos = getRelativePosition(event.clientX, event.clientY, canvas)
            let oldCentre = (startpx + endpx) / 2

            // move the zoomarea to the left or right
            let dx = pos.x - lastMouseX
            setZoomAreaToCentre(oldCentre + dx)

            let dy = lastMouseY - pos.y
            if (endpx - startpx >= minzoomarea || dy > 0) { // if the area is at or below minimum size, don't shrink it
                // if the new area will be below minimum size, only shrink to minimum
                if ((endpx + dy) - (startpx - dy) < minzoomarea) {
                    dy = (minzoomarea - (endpx - startpx)) / 2
                }

                // change the box size
                startpx -= dy
                endpx += dy
                let w = canvas.getBoundingClientRect().width;
                startpx = startpx < 0 ? 0 : startpx;
                endpx = endpx > w ? w : endpx;
            }

            drawZoomWindow()
            lastMouseX = pos.x
            lastMouseY = pos.y
        }
    })

    document.addEventListener("mouseup", (event) => {
        switch (event.button) {
            case 0:
                mouseDown = false;
            default:
                // only handle left clicks
        }
    })

    function setZoomAreaToCentre(centre) {
        // recentre the zoomarea to the new centre with its old size
        let dist = (endpx - startpx)/2

        // make sure the edges of the zoom area aren't off the canvas
        centre = centre-dist<0 ? dist : centre
        let w = canvas.getBoundingClientRect().width
        centre = centre+dist > w ? w - dist : centre

        startpx = centre - dist
        endpx = centre + dist
    }

    // TODO: consider bar snap ala Ableton
</script>

<style>
    #beatarea {
        width: 100%;
        height: 20px;
    }
</style>

<canvas id="beatarea" bind:this={canvas} on:mousedown={handleMouseDown}></canvas>