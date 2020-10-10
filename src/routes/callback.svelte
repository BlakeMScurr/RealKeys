<!-- TODO: rename file to spotify callback -->
<script>
    import { joinURL } from "../lib/util";
    import queryString from "query-string";

    // TODO(security): handle the state parameter to prevent CORS issue
    // TODO: handle error
    let code;
    let error;
    if (typeof window !== 'undefined') {
        let parsed = queryString.parse(window.location.search);
        code = parsed.code
        error = parsed.error

        if (code !== undefined) {
            fetch(joinURL(["api", "login"]), {
                method: 'POST',
                body: JSON.stringify({ code: code }),
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        }
    }

</script>

Login {error === undefined ? "succeeded" : "failed: " + error}