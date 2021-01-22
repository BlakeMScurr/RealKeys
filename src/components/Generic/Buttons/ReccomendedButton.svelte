<script lang="ts">
    export let text: string;
</script>

<style lang="scss">
    div {
        height: 21px;
        min-width: 70px;
        box-sizing: border-box;
        border-radius: 10px;
        background-color: #38A3FA;
        border: none;
        display: inline-block;
        
        div {
            display: flex;
            justify-content: center;

            h4 {
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
        <h4 class="robotic">{text}</h4>
    </div>
</div>