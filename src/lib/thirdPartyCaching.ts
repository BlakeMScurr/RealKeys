// TODO: cache the actual instrument

// Copied from soundfont-player used to create the appropriate caching URL
// TODO: put the nameToUrl in the index.d.ts file in soundfont-player and make a PR upstream
function nameToUrl (name: string, sf: string, format: string) {
    format = format === 'ogg' ? format : 'mp3'
    sf = sf === 'FluidR3_GM' ? sf : 'MusyngKite'
    return 'https://gleitz.github.io/midi-js-soundfonts/' + sf + '/' + name + '-' + format + '.js'
}

// if (percusive) {
//     reqURL = nameToUrl("percussion", "FluidR3_GM", "mp3")
// } else {
//     reqURL = nameToUrl(instrumentName(GeneralMidiInstrumentNumber), "MusyngKite", "mp3")
// }

// Apparently this isn't inbuilt, for whatever reason, so I got it from https://gist.github.com/ithinkihaveacat/227bfe8aa81328c5d64ec48f4e4df8e5
interface FetchEvent extends Event {
	request: Request;
    respondWith(response: Promise<Response>|Response): Promise<Response>;
    waitUntil(fn: Promise<any>): void; // This part comes from extendable event
}

const CACHE_NAME = "soundfont_cache"

// Adds a listener which listens on fetch requests and caches them where applicable 
export function addFetchListener() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw/caching.js')
        .then((reg) => {
          // registration worked
          console.log('Registration succeeded. Scope is ' + reg.scope);
        }).catch((error) => {
          // registration failed
          console.log('Registration failed with ' + error);
        });
      }
}
