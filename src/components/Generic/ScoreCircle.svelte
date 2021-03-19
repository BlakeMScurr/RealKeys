<script lang="ts">
    export let score = 0;
</script>


<style lang="scss">
    .outerCircle {
        $radius: 18px;
        width: $radius;
        height: $radius;
        background-color: #A4A4A4;
        border-radius: 50%;

        display: grid;
        padding: 4px;

        
        .innerCircle {
            background-color: white;
            border-radius: 50%;
            text-align: center;

            display: grid;
            align-items: center;
            h5 {
                margin: 0;
                color: #A4A4A4;
            }
        }
    }
</style>

<div class="outerCircle">
    <div class="innerCircle">
        <h5 class="robotic">{score}</h5>
    </div>
</div>