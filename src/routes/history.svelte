<script lang="ts">
    import { Chart } from "chart.js";
    import { onMount } from "svelte"
    import { historyKey } from "../lib/level";

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
                            }
                        }],
                        xAxes: [{
                            type: 'time',
                        }]
                    },
                    maintainAspectRatio: false,
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
