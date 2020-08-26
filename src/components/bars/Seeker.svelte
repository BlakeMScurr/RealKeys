<style>
    .arrow {
        width: 0;
        height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
    }

    .down {
        border-top: 10px solid blue;
    }

    .lineholder {
        height: 50px;
        width: 20px;
        margin: 0;
    }

    .line {
        position: relative;
        height: 70px;
        top: -10px;
        width: 4px;
        margin-left:  8px; /* triangle wiidth - line width / 2 = (20 - 4)/2 = 8, which centres the line */
        background-color: blue;
    }

    .up {
        border-bottom: 10px solid blue;
    }
</style>

<div class="container">
    <div class="arrow down"></div>
    <div class="lineholder">
        <div class="line"></div>
    </div>
    <div class="arrow up"></div>
</div>