import * as sys from './sys.js';

export class TypeTest extends sys.Test {
  testIdentity(): void
  testFind(): void
  testValueTypes(): void
  testFlags(): void
  testMixins(): void
  testInheritance(): void
  testFits(): void
  verifyFits(a: sys.Type, b: sys.Type, expected: boolean): void
  testIsGeneric(): void
  testParams(): void
  testParameterization(): void
  testToListOf(): void
  testEmptyList(): void
  testMake(): void
  testSynthetic(): void
  verifySlotsSynthetic(t: sys.Type): void
  testGenericParameters(): void
  testInference(): void
  static make(): TypeTest
}
export class TypeInheritTestAbstract extends sys.Obj {
  static make(): TypeInheritTestAbstract
}
export class MxA extends sys.Obj {
  static sa(): string
  ia(): string
  wrapToStr1(): string
  wrapToStr2(): string
  static staticWrapType(a: MxA): sys.Type
  va(): string
  aa(): string
  coa(): sys.JsObj
  cob(): sys.JsObj
  coc(): sys.JsObj
  thisa(): this
  thisb(): this
}
export class MxB extends sys.Obj {
  static sb(): string
  ib(): string
  vb(): string
  ab(): string
}
export class MxClsA extends sys.Obj {
  static sa(): string
  ia(): string
  wrapToStr1(): string
  wrapToStr2(): string
  static staticWrapType(a: MxA): sys.Type
  va(): string
  aa(): string
  coa(): sys.JsObj
  cob(): sys.JsObj
  coc(): sys.JsObj
  thisa(): this
  thisb(): this
  mxClsA(): string
  static make(): MxClsA
}
export class MxClsAB extends sys.Obj {
  static sa(): string
  ia(): string
  wrapToStr1(): string
  wrapToStr2(): string
  static staticWrapType(a: MxA): sys.Type
  va(): string
  aa(): string
  coa(): sys.JsObj
  cob(): string
  coc(): sys.JsObj
  thisa(): this
  thisb(): this
  static sb(): string
  ib(): string
  vb(): string
  ab(): string
  mxClsAB(): string
  static make(): MxClsAB
}
export class FacetM1 extends sys.Obj {
  static defVal(): FacetM1
}
export class FacetM2 extends sys.Obj {
  static defVal(): FacetM2
}

