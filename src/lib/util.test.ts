import { midiPathToName } from "./util"

test("midiPathToName", ()=>{
    expect(midiPathToName("/K/K/katy_perry-i_kissed_a_girl.mid")).toBe("Katy Perry - I Kissed A Girl")
    expect(midiPathToName("/H/H/HereComesTheSun.mid")).toBe("Here Comes The Sun")
    expect(midiPathToName("/A/A/ADayInTheLife2.mid")).toBe("A Day In The Life2")
})