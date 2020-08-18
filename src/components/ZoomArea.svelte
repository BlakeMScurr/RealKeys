<script>
    import { onMount } from 'svelte';

    // start and end are the start and end of the content in the zoom area
    // they are given as percentages
    // export let start = 0;
    // export let end = 1;

    // startpx and endpx represent the starting and end points for the zoom area in terms of coordinates from the canvas
    let startpx = 0;
    let endpx;

    let canvas;
    let ctx
    let minzoomarea = 30;
    onMount(() => {
        ctx = canvas.getContext('2d');
        setCanvasWidth(ctx)
        // set the width of the visible zoom window
        endpx = canvas.getBoundingClientRect().width/5;

        // initial drawing
        drawZoomWindow()
    });

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

    // gives coordinates relative to the top left of the canvas rather than the window
    function getRelativePosition(x, y) {
        var rect = canvas.getBoundingClientRect();
        return { x: x - rect.left, y: y - rect.top }
    }

    // gives coordinates relative to the window rather than the top left of the canvas
    function getAbsolutePosition(x, y) {
        var rect = canvas.getBoundingClientRect();
        return { x: x + rect.left, y: y + rect.top }
    }

    let mouseDown = false;
    let lastMouseX;
    let lastMouseY;
    function handleMouseDown(event) {
        switch (event.button) {
            case 0:
                mouseDown = true;
                let pos = getRelativePosition(event.clientX, event.clientY)
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
            let pos = getRelativePosition(event.clientX, event.clientY)
            let oldCentre = (startpx + endpx) / 2

            // move the zoomarea to the left or right
            let dx = pos.x - lastMouseX
            setZoomAreaToCentre(oldCentre + dx)

            // change the zoom area size
            let dy = lastMouseY - pos.y
            console.log(dy)
            if (endpx - startpx > minzoomarea + 2 * dx) {
                startpx -= dy
                endpx += dy
                startpx = startpx < 0 ? 0 : startpx;
                let w = canvas.getBoundingClientRect().width;
                endpx = endpx > w ? w : endpx;
                console.log(startpx, endpx)
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
</script>

<style>
    #beatarea {
        width: 100%;
        height: 20px;
    }
</style>

<canvas id="beatarea" bind:this={canvas} on:mousedown={handleMouseDown}></canvas>