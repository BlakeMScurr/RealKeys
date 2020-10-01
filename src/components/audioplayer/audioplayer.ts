import { Howl } from 'howler';

export interface Player {
    Seek(time: number);
    CurrentTime():number;
    Pause();
    Play();
    Duration():number;
}


export async function NewYouTubeAudioPlayer(videoID: string):Promise<Player> {
    return NewHowlAudioPlayer(['getYTAudio/' + videoID])
}

export async function NewHowlAudioPlayer(src: any):Promise<Player> {
    let howlPromise:Promise<Player> = new Promise((resolve) => {
        let sound;
        sound = new HowlPlayer(new Howl({
            src: src,
            format: 'mp3',
            html5: true, // html5 being forced gives us rate change without pitch increase as per https://github.com/goldfire/howler.js/issues/586#issuecomment-237240859
            onload: ()=> {
                resolve(sound)
            }
        }));
    })
    return howlPromise;
}

export function NewMockPlayer(length: number):Promise<Player> {
    return new Promise((resolve) => {
        resolve(new MockPlayer(5));
    })
}
class HowlPlayer {
    sound: any;

    constructor(sound: any) {
       this.sound = sound
    }

    Seek(time: number) {
        this.sound.seek(time)
    }

    CurrentTime():number {
        return this.sound.seek()
    }

    Pause() {
        this.sound.pause()
    }

    Play() {
        this.sound.play()
    }

    Duration():number {
        return this.sound.duration()
    }
}

export class MockPlayer {
    length: number;
    position: number;
    whenPlayStarted: number|undefined;
    constructor(length: number) {
        this.length = length
        this.position = 0;
    }

    Seek(time: number) {
        this.position = time
    }

    CurrentTime():number {
        if (this.whenPlayStarted == undefined) {
            return this.position
        }
        return this.position + (Date.now() - this.whenPlayStarted)/(this.Duration()*1000)
    }

    Pause() {
        this.position = this.CurrentTime()
        this.whenPlayStarted = undefined
    }
    
    Play() {
        this.whenPlayStarted = Date.now()
    }

    Duration():number {
        return this.length
    }


}