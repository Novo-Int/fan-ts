export type JsObj = Obj | number | string | boolean | ((...args: any) => any)

export class Obj {
  equals(that: JsObj | null): boolean
  compare(that: JsObj): number
  hash(): number
  toStr(): string
  trap(name$: string, args?: List<JsObj | null> | null): JsObj | null
  with$(f: ((argA: this) => void)): this
  isImmutable(): boolean
  toImmutable(): this
  typeof$(): Type
  static echo(x?: JsObj | null): void
}
export class Facet extends Obj {
}
export class TimeZone extends Obj {
  static listNames(): List<string>
  static listFullNames(): List<string>
  static fromStr(name$: string, checked?: boolean): TimeZone
  static utc(): TimeZone
  static rel(): TimeZone
  static cur(): TimeZone
  static defVal(): TimeZone
  name$(): string
  fullName(): string
  offset(year: number): Duration
  dstOffset(year: number): Duration | null
  stdAbbr(year: number): string
  dstAbbr(year: number): string | null
}
export class Uri extends Obj {
  static defVal(): Uri
  static sectionPath(): number
  static sectionQuery(): number
  static sectionFrag(): number
  static fromStr(s: string, checked?: boolean): Uri
  static decode(s: string, checked?: boolean): Uri | null
  static decodeQuery(s: string): Map<string, string>
  static encodeQuery(q: Map<string, string>): string
  static isName(name$: string): boolean
  static checkName(name$: string): void
  static escapeToken(s: string, section: number): string
  static unescapeToken(s: string): string
  static encodeToken(s: string, section: number): string
  static decodeToken(s: string, section: number): string
  toLocale(): string
  encode(): string
  isAbs(): boolean
  isRel(): boolean
  isDir(): boolean
  scheme(): string | null
  auth(): string | null
  host(): string | null
  userInfo(): string | null
  port(): number | null
  path(): List<string>
  pathStr(): string
  isPathAbs(): boolean
  isPathRel(): boolean
  isPathOnly(): boolean
  name$(): string
  basename(): string
  ext(): string | null
  mimeType(): MimeType | null
  query(): Map<string, string>
  queryStr(): string | null
  frag(): string | null
  parent(): Uri | null
  pathOnly(): Uri
  getRange(r: Range): Uri
  getRangeToPathAbs(r: Range): Uri
  plus(toAppend: Uri): Uri
  plusName(name$: string, asDir?: boolean): Uri
  plusSlash(): Uri
  plusQuery(query: Map<string, string> | null): Uri
  relTo(base: Uri): Uri
  relToAuth(): Uri
  toFile(): File
  get(base?: JsObj | null, checked?: boolean): JsObj | null
  toCode(): string
}
export class Num extends Obj {
  static toInt(self: number): number
  static toFloat(self: number): number
  static toDecimal(self: number): number
  static localeDecimal(): string
  static localeGrouping(): string
  static localeMinus(): string
  static localePercent(): string
  static localePosInf(): string
  static localeNegInf(): string
  static localeNaN(): string
}
export class Int extends Num {
  static defVal(): number
  static maxVal(): number
  static minVal(): number
  static fromStr(s: string, radix?: number, checked?: boolean): Int
  static random(r?: Range | null): number
  static negate(self: number): number
  static increment(self: number): number
  static decrement(self: number): number
  static mult(self: number, b: number): number
  static multFloat(self: number, b: number): number
  static multDecimal(self: number, b: number): number
  static div(self: number, b: number): number
  static divFloat(self: number, b: number): number
  static divDecimal(self: number, b: number): number
  static mod(self: number, b: number): number
  static modFloat(self: number, b: number): number
  static modDecimal(self: number, b: number): number
  static plus(self: number, b: number): number
  static plusFloat(self: number, b: number): number
  static plusDecimal(self: number, b: number): number
  static minus(self: number, b: number): number
  static minusFloat(self: number, b: number): number
  static minusDecimal(self: number, b: number): number
  static not(self: number): number
  static and(self: number, b: number): number
  static or(self: number, b: number): number
  static xor(self: number, b: number): number
  static shiftl(self: number, b: number): number
  static shiftr(self: number, b: number): number
  static shifta(self: number, b: number): number
  static abs(self: number): number
  static min(self: number, that: number): number
  static max(self: number, that: number): number
  static clamp(self: number, min: number, max: number): number
  static clip(self: number, min: number, max: number): number
  static pow(self: number, pow: number): number
  static isEven(self: number): boolean
  static isOdd(self: number): boolean
  static isSpace(self: number): boolean
  static isAlpha(self: number): boolean
  static isAlphaNum(self: number): boolean
  static isUpper(self: number): boolean
  static isLower(self: number): boolean
  static upper(self: number): number
  static lower(self: number): number
  static isDigit(self: number, radix?: number): boolean
  static toDigit(self: number, radix?: number): number | null
  static fromDigit(self: number, radix?: number): number | null
  static equalsIgnoreCase(self: number, ch: number): boolean
  static toLocale(self: number, pattern?: string | null, locale?: Locale): string
  static localeIsUpper(self: number): boolean
  static localeIsLower(self: number): boolean
  static localeUpper(self: number): number
  static localeLower(self: number): number
  static toHex(self: number, width?: number | null): string
  static toRadix(self: number, radix: number, width?: number | null): string
  static toChar(self: number): string
  static toCode(self: number, base?: number): string
  static toDuration(self: number): Duration
  static toDateTime(self: number, tz?: TimeZone): DateTime
  static times(self: number, c: ((argA: number) => void)): void
}
export class Err extends Obj {
  static make(msg?: string, cause?: Err | null): Err
  msg(): string
  cause(): Err | null
  trace(out?: OutStream, options?: Map<string, JsObj> | null): this
  traceToStr(): string
}
export class CancelledErr extends Err {
}
export class Unsafe extends Obj {
  static make(val: JsObj | null): Unsafe
  val(): JsObj | null
}
export class Pod extends Obj {
  static of(obj: JsObj): Pod | null
  static list(): List<Pod>
  static find(name$: string, checked?: boolean): Pod | null
  static load(in$: InStream): Pod
  name$(): string
  version(): Version
  depends(): List<Depend>
  uri(): Uri
  meta(): Map<string, string>
  types(): List<Type>
  type(name$: string, checked?: boolean): Type | null
  files(): List<File>
  file(uri: Uri, checked?: boolean): File | null
  doc(): string | null
  log(): Log
  props(uri: Uri, maxAge: Duration): Map<string, string>
  config(name$: string, def?: string | null): string | null
  locale(name$: string, def?: string | null): string | null
  static flattenDepends(pods: List<Pod>): List<Pod>
  static orderByDepends(pods: List<Pod>): List<Pod>
}
export class Void extends Obj {
}
export class ConstErr extends Err {
}
export class Version extends Obj {
  static defVal(): Version
  static fromStr(version: string, checked?: boolean): Version
  static make(segments: List<number>): Version
  segments(): List<number>
  major(): number
  minor(): number | null
  build(): number | null
  patch(): number | null
}
export class ArgErr extends Err {
}
export class Date extends Obj {
  static defVal(): Date
  static today(tz?: TimeZone): Date
  static yesterday(tz?: TimeZone): Date
  static tomorrow(tz?: TimeZone): Date
  static make(year: number, month: Month, day: number): Date
  static fromStr(s: string, checked?: boolean): Date
  year(): number
  month(): Month
  day(): number
  weekday(): Weekday
  dayOfYear(): number
  weekOfYear(startOfWeek?: Weekday): number
  toLocale(pattern?: string | null, locale?: Locale): string
  static fromLocale(str: string, pattern: string, checked?: boolean): Date | null
  static fromIso(s: string, checked?: boolean): Date | null
  toIso(): string
  plus(days: Duration): Date
  minus(days: Duration): Date
  minusDate(days: Date): Duration
  firstOfMonth(): Date
  lastOfMonth(): Date
  isYesterday(): boolean
  isToday(): boolean
  isTomorrow(): boolean
  toDateTime(t: Time, tz?: TimeZone): DateTime
  midnight(tz?: TimeZone): DateTime
  toCode(): string
}
export class Enum extends Obj {
  name$(): string
  ordinal(): number
}
export class Endian extends Enum {
  static big(): Endian
  static little(): Endian
  static vals(): List<Endian>
  static fromStr(name$: string, checked?: boolean): Endian
}
export class Test extends Obj {
  curTestMethod(): Method
  setup(): void
  teardown(): void
  verify(cond: boolean, msg?: string | null): void
  verifyTrue(cond: boolean, msg?: string | null): void
  verifyFalse(cond: boolean, msg?: string | null): void
  verifyNull(a: JsObj | null, msg?: string | null): void
  verifyNotNull(a: JsObj | null, msg?: string | null): void
  verifyEq(a: JsObj | null, b: JsObj | null, msg?: string | null): void
  verifyNotEq(a: JsObj | null, b: JsObj | null, msg?: string | null): void
  verifySame(a: JsObj | null, b: JsObj | null, msg?: string | null): void
  verifyNotSame(a: JsObj | null, b: JsObj | null, msg?: string | null): void
  verifyType(obj: JsObj, t: Type): void
  verifyErr(errType: Type | null, c: ((argA: Test) => void)): void
  verifyErrMsg(errType: Type, errMsg: string, c: ((argA: Test) => void)): void
  fail(msg?: string | null): void
  tempDir(): File
}
export class TestErr extends Err {
}
export class NameErr extends Err {
}
export class Duration extends Obj {
  static defVal(): Duration
  static minVal(): Duration
  static maxVal(): Duration
  static now(): Duration
  static nowTicks(): number
  static make(ticks: number): Duration
  static fromStr(s: string, checked?: boolean): Duration
  static boot(): Duration
  static uptime(): Duration
  ticks(): number
  negate(): Duration
  mult(b: number): Duration
  multFloat(b: number): Duration
  div(b: number): Duration
  divFloat(b: number): Duration
  plus(b: Duration): Duration
  minus(b: Duration): Duration
  abs(): Duration
  min(that: Duration): Duration
  max(that: Duration): Duration
  clamp(min: Duration, max: Duration): Duration
  floor(accuracy: Duration): Duration
  toMillis(): number
  toSec(): number
  toMin(): number
  toHour(): number
  toDay(): number
  toLocale(): string
  toCode(): string
  toIso(): string
  static fromIso(s: string, checked?: boolean): Duration
}
export class Process extends Obj {
  command(): List<string>
  command(it: List<string>): void
  dir(): File | null
  dir(it: File | null): void
  mergeErr(): boolean
  mergeErr(it: boolean): void
  out(): OutStream | null
  out(it: OutStream | null): void
  err(): OutStream | null
  err(it: OutStream | null): void
  in$(): InStream | null
  in$(it: InStream | null): void
  static make(cmd?: List<string>, dir?: File | null): Process
  env(): Map<string, string>
  run(): this
  join(): number
  kill(): this
}
export class Decimal extends Num {
  static defVal(): number
  static fromStr(s: string, checked?: boolean): Decimal
  static negate(self: number): number
  static increment(self: number): number
  static decrement(self: number): number
  static mult(self: number, b: number): number
  static multInt(self: number, b: number): number
  static multFloat(self: number, b: number): number
  static div(self: number, b: number): number
  static divInt(self: number, b: number): number
  static divFloat(self: number, b: number): number
  static mod(self: number, b: number): number
  static modInt(self: number, b: number): number
  static modFloat(self: number, b: number): number
  static plus(self: number, b: number): number
  static plusInt(self: number, b: number): number
  static plusFloat(self: number, b: number): number
  static minus(self: number, b: number): number
  static minusInt(self: number, b: number): number
  static minusFloat(self: number, b: number): number
  static abs(self: number): number
  static min(self: number, that: number): number
  static max(self: number, that: number): number
  static toCode(self: number): string
  static toLocale(self: number, pattern?: string | null, locale?: Locale): string
}
export class TimeoutErr extends Err {
}
export class IOErr extends Err {
}
export class Locale extends Obj {
  static en(): Locale
  static fromStr(s: string, checked?: boolean): Locale
  static cur(): Locale
  static setCur(locale: Locale): void
  use(func: ((argA: this) => void)): this
  lang(): string
  country(): string | null
}
export class UnresolvedErr extends Err {
}
export class This extends Obj {
}
export class UnknownSlotErr extends Err {
}
export class StrBuf extends Obj {
  capacity(): number
  capacity(it: number): void
  static make(capacity?: number): StrBuf
  isEmpty(): boolean
  size(): number
  get(index: number): number
  getRange(range: Range): string
  set(index: number, ch: number): this
  add(x: JsObj | null): this
  addChar(ch: number): this
  join(x: JsObj | null, sep?: string): this
  insert(index: number, x: JsObj | null): this
  remove(index: number): this
  removeRange(r: Range): this
  replaceRange(r: Range, str: string): this
  reverse(): this
  clear(): this
  out(): OutStream
}
export class ReadonlyErr extends Err {
}
export class LogRec extends Obj {
  time(): DateTime
  level(): LogLevel
  logName(): string
  msg(): string
  err(): Err | null
  static make(time: DateTime, level: LogLevel, logName: string, message: string, err?: Err | null): LogRec
  print(out?: OutStream): void
}
export class Range extends Obj {
  static makeInclusive(start: number, end: number): Range
  static makeExclusive(start: number, end: number): Range
  static make(start: number, end: number, exclusive: boolean): Range
  static fromStr(s: string, checked?: boolean): Range
  start(): number
  end(): number
  inclusive(): boolean
  exclusive(): boolean
  isEmpty(): boolean
  min(): number | null
  max(): number | null
  first(): number | null
  last(): number | null
  contains(i: number): boolean
  offset(offset: number): Range
  each(c: ((argA: number) => void)): void
  eachWhile(c: ((argA: number) => JsObj | null)): JsObj | null
  map(c: ((argA: number) => JsObj | null)): List<JsObj | null>
  toList(): List<number>
  random(): number
}
export class IndexErr extends Err {
}
export class Log extends Obj {
  level(): LogLevel
  level(it: LogLevel): void
  static list(): List<Log>
  static find(name$: string, checked?: boolean): Log | null
  static get(name$: string): Log
  static make(name$: string, register: boolean): Log
  name$(): string
  isEnabled(level: LogLevel): boolean
  isErr(): boolean
  isWarn(): boolean
  isInfo(): boolean
  isDebug(): boolean
  err(msg: string, err?: Err | null): void
  warn(msg: string, err?: Err | null): void
  info(msg: string, err?: Err | null): void
  debug(msg: string, err?: Err | null): void
  log(rec: LogRec): void
  static handlers(): List<((argA: LogRec) => void)>
  static addHandler(handler: ((argA: LogRec) => void)): void
  static removeHandler(handler: ((argA: LogRec) => void)): void
}
export class Weekday extends Enum {
  static sun(): Weekday
  static mon(): Weekday
  static tue(): Weekday
  static wed(): Weekday
  static thu(): Weekday
  static fri(): Weekday
  static sat(): Weekday
  static vals(): List<Weekday>
  increment(): Weekday
  decrement(): Weekday
  toLocale(pattern?: string | null, locale?: Locale): string
  localeAbbr(): string
  localeFull(): string
  static localeStartOfWeek(): Weekday
  static localeVals(): List<Weekday>
  static fromStr(name$: string, checked?: boolean): Weekday
}
export class Buf extends Obj {
  size(): number
  size(it: number): void
  capacity(): number
  capacity(it: number): void
  endian(): Endian
  endian(it: Endian): void
  charset(): Charset
  charset(it: Charset): void
  static make(capacity?: number): Buf
  static random(size: number): Buf
  bytesEqual(that: Buf): boolean
  isEmpty(): boolean
  pos(): number
  remaining(): number
  more(): boolean
  seek(pos: number): this
  flip(): this
  get(index: number): number
  getRange(range: Range): Buf
  dup(): Buf
  set(index: number, byte: number): this
  clear(): this
  trim(): this
  close(): boolean
  flush(): this
  sync(): this
  fill(byte: number, times: number): this
  out(): OutStream
  write(byte: number): this
  writeBuf(buf: Buf, n?: number): this
  writeI2(n: number): this
  writeI4(n: number): this
  writeI8(n: number): this
  writeF4(r: number): this
  writeF8(r: number): this
  writeDecimal(d: number): this
  writeBool(b: boolean): this
  writeUtf(s: string): this
  writeChar(char$: number): this
  writeChars(str: string, off?: number, len?: number): this
  print(s: JsObj | null): this
  printLine(obj?: JsObj | null): this
  writeProps(props: Map<string, string>): this
  writeObj(obj: JsObj | null, options?: Map<string, JsObj> | null): this
  writeXml(s: string, flags?: number): this
  in$(): InStream
  read(): number | null
  readBuf(buf: Buf, n: number): number | null
  unread(b: number): this
  readAllBuf(): Buf
  readBufFully(buf: Buf | null, n: number): Buf
  peek(): number | null
  readU1(): number
  readS1(): number
  readU2(): number
  readS2(): number
  readU4(): number
  readS4(): number
  readS8(): number
  readF4(): number
  readF8(): number
  readDecimal(): number
  readBool(): boolean
  readUtf(): string
  readChar(): number | null
  unreadChar(b: number): this
  peekChar(): number | null
  readChars(n: number): string
  readLine(max?: number | null): string | null
  readStrToken(max?: number | null, c?: ((argA: number) => boolean) | null): string | null
  readAllLines(): List<string>
  eachLine(f: ((argA: string) => void)): void
  readAllStr(normalizeNewlines?: boolean): string
  readProps(): Map<string, string>
  readObj(options?: Map<string, JsObj> | null): JsObj | null
  toFile(uri: Uri): File
  toHex(): string
  static fromHex(s: string): Buf
  toBase64(): string
  toBase64Uri(): string
  static fromBase64(s: string): Buf
  toDigest(algorithm: string): Buf
  crc(algorithm: string): number
  hmac(algorithm: string, key: Buf): Buf
  static pbk(algorithm: string, password: string, salt: Buf, iterations: number, keyLen: number): Buf
}
export class Charset extends Obj {
  static fromStr(name$: string, checked?: boolean): Charset
  static defVal(): Charset
  static utf8(): Charset
  static utf16BE(): Charset
  static utf16LE(): Charset
  name$(): string
}
export class Zip extends Obj {
  static open(file: File): Zip
  static read(in$: InStream): Zip
  static write(out: OutStream): Zip
  file(): File | null
  contents(): Map<Uri, File> | null
  readNext(): File | null
  readEach(c: ((argA: File) => void)): void
  writeNext(path: Uri, modifyTime?: DateTime, opts?: Map<string, JsObj | null> | null): OutStream
  finish(): boolean
  close(): boolean
  static unzipInto(zip: File, dir: File): number
  static gzipOutStream(out: OutStream): OutStream
  static gzipInStream(in$: InStream): InStream
  static deflateOutStream(out: OutStream, opts?: Map<string, JsObj | null> | null): OutStream
  static deflateInStream(in$: InStream, opts?: Map<string, JsObj | null> | null): InStream
}
export class Depend extends Obj {
  static fromStr(s: string, checked?: boolean): Depend
  name$(): string
  size(): number
  version(index?: number): Version
  isSimple(index?: number): boolean
  isPlus(index?: number): boolean
  isRange(index?: number): boolean
  endVersion(index?: number): Version
  match(version: Version): boolean
}
export class Str extends Obj {
  static defVal(): string
  static fromChars(chars: List<number>): string
  static equalsIgnoreCase(self: string, s: string): boolean
  static compareIgnoreCase(self: string, s: string): number
  static toLocale(self: string): string
  static isEmpty(self: string): boolean
  static size(self: string): number
  static intern(self: string): string
  static startsWith(self: string, s: string): boolean
  static endsWith(self: string, s: string): boolean
  static index(self: string, s: string, offset?: number): number | null
  static indexr(self: string, s: string, offset?: number): number | null
  static indexIgnoreCase(self: string, s: string, offset?: number): number | null
  static indexrIgnoreCase(self: string, s: string, offset?: number): number | null
  static contains(self: string, s: string): boolean
  static containsChar(self: string, ch: number): boolean
  static get(self: string, index: number): number
  static getSafe(self: string, index: number, def?: number): number
  static getRange(self: string, range: Range): string
  static plus(self: string, obj: JsObj | null): string
  static mult(self: string, times: number): string
  static chars(self: string): List<number>
  static each(self: string, c: ((argA: number, argB: number) => void)): void
  static eachr(self: string, c: ((argA: number, argB: number) => void)): void
  static eachWhile(self: string, c: ((argA: number, argB: number) => JsObj | null)): JsObj | null
  static any(self: string, c: ((argA: number, argB: number) => boolean)): boolean
  static all(self: string, c: ((argA: number, argB: number) => boolean)): boolean
  static spaces(n: number): string
  static lower(self: string): string
  static upper(self: string): string
  static capitalize(self: string): string
  static decapitalize(self: string): string
  static toDisplayName(self: string): string
  static fromDisplayName(self: string): string
  static justl(self: string, width: number): string
  static justr(self: string, width: number): string
  static padl(self: string, width: number, char$?: number): string
  static padr(self: string, width: number, char$?: number): string
  static reverse(self: string): string
  static trim(self: string): string
  static trimToNull(self: string): string | null
  static trimStart(self: string): string
  static trimEnd(self: string): string
  static split(self: string, separator?: number | null, trim?: boolean): List<string>
  static splitLines(self: string): List<string>
  static replace(self: string, from: string, to: string): string
  static numNewlines(self: string): number
  static isAscii(self: string): boolean
  static isSpace(self: string): boolean
  static isUpper(self: string): boolean
  static isLower(self: string): boolean
  static isAlpha(self: string): boolean
  static isAlphaNum(self: string): boolean
  static localeCompare(self: string, s: string): number
  static localeLower(self: string): string
  static localeUpper(self: string): string
  static localeCapitalize(self: string): string
  static localeDecapitalize(self: string): string
  static toBool(self: string, checked?: boolean): boolean | null
  static toInt(self: string, radix?: number, checked?: boolean): number | null
  static toFloat(self: string, checked?: boolean): number | null
  static toDecimal(self: string, checked?: boolean): number | null
  static toCode(self: string, quote?: number | null, escapeUnicode?: boolean): string
  static toXml(self: string): string
  static toUri(self: string): Uri
  static toRegex(self: string): Regex
  static in$(self: string): InStream
  static toBuf(self: string, charset?: Charset): Buf
}
export class Bool extends Obj {
  static defVal(): boolean
  static fromStr(s: string, checked?: boolean): Bool
  static toLocale(self: boolean): string
  static not(self: boolean): boolean
  static and(self: boolean, b: boolean): boolean
  static or(self: boolean, b: boolean): boolean
  static xor(self: boolean, b: boolean): boolean
  static toCode(self: boolean): string
}
export class MimeType extends Obj {
  static fromStr(s: string, checked?: boolean): MimeType
  static parseParams(s: string, checked?: boolean): Map<string, string> | null
  static forExt(ext: string): MimeType | null
  mediaType(): string
  subType(): string
  params(): Map<string, string>
  charset(): Charset
  noParams(): MimeType
}
export class Type extends Obj {
  static of(obj: JsObj): Type
  static find(qname: string, checked?: boolean): Type | null
  pod(): Pod | null
  name$(): string
  qname(): string
  signature(): string
  base(): Type | null
  mixins(): List<Type>
  inheritance(): List<Type>
  fits(t: Type): boolean
  isVal(): boolean
  isNullable(): boolean
  toNullable(): Type
  toNonNullable(): Type
  isGeneric(): boolean
  params(): Map<string, Type>
  parameterize(params: Map<string, Type>): Type
  toListOf(): Type
  emptyList(): List<JsObj>
  isAbstract(): boolean
  isClass(): boolean
  isConst(): boolean
  isEnum(): boolean
  isFacet(): boolean
  isFinal(): boolean
  isInternal(): boolean
  isMixin(): boolean
  isPublic(): boolean
  isSynthetic(): boolean
  fields(): List<Field>
  methods(): List<Method>
  slots(): List<Slot>
  field(name$: string, checked?: boolean): Field | null
  method(name$: string, checked?: boolean): Method | null
  slot(name$: string, checked?: boolean): Slot | null
  make(args?: List<JsObj> | null): JsObj
  facets(): List<Facet>
  facet(type: Type, checked?: boolean): Facet | null
  hasFacet(type: Type): boolean
  doc(): string | null
  toLocale(): string
}
export class Regex extends Obj {
  static defVal(): Regex
  static fromStr(pattern: string, flags?: string): Regex
  static glob(pattern: string): Regex
  static quote(str: string): Regex
  flags(): string
  matches(s: string): boolean
  matcher(s: string): RegexMatcher
  split(s: string, limit?: number): List<string>
}
export class OutStream extends Obj {
  endian(): Endian
  endian(it: Endian): void
  charset(): Charset
  charset(it: Charset): void
  static xmlEscNewlines(): number
  static xmlEscQuotes(): number
  static xmlEscUnicode(): number
  write(byte: number): this
  writeBuf(buf: Buf, n?: number): this
  flush(): this
  sync(): this
  close(): boolean
  writeI2(n: number): this
  writeI4(n: number): this
  writeI8(n: number): this
  writeF4(r: number): this
  writeF8(r: number): this
  writeDecimal(d: number): this
  writeBool(b: boolean): this
  writeUtf(s: string): this
  writeBits(val: number, num: number): this
  numPendingBits(): number
  writeChar(char$: number): this
  writeChars(str: string, off?: number, len?: number): this
  print(s: JsObj | null): this
  printLine(obj?: JsObj | null): this
  writeObj(obj: JsObj | null, options?: Map<string, JsObj> | null): this
  writeProps(props: Map<string, string>, close?: boolean): this
  writeXml(str: string, mode?: number): this
}
export class LogLevel extends Enum {
  static debug(): LogLevel
  static info(): LogLevel
  static warn(): LogLevel
  static err(): LogLevel
  static silent(): LogLevel
  static vals(): List<LogLevel>
  static fromStr(name$: string, checked?: boolean): LogLevel
}
export class Time extends Obj {
  static defVal(): Time
  static now(tz?: TimeZone): Time
  static make(hour: number, min: number, sec?: number, ns?: number): Time
  static fromStr(s: string, checked?: boolean): Time
  hour(): number
  min(): number
  sec(): number
  nanoSec(): number
  toLocale(pattern?: string | null, locale?: Locale): string
  static fromLocale(str: string, pattern: string, checked?: boolean): Time | null
  static fromIso(s: string, checked?: boolean): Time | null
  toIso(): string
  plus(dur: Duration): Time
  minus(dur: Duration): Time
  static fromDuration(d: Duration): Time
  toDuration(): Duration
  toDateTime(d: Date, tz?: TimeZone): DateTime
  toCode(): string
  isMidnight(): boolean
}
export class UnknownTypeErr extends Err {
}
export class UriScheme extends Obj {
  static find(scheme: string, checked?: boolean): UriScheme | null
  get(uri: Uri, base: JsObj | null): JsObj | null
  static make(): UriScheme
}
export class Month extends Enum {
  static jan(): Month
  static feb(): Month
  static mar(): Month
  static apr(): Month
  static may(): Month
  static jun(): Month
  static jul(): Month
  static aug(): Month
  static sep(): Month
  static oct(): Month
  static nov(): Month
  static dec(): Month
  static vals(): List<Month>
  increment(): Month
  decrement(): Month
  numDays(year: number): number
  toLocale(pattern?: string | null, locale?: Locale): string
  localeAbbr(): string
  localeFull(): string
  static fromStr(name$: string, checked?: boolean): Month
}
export class CastErr extends Err {
}
export class ParseErr extends Err {
}
export class DateTime extends Obj {
  static defVal(): DateTime
  static now(tolerance?: Duration | null): DateTime
  static nowUtc(tolerance?: Duration | null): DateTime
  static nowTicks(): number
  static nowUnique(): number
  static makeTicks(ticks: number, tz?: TimeZone): DateTime
  static make(year: number, month: Month, day: number, hour: number, min: number, sec?: number, ns?: number, tz?: TimeZone): DateTime
  static fromStr(s: string, checked?: boolean): DateTime
  static boot(): DateTime
  ticks(): number
  date(): Date
  time(): Time
  year(): number
  month(): Month
  day(): number
  hour(): number
  min(): number
  sec(): number
  nanoSec(): number
  weekday(): Weekday
  tz(): TimeZone
  dst(): boolean
  tzAbbr(): string
  dayOfYear(): number
  weekOfYear(startOfWeek?: Weekday): number
  hoursInDay(): number
  toLocale(pattern?: string | null, locale?: Locale): string
  static fromLocale(str: string, pattern: string, tz?: TimeZone, checked?: boolean): DateTime | null
  toTimeZone(tz: TimeZone): DateTime
  toUtc(): DateTime
  toRel(): DateTime
  minusDateTime(time: DateTime): Duration
  plus(duration: Duration): DateTime
  minus(duration: Duration): DateTime
  floor(accuracy: Duration): DateTime
  midnight(): DateTime
  isMidnight(): boolean
  static isLeapYear(year: number): boolean
  static weekdayInMonth(year: number, mon: Month, weekday: Weekday, pos: number): number
  static fromJava(millis: number, tz?: TimeZone, negIsNull?: boolean): DateTime | null
  toJava(): number
  static fromIso(s: string, checked?: boolean): DateTime | null
  toIso(): string
  static fromHttpStr(s: string, checked?: boolean): DateTime | null
  toHttpStr(): string
  toCode(): string
}
export class NotImmutableErr extends Err {
}
export class UnknownPodErr extends Err {
}
export class List<V = unknown> extends Obj {
  size(): number
  size(it: number): void
  capacity(): number
  capacity(it: number): void
  static make(of: Type, capacity: number): List
  static makeObj(capacity: number): List
  of(): Type
  isEmpty(): boolean
  get(index: number): V
  getSafe(index: number, def?: V | null): V | null
  getRange(range: Range): List<V>
  contains(item: V): boolean
  containsSame(item: V): boolean
  containsAll(list: List<V>): boolean
  containsAny(list: List<V>): boolean
  index(item: V, offset?: number): number | null
  indexr(item: V, offset?: number): number | null
  indexSame(item: V, offset?: number): number | null
  first(): V | null
  last(): V | null
  dup(): List<V>
  set(index: number, item: V): List<V>
  add(item: V): List<V>
  addIfNotNull(item: V | null): List<V>
  addNotNull(item: V | null): List<V>
  addAll(list: List<V>): List<V>
  insert(index: number, item: V): List<V>
  insertAll(index: number, list: List<V>): List<V>
  remove(item: V): V | null
  removeSame(item: V): V | null
  removeAt(index: number): V
  removeRange(r: Range): List<V>
  removeAll(list: List<V>): List<V>
  clear(): List<V>
  trim(): List<V>
  fill(val: V, times: number): List<V>
  peek(): V | null
  pop(): V | null
  push(item: V): List<V>
  each(c: ((argA: V, argB: number) => void)): void
  eachr(c: ((argA: V, argB: number) => void)): void
  eachRange(r: Range, c: ((argA: V, argB: number) => void)): void
  eachNotNull(c: ((argA: V, argB: number) => void)): void
  eachWhile(c: ((argA: V, argB: number) => JsObj | null)): JsObj | null
  eachrWhile(c: ((argA: V, argB: number) => JsObj | null)): JsObj | null
  find(c: ((argA: V, argB: number) => boolean)): V | null
  findIndex(c: ((argA: V, argB: number) => boolean)): number | null
  findAll(c: ((argA: V, argB: number) => boolean)): List<V>
  findType(t: Type): List<V>
  findNotNull(): List<V>
  exclude(c: ((argA: V, argB: number) => boolean)): List<V>
  any(c: ((argA: V, argB: number) => boolean)): boolean
  all(c: ((argA: V, argB: number) => boolean)): boolean
  map(c: ((argA: V, argB: number) => JsObj | null)): List<JsObj | null>
  mapNotNull(c: ((argA: V, argB: number) => JsObj | null)): List<JsObj>
  flatMap(c: ((argA: V, argB: number) => List<JsObj | null>)): List<JsObj | null>
  groupBy(c: ((argA: V, argB: number) => JsObj)): Map<JsObj, List<V>>
  groupByInto(map: Map<JsObj, List<V>>, c: ((argA: V, argB: number) => JsObj)): Map<JsObj, List<V>>
  reduce(init: JsObj | null, c: ((argA: JsObj | null, argB: V, argC: number) => JsObj | null)): JsObj | null
  min(c?: ((argA: V, argB: V) => number) | null): V | null
  max(c?: ((argA: V, argB: V) => number) | null): V | null
  unique(): List<V>
  union(that: List<V>): List<V>
  intersection(that: List<V>): List<V>
  sort(c?: ((argA: V, argB: V) => number) | null): List<V>
  sortr(c?: ((argA: V, argB: V) => number) | null): List<V>
  binarySearch(key: V, c?: ((argA: V, argB: V) => number) | null): number
  binaryFind(c: ((argA: V, argB: number) => number)): number
  reverse(): List<V>
  swap(indexA: number, indexB: number): List<V>
  moveTo(item: V | null, toIndex: number): List<V>
  flatten(): List<JsObj | null>
  random(): V | null
  shuffle(): List<V>
  join(separator?: string, c?: ((argA: V, argB: number) => string) | null): string
  toCode(): string
  isRO(): boolean
  isRW(): boolean
  ro(): List<V>
  rw(): List<V>
}
export class FileStore extends Obj {
  totalSpace(): number | null
  availSpace(): number | null
  freeSpace(): number | null
}
export class Unit extends Obj {
  static define(s: string): Unit
  static fromStr(s: string, checked?: boolean): Unit
  static list(): List<Unit>
  static quantities(): List<string>
  static quantity(quantity: string): List<Unit>
  ids(): List<string>
  name$(): string
  symbol(): string
  scale(): number
  offset(): number
  definition(): string
  dim(): string
  kg(): number
  m(): number
  sec(): number
  K(): number
  A(): number
  mol(): number
  cd(): number
  mult(that: Unit): Unit
  div(b: Unit): Unit
  convertTo(scalar: number, unit: Unit): number
  static make(): Unit
}
export class RegexMatcher extends Obj {
  matches(): boolean
  find(): boolean
  replaceFirst(replacement: string): string
  replaceAll(replacement: string): string
  groupCount(): number
  group(group?: number): string | null
  start(group?: number): number
  end(group?: number): number
}
export class Slot extends Obj {
  static find(qname: string, checked?: boolean): Slot | null
  static findMethod(qname: string, checked?: boolean): Method | null
  static findField(qname: string, checked?: boolean): Field | null
  static findFunc(qname: string, checked?: boolean): ((...args: any) => any) | null
  parent(): Type
  name$(): string
  qname(): string
  isField(): boolean
  isMethod(): boolean
  isAbstract(): boolean
  isConst(): boolean
  isCtor(): boolean
  isInternal(): boolean
  isNative(): boolean
  isOverride(): boolean
  isPrivate(): boolean
  isProtected(): boolean
  isPublic(): boolean
  isStatic(): boolean
  isSynthetic(): boolean
  isVirtual(): boolean
  facets(): List<Facet>
  facet(type: Type, checked?: boolean): Facet | null
  hasFacet(type: Type): boolean
  doc(): string | null
  signature(): string
}
export class Field extends Slot {
  static makeSetFunc(vals: Map<Field, JsObj | null>): ((argA: JsObj) => void)
  type(): Type
  get(instance?: JsObj | null): JsObj | null
  set(instance: JsObj | null, value: JsObj | null): void
}
export class FieldNotSetErr extends Err {
}
export class Method extends Slot {
  returns(): Type
  params(): List<Param>
  func(): ((...args: any) => any)
  paramDef(param: Param, instance?: JsObj | null): JsObj | null
  callList(args: List<JsObj | null> | null): JsObj | null
  callOn(target: JsObj | null, args: List<JsObj | null> | null): JsObj | null
  call(a?: JsObj | null, b?: JsObj | null, c?: JsObj | null, d?: JsObj | null, e?: JsObj | null, f?: JsObj | null, g?: JsObj | null, h?: JsObj | null): JsObj | null
}
export class Serializable extends Obj {
  simple(): boolean
  collection(): boolean
  static make(f?: ((argA: Serializable) => void) | null): Serializable
}
export class Transient extends Obj {
  static defVal(): Transient
}
export class Js extends Obj {
  static defVal(): Js
}
export class NoDoc extends Obj {
  static defVal(): NoDoc
}
export class Deprecated extends Obj {
  msg(): string
  static make(f?: ((argA: Deprecated) => void) | null): Deprecated
}
export class Operator extends Obj {
  static defVal(): Operator
}
export class FacetMeta extends Obj {
  inherited(): boolean
  static make(f?: ((argA: FacetMeta) => void) | null): FacetMeta
}
export class UnknownServiceErr extends Err {
}
export class NullErr extends Err {
}
export class Uuid extends Obj {
  static make(): Uuid
  static makeBits(hi: number, lo: number): Uuid
  static fromStr(s: string, checked?: boolean): Uuid
  bitsHi(): number
  bitsLo(): number
}
export class UnsupportedErr extends Err {
}
export class UnknownKeyErr extends Err {
}
export class UnknownFacetErr extends Err {
}
export class InStream extends Obj {
  endian(): Endian
  endian(it: Endian): void
  charset(): Charset
  charset(it: Charset): void
  avail(): number
  read(): number | null
  readBuf(buf: Buf, n: number): number | null
  unread(b: number): this
  close(): boolean
  skip(n: number): number
  readAllBuf(): Buf
  readBufFully(buf: Buf | null, n: number): Buf
  peek(): number | null
  readU1(): number
  readS1(): number
  readU2(): number
  readS2(): number
  readU4(): number
  readS4(): number
  readS8(): number
  readF4(): number
  readF8(): number
  readBool(): boolean
  readDecimal(): number
  readUtf(): string
  readBits(num: number): number
  numPendingBits(): number
  readChar(): number | null
  unreadChar(b: number): this
  peekChar(): number | null
  readChars(n: number): string
  readLine(max?: number | null): string | null
  readStrToken(max?: number | null, c?: ((argA: number) => boolean) | null): string | null
  readNullTerminatedStr(max?: number | null): string
  readAllLines(): List<string>
  eachLine(f: ((argA: string) => void)): void
  readAllStr(normalizeNewlines?: boolean): string
  readObj(options?: Map<string, JsObj> | null): JsObj | null
  readProps(): Map<string, string>
  readPropsListVals(): Map<string, List<string>>
  pipe(out: OutStream, n?: number | null, close?: boolean): number
}
export class File extends Obj {
  modified(): DateTime | null
  modified(it: DateTime | null): void
  static sep(): string
  static pathSep(): string
  static make(uri: Uri, checkSlash?: boolean): File
  static os(osPath: string): File
  static osRoots(): List<File>
  static createTemp(prefix?: string, suffix?: string, dir?: File | null): File
  uri(): Uri
  isDir(): boolean
  path(): List<string>
  pathStr(): string
  name$(): string
  basename(): string
  ext(): string | null
  mimeType(): MimeType | null
  exists(): boolean
  size(): number | null
  isEmpty(): boolean
  isHidden(): boolean
  isReadable(): boolean
  isWritable(): boolean
  isExecutable(): boolean
  osPath(): string | null
  parent(): File | null
  list(pattern?: Regex | null): List<File>
  listDirs(pattern?: Regex | null): List<File>
  listFiles(pattern?: Regex | null): List<File>
  walk(c: ((argA: File) => void)): void
  normalize(): File
  plus(path: Uri, checkSlash?: boolean): File
  store(): FileStore
  create(): File
  createFile(name$: string): File
  createDir(name$: string): File
  copyTo(to: File, options?: Map<string, JsObj> | null): File
  copyInto(dir: File, options?: Map<string, JsObj> | null): File
  moveTo(to: File): File
  moveInto(dir: File): File
  rename(newName: string): File
  delete$(): void
  deleteOnExit(): File
  open(mode?: string): Buf
  mmap(mode?: string, pos?: number, size?: number | null): Buf
  in$(bufferSize?: number | null): InStream
  out(append?: boolean, bufferSize?: number | null): OutStream
  readAllBuf(): Buf
  readAllLines(): List<string>
  eachLine(f: ((argA: string) => void)): void
  readAllStr(normalizeNewlines?: boolean): string
  readProps(): Map<string, string>
  writeProps(props: Map<string, string>): void
  readObj(options?: Map<string, JsObj> | null): JsObj | null
  writeObj(obj: JsObj | null, options?: Map<string, JsObj> | null): void
}
export class InterruptedErr extends Err {
}
export class Env extends Obj {
  static cur(): Env
  parent(): Env | null
  platform(): string
  os(): string
  arch(): string
  runtime(): string
  javaVersion(): number
  idHash(obj: JsObj | null): number
  args(): List<string>
  mainMethod(): Method | null
  vars(): Map<string, string>
  diagnostics(): Map<string, JsObj>
  gc(): void
  host(): string
  user(): string
  in$(): InStream
  out(): OutStream
  err(): OutStream
  prompt(msg?: string): string | null
  promptPassword(msg?: string): string | null
  homeDir(): File
  workDir(): File
  tempDir(): File
  path(): List<File>
  findFile(uri: Uri, checked?: boolean): File | null
  findAllFiles(uri: Uri): List<File>
  findPodFile(podName: string): File | null
  findAllPodNames(): List<string>
  compileScript(f: File, options?: Map<string, JsObj> | null): Type
  compileScriptToJs(f: File, options?: Map<string, JsObj> | null): string
  index(key: string): List<string>
  indexKeys(): List<string>
  indexPodNames(key: string): List<string>
  props(pod: Pod, uri: Uri, maxAge: Duration): Map<string, string>
  config(pod: Pod, key: string, def?: string | null): string | null
  locale(pod: Pod, key: string, def?: string | null, locale?: Locale): string | null
  exit(status?: number): void
  addShutdownHook(hook: (() => void)): void
  removeShutdownHook(hook: (() => void)): boolean
}
export class Map<K = unknown, V = unknown> extends Obj {
  caseInsensitive(): boolean
  caseInsensitive(it: boolean): void
  ordered(): boolean
  ordered(it: boolean): void
  def(): V | null
  def(it: V | null): void
  static make(type: Type): Map
  isEmpty(): boolean
  size(): number
  get(key: K, def?: V | null): V | null
  getChecked(key: K, checked?: boolean): V | null
  getOrThrow(key: K): V
  containsKey(key: K): boolean
  keys(): List<K>
  vals(): List<V>
  dup(): Map<K,V>
  set(key: K, val: V): Map<K,V>
  add(key: K, val: V): Map<K,V>
  addIfNotNull(key: K, val: V | null): Map<K,V>
  addNotNull(key: K, val: V | null): Map<K,V>
  getOrAdd(key: K, valFunc: ((argA: K) => V)): V
  setAll(m: Map<K,V>): Map<K,V>
  addAll(m: Map<K,V>): Map<K,V>
  setList(list: List<V>, c?: ((argA: V, argB: number) => K) | null): Map<K,V>
  addList(list: List<V>, c?: ((argA: V, argB: number) => K) | null): Map<K,V>
  remove(key: K): V | null
  clear(): Map<K,V>
  join(separator: string, c?: ((argA: V, argB: K) => string) | null): string
  toCode(): string
  each(c: ((argA: V, argB: K) => void)): void
  eachWhile(c: ((argA: V, argB: K) => JsObj | null)): JsObj | null
  find(c: ((argA: V, argB: K) => boolean)): V | null
  findAll(c: ((argA: V, argB: K) => boolean)): Map<K,V>
  findNotNull(): Map<K,V>
  exclude(c: ((argA: V, argB: K) => boolean)): Map<K,V>
  any(c: ((argA: V, argB: K) => boolean)): boolean
  all(c: ((argA: V, argB: K) => boolean)): boolean
  reduce(init: JsObj | null, c: ((argA: JsObj | null, argB: V, argC: K) => JsObj | null)): JsObj | null
  map(c: ((argA: V, argB: K) => JsObj | null)): Map<JsObj, JsObj | null>
  mapNotNull(c: ((argA: V, argB: K) => JsObj | null)): Map<JsObj, JsObj | null>
  isRO(): boolean
  isRW(): boolean
  ro(): Map<K,V>
  rw(): Map<K,V>
}
export class Param extends Obj {
  name$(): string
  type(): Type
  hasDefault(): boolean
}
export class Float extends Num {
  static defVal(): number
  static posInf(): number
  static negInf(): number
  static nan(): number
  static e(): number
  static pi(): number
  static makeBits(bits: number): number
  static makeBits32(bits: number): number
  static fromStr(s: string, checked?: boolean): Float
  static random(): number
  static approx(self: number, r: number, tolerance?: number | null): boolean
  static isNaN(self: number): boolean
  static isNegZero(self: number): boolean
  static normNegZero(self: number): number
  static negate(self: number): number
  static increment(self: number): number
  static decrement(self: number): number
  static mult(self: number, b: number): number
  static multInt(self: number, b: number): number
  static multDecimal(self: number, b: number): number
  static div(self: number, b: number): number
  static divInt(self: number, b: number): number
  static divDecimal(self: number, b: number): number
  static mod(self: number, b: number): number
  static modInt(self: number, b: number): number
  static modDecimal(self: number, b: number): number
  static plus(self: number, b: number): number
  static plusInt(self: number, b: number): number
  static plusDecimal(self: number, b: number): number
  static minus(self: number, b: number): number
  static minusInt(self: number, b: number): number
  static minusDecimal(self: number, b: number): number
  static abs(self: number): number
  static min(self: number, that: number): number
  static max(self: number, that: number): number
  static clamp(self: number, min: number, max: number): number
  static clip(self: number, min: number, max: number): number
  static ceil(self: number): number
  static floor(self: number): number
  static round(self: number): number
  static exp(self: number): number
  static log(self: number): number
  static log10(self: number): number
  static pow(self: number, pow: number): number
  static sqrt(self: number): number
  static acos(self: number): number
  static asin(self: number): number
  static atan(self: number): number
  static atan2(y: number, x: number): number
  static cos(self: number): number
  static cosh(self: number): number
  static sin(self: number): number
  static sinh(self: number): number
  static tan(self: number): number
  static tanh(self: number): number
  static toDegrees(self: number): number
  static toRadians(self: number): number
  static bits(self: number): number
  static bits32(self: number): number
  static toCode(self: number): string
  static toLocale(self: number, pattern?: string | null, locale?: Locale): string
}
export class Service extends Obj {
  static list(): List<Service>
  static find(t: Type, checked?: boolean): Service | null
  static findAll(t: Type): List<Service>
  isInstalled(): boolean
  isRunning(): boolean
  install(): this
  start(): this
  stop(): this
  uninstall(): this
}

