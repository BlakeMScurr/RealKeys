import { midiPathToName } from "./util"

test("midiPathToName", ()=>{
    expect(midiPathToName("/K/K/katy_perry-i_kissed_a_girl.mid")).toBe("Katy Perry - I Kissed A Girl")
})