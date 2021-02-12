<script lang="ts"></script>

<style lang="scss">
    div {
        $little-pad: 15px;

        position: relative;
        background-color: white;
        height: 50px;
        width: 100%;
        box-shadow: 0px 12px 12px rgba(208, 208, 208, 0.25);
        z-index: 3;

        display: flex;
        justify-content: space-between;
        align-items: center;

        h1 {
            padding-left: $little-pad;
            margin: 0;
            width: 0%;
        }
        
        .right {
            padding-right: $little-pad;
            margin: 0;
            width: auto;
            h4 {
                padding-left: $little-pad;
            }
        }
    }
</style>

<div>
    <h1><a href="/">RealKeys</a></h1>
    <div class="right">
        <h4><a href="/">Home</a></h4>
        <h4><a href="/settings">Settings</a></h4>
    </div>
</div>