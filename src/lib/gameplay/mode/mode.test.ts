import { makeMode, modeFactory, modeName } from "./mode"

test("makeMode", () => {
    expect(makeMode("wait")).toEqual(modeFactory(modeName.wait))
    expect(makeMode("atSpeed50")).toEqual(modeFactory(modeName.atSpeed, 50))
})