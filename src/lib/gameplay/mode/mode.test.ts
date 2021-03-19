import { makeMode, modeFactory, modeName } from "./mode"

test("makeMode", () => {
    expect(makeMode("wait")).toEqual(modeFactory(modeName.wait))
    expect(makeMode("atSpeed50")).toEqual(modeFactory(modeName.atSpeed, 50))
})

test("makeMode.error", () => {
    expect(()=>{makeMode("garbo")}).toThrow("unknown mode type garbo")
})