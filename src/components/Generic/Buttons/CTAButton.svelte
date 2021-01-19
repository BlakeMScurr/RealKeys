<script lang="ts">
    export let text: string;
</script>

<style lang="scss">
    div {
        height: 39px;
        box-sizing: border-box;
        border-radius: 20px;
        background-color: #38A3FA;
        border: none;
        display: inline-block;
        
        div {
            display: flex;
            justify-content: center;

            h2 {
                margin: 0;
                padding-top: 0;
                padding-bottom: 0;
                color: white;
                align-self: center;
                padding: 10px;
            }
        }
    }

</style>

<div>
    <div>
        <h2 class="robotic">{text}</h2>
    </div>
</div>