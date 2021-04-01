<script lang="ts">
    import { Chart } from "chart.js";
    import { onMount } from "svelte"
    import { goto } from "@sapper/app"
    import { historyKey, level } from "../lib/level";

    let borderColours = [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ]

    let canvas
    onMount(() => {
        let str = localStorage.getItem(historyKey)
        if (str) {
            let history = JSON.parse(str)

            let data = history.levels.map((event) => {
                return {
                    tonality: event.key + " " + event.tonality,
                    level: new level(event.key, event.tonality, event.phraseLength, event.notePoolSize, event.maxInterval),
                    x: new Date(event.time),
                    y: event.phraseLength + event.notePoolSize + event.maxInterval,
                }
            })

            let buckets = new Map<string, Array<any>>();
            data.forEach(point => {
                if (!buckets.has(point.tonality)) {
                    buckets.set(point.tonality, new Array())
                }
                buckets.get(point.tonality).push(point)
            });

            let dataSets = []
            let i = 0
            buckets.forEach((points, tonality) => {
                dataSets.push({
                    fill: false,
                    label: tonality,
                    data: points,
                    borderColor: [
                        borderColours[i],
                    ],
                    borderWidth: 1
                })
                i = (i+1) % borderColours.length
            })

            var ctx = canvas.getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: dataSets,
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'Difficulty (phrase length + note pool + max interval)'
                            }
                        }],
                        xAxes: [{
                            type: 'time',
                        }]
                    },
                    maintainAspectRatio: false,
                    onClick: (e, items) => {
                        if (items.length > 0) {
                            let shortest = Math.abs(items[0]._model.x - e.offsetX) + Math.abs(items[0]._model.y - e.offsetY)
                            let closest = {ds: items[0]._datasetIndex, i: items[0]._index}
                            items.forEach(item => {
                                let dist = Math.abs(item._model.x - e.offsetX) + Math.abs(item._model.y - e.offsetY)
                                if (dist < shortest) {
                                    shortest = dist
                                    closest = {ds: item._datasetIndex, i: item._index}
                                }
                            });
                            goto(dataSets[closest.ds].data[closest.i].level.playURL())
                        }
                    },
                    tooltips: {
                        // Disable the on-canvas tooltip
                        enabled: true,
                        callbacks: {
                            afterBody: function(a) {
                                let level = dataSets[a[0].datasetIndex].data[a[0].index].level
                                return `Phrase length: ${level.phraseLength}\nNote pool size: ${level.notePoolSize}\nMax interval: ${level.maxInterval}`
                            }
                        }
                    },
                }
            });
        } else {
            // Tell the user there's no history yet
        }
    })
</script>

<style lang="scss">
    div {
        height: calc(100% - 50px);
        width: 100%;
    }
</style>

<div>
    <canvas id="myChart" width="400" height="400" bind:this={canvas}></canvas>
</div>
