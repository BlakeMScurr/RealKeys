<!-- TODO: rename file to spotify callback -->
<script>
    import { joinURL, spotifyRedirectURI } from "../lib/util";
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
            }).then((res)=>{
                return res.json()
            }).then((json)=>{
                if (json.error !== undefined) {
                    error = json.error
                    console.log("could not login with spotify", error)
                } else {
                    let { jwt, spotifyAccessToken } = json
                    // TODO: store jwt too
                    // TODO: protect from CSRF stuff, however that works
                    console.log(spotifyAccessToken)
                    document.cookie = `token=${spotifyAccessToken}`
                }
            }).catch((e)=>{
                error = e
                console.log("could not login with spotify", e)
            })
        }
    }

</script>

Login {error === undefined ? "succeeded" : "failed: " + error}