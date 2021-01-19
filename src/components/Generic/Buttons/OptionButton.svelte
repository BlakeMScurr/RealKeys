<script lang="ts">
    export let text: string;
</script>

<style lang="scss">
    div {
        height: 21px;
        box-sizing: border-box;
        border-radius: 10px;
        border: 1px solid black;
        color: black;
        display: inline-block;
        
        div {
            display: flex;
            justify-content: center;
            border: none;

            h4 {
                margin: 0;
                padding-top: 0;
                padding-bottom: 0;
                align-self: center;
                padding: 10px;
            }
        }
    }

</style>

<div>
    <div>
        <h4>{text}</h4>
    </div>
</div>