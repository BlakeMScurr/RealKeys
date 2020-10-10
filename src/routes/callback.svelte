<!-- TODO: rename file to spotify callback -->
<script>
    import queryString from "query-string";

    let parsed = {};
    if (typeof window !== 'undefined') {
        parsed = queryString.parse(window.location.search);
    }
</script>

Login happened

{parsed}