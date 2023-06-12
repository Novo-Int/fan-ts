import * as sys from './sys.js';

class EnumAbc extends sys.Enum {
  constructor() {
    super();
    const this$ = this;
  }

  typeof$() { return EnumAbc.type$; }

  static A() { return EnumAbc.vals().get(0); }

  static B() { return EnumAbc.vals().get(1); }

  static C() { return EnumAbc.vals().get(2); }

  static #vals = null;

  static #first = null;

  negOrdinal() {
    return sys.Int.negate(this.ordinal());
  }

  static make($ordinal,$name) {
    const self$ = new EnumAbc();
    EnumAbc.make$(self$,$ordinal,$name);
    return self$;
  }

  static make$(self$,$ordinal,$name) {
    sys.Enum.make$(self$, $ordinal, $name);
    return;
  }

  static fromStr(name$, checked=true) {
    return sys.Enum.doFromStr(EnumAbc.type$, EnumAbc.vals(), name$, checked);
  }

  static vals() {
    if (EnumAbc.#vals == null) {
      EnumAbc.#vals = sys.List.make(EnumAbc.type$, [
        EnumAbc.make(0,"A"),
        EnumAbc.make(1,"B"),
        EnumAbc.make(2,"C"),
      ]).toImmutable();
    }
    return EnumAbc.#vals;
  }

}

class TypeTest extends sys.Test {
  constructor() {
    super();
    const this$ = this;
  }

  typeof$() { return TypeTest.type$; }

  testIdentity() {
    let t = sys.Type.of(this);
    this.verifyEq(sys.ObjUtil.coerce(sys.ObjUtil.isImmutable(t), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(t.toStr(), "testEs::TypeTest");
    this.verifyEq(t.toLocale(), "testEs::TypeTest");
    return;
  }

  testFind() {
    const this$ = this
    this.verifySame(sys.Type.find("sys::Int"), sys.Int.type$);
    this.verifySame(sys.Type.find("sys::Str[]"), sys.Type.find("sys::Str[]"));
    this.verifySame(sys.Type.find("sys::notHereFoo", false), null);
    this.verifyErr(sys.UnknownTypeErr.type$, (it) => {
      sys.Type.find("sys::notHereFoo");
      return;
    });
    this.verifyErr(sys.UnknownPodErr.type$, (it) => {
      sys.Type.find("notHereFoo::Duh");
      return;
    });
    this.verifyErr(sys.ArgErr.type$, (it) => {
      sys.Type.find("sys");
      return;
    });
    this.verifyErr(sys.ArgErr.type$, (it) => {
      sys.Type.find("sys::");
      return;
    });
    this.verifyErr(sys.ArgErr.type$, (it) => {
      sys.Type.find("::sys");
      return;
    });
    this.verifyErr(sys.ArgErr.type$, (it) => {
      sys.Type.find("[]");
      return;
    });
    return;
  }

  testValueTypes() {
    this.verifyEq(sys.ObjUtil.coerce(sys.Bool.type$.isVal(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.Bool.type$.toNullable().isVal(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.Int.type$.isVal(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.Int.type$.toNullable().isVal(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.Float.type$.isVal(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.Float.type$.toNullable().isVal(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.Obj.type$.isVal(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.Obj.type$.toNullable().isVal(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.Num.type$.isVal(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.Num.type$.toNullable().isVal(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.Decimal.type$.isVal(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.Decimal.type$.toNullable().isVal(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.Str.type$.isVal(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.Str.type$.toNullable().isVal(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    let x = sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable());
    this.verifyEq(sys.ObjUtil.coerce(sys.ObjUtil.is(x, sys.Obj.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(!sys.ObjUtil.is(x, sys.Obj.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.as(x, sys.Obj.type$), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.ObjUtil.is(x, sys.Bool.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(!sys.ObjUtil.is(x, sys.Bool.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.ObjUtil.as(x, sys.Bool.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.ObjUtil.is(x, sys.Num.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(!sys.ObjUtil.is(x, sys.Num.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.as(x, sys.Num.type$), null);
    this.verifyEq(sys.ObjUtil.coerce(sys.ObjUtil.is(x, sys.Int.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(!sys.ObjUtil.is(x, sys.Int.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.ObjUtil.as(x, sys.Int.type$), sys.Obj.type$.toNullable()), null);
    (x = sys.ObjUtil.coerce(123, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.ObjUtil.is(x, sys.Obj.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(!sys.ObjUtil.is(x, sys.Obj.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.as(x, sys.Obj.type$), sys.ObjUtil.coerce(123, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.ObjUtil.is(x, sys.Bool.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(!sys.ObjUtil.is(x, sys.Bool.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.ObjUtil.as(x, sys.Bool.type$), sys.Obj.type$.toNullable()), null);
    this.verifyEq(sys.ObjUtil.coerce(sys.ObjUtil.is(x, sys.Num.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(!sys.ObjUtil.is(x, sys.Num.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.as(x, sys.Num.type$), sys.ObjUtil.coerce(123, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.ObjUtil.is(x, sys.Int.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(!sys.ObjUtil.is(x, sys.Int.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.ObjUtil.as(x, sys.Int.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(123, sys.Obj.type$.toNullable()));
    (x = sys.ObjUtil.coerce(sys.Float.make(123.0), sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.ObjUtil.is(x, sys.Obj.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(!sys.ObjUtil.is(x, sys.Obj.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.as(x, sys.Obj.type$), sys.ObjUtil.coerce(sys.Float.make(123.0), sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.ObjUtil.is(x, sys.Bool.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(!sys.ObjUtil.is(x, sys.Bool.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.ObjUtil.as(x, sys.Bool.type$), sys.Obj.type$.toNullable()), null);
    this.verifyEq(sys.ObjUtil.coerce(sys.ObjUtil.is(x, sys.Num.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(!sys.ObjUtil.is(x, sys.Num.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.as(x, sys.Num.type$), sys.ObjUtil.coerce(sys.Float.make(123.0), sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.ObjUtil.is(x, sys.Int.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(!sys.ObjUtil.is(x, sys.Int.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.ObjUtil.as(x, sys.Int.type$), sys.Obj.type$.toNullable()), null);
    this.verifyEq(sys.ObjUtil.coerce(sys.ObjUtil.is(x, sys.Float.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(!sys.ObjUtil.is(x, sys.Float.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.ObjUtil.as(x, sys.Float.type$), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(sys.Float.make(123.0), sys.Obj.type$.toNullable()));
    return;
  }

  testFlags() {
    let t = sys.Type.of(this);
    this.verifyEq(sys.ObjUtil.coerce(sys.Test.type$.isAbstract(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(t.isAbstract(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(t.isClass(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(EnumAbc.type$.isClass(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(MxA.type$.isClass(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(t.isEnum(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(EnumAbc.type$.isEnum(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(MxA.type$.isEnum(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(FacetM1.type$.isFacet(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(MxA.type$.isFacet(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.Bool.type$.isFinal(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.Test.type$.isFinal(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(t.isInternal(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(EnumAbc.type$.isInternal(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(t.isMixin(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(EnumAbc.type$.isMixin(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(MxA.type$.isMixin(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(t.isPublic(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(EnumAbc.type$.isPublic(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    return;
  }

  testMixins() {
    this.verifyEq(sys.Obj.type$.mixins(), sys.List.make(sys.Type.type$));
    this.verifyEq(sys.ObjUtil.coerce(sys.Obj.type$.mixins().isRO(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(MxClsAB.type$.mixins(), sys.List.make(sys.Type.type$, [MxA.type$, MxB.type$]));
    this.verifyEq(sys.ObjUtil.coerce(MxClsAB.type$.mixins().isRO(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    return;
  }

  testInheritance() {
    const this$ = this
    this.verifyEq(sys.Obj.type$.inheritance(), sys.List.make(sys.Type.type$, [sys.Obj.type$]));
    this.verifyEq(sys.Num.type$.inheritance(), sys.List.make(sys.Type.type$, [sys.Num.type$, sys.Obj.type$]));
    this.verifyEq(sys.Int.type$.inheritance(), sys.List.make(sys.Type.type$, [sys.Int.type$, sys.Num.type$, sys.Obj.type$]));
    this.verifyEq(sys.Void.type$.inheritance(), sys.List.make(sys.Type.type$, [sys.Void.type$]));
    let t = TypeInheritTestC.type$;
    this.verifyNotNull(t.slot("c"));
    this.verifyNotNull(t.slot("b"));
    this.verifyNotNull(t.slot("a"));
    this.verifyNotNull(t.slot("m"));
    this.verifyNotNull(t.slots().find((s) => {
      return sys.ObjUtil.equals(s.name$(), "c");
    }));
    this.verifyNotNull(t.slots().find((s) => {
      return sys.ObjUtil.equals(s.name$(), "b");
    }));
    this.verifyNotNull(t.slots().find((s) => {
      return sys.ObjUtil.equals(s.name$(), "a");
    }));
    this.verifyNotNull(t.slots().find((s) => {
      return sys.ObjUtil.equals(s.name$(), "m");
    }));
    this.verifyNotNull(t.fields().find((f) => {
      return sys.ObjUtil.equals(f.name$(), "b");
    }));
    this.verifyNotNull(t.fields().find((f) => {
      return sys.ObjUtil.equals(f.name$(), "a");
    }));
    this.verifyNotNull(t.methods().find((m) => {
      return sys.ObjUtil.equals(m.name$(), "m");
    }));
    return;
  }

  testFits() {
    const this$ = this
    this.verifyFits(sys.Float.type$, sys.Float.type$, true);
    this.verifyFits(sys.Float.type$, sys.Num.type$, true);
    this.verifyFits(sys.Float.type$, sys.Obj.type$, true);
    this.verifyFits(sys.Float.type$, sys.Str.type$, false);
    this.verifyFits(sys.Obj.type$, sys.Float.type$, false);
    this.verifyFits(sys.Type.find("sys::Int[]"), sys.Obj.type$, true);
    this.verifyFits(sys.Type.find("sys::Int[]"), sys.Type.find("sys::Int[]"), true);
    this.verifyFits(sys.Type.find("sys::Int[]"), sys.Type.find("sys::Num[]"), true);
    this.verifyFits(sys.Type.find("sys::Int[]"), sys.Type.find("sys::Obj[]"), true);
    this.verifyFits(sys.Type.find("sys::Int[]"), sys.Type.find("sys::Float[]"), false);
    this.verifyFits(sys.Type.find("[sys::Str:sys::Int]"), sys.Obj.type$, true);
    this.verifyFits(sys.Type.find("[sys::Str:sys::Int]"), sys.Type.find("[sys::Str:sys::Int]"), true);
    this.verifyFits(sys.Type.find("[sys::Str:sys::Int]"), sys.Type.find("[sys::Str:sys::Num]"), true);
    this.verifyFits(sys.Type.find("[sys::Str:sys::Int]"), sys.Type.find("[sys::Str:sys::Obj]"), true);
    this.verifyFits(sys.Type.find("[sys::Str:sys::Int]"), sys.Type.find("[sys::Obj:sys::Obj]"), true);
    this.verifyFits(sys.Type.find("[sys::Str:sys::Int]"), sys.Type.find("[sys::Obj:sys::Float]"), false);
    this.verifyFits(sys.Type.find("[sys::Str:sys::Int]"), sys.Str.type$, false);
    this.verifyFits(sys.Type.find("|sys::Int->sys::Void|"), sys.Obj.type$, true);
    this.verifyFits(sys.Type.find("|sys::Int->sys::Void|"), sys.Type.find("|sys::Int->sys::Void|"), true);
    this.verifyFits(sys.Type.find("|sys::Num->sys::Void|"), sys.Type.find("|sys::Int->sys::Void|"), true);
    this.verifyFits(sys.Type.find("|sys::Obj->sys::Void|"), sys.Type.find("|sys::Int->sys::Void|"), true);
    this.verifyFits(sys.Type.find("|sys::Float->sys::Void|"), sys.Type.find("|sys::Int->sys::Void|"), false);
    this.verifyFits(sys.Void.type$, sys.Obj.type$, false);
    this.verifyFits(sys.Obj.type$, sys.Void.type$, false);
    let list1 = sys.ObjUtil.coerce(sys.List.make(sys.Obj.type$), sys.Type.find("sys::Int[]?"));
    let list2 = sys.ObjUtil.coerce(sys.List.make(sys.Obj.type$.toNullable()), sys.Type.find("sys::Int[]?"));
    let list3 = sys.ObjUtil.coerce(sys.List.make(sys.Obj.type$), sys.Type.find("sys::Int?[]?"));
    let list4 = sys.ObjUtil.coerce(sys.List.make(sys.Obj.type$.toNullable()), sys.Type.find("sys::Int?[]?"));
    let map1 = sys.ObjUtil.coerce(sys.Map.fromLiteral$([], [], sys.Type.find("sys::Obj"), sys.Type.find("sys::Obj")), sys.Type.find("[sys::Int:sys::Int[]?]"));
    let map2 = sys.ObjUtil.coerce(sys.Map.fromLiteral$([], [], sys.Type.find("sys::Obj"), sys.Type.find("sys::Obj?")), sys.Type.find("[sys::Int:sys::Int[]?]"));
    let map3 = sys.ObjUtil.coerce(sys.Map.fromLiteral$([], [], sys.Type.find("sys::Obj"), sys.Type.find("sys::Obj")), sys.Type.find("[sys::Int:sys::Int?[]?]"));
    let map4 = sys.ObjUtil.coerce(sys.Map.fromLiteral$([], [], sys.Type.find("sys::Obj"), sys.Type.find("sys::Obj?")), sys.Type.find("[sys::Int:sys::Int?[]?]"));
    let map5 = sys.ObjUtil.coerce(sys.Map.fromLiteral$([sys.ObjUtil.coerce(1, sys.Obj.type$.toNullable())], [sys.ObjUtil.coerce(1, sys.Obj.type$.toNullable())], sys.Type.find("sys::Int"), sys.Type.find("sys::Int")).map((it) => {
      return sys.Int.toStr(it);
    }), sys.Type.find("[sys::Int:sys::Str]"));
    let list5 = sys.ObjUtil.coerce(sys.List.make(sys.Int.type$, [sys.ObjUtil.coerce(1, sys.Obj.type$.toNullable())]).map((it) => {
      return sys.Int.toStr(it);
    }), sys.Type.find("sys::Str[]"));
    return;
  }

  verifyFits(a,b,expected) {
    let an = a.toNullable();
    let bn = b.toNullable();
    this.verifyEq(sys.ObjUtil.coerce(a.fits(b), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(expected, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(an.fits(b), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(expected, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(a.fits(bn), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(expected, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(an.fits(bn), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(expected, sys.Obj.type$.toNullable()));
    return;
  }

  testIsGeneric() {
    this.verifyEq(sys.ObjUtil.coerce(sys.Obj.type$.isGeneric(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.Str.type$.isGeneric(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.Type.find("sys::Str[]").isGeneric(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.Method.type$.isGeneric(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(false, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.Type.find("sys::List").isGeneric(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.Type.find("sys::Map").isGeneric(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.ObjUtil.coerce(sys.Type.find("sys::Func").isGeneric(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    return;
  }

  testParams() {
    this.verifyEq(sys.Str.type$.params(), sys.Map.fromLiteral$([], [], sys.Type.find("sys::Str"), sys.Type.find("sys::Type")));
    this.verifyEq(sys.ObjUtil.coerce(sys.Str.type$.params().isRO(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.Type.find("sys::Str[]").params(), sys.Map.fromLiteral$(["V","L"], [sys.Str.type$,sys.Type.find("sys::Str[]")], sys.Type.find("sys::Str"), sys.Type.find("sys::Type")));
    this.verifyEq(sys.ObjUtil.coerce(sys.Type.find("sys::Str[]").params().isRO(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.Type.find("[sys::Int:sys::Slot[]]").params(), sys.Map.fromLiteral$(["K","V","M"], [sys.Int.type$,sys.Type.find("sys::Slot[]"),sys.Type.find("[sys::Int:sys::Slot[]]")], sys.Type.find("sys::Str"), sys.Type.find("sys::Type")));
    this.verifyEq(sys.ObjUtil.coerce(sys.Type.find("[sys::Int:sys::Slot[]]").params().isRO(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.Type.find("|sys::Int,sys::Float->sys::Bool|").params(), sys.Map.fromLiteral$(["A","B","R"], [sys.Int.type$,sys.Float.type$,sys.Bool.type$], sys.Type.find("sys::Str"), sys.Type.find("sys::Type")));
    this.verifyEq(sys.ObjUtil.coerce(sys.Type.find("|sys::Int,sys::Float->sys::Bool|").params().isRO(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    return;
  }

  testParameterization() {
    const this$ = this
    this.verifyEq(sys.Type.find("sys::List").parameterize(sys.Map.fromLiteral$(["V"], [sys.Bool.type$], sys.Type.find("sys::Str"), sys.Type.find("sys::Type"))), sys.Type.find("sys::Bool[]"));
    this.verifyEq(sys.Type.find("sys::List").parameterize(sys.Map.fromLiteral$(["V"], [sys.Type.find("sys::Bool[]")], sys.Type.find("sys::Str"), sys.Type.find("sys::Type"))), sys.Type.find("sys::Bool[][]"));
    this.verifyErr(sys.ArgErr.type$, (it) => {
      sys.Type.find("sys::List").parameterize(sys.Map.fromLiteral$(["X"], [sys.Type.find("sys::Bool[]")], sys.Type.find("sys::Str"), sys.Type.find("sys::Type")));
      return;
    });
    this.verifyEq(sys.Type.find("sys::Map").parameterize(sys.Map.fromLiteral$(["K","V"], [sys.Str.type$,sys.Slot.type$], sys.Type.find("sys::Str"), sys.Type.find("sys::Type"))), sys.Type.find("[sys::Str:sys::Slot]"));
    this.verifyEq(sys.Type.find("sys::Map").parameterize(sys.Map.fromLiteral$(["K","V"], [sys.Str.type$,sys.Type.find("sys::Int[]")], sys.Type.find("sys::Str"), sys.Type.find("sys::Type"))), sys.Type.find("[sys::Str:sys::Int[]]"));
    this.verifyErr(sys.ArgErr.type$, (it) => {
      sys.Type.find("sys::Map").parameterize(sys.Map.fromLiteral$(["V"], [sys.Type.find("sys::Bool[]")], sys.Type.find("sys::Str"), sys.Type.find("sys::Type")));
      return;
    });
    this.verifyErr(sys.ArgErr.type$, (it) => {
      sys.Type.find("sys::Map").parameterize(sys.Map.fromLiteral$(["K"], [sys.Type.find("sys::Bool[]")], sys.Type.find("sys::Str"), sys.Type.find("sys::Type")));
      return;
    });
    this.verifyEq(sys.Type.find("sys::Func").parameterize(sys.Map.fromLiteral$(["R"], [sys.Void.type$], sys.Type.find("sys::Str"), sys.Type.find("sys::Type"))), sys.Type.find("|->sys::Void|"));
    this.verifyEq(sys.Type.find("sys::Func").parameterize(sys.Map.fromLiteral$(["A","R"], [sys.Str.type$,sys.Int.type$], sys.Type.find("sys::Str"), sys.Type.find("sys::Type"))), sys.Type.find("|sys::Str->sys::Int|"));
    this.verifyEq(sys.Type.find("sys::Func").parameterize(sys.Map.fromLiteral$(["A","B","C","R"], [sys.Str.type$,sys.Bool.type$,sys.Int.type$,sys.Float.type$], sys.Type.find("sys::Str"), sys.Type.find("sys::Type"))), sys.Type.find("|sys::Str,sys::Bool,sys::Int->sys::Float|"));
    this.verifyErr(sys.ArgErr.type$, (it) => {
      sys.Type.find("sys::Func").parameterize(sys.Map.fromLiteral$(["A"], [sys.Type.find("sys::Bool[]")], sys.Type.find("sys::Str"), sys.Type.find("sys::Type")));
      return;
    });
    this.verifyErr(sys.UnsupportedErr.type$, (it) => {
      sys.Str.type$.parameterize(sys.Map.fromLiteral$(["X"], [sys.Void.type$], sys.Type.find("sys::Str"), sys.Type.find("sys::Type")));
      return;
    });
    this.verifyErr(sys.UnsupportedErr.type$, (it) => {
      sys.Type.find("sys::Str[]").parameterize(sys.Map.fromLiteral$(["X"], [sys.Void.type$], sys.Type.find("sys::Str"), sys.Type.find("sys::Type")));
      return;
    });
    return;
  }

  testToListOf() {
    this.verifyEq(sys.Str.type$.toListOf(), sys.Type.find("sys::Str[]"));
    this.verifyEq(sys.Type.find("sys::Str[]").toListOf(), sys.Type.find("sys::Str[][]"));
    this.verifyEq(sys.Type.find("sys::Str[][]").toListOf(), sys.Type.find("sys::Str[][][]"));
    this.verifyEq(sys.Type.find("[sys::Str:sys::Buf]").toListOf(), sys.Type.find("[sys::Str:sys::Buf][]"));
    return;
  }

  testEmptyList() {
    const this$ = this
    let s = sys.Str.type$.emptyList();
    this.verifyEq(s, sys.List.make(sys.Str.type$));
    this.verifyEq(sys.ObjUtil.coerce(sys.ObjUtil.isImmutable(s), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.Type.of(s).signature(), "sys::Str[]");
    this.verifySame(s, sys.Str.type$.emptyList());
    this.verifyErr(sys.ReadonlyErr.type$, (it) => {
      s.add("foo");
      return;
    });
    let sl = sys.Type.find("sys::Str[]").emptyList();
    this.verifyEq(sl, sys.List.make(sys.Type.find("sys::Str[]")));
    this.verifyEq(sys.ObjUtil.coerce(sys.ObjUtil.isImmutable(sl), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(true, sys.Obj.type$.toNullable()));
    this.verifyEq(sys.Type.of(sl).signature(), "sys::Str[][]");
    this.verifySame(sl, sys.Type.find("sys::Str[]").emptyList());
    this.verifyNotSame(sl, s);
    this.verifyErr(sys.ReadonlyErr.type$, (it) => {
      sl.add(sys.List.make(sys.Str.type$));
      return;
    });
    return;
  }

  testMake() {
    const this$ = this
    this.verify(sys.ObjUtil.is(sys.Version.type$.make(sys.List.make(sys.Type.find("sys::Int[]"), [sys.List.make(sys.Int.type$, [sys.ObjUtil.coerce(2, sys.Obj.type$.toNullable())])])), sys.Version.type$));
    this.verifyErr(sys.Err.type$, (it) => {
      TypeInheritTestAbstract.type$.make();
      return;
    });
    this.verifyErr(sys.Err.type$, (it) => {
      TypeInheritTestM1.type$.make();
      return;
    });
    return;
  }

  testSynthetic() {
    const this$ = this
    sys.Pod.of(this).types().each((t) => {
      this$.verifyEq(sys.ObjUtil.coerce(t.isSynthetic(), sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(sys.Str.index(t.name$(), "\$") != null, sys.Obj.type$.toNullable()), t.toStr());
      this$.verifySlotsSynthetic(t);
      return;
    });
    return;
  }

  verifySlotsSynthetic(t) {
    const this$ = this
    t.slots().each((slot) => {
      if ((slot.parent().isSynthetic() || sys.Str.index(slot.name$(), "\$") != null)) {
        this$.verify(slot.isSynthetic(), slot.toStr());
      }
      ;
      return;
    });
    return;
  }

  testGenericParameters() {
    let v = sys.Type.find("sys::List").slot("get").returns();
    this.verifyEq(v.name$(), "V");
    this.verifyEq(v.qname(), "sys::V");
    this.verifySame(v.pod(), sys.Obj.type$.pod());
    this.verifySame(v.base(), sys.Obj.type$);
    this.verifyEq(v.mixins(), sys.List.make(sys.Type.type$));
    this.verifyEq(v.mixins().ro(), sys.List.make(sys.Type.type$));
    return;
  }

  testInference() {
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Int.type$, [sys.ObjUtil.coerce(2, sys.Obj.type$.toNullable())])), sys.Type.find("sys::Int[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Num.type$, [this.num()])), sys.Type.find("sys::Num[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(TiA.type$, [this.a()])), sys.Type.find("testEs::TiA[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(TiA.type$.toNullable(), [this.an()])), sys.Type.find("testEs::TiA?[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Int.type$, [sys.ObjUtil.coerce(2, sys.Obj.type$.toNullable()), sys.ObjUtil.coerce(3, sys.Obj.type$.toNullable())])), sys.Type.find("sys::Int[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Num.type$, [sys.ObjUtil.coerce(sys.Float.make(2.0), sys.Num.type$), sys.ObjUtil.coerce(3, sys.Num.type$)])), sys.Type.find("sys::Num[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Num.type$, [sys.ObjUtil.coerce(3, sys.Num.type$), sys.ObjUtil.coerce(sys.Float.make(2.0), sys.Num.type$)])), sys.Type.find("sys::Num[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Num.type$, [sys.ObjUtil.coerce(3, sys.Num.type$), this.num()])), sys.Type.find("sys::Num[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Num.type$, [this.num(), sys.ObjUtil.coerce(3, sys.Num.type$)])), sys.Type.find("sys::Num[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(TiA.type$, [this.a(), this.a(), this.a()])), sys.Type.find("testEs::TiA[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(TiB.type$.toNullable(), [this.b(), this.bn(), this.b()])), sys.Type.find("testEs::TiB?[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(TiC.type$, [this.c(), this.c(), this.c()])), sys.Type.find("testEs::TiC[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(TiA.type$, [this.a(), this.b(), this.c()])), sys.Type.find("testEs::TiA[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(TiA.type$, [this.c(), this.b(), this.a()])), sys.Type.find("testEs::TiA[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(TiB.type$, [this.c(), this.b(), this.b()])), sys.Type.find("testEs::TiB[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(TiB.type$.toNullable(), [this.cn(), this.b(), this.b()])), sys.Type.find("testEs::TiB?[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(TiB.type$.toNullable(), [this.b(), this.c(), this.bn()])), sys.Type.find("testEs::TiB?[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Obj.type$, [this.b(), this.c(), this.m()])), sys.Type.find("sys::Obj[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Obj.type$.toNullable(), [this.c(), this.mn(), this.c()])), sys.Type.find("sys::Obj?[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(TiM.type$, [this.m(), this.m()])), sys.Type.find("testEs::TiM[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(TiM.type$.toNullable(), [this.m(), this.mn()])), sys.Type.find("testEs::TiM?[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(TiM.type$.toNullable(), [this.mn(), this.m()])), sys.Type.find("testEs::TiM?[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Obj.type$.toNullable(), [this.m(), this.on()])), sys.Type.find("sys::Obj?[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Obj.type$.toNullable(), [this.on(), this.m()])), sys.Type.find("sys::Obj?[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(TiO.type$.toNullable(), [this.on(), this.on()])), sys.Type.find("testEs::TiO?[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Type.find("sys::Int[]"), [sys.List.make(sys.Int.type$, [sys.ObjUtil.coerce(2, sys.Obj.type$.toNullable())]), sys.List.make(sys.Int.type$, [sys.ObjUtil.coerce(3, sys.Obj.type$.toNullable())])])), sys.Type.find("sys::Int[][]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Type.find("sys::Num[]"), [sys.List.make(sys.Float.type$, [sys.ObjUtil.coerce(sys.Float.make(2.0), sys.Obj.type$.toNullable())]), sys.List.make(sys.Int.type$, [sys.ObjUtil.coerce(3, sys.Obj.type$.toNullable())])])), sys.Type.find("sys::Num[][]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Type.find("sys::Num[]"), [sys.List.make(sys.Int.type$, [sys.ObjUtil.coerce(3, sys.Obj.type$.toNullable())]), sys.List.make(sys.Float.type$, [sys.ObjUtil.coerce(sys.Float.make(2.0), sys.Obj.type$.toNullable())])])), sys.Type.find("sys::Num[][]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Type.find("sys::Num[]"), [sys.List.make(sys.Int.type$, [sys.ObjUtil.coerce(3, sys.Obj.type$.toNullable())]), sys.List.make(sys.Num.type$, [this.num()])])), sys.Type.find("sys::Num[][]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Type.find("sys::Num[]"), [sys.List.make(sys.Num.type$, [this.num()]), sys.List.make(sys.Int.type$, [sys.ObjUtil.coerce(3, sys.Obj.type$.toNullable())])])), sys.Type.find("sys::Num[][]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Type.find("testEs::TiA[]"), [sys.List.make(TiA.type$, [this.a()]), sys.List.make(TiA.type$, [this.a(), this.b()]), sys.List.make(TiA.type$, [this.a()])])), sys.Type.find("testEs::TiA[][]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Type.find("testEs::TiB?[]"), [sys.List.make(TiB.type$, [this.b()]), sys.List.make(TiB.type$.toNullable(), [this.bn(), this.b()]), sys.List.make(TiB.type$, [this.b()])])), sys.Type.find("testEs::TiB?[][]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Type.find("testEs::TiC[]"), [sys.List.make(TiC.type$, [this.c()]), sys.List.make(TiC.type$, [this.c()]), sys.List.make(TiC.type$, [this.c()])])), sys.Type.find("testEs::TiC[][]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Type.find("testEs::TiA[]"), [sys.List.make(TiA.type$, [this.a()]), sys.List.make(TiB.type$, [this.b()]), sys.List.make(TiC.type$, [this.c(), this.c()])])), sys.Type.find("testEs::TiA[][]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Type.find("testEs::TiA[]"), [sys.List.make(TiC.type$, [this.c()]), sys.List.make(TiB.type$, [this.b(), this.c()]), sys.List.make(TiA.type$, [this.a()])])), sys.Type.find("testEs::TiA[][]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Type.find("testEs::TiB[]"), [sys.List.make(TiC.type$, [this.c()]), sys.List.make(TiB.type$, [this.b()]), sys.List.make(TiB.type$, [this.b()])])), sys.Type.find("testEs::TiB[][]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Type.find("testEs::TiB?[]"), [sys.List.make(TiC.type$.toNullable(), [this.cn()]), sys.List.make(TiB.type$, [this.b()]), sys.List.make(TiB.type$, [this.b()])])), sys.Type.find("testEs::TiB?[][]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Type.find("testEs::TiB?[]"), [sys.List.make(TiB.type$, [this.b()]), sys.List.make(TiC.type$, [this.c()]), sys.List.make(TiB.type$.toNullable(), [this.bn()])])), sys.Type.find("testEs::TiB?[][]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Type.find("sys::Obj[]"), [sys.List.make(TiB.type$, [this.b()]), sys.List.make(TiC.type$, [this.c()]), sys.List.make(TiM.type$, [this.m()])])), sys.Type.find("sys::Obj[][]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Type.find("sys::Obj?[]"), [sys.List.make(TiC.type$, [this.c()]), sys.List.make(TiM.type$.toNullable(), [this.mn(), this.m()]), sys.List.make(TiC.type$, [this.c()])])), sys.Type.find("sys::Obj?[][]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Type.find("testEs::TiB?[][]"), [sys.List.make(sys.Type.find("testEs::TiB[]"), [sys.List.make(TiB.type$, [this.b()]), sys.List.make(TiC.type$, [this.c()])]), sys.List.make(sys.Type.find("testEs::TiC?[]"), [sys.List.make(TiC.type$.toNullable(), [this.cn()])])])), sys.Type.find("testEs::TiB?[][][]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Type.find("|->sys::Int|"), [this.func1(), this.func1()])), sys.Type.find("|->sys::Int|[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Type.find("|->sys::Int|?"), [this.func1n(), this.func1()])), sys.Type.find("|->sys::Int|?[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Type.find("|->sys::Int|?"), [this.func1(), this.func1n()])), sys.Type.find("|->sys::Int|?[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Type.find("sys::Func"), [this.func1(), this.func2()])), sys.Type.find("sys::Func[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Type.find("sys::Func?"), [this.func1n(), this.func2()])), sys.Type.find("sys::Func?[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.Map.fromLiteral$([sys.ObjUtil.coerce(1, sys.Obj.type$.toNullable()),sys.ObjUtil.coerce(2, sys.Obj.type$.toNullable())], [this.a(),this.a()], sys.Type.find("sys::Int"), sys.Type.find("testEs::TiA"))), sys.Type.find("[sys::Int:testEs::TiA]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.Map.fromLiteral$([sys.ObjUtil.coerce(1, sys.Obj.type$.toNullable()),sys.ObjUtil.coerce(2, sys.Obj.type$.toNullable())], [this.an(),this.a()], sys.Type.find("sys::Int"), sys.Type.find("testEs::TiA?"))), sys.Type.find("[sys::Int:testEs::TiA?]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.Map.fromLiteral$([sys.ObjUtil.coerce(1, sys.Obj.type$.toNullable()),sys.ObjUtil.coerce(2, sys.Obj.type$.toNullable())], [this.a(),this.an()], sys.Type.find("sys::Int"), sys.Type.find("testEs::TiA?"))), sys.Type.find("[sys::Int:testEs::TiA?]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.Map.fromLiteral$([sys.ObjUtil.coerce(1, sys.Obj.type$.toNullable()),sys.ObjUtil.coerce(2, sys.Obj.type$.toNullable())], [this.b(),this.c()], sys.Type.find("sys::Int"), sys.Type.find("testEs::TiB"))), sys.Type.find("[sys::Int:testEs::TiB]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.Map.fromLiteral$([sys.ObjUtil.coerce(1, sys.Obj.type$.toNullable()),sys.ObjUtil.coerce(2, sys.Obj.type$.toNullable())], [this.b(),this.cn()], sys.Type.find("sys::Int"), sys.Type.find("testEs::TiB?"))), sys.Type.find("[sys::Int:testEs::TiB?]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Type.find("[sys::Int:testEs::TiB?]"), [sys.Map.fromLiteral$([sys.ObjUtil.coerce(1, sys.Obj.type$.toNullable()),sys.ObjUtil.coerce(2, sys.Obj.type$.toNullable())], [this.b(),this.cn()], sys.Type.find("sys::Int"), sys.Type.find("testEs::TiB?")), sys.Map.fromLiteral$([sys.ObjUtil.coerce(1, sys.Obj.type$.toNullable()),sys.ObjUtil.coerce(2, sys.Obj.type$.toNullable())], [this.b(),this.cn()], sys.Type.find("sys::Int"), sys.Type.find("testEs::TiB?"))])), sys.Type.find("[sys::Int:testEs::TiB?][]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Type.find("sys::Map"), [sys.Map.fromLiteral$([sys.ObjUtil.coerce(1, sys.Obj.type$.toNullable()),sys.ObjUtil.coerce(2, sys.Obj.type$.toNullable())], [this.b(),this.c()], sys.Type.find("sys::Int"), sys.Type.find("testEs::TiB")), sys.Map.fromLiteral$([sys.ObjUtil.coerce(1, sys.Obj.type$.toNullable()),sys.ObjUtil.coerce(2, sys.Obj.type$.toNullable())], [this.b(),this.cn()], sys.Type.find("sys::Int"), sys.Type.find("testEs::TiB?"))])), sys.Type.find("sys::Map[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Type.find("sys::Map"), [sys.Map.fromLiteral$([sys.ObjUtil.coerce(1, sys.Obj.type$.toNullable()),sys.ObjUtil.coerce(2, sys.Obj.type$.toNullable())], [this.b(),this.a()], sys.Type.find("sys::Int"), sys.Type.find("testEs::TiA")), sys.Map.fromLiteral$([sys.ObjUtil.coerce(1, sys.Obj.type$.toNullable()),sys.ObjUtil.coerce(2, sys.Obj.type$.toNullable())], [this.b(),this.c()], sys.Type.find("sys::Int"), sys.Type.find("testEs::TiB"))])), sys.Type.find("sys::Map[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Type.find("sys::Map"), [sys.Map.fromLiteral$([sys.ObjUtil.coerce(1, sys.Obj.type$.toNullable()),sys.ObjUtil.coerce(2, sys.Obj.type$.toNullable())], [this.b(),this.a()], sys.Type.find("sys::Int"), sys.Type.find("testEs::TiA")), sys.Map.fromLiteral$([sys.ObjUtil.coerce(1, sys.Obj.type$.toNullable()),sys.ObjUtil.coerce(2, sys.Obj.type$.toNullable())], [this.b(),this.cn()], sys.Type.find("sys::Int"), sys.Type.find("testEs::TiB?"))])), sys.Type.find("sys::Map[]"));
    this.verifyEq(sys.ObjUtil.typeof$(sys.List.make(sys.Type.find("sys::Map?"), [sys.Map.fromLiteral$([sys.ObjUtil.coerce(1, sys.Obj.type$.toNullable()),sys.ObjUtil.coerce(2, sys.Obj.type$.toNullable())], [this.b(),this.a()], sys.Type.find("sys::Int"), sys.Type.find("testEs::TiA")), sys.Map.fromLiteral$([sys.ObjUtil.coerce(1, sys.Obj.type$.toNullable()),sys.ObjUtil.coerce(2, sys.Obj.type$.toNullable())], [this.b(),this.cn()], sys.Type.find("sys::Int"), sys.Type.find("testEs::TiB?")), null])), sys.Type.find("sys::Map?[]"));
    return;
  }

  num() {
    return sys.ObjUtil.coerce(4, sys.Num.type$);
  }

  a() {
    return TiA.make();
  }

  an() {
    return TiA.make();
  }

  b() {
    return TiB.make();
  }

  bn() {
    return TiB.make();
  }

  c() {
    return TiC.make();
  }

  cn() {
    return TiC.make();
  }

  m() {
    return TiC.make();
  }

  mn() {
    return TiC.make();
  }

  on() {
    return null;
  }

  func1() {
    const this$ = this
    return () => {
      return 3;
    };
  }

  func1n() {
    const this$ = this
    return () => {
      return 3;
    };
  }

  func2() {
    const this$ = this
    return () => {
      return sys.ObjUtil.coerce(3, sys.Num.type$);
    };
  }

  static make() {
    const self$ = new TypeTest();
    TypeTest.make$(self$);
    return self$;
  }

  static make$(self$) {
    sys.Test.make$(self$);
    return;
  }

}

class TiA extends sys.Obj {
  constructor() {
    super();
    const this$ = this;
  }

  typeof$() { return TiA.type$; }

  static make() {
    const self$ = new TiA();
    TiA.make$(self$);
    return self$;
  }

  static make$(self$) {
    return;
  }

}

class TiM {
  constructor() {
    const this$ = this;
  }

  typeof$() { return TiM.type$; }

}

class TiB extends TiA {
  constructor() {
    super();
    const this$ = this;
  }

  typeof$() { return TiB.type$; }

  static make() {
    const self$ = new TiB();
    TiB.make$(self$);
    return self$;
  }

  static make$(self$) {
    TiA.make$(self$);
    return;
  }

}

class TiC extends TiB {
  constructor() {
    super();
    const this$ = this;
  }

  typeof$() { return TiC.type$; }

  static make() {
    const self$ = new TiC();
    TiC.make$(self$);
    return self$;
  }

  static make$(self$) {
    TiB.make$(self$);
    return;
  }

}

class TiO {
  constructor() {
    const this$ = this;
  }

  typeof$() { return TiO.type$; }

}

class TypeInheritTestAbstract extends sys.Obj {
  constructor() {
    super();
    const this$ = this;
  }

  typeof$() { return TypeInheritTestAbstract.type$; }

  static make() {
    const self$ = new TypeInheritTestAbstract();
    TypeInheritTestAbstract.make$(self$);
    return self$;
  }

  static make$(self$) {
    return;
  }

}

class TypeInheritTestA extends sys.Obj {
  constructor() {
    super();
    const this$ = this;
    this.#a = 5;
    return;
  }

  typeof$() { return TypeInheritTestA.type$; }

  #a = 0;

  static make() {
    const self$ = new TypeInheritTestA();
    TypeInheritTestA.make$(self$);
    return self$;
  }

  static make$(self$) {
    ;
    return;
  }

}

class TypeInheritTestM1 {
  constructor() {
    const this$ = this;
  }

  typeof$() { return TypeInheritTestM1.type$; }

  m() {
    return 10;
  }

}

class TypeInheritTestB extends TypeInheritTestA {
  constructor() {
    super();
    const this$ = this;
    this.#b = "foo";
    return;
  }

  typeof$() { return TypeInheritTestB.type$; }

  #b = null;

  static make() {
    const self$ = new TypeInheritTestB();
    TypeInheritTestB.make$(self$);
    return self$;
  }

  static make$(self$) {
    TypeInheritTestA.make$(self$);
    ;
    return;
  }

}

class TypeInheritTestC extends TypeInheritTestB {
  constructor() {
    super();
    const this$ = this;
    this.#c = sys.Float.make(7.5);
    return;
  }

  typeof$() { return TypeInheritTestC.type$; }

  m = TypeInheritTestM1.prototype.m;

  #c = sys.Float.make(0);

  static make() {
    const self$ = new TypeInheritTestC();
    TypeInheritTestC.make$(self$);
    return self$;
  }

  static make$(self$) {
    TypeInheritTestB.make$(self$);
    ;
    return;
  }

}

class MxA {
  constructor() {
    const this$ = this;
  }

  typeof$() { return MxA.type$; }

  static sa() {
    return "sa";
  }

  ia() {
    return "ia";
  }

  wrapToStr1() {
    return sys.ObjUtil.toStr(this);
  }

  wrapToStr2() {
    return sys.ObjUtil.toStr(this);
  }

  static staticWrapType(a) {
    return sys.Type.of(a);
  }

  va() {
    return "va";
  }


  coa() {
    return "1";
  }

  cob() {
    return "2";
  }

  coc() {
    return "3";
  }

  thisa() {
    return this;
  }

  thisb() {
    return this;
  }

}

class MxB {
  constructor() {
    const this$ = this;
  }

  typeof$() { return MxB.type$; }

  static sb() {
    return "sb";
  }

  ib() {
    return "ib";
  }

  vb() {
    return "vb";
  }


}

class MxClsA extends sys.Obj {
  constructor() {
    super();
    const this$ = this;
  }

  typeof$() { return MxClsA.type$; }

  wrapToStr2 = MxA.prototype.wrapToStr2;

  wrapToStr1 = MxA.prototype.wrapToStr1;

  coa = MxA.prototype.coa;

  coc = MxA.prototype.coc;

  cob = MxA.prototype.cob;

  thisb = MxA.prototype.thisb;

  ia = MxA.prototype.ia;

  aa() {
    return "aa";
  }

  va() {
    return "override-va";
  }

  thisa() {
    throw sys.UnsupportedErr.make();
  }

  mxClsA() {
    return "MxClsA";
  }

  static make() {
    const self$ = new MxClsA();
    MxClsA.make$(self$);
    return self$;
  }

  static make$(self$) {
    return;
  }

}

class MxClsAB extends sys.Obj {
  constructor() {
    super();
    const this$ = this;
  }

  typeof$() { return MxClsAB.type$; }

  wrapToStr2 = MxA.prototype.wrapToStr2;

  wrapToStr1 = MxA.prototype.wrapToStr1;

  va = MxA.prototype.va;

  thisa = MxA.prototype.thisa;

  coa = MxA.prototype.coa;

  coc = MxA.prototype.coc;

  thisb = MxA.prototype.thisb;

  ia = MxA.prototype.ia;

  ib = MxB.prototype.ib;

  aa() {
    return "aa";
  }

  ab() {
    return "ab";
  }

  vb() {
    return "override-vb";
  }

  toStr() {
    return "MxClsAB!";
  }

  cob() {
    return "22";
  }

  mxClsAB() {
    return "MxClsAB";
  }

  static make() {
    const self$ = new MxClsAB();
    MxClsAB.make$(self$);
    return self$;
  }

  static make$(self$) {
    return;
  }

}

class FacetM1 extends sys.Obj {
  constructor() {
    super();
    const this$ = this;
  }

  typeof$() { return FacetM1.type$; }

  static #defVal = null;

  static make() {
    const self$ = new FacetM1();
    FacetM1.make$(self$);
    return self$;
  }

  static make$(self$) {
    return;
  }

  static static$init() {
    FacetM1.#defVal = FacetM1.make();
    return;
  }

}

class FacetM2 extends sys.Obj {
  constructor() {
    super();
    const this$ = this;
  }

  typeof$() { return FacetM2.type$; }

  static #defVal = null;

  static make() {
    const self$ = new FacetM2();
    FacetM2.make$(self$);
    return self$;
  }

  static make$(self$) {
    return;
  }

  static static$init() {
    FacetM2.#defVal = FacetM2.make();
    return;
  }

}

const p = sys.Pod.add$('testEs');
const xp = sys.Param.noParams$();
EnumAbc.type$ = p.at$('EnumAbc','sys::Enum',[],{'sys::Js':"",'sys::Serializable':"sys::Serializable{simple=true;}"},170);
TypeTest.type$ = p.at$('TypeTest','sys::Test',[],{'sys::Js':""},8192);
TiA.type$ = p.at$('TiA','sys::Obj',[],{'sys::Js':""},128);
TiM.type$ = p.am$('TiM','sys::Obj',[],{'sys::Js':""},385);
TiB.type$ = p.at$('TiB','testEs::TiA',['testEs::TiM'],{'sys::Js':""},128);
TiC.type$ = p.at$('TiC','testEs::TiB',[],{'sys::Js':""},128);
TiO.type$ = p.am$('TiO','sys::Obj',['testEs::TiM'],{'sys::Js':""},385);
TypeInheritTestAbstract.type$ = p.at$('TypeInheritTestAbstract','sys::Obj',[],{'sys::Js':""},8193);
TypeInheritTestA.type$ = p.at$('TypeInheritTestA','sys::Obj',[],{'sys::Js':""},128);
TypeInheritTestM1.type$ = p.am$('TypeInheritTestM1','sys::Obj',[],{'sys::Js':""},385);
TypeInheritTestB.type$ = p.at$('TypeInheritTestB','testEs::TypeInheritTestA',[],{'sys::Js':""},128);
TypeInheritTestC.type$ = p.at$('TypeInheritTestC','testEs::TypeInheritTestB',['testEs::TypeInheritTestM1'],{'sys::Js':""},128);
MxA.type$ = p.am$('MxA','sys::Obj',[],{'sys::Js':""},8449);
MxB.type$ = p.am$('MxB','sys::Obj',[],{'sys::Js':""},8449);
MxClsA.type$ = p.at$('MxClsA','sys::Obj',['testEs::MxA'],{'sys::Js':""},8192);
MxClsAB.type$ = p.at$('MxClsAB','sys::Obj',['testEs::MxA','testEs::MxB'],{'sys::Js':""},8192);
FacetM1.type$ = p.at$('FacetM1','sys::Obj',['sys::Facet'],{'sys::Js':""},8242);
FacetM2.type$ = p.at$('FacetM2','sys::Obj',['sys::Facet'],{'sys::Js':""},8242);
EnumAbc.type$.af$('A',106506,'testEs::EnumAbc',{}).af$('B',106506,'testEs::EnumAbc',{}).af$('C',106506,'testEs::EnumAbc',{}).af$('vals',106498,'testEs::EnumAbc[]',{}).af$('first',106498,'testEs::EnumAbc',{}).am$('negOrdinal',8192,'sys::Int',xp,{}).am$('make',133124,'sys::Void',sys.List.make(sys.Param.type$,[new sys.Param('$ordinal','sys::Int',false),new sys.Param('$name','sys::Str',false)]),{}).am$('fromStr',40966,'testEs::EnumAbc?',sys.List.make(sys.Param.type$,[new sys.Param('name','sys::Str',false),new sys.Param('checked','sys::Bool',true)]),{}).am$('static$init',165890,'sys::Void',xp,{});
TypeTest.type$.am$('testIdentity',8192,'sys::Void',xp,{}).am$('testFind',8192,'sys::Void',xp,{}).am$('testValueTypes',8192,'sys::Void',xp,{}).am$('testFlags',8192,'sys::Void',xp,{}).am$('testMixins',8192,'sys::Void',xp,{}).am$('testInheritance',8192,'sys::Void',xp,{}).am$('testFits',8192,'sys::Void',xp,{}).am$('verifyFits',8192,'sys::Void',sys.List.make(sys.Param.type$,[new sys.Param('a','sys::Type',false),new sys.Param('b','sys::Type',false),new sys.Param('expected','sys::Bool',false)]),{}).am$('testIsGeneric',8192,'sys::Void',xp,{}).am$('testParams',8192,'sys::Void',xp,{}).am$('testParameterization',8192,'sys::Void',xp,{}).am$('testToListOf',8192,'sys::Void',xp,{}).am$('testEmptyList',8192,'sys::Void',xp,{}).am$('testMake',8192,'sys::Void',xp,{}).am$('testSynthetic',8192,'sys::Void',xp,{}).am$('verifySlotsSynthetic',8192,'sys::Void',sys.List.make(sys.Param.type$,[new sys.Param('t','sys::Type',false)]),{}).am$('testGenericParameters',8192,'sys::Void',xp,{}).am$('testInference',8192,'sys::Void',xp,{}).am$('num',2048,'sys::Num',xp,{}).am$('a',2048,'testEs::TiA',xp,{}).am$('an',2048,'testEs::TiA?',xp,{}).am$('b',2048,'testEs::TiB',xp,{}).am$('bn',2048,'testEs::TiB?',xp,{}).am$('c',2048,'testEs::TiC',xp,{}).am$('cn',2048,'testEs::TiC?',xp,{}).am$('m',2048,'testEs::TiM',xp,{}).am$('mn',2048,'testEs::TiM?',xp,{}).am$('on',2048,'testEs::TiO?',xp,{}).am$('func1',2048,'|->sys::Int|',xp,{}).am$('func1n',2048,'|->sys::Int|?',xp,{}).am$('func2',2048,'|->sys::Num|',xp,{}).am$('make',139268,'sys::Void',xp,{});
TiA.type$.am$('make',139268,'sys::Void',xp,{});
TiB.type$.am$('make',139268,'sys::Void',xp,{});
TiC.type$.am$('make',139268,'sys::Void',xp,{});
TypeInheritTestAbstract.type$.am$('make',139268,'sys::Void',xp,{});
TypeInheritTestA.type$.af$('a',73728,'sys::Int',{}).am$('make',139268,'sys::Void',xp,{});
TypeInheritTestM1.type$.am$('m',8192,'sys::Int',xp,{});
TypeInheritTestB.type$.af$('b',73728,'sys::Str',{}).am$('make',139268,'sys::Void',xp,{});
TypeInheritTestC.type$.af$('c',73728,'sys::Float',{}).am$('make',139268,'sys::Void',xp,{});
MxA.type$.am$('sa',40962,'sys::Str',xp,{}).am$('ia',8192,'sys::Str',xp,{}).am$('wrapToStr1',8192,'sys::Str',xp,{}).am$('wrapToStr2',8192,'sys::Str',xp,{}).am$('staticWrapType',40962,'sys::Type',sys.List.make(sys.Param.type$,[new sys.Param('a','testEs::MxA',false)]),{}).am$('va',270336,'sys::Str',xp,{}).am$('aa',270337,'sys::Str',xp,{}).am$('coa',270336,'sys::Obj',xp,{}).am$('cob',270336,'sys::Obj',xp,{}).am$('coc',270336,'sys::Obj',xp,{}).am$('thisa',270336,'sys::This',xp,{}).am$('thisb',270336,'sys::This',xp,{});
MxB.type$.am$('sb',40962,'sys::Str',xp,{}).am$('ib',8192,'sys::Str',xp,{}).am$('vb',270336,'sys::Str',xp,{}).am$('ab',270337,'sys::Str',xp,{});
MxClsA.type$.am$('aa',271360,'sys::Str',xp,{}).am$('va',271360,'sys::Str',xp,{}).am$('thisa',271360,'sys::This',xp,{}).am$('mxClsA',8192,'sys::Str',xp,{}).am$('make',139268,'sys::Void',xp,{});
MxClsAB.type$.am$('aa',271360,'sys::Str',xp,{}).am$('ab',271360,'sys::Str',xp,{}).am$('vb',271360,'sys::Str',xp,{}).am$('toStr',271360,'sys::Str',xp,{}).am$('cob',271360,'sys::Str',xp,{}).am$('mxClsAB',8192,'sys::Str',xp,{}).am$('make',139268,'sys::Void',xp,{});
FacetM1.type$.af$('defVal',106498,'testEs::FacetM1',{}).am$('make',133124,'sys::Void',xp,{}).am$('static$init',165890,'sys::Void',xp,{});
FacetM2.type$.af$('defVal',106498,'testEs::FacetM2',{}).am$('make',133124,'sys::Void',xp,{}).am$('static$init',165890,'sys::Void',xp,{});
export {
TypeTest,
TypeInheritTestAbstract,
MxA,
MxB,
MxClsA,
MxClsAB,
FacetM1,
FacetM2,
};
