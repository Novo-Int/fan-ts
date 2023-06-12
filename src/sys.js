import * as es6 from './es6.js';
import * as node from './node.js';
class Obj {
  constructor() {
    this.#hash = undefined;
  }
  static #hashCounter = 0;
  #hash;
  equals(that) { return this === that; }
  compare(that) {
    if (this < that) return -1;
    if (this > that) return 1;
    return 0;
  }
  hash() {
    if (this.#hash === undefined) this.#hash = Obj.#hashCounter++;
    return this.#hash;
  }
  $with(f) {
    f.call(this);
    return this;
  }
  isImmutable() { return this.typeof$().isConst(); }
  toImmutable() {
    if (this.isImmutable()) return this;
    throw NotImmutableErr.make(this.typeof$().toStr());
  }
  toStr() { return `${this.typeof$()}@${this.hash()}`; }
  toString() { return "" + this.toStr(); }
  trap(name, args=null) { return ObjUtil.doTrap(this, name, args, this.typeof$()); }
}
class Facet extends Obj {
  constructor() { super(); }
}
class Deprecated extends Obj {
  constructor(f=null) {
    super();
    this.#msg;
    if (f != null) f(this);
  }
  #msg;
  msg(it=undefined) {
    if (it === undefined) return this.#msg;
    this.#msg = it;
  }
  static make(f=null) { return new Deprecated(f); }
  toStr() { return fanx_ObjEncoder.encode(this); }
}
class FacetMeta extends Obj {
  constructor(f=null) {
    super();
    this.#inherited = false;
    if (f != null) f(this);
  }
  #inherited;
  inherited(it=undefined) {
    if (it === undefined) return this.#inherited;
    this.#inherited = it;
  }
  static make(f=null) { return new FacetMeta(f); }
  toStr() { return fanx_ObjEncoder.encode(this); }
}
class Js extends Obj {
  constructor() { super(); }
  static defVal = new Js();
  toStr() { return this.typeof$().qname(); }
}
class NoDoc extends Obj {
  constructor() { super(); }
  static defVal = new NoDoc();
  toStr() { return this.typeof$().qname(); }
}
class Operator extends Obj {
  constructor() { super(); }
  static defVal = new Operator();
  toStr() { return this.typeof$().qname(); }
}
class Serializable extends Obj {
  constructor(f=null) {
    super();
    this.#simple = false;
    this.#collection = false;
    if (f != null) f(this);
  }
  #simple;
  #collection;
  simple(it=undefined) {
    if (it === undefined) return this.#simple;
    this.#simple = it;
  }
  collection(it=undefined) {
    if (it === undefined) return this.#collection;
    this.#collection = it;
  }
  static make(f=null) { return new Serializable(f); }
  toStr() { return fanx_ObjEncoder.encode(this); }
}
class Transient extends Obj {
  constructor() { super(); }
  static defVal = new Transient();
  toStr() { return this.typeof$().qname(); }
}
class TimeZone extends Obj {
  constructor(name, fullName, rules) {
    super();
    this.#name = name;
    this.#fullName = fullName;
    this.#rules = rules;
  }
  #name;
  #fullName;
  #rules;
  static #cache = {};
  static #names = [];
  static #fullNames = [];
  static #aliases = {};
  static #utc = undefined;
  static #rel = undefined;
  static #cur = undefined;
  static #defVal = undefined;
  static defVal() {
    if (TimeZone.#defVal === undefined) TimeZone.#defVal = TimeZone.#utc;
    return TimeZone.#defVal;
  }
  static listNames() {
    return List.make(Str.type$, TimeZone.#names).ro();
  }
  static listFullNames() {
    return List.make(Str.type$, TimeZone.#fullNames).ro();
  }
  static fromStr(name, checked=true) {
    let tz = TimeZone.#fromCache(name);
    if (tz != null) return tz;
    let target = TimeZone.#aliases[name];
    tz = fan.sys.TimeZone.fromCache$(target);
    if (tz != null) return tz;
    if (checked) throw ParseErr.make("TimeZone not found: " + name);
    return null;
  }
  static utc() {
    if (TimeZone.#utc === undefined) TimeZone.#utc = TimeZone.fromStr("UTC");
    return TimeZone.#utc;
  }
  static rel() {
    if (TimeZone.#rel === undefined) TimeZone.#rel = TimeZone.fromStr("Rel");
    return TimeZone.#rel;
  }
  static cur() {
    if (TimeZone.#cur === undefined) {
      try {
        let tz = Env.cur().vars().get("timezone");
        if (tz == null) tz = Intl.DateTimeFormat().resolvedOptions().timeZone.split("/")[1];
        if (tz == null) tz = "UTC"
        TimeZone.#cur = TimeZone.fromStr(tz);
      }
      catch (err) {
        console.log(Err.make(err).msg());
        TimeZone.cur = TimeZone.#utc;
        throw Err.make(err);
      }
    }
    return TimeZone.#cur;
  }
  static fromGmtOffset(offset=0) {
    if (offset == 0)
      return TimeZone.utc();
    else
      return TimeZone.fromStr("GMT" + (offset < 0 ? "+" : "-") + Int.div(Math.abs(offset), 3600));
  }
  toStr() { return this.#name; }
  name() { return this.#name; }
  fullName() { return this.#fullName; }
  offset(year) {
    return Duration.make(this.rule(year).offset * Duration.nsPerSec$);
  }
  dstOffset(year) {
    const r = this.rule(year);
    if (r.dstOffset == 0) return null;
    return Duration.make(r.dstOffset * Duration.nsPerSec$);
  }
  stdAbbr(year) { return this.rule(year).stdAbbr; }
  dstAbbr(year) { return this.rule(year).dstAbbr; }
  abbr(year, inDST) {
    return inDST ? this.rule(year).dstAbbr : this.rule(year).stdAbbr;
  }
  rule(year) {
    const rule = this.#rules[0];
    if (year >= rule.startYear) return rule;
    for (let i=1; i<this.#rules.length; ++i)
      if (year >= (rule = this.#rules[i]).startYear) return rule;
    return this.#rules[this.#rules.length-1];
  }
  static cache$(fullName, encoded) {
    const city = fullName.split("/").reverse()[0];
    TimeZone.#cache[city] = encoded;
    TimeZone.#cache[fullName] = encoded;
    TimeZone.#names.push(city);
    TimeZone.#fullNames.push(fullName);
  }
  static #fromCache(name) {
    let entry = TimeZone.#cache[name];
    if (entry == null || entry === undefined) return null;
    if ((typeof entry) !== 'string') return entry;
    const buf = Buf.fromBase64(entry);
    const fullName = buf.readUtf();
    const city = fullName.split("/").reverse()[0];
    const decodeDst = () => {
      const dst = new TimeZoneDstTime(
        buf.read(),
        buf.read(),
        buf.read(),
        buf.read(),
        buf.readS4(),
        buf.read()
      );
      return dst;
    };
    let rule;
    const rules = [];
    while (buf.more()) {
      rule = new TimeZoneRule();
      rule.startYear = buf.readS2();
      rule.offset    = buf.readS4();
      rule.stdAbbr   = buf.readUtf();
      rule.dstOffset = buf.readS4();
      if (rule.dstOffset != 0) {
        rule.dstAbbr  = buf.readUtf();
        rule.dstStart = decodeDst();
        rule.dstEnd   = decodeDst();
      }
      rules.push(rule);
    }
    const tz = new TimeZone(name, fullName, rules);
    TimeZone.#cache[city] = tz;
    TimeZone.#cache[fullName] = tz;
    return tz;
  }
  static alias$(alias, target) {
    const parts = alias.split("/");
    TimeZone.#aliases[alias] = target;
    if (parts.length > 1) TimeZone.#aliases[parts[parts.length-1]] = target;
  }
}
class TimeZoneRule {
  constructor() { }
  startYear = null;
  offset = null;
  stdAbbr = null;
  dstOffset = null;
  dstAbbr = null;
  dstStart = null;
  dstEnd = null;
  isWallTime() { return this.dstStart.atMode == 'w'; }
}
class TimeZoneDstTime  {
  constructor(mon, onMode, onWeekday, onDay, atTime, atMode) {
    this.mon = mon;
    this.onMode = String.fromCharCode(onMode);
    this.onWeekday = onWeekday;
    this.onDay = onDay;
    this.atTime = atTime;
    this.atMode = String.fromCharCode(atMode);
  }
  mon;
  onMode;
  onWeekday;
  onDay;
  atTime;
  atMode;
}
class Uri extends Obj {
  constructor(sections) {
    super();
    this.#scheme = sections.scheme;
    this.#userInfo = sections.userInfo;
    this.#host = sections.host;
    this.#port = sections.port;
    this.#pathStr = sections.pathStr;
    this.#path = sections.path.ro();
    this.#queryStr = sections.queryStr;
    this.#query = sections.query.ro();
    this.frag = sections.frag;
    this.#str = sections.str != null ? sections.str : new UriEncoder(this, false).encode();
    this.#encoded = null;
  }
  #scheme;
  #userInfo;
  #host;
  #port;
  #pathStr;
  #path;
  #queryStr;
  #query;
  #frag;
  #str;
  #encoded;
  static #defVal = undefined
  static defVal() {
    if (Uri.#defVal === undefined) Uri.#defVal = Uri.fromStr("");
    return Uri.#defVal;
  }
  static fromStr(s, checked=true) {
    try {
      return Uri.makeSections(new UriDecoder(s, false).decode());
    }
    catch (err) {
      if (!checked) return null;
      throw ParseErr.makeStr("Uri", s, null, err);
    }
  }
  static decode(s, checked=true) {
    try {
      return new Uri.makeSections(new UriDecoder(s, true).decode());
    }
    catch (err) {
      if (!checked) return null;
      throw ParseErr.makeStr("Uri", s, null, err);
    }
  }
  equals(that) {
    if (that instanceof Uri)
      return this.#str === that.#str;
    else
      return false;
  }
  toCode() {
    let s = '`';
    const len = this.#str.length;
    for (let i=0; i<len; ++i) {
      const c = this.#str.charAt(i);
      switch (c)
      {
        case '\n': s += '\\' + 'n'; break;
        case '\r': s += '\\' + 'r'; break;
        case '\f': s += '\\' + 'f'; break;
        case '\t': s += '\\' + 't'; break;
        case '`':  s += '\\' + '`'; break;
        case '$':  s += '\\' + '$'; break;
        default:  s += c;
      }
    }
    s += '`';
    return s;
  }
  hash() { return Str.hash(this.#str); }
  toStr() { return this.#str; }
  toLocale() { return this.#str; }
  literalEncode$(out) { out.wStrLiteral(this.#str, '`'); }
  encode() {
    const x = this.#encoded;
    if (x != null) return x;
    return this.#encoded = new UriEncoder(this, true).encode();
  }
  get() {
    if (this.#scheme == "fan") {
      if (this.#path.size() == 0)
        return Pod.find(this.#host);
    }
    return File.make();
  }
  static emptyPath() {
    if (Uri.emptyPath$ === undefined) {
      Uri.emptyPath$ = List.make(Str.type$, []).toImmutable();
    }
    return Uri.emptyPath$;
  }
  static emptyQuery() {
    if (Uri.emptyQuery$ === undefined) {
      Uri.emptyQuery$ = Map.make(Str.type$, Str.type$).toImmutable();
    }
    return Uri.emptyQuery$;
  }
}
class UriSections {
  constructor() { }
  scheme = null;
  host = null;
  userInfo = null;
  port = null;
  pathStr = null;
  path = null;
  queryStr = null;
  query = null;
  frag = null;
  str = null;
  setAuth(x)  { this.userInfo = x.userInfo(); this.host = x.host(); this.port = x.port(); }
  setPath(x)  { this.pathStr = x.pathStr(); this.path = x.path(); }
  setQuery(x) { this.queryStr = x.queryStr(); this.query = x.query(); }
  setFrag(x)  { this.frag = x.frag(); }
  normalize() {
    this.normalizeSchemes();
    this.normalizePath();
    this.normalizeQuery();
  }
  normalizeSchemes() {
    if (this.scheme == null) return;
    if (this.scheme == "http")  { this.normalizeScheme(80);  return; }
    if (this.scheme == "https") { this.normalizeScheme(443); return; }
    if (this.scheme == "ftp")   { this.normalizeScheme(21);  return; }
  }
  normalizeScheme(p) {
    if (this.port != null && this.port == p) this.port = null;
    if (this.pathStr == null || this.pathStr.length == 0) {
      this.pathStr = "/";
      if (this.path == null) this.path = Uri.emptyPath();
    }
  }
  normalizePath() {
    if (this.path == null) return;
    let isAbs = Str.startsWith(this.pathStr, "/");
    let isDir = Str.endsWith(this.pathStr, "/");
    let dotLast = false;
    let modified = false;
    for (let i=0; i<this.path.size(); ++i)
    {
      const seg = this.path.get(i);
      if (seg == "." && (this.path.size() > 1 || this.host != null)) {
        this.path.removeAt(i);
        modified = true;
        dotLast = true;
        i -= 1;
      }
      else if (seg == ".." && i > 0 && this.path.get(i-1).toString() != "..") {
        this.path.removeAt(i);
        this.path.removeAt(i-1);
        modified = true;
        i -= 2;
        dotLast = true;
      }
      else {
        dotLast = false;
      }
    }
    if (modified) {
      if (dotLast) isDir = true;
      if (this.path.size() == 0 || this.path.last().toString() == "..") isDir = false;
      this.pathStr = Uri.toPathStr(isAbs, this.path, isDir);
    }
  }
  normalizeQuery() {
    if (this.query == null)
      this.query = Uri.emptyQuery();
  }
}
class UriDecoder extends UriSections {
  constructor(str, decoding=false) {
    super();
    this.str = str;
    this.decoding = decoding;
  }
  str;
  decoding;
  dpos = null;
  nextCharWasEscaped = null;
  decode() {
    const str = this.str;
    const len = str.length;
    let pos = 0;
    let hasUpper = false;
    for (let i=0; i<len; ++i) {
      let c = str.charCodeAt(i);
      if (Uri.isScheme(c)) {
        if (!hasUpper && Uri.isUpper(c)) hasUpper = true;
        continue;
      }
      if (c != 58) break;
      pos = i + 1;
      let scheme = str.substring(0, i);
      if (hasUpper) scheme = Str.lower(scheme);
      this.scheme = scheme;
      break;
    }
    if (pos+1 < len && str.charAt(pos) == '/' && str.charAt(pos+1) == '/')
    {
      let authStart = pos+2;
      let authEnd = len;
      let at = -1;
      let colon = -1;
      for (let i=authStart; i<len; ++i) {
        const c = str.charAt(i);
        if (c == '/' || c == '?' || c == '#') { authEnd = i; break; }
        else if (c == '@' && at < 0) { at = i; colon = -1; }
        else if (c == ':') colon = i;
        else if (c == ']') colon = -1;
      }
      let hostStart = authStart;
      let hostEnd = authEnd;
      if (at > 0) {
        this.userInfo = this.substring(authStart, at, Uri.USER);
        hostStart = at+1;
      }
      if (colon > 0) {
        this.port = Int.fromStr(str.substring(colon+1, authEnd));
        hostEnd = colon;
      }
      this.host = this.substring(hostStart, hostEnd, Uri.HOST);
      pos = authEnd;
    }
    let pathStart = pos;
    let pathEnd = len;
    let numSegs = 1;
    let prev = 0;
    for (let i=pathStart; i<len; ++i) {
      const c = str.charAt(i);
      if (prev != '\\') {
        if (c == '?' || c == '#') { pathEnd = i; break; }
        if (i != pathStart && c == '/') ++numSegs;
        prev = c;
      }
      else {
        prev = (c != '\\') ? c : 0;
      }
    }
    this.pathStr = this.substring(pathStart, pathEnd, Uri.PATH);
    this.path = this.pathSegments(this.pathStr, numSegs);
    pos = pathEnd;
    if (pos < len && str.charAt(pos) == '?') {
      let queryStart = pos+1;
      let queryEnd = len;
      prev = 0;
      for (let i=queryStart; i<len; ++i) {
        const c = str.charAt(i);
        if (prev != '\\') {
          if (c == '#') { queryEnd = i; break; }
          prev = c;
        }
        else {
          prev = (c != '\\') ? c : 0;
        }
      }
      this.queryStr = this.substring(queryStart, queryEnd, Uri.QUERY);
      this.query = this.parseQuery(this.queryStr);
      pos = queryEnd;
    }
    if (pos < len  && str.charAt(pos) == '#') {
      this.frag = this.substring(pos+1, len, Uri.FRAG);
    }
    this.normalize();
    this.str = null;
    return this;
  }
  pathSegments = function(pathStr, numSegs) {
    const len = pathStr.length;
    if (len == 0 || (len == 1 && pathStr.charAt(0) == '/'))
      return Uri.emptyPath();
    if (len > 1 && pathStr.charAt(len-1) == '/' && pathStr.charAt(len-2) != '\\') {
      numSegs--;
      len--;
    }
    let path = [];
    let n = 0;
    let segStart = 0;
    let prev = 0;
    for (let i=0; i<pathStr.length; ++i) {
      const c = pathStr.charAt(i);
      if (prev != '\\') {
        if (c == '/')
        {
          if (i > 0) { path.push(pathStr.substring(segStart, i)); n++ }
          segStart = i+1;
        }
        prev = c;
      }
      else {
        prev = (c != '\\') ? c : 0;
      }
    }
    if (segStart < len) {
      path.push(pathStr.substring(segStart, pathStr.length));
      n++;
    }
    return List.make(Str.type$, path);
  }
  decodeQuery() {
    return this.parseQuery(this.substring(0, this.str.length, Uri.QUERY));
  }
  parseQuery(q) {
    if (q == null) return null;
    const map = Map.make(Str.type$, Str.type$);
    try {
      let start = 0;
      let eq = 0;
      let len = q.length;
      let prev = 0;
      let escaped = false;
      for (let i=0; i<len; ++i) {
        const ch = q.charAt(i);
        if (prev != '\\') {
          if (ch == '=') eq = i;
          if (ch != '&' && ch != ';') { prev = ch; continue; }
        }
        else {
          escaped = true;
          prev = (ch != '\\') ? ch : 0;
          continue;
        }
        if (start < i) {
          this.addQueryParam(map, q, start, eq, i, escaped);
          escaped = false;
        }
        start = eq = i+1;
      }
      if (start < len)
        this.addQueryParam(map, q, start, eq, len, escaped);
    }
    catch (err) {
      Err.make(err).trace();
    }
    return map;
  }
  addQueryParam(map, q, start, eq, end, escaped) {
    if (start == eq && q.charAt(start) != '=') {
      key = this.toQueryStr(q, start, end, escaped);
      val = "true";
    }
    else {
      key = this.toQueryStr(q, start, eq, escaped);
      val = this.toQueryStr(q, eq+1, end, escaped);
    }
    dup = map.get(key, null);
    if (dup != null) val = dup + "," + val;
    map.set(key, val);
  }
  toQueryStr(q, start, end, escaped) {
    if (!escaped) return q.substring(start, end);
    let s = "";
    let prev = 0;
    for (let i=start; i<end; ++i) {
      const c = q.charAt(i);
      if (c != '\\') {
        s += c;
        prev = c;
      }
      else {
        if (prev == '\\') { s += c; prev = 0; }
        else prev = c;
      }
    }
    return s;
  }
  decodeToken(mask) {
    return this.substring(0, this.str.length, mask);
  }
  substring(start, end, section) {
    let buf = [];
    let delimEscMap = Uri.delimEscMap;
    if (!this.decoding) {
      let last = 0;
      let backslash = 92;
      for (let i = start; i < end; ++i) {
        const ch = this.str.charCodeAt(i);
        if (last == backslash && ch < delimEscMap.length && (delimEscMap[ch] & section) == 0) {
          buf.pop();
        }
        buf.push(String.fromCharCode(ch));
        last = ((last == backslash && ch == backslash) ? 0 : ch);
      }
    }
    else {
      this.dpos = start;
      while (this.dpos < end) {
        const ch = this.nextChar(section);
        if (this.nextCharWasEscaped && ch < delimEscMap.length && (delimEscMap[ch] & section) != 0) {
          buf.push('\\');
        }
        buf.push(String.fromCharCode(ch));
      }
    }
    return buf.join("");
  }
  nextChar(section) {
    const c = this.nextOctet(section);
    if (c < 0) return -1;
    let c2, c3;
    switch (c >> 4)
    {
      case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
        return c;
      case 12: case 13:
        c2 = this.nextOctet(section);
        if ((c2 & 0xC0) != 0x80)
          throw ParseErr.make("Invalid UTF-8 encoding");
        return ((c & 0x1F) << 6) | (c2 & 0x3F);
      case 14:
        c2 = this.nextOctet(section);
        c3 = this.nextOctet(section);
        if (((c2 & 0xC0) != 0x80) || ((c3 & 0xC0) != 0x80))
          throw ParseErr.make("Invalid UTF-8 encoding");
        return (((c & 0x0F) << 12) | ((c2 & 0x3F) << 6) | ((c3 & 0x3F) << 0));
      default:
        throw ParseErr.make("Invalid UTF-8 encoding");
    }
  }
  nextOctet(section) {
    const c = this.str.charCodeAt(this.dpos++);
    if (c == 37)
    {
      this.nextCharWasEscaped = true;
      return (Uri.hexNibble(this.str.charCodeAt(this.dpos++)) << 4) | Uri.hexNibble(this.str.charCodeAt(this.dpos++));
    }
    else
    {
      this.nextCharWasEscaped = false;
    }
    if (c == 43 && section == fan.sys.Uri.QUERY)
      return 32
    if (c >= Uri.charMap.length || (Uri.charMap[c] & section) == 0)
      throw ParseErr.make("Invalid char in " + Uri.toSection(section) + " at index " + (this.dpos-1));
    return c;
  }
}
class UriEncoder {
  constructor(uri, encoding) {
    this.uri = uri;
    this.encoding = encoding;
    this.buf = '';
  }
  uri;
  encoding;
  buf;
  encode() {
    let uri = this.uri;
    if (uri.scheme() != null) this.buf += uri.scheme() + ':';
    if (uri.userInfo() != null || uri.host() != null || uri.port() != null) {
      this.buf += '/' + '/';
      if (uri.userInfo() != null) { this.doEncode(uri.userInfo(), Uri.USER); this.buf += '@'; }
      if (uri.host() != null) this.doEncode(uri.host(), Uri.HOST);
      if (uri.port() != null) this.buf += ':' + uri.port();
    }
    if (uri.pathStr() != null)
      this.doEncode(uri.pathStr(), Uri.PATH);
    if (uri.queryStr() != null)
      { this.buf += '?'; this.doEncode(uri.queryStr(), Uri.QUERY); }
    if (uri.frag() != null)
      { this.buf += '#'; this.doEncode(uri.frag(), Uri.FRAG); }
    return this.buf;
  }
  doEncode(s, section) {
    if (!this.encoding) { this.buf += s; return this.buf; }
    const len = s.length;
    let c = 0;
    let prev;
    for (let i=0; i<len; ++i) {
      prev = c;
      c = s.charCodeAt(i);
      if (c < 128 && (fan.sys.Uri.charMap[c] & section) != 0 && prev != 92) {
        this.buf += String.fromCharCode(c);
        continue;
      }
      if (c == 92 && prev != 92) continue;
      if (c == 32 && section == Uri.QUERY)
        this.buf += '+';
      else
        this.buf = UriEncoder.percentEncodeChar(this.buf, c);
      if (c == 92) c = 0;
    }
    return this.buf;
  }
  static percentEncodeChar = function(buf, c) {
    if (c <= 0x007F) {
      buf = UriEncoder.percentEncodeByte(buf, c);
    }
    else if (c > 0x07FF) {
      buf = UriEncoder.percentEncodeByte(buf, 0xE0 | ((c >> 12) & 0x0F));
      buf = UriEncoder.percentEncodeByte(buf, 0x80 | ((c >>  6) & 0x3F));
      buf = UriEncoder.percentEncodeByte(buf, 0x80 | ((c >>  0) & 0x3F));
    }
    else {
      buf = UriEncoder.percentEncodeByte(buf, 0xC0 | ((c >>  6) & 0x1F));
      buf = UriEncoder.percentEncodeByte(buf, 0x80 | ((c >>  0) & 0x3F));
    }
    return buf;
  }
  static percentEncodeByte(buf, c) {
    buf += '%';
    const hi = (c >> 4) & 0xf;
    const lo = c & 0xf;
    buf += (hi < 10 ? String.fromCharCode(48+hi) : String.fromCharCode(65+(hi-10)));
    buf += (lo < 10 ? String.fromCharCode(48+lo) : String.fromCharCode(65+(lo-10)));
    return buf;
  }
}
class Num extends Obj {
  constructor() { super(); }
  static toDecimal(val) { return Decimal.make(val.valueOf()); }
  static toFloat(val) { return Float.make(val.valueOf()); }
  static toInt(val) {
    if (isNaN(val)) return 0;
    if (val == Number.POSITIVE_INFINITY) return Int.maxVal;
    if (val == Number.NEGATIVE_INFINITY) return Int.minVal;
    if (val < 0) return Math.ceil(val);
    return Math.floor(val);
  }
  static localeDecimal() { return Locale.cur().numSymbols$().decimal; }
  static localeGrouping() { return Locale.cur().numSymbols$().grouping; }
  static localeMinus() { return Locale.cur().numSymbols$().minus; }
  static localePercent() { return Locale.cur().numSymbols$().percent; }
  static localePosInf() { return Locale.cur().numSymbols$().posInf; }
  static localeNegInf() { return Locale.cur().numSymbols$().negInf; }
  static localeNaN() { return Locale.cur().numSymbols$().nan; }
  static toLocale(p, d, locale) {
    var symbols = locale.numSymbols$();
    let s = "";
    if (d.negative) s += symbols.minus;
    d.round(p.maxFrac);
    let start = 0;
    if (p.optInt && d.zeroInt()) start = d.decimal;
    if (p.minFrac == 0 && d.zeroFrac(p.maxFrac)) d.truncateToWhole();
    for (let i=0; i<p.minInt-d.decimal; ++i) s += '0';
    let decimal = false;
    for (let i=start; i<d.size; ++i) {
      if (i < d.decimal) {
        if ((d.decimal - i) % p.group == 0 && i > 0)
          s += symbols.grouping;
      }
      else {
        if (i == d.decimal && p.maxFrac > 0) {
          s += symbols.decimal;
          decimal = true;
        }
        if (i-d.decimal >= p.maxFrac) break;
      }
      s += String.fromCharCode(d.digits[i]);
    }
    for (let i=0; i<p.minFrac-d.fracSize(); ++i) {
      if (!decimal) { s += symbols.decimal; decimal = true; }
      s += '0';
    }
    if (s.length == 0) return "0";
    return s;
  }
}
class NumDigits extends Obj {
  constructor(digits, decimal, size, negative) {
    super();
    this.#digits = digits;
    this.#decimal = decimal;
    this.#size = size;
    this.#negative = negative;
  }
  #digits;
  #decimal;
  #size;
  #negative;
  get digits() { return this.#digits; }
  get decimal() { return this.#decimal; }
  get size() { return this.#size}
  get negative() { return this.#negative; }
  static makeStr(s) {
    const digits = [];
    let decimal = -99;
    let size = 0;
    let negative = false;
    let expPos = -1;
    for (let i=0; i<s.length; ++i) {
      const c = s.charCodeAt(i);
      if (c == 45) { negative = true; continue; }
      if (c == 46) { decimal = negative ? i-1 : i; continue; }
      if (c == 101 || c == 69) { expPos = i; break; }
      digits.push(c); size++;
    }
    if (decimal < 0) decimal = size;
    if (expPos >= 0) {
      const exp = parseInt(s.substring(expPos+1), 10);
      decimal += exp;
      if (decimal >= size) {
        while(size <= decimal) digits[size++] = 48;
      }
      else if (decimal < 0) {
        for (let i=0; i<-decimal; ++i) digits.unshift(48);
        size += -decimal;
        decimal = 0;
      }
    }
    return new NumDigits(digits, decimal, size, negative);
  }
  static makeLong(l) {
    const digits = [];
    let negative = false;
    if (l < 0) { negative = true; l = -l; }
    let s = l.toString();
    if (s.charAt(0) === '-') s = "9223372036854775808";
    for (let i=0; i<s.length; i++) digits.push(s.charCodeAt(i));
    return new NumDigits(digits, digits.length, digits.length, negative);
  }
  truncateToWhole() { this.#size = this.#decimal; }
  intSize() { return this.#decimal; }
  fracSize() { return this.#size - this.#decimal; }
  zeroInt() {
    for (let i=0; i<this.#decimal; ++i) if (this.#digits[i] != 48) return false;
    return true;
  }
  zeroFrac(maxFrac) {
    let until = this.#decimal + maxFrac;
    for (var i=this.#decimal; i<until; ++i) if (this.#digits[i] != 48) return false;
    return true;
  }
  round(maxFrac) {
    if (this.fracSize() <= maxFrac) return;
    if (this.#digits[this.#decimal+maxFrac] >= 53)
    {
      let i = this.#decimal + maxFrac - 1;
      while (true) {
        if (this.#digits[i] < 57) { this.#digits[i]++; break; }
        this.#digits[i--] = 48;
        if (i < 0) {
          this.#digits.unshift(49);
          this.#size++; this.#decimal++;
          break;
        }
      }
    }
    this.#size = this.#decimal + maxFrac;
    while (this.#digits[this.#size-1] == 48 && this.#size > this.#decimal) this.#size--;
  }
  toString() {
    let s = "";
    for (let i=0; i<this.#digits.length; i++) s += String.fromCharCode(this.#digits[i]);
    return s + " neg=" + this.#negative + " decimal=" + this.#decimal;
  }
}
class NumPattern extends Obj {
  constructor(pattern, group, optInt, minInt, minFrac, maxFrac) {
    super();
    this.#pattern = pattern;
    this.#group = group;
    this.#optInt = optInt;
    this.#minInt = minInt;
    this.#minFrac = minFrac;
    this.#maxFrac = maxFrac;
  }
  static #cache = {};
  #pattern;
  #group;
  #optInt;
  #minInt;
  #minFrac;
  #maxFrac;
  get pattern() { return this.#pattern; }
  get group() { return this.#group; }
  get optInt() { return this.#optInt; }
  get minInt() { return this.#minInt; }
  get minFrac() { return this.#minFrac; }
  get maxFrac() { return this.#maxFrac; }
  static parse(s) {
    const x = fan.sys.NumPattern.cache$[s];
    if (x != null) return x;
    return NumPattern.make(s);
  }
  static make(s) {
    let group = Int.maxVal;
    let optInt = true;
    let comma = false;
    let decimal = false;
    let minInt = 0, minFrac = 0, maxFrac = 0;
    let last = 0;
    for (let i=0; i<s.length; ++i)
    {
      const c = s.charAt(i);
      switch (c)
      {
        case ',':
          comma = true;
          group = 0;
          break;
        case '0':
          if (decimal)
            { minFrac++; maxFrac++; }
          else
            { minInt++; if (comma) group++; }
          break;
        case '#':
          if (decimal)
            maxFrac++;
          else
            if (comma) group++;
          break;
        case '.':
          decimal = true;
          optInt  = last == '#';
          break;
      }
      last = c;
    }
    if (!decimal) optInt = last == '#';
    return new NumPattern(s, group, optInt, minInt, minFrac, maxFrac);
  }
  toString() {
    return this.#pattern + " group=" + this.#group + " minInt=" + this.#minInt +
      " maxFrac=" + this.#maxFrac + " minFrac=" + this.#minFrac + " optInt=" + this.#optInt;
  }
  static cache$(p) { NumPattern.#cache[p] = NumPattern.make(p); }
}
class Int extends Num {
  constructor() { super(); }
  make(val) { return val; }
  static #MAX_SAFE = 9007199254740991;
  static #MIN_SAFE = -9007199254740991;
  static maxVal() { return Math.pow(2, 53); }
  static minVal() { return -Math.pow(2, 53); }
  static defVal() { return 0; }
  static Chunk  = 4096;
  static fromStr(s, radix=10, checked=true) {
    try {
      if (radix === 10) { const n = Int.#parseDecimal(s); return n; }
      if (radix === 16) { const n = Int.#parseHex(s); return n; }
      throw new Error("Unsupported radix " + radix);
    }
    catch (err) {
      if (checked) throw ParseErr.make("Int", s, null, err);
      return null;
    }
  }
  static #parseDecimal(s) {
    let n = 0;
    if (s.charCodeAt(0) === 45) n++;
    for (let i=n; i<s.length; i++) {
      const ch = s.charCodeAt(i);
      if (ch >= 48 && ch <= 57) continue;
      throw new Error("Illegal decimal char " + s.charAt(i));
    }
    const x = parseInt(s, 10);
    if (isNaN(x)) throw new Error("Invalid number");
    return x;
  }
  static #parseHex(s) {
    for (let i=0; i<s.length; i++)
    {
      const ch = s.charCodeAt(i);
      if (ch >= 48 && ch <= 57) continue;
      if (ch >= 65 && ch <= 70) continue;
      if (ch >= 97 && ch <= 102) continue;
      throw new Error("Illegal hex char " + s.charAt(i));
    }
    const x = parseInt(s, 16);
    if (isNaN(x)) throw new Error("Invalid number");
    return x;
  }
  static random(r) {
    if (r === undefined) return Math.floor(Math.random() * Math.pow(2, 64));
    else
    {
      const start = r.start();
      const end   = r.end();
      if (r.inclusive()) ++end;
      if (end <= start) throw ArgErr.make("Range end < start: " + r);
      r = end-start;
      if (r < 0) r = -r;
      return Math.floor(Math.random()*r) + start;
    }
  }
  static toStr(self) { return self.toString(); }
  static equals(self, obj) { return self === obj; }
  static hash(self) { return self; }
  static negate(self) { return -self; }
  static increment(self) { return self+1; }
  static decrement(self) { return self-1; }
  static mult(a, b) { return a * b; }
  static multFloat(a, b) { return Float.make(a * b); }
  static multDecimal(a, b) { return Decimal.make(a * b); }
  static div(a, b) {
    const r = a / b;
    if (r < 0) return Math.ceil(r);
    return Math.floor(r);
  }
  static divFloat(a, b) { return Float.make(a / b); }
  static divDecimal(a, b) { return Decimal.make(Int.div(a, b)); }
  static mod(a, b) { return a % b; }
  static modFloat(a, b) { return Float.make(a % b); }
  static modDecimal(a, b) { return Decimal.make(a % b); }
  static plus(a, b) { return a + b; }
  static plusFloat(a, b) { return Float.make(a + b); }
  static plusDecimal(a, b) { return Decimal.make(a + b); }
  static minus(a, b) { return a - b; }
  static minusFloat(a, b) { return Float.make(a - b); }
  static minusDecimal(a, b) { return Decimal.make(a - b); }
static not(a) { return ~a; }
static and(a, b) { let x = a & b;  if (x<0) x += 0xffffffff+1; return x; }
static or(a, b) { let x = a | b;  if (x<0) x += 0xffffffff+1; return x; }
static xor(a, b) { let x = a ^ b;  if (x<0) x += 0xffffffff+1; return x; }
static shiftl(a, b) { let x = a << b; if (x<0) x += 0xffffffff+1; return x; }
static shiftr(a, b) { let x = a >>> b; if (x<0) x += 0xffffffff+1; return x; }
static shifta(a, b) { let x = a >> b; return x; }
  static abs(self)      { return self < 0 ? -self : self; }
  static min(self, val) { return self < val ? self : val; }
  static max(self, val) { return self > val ? self : val; }
  static clamp(self, min, max) {
    if (self < min) return min;
    if (self > max) return max;
    return self;
  }
  static clip(self, min, max) { return clamp(self, min, max); }
  static pow(self, pow) {
    if (pow < 0) throw ArgErr.make("pow < 0");
    return Math.pow(self, pow);
  }
  static isEven(self) { return self % 2 == 0; }
  static isOdd(self) { return self % 2 != 0; }
  static isSpace(self) { return self == 32 || self == 9 || self == 10 || self == 13; }
  static isAlpha(self) { return Int.isUpper(self) || Int.isLower(self); }
  static isAlphaNum(self) { return Int.isAlpha(self) || Int.isDigit(self); }
  static isUpper(self) { return self >= 65 && self <= 90; }
  static isLower(self) { return self >= 97 && self <= 122; }
  static upper(self) { return Int.isLower(self) ? self-32 : self; }
  static lower(self) { return Int.isUpper(self) ? self+32 : self; }
  static isDigit(self, radix=10) {
    if (radix == 10) return self >= 48 && self <= 57;
    if (radix == 16)
    {
      if (self >= 48 && self <= 57) return true;
      if (self >= 65 && self <= 70) return true;
      if (self >= 97 && self <= 102) return true;
      return false;
    }
    if (radix <= 10) return 48 <= self && self <= (48+radix);
    var x = self-10;
    if (97 <= self && self <= 97+x) return true;
    if (65 <= self && self <= 65+x) return true;
    return false;
  }
  static toDigit(self, radix=10) {
    if (radix == 10) return 0 <= self && self <= 9 ? 48+self : null;
    if (self < 0 || self >= radix) return null;
    if (self < 10) return 48+self;
    return self-10+97;
  }
  static fromDigit(self, radix=10) {
    if (self < 0 || self >= 128) return null;
    var ten = radix < 10 ? radix : 10;
    if (48 <= self && self < 48+ten) return self-48;
    if (radix > 10)
    {
      var alpha = radix-10;
      if (97 <= self && self < 97+alpha) return self+10-97;
      if (65 <= self && self < 65+alpha) return self+10-65;
    }
    return null;
  }
  static equalsIgnoreCase(self, ch) { return (self|0x20) == (ch|0x20); }
  static toLocale(self, pattern=null, locale=Locale.cur()) {
    if (pattern != null && pattern.length == 1 && pattern.charAt(0) == 'B')
      return Int.#toLocaleBytes(self);
    if (pattern == null)
      pattern = "#,###";
    const p = NumPattern.parse(pattern);
    const d = NumDigits.makeLong(self);
    return Num.toLocale(p, d, locale);
  }
  static #KB = 1024;
  static #MB = 1024*1024;
  static #GB = 1024*1024*1024;
  static #toLocaleBytes(b) {
    let KB = Int.#KB;
    let MB = Int.#MB;
    let GB = Int.#GB;
    if (b < KB)    return b + "B";
    if (b < 10*KB) return Float.toLocale(b/KB, "#.#") + "KB";
    if (b < MB)    return Math.round(b/KB) + "KB";
    if (b < 10*MB) return Float.toLocale(b/MB, "#.#") + "MB";
    if (b < GB)    return Math.round(b/MB) + "MB";
    if (b < 10*GB) return Float.toLocale(b/GB, "#.#") + "GB";
    return Math.round(b/fan.sys.Int.m_GB) + "GB";
  }
  static localeIsUpper(self) { return Int.isUpper(self); }
  static localeIsLower(self) { return Int.isLower(self); }
  static localeUpper(self) { return Int.upper(self); }
  static localeLower(self) { return Int.lower(self); }
  static toInt(val) { return val; }
  static toFloat(val) { return Float.make(val); }
  static toDecimal(val) { return Decimal.make(val); }
  static toChar(self) {
    if (self < 0 || self > 0xFFFF) throw Err.make("Invalid unicode char: " + self);
    return String.fromCharCode(self);
  }
  static toHex(self, width=null) {
    if (self == null) self = 0;
    let val = self;
    if (val < 0) val += Int.#MAX_SAFE;
    let s = "";
    while (true) {
      s = "0123456789abcdef".charAt(val % 16) + s;
      val = Math.floor(val / 16);
      if (val === 0) break
    }
    if (width != null && s.length < width) {
      const zeros = width - s.length;
      for (var i=0; i<zeros; ++i) s = '0' + s;
    }
    return s;
  }
  static toRadix(self, radix=10, width=null) {
    const s = self.toString(radix);
    if (width != null && s.length < width) {
      const zeros = width - s.length;
      for (var i=0; i<zeros; ++i) s = '0' + s;
    }
    return s;
  }
  static toCode(self, base=10) {
    if (base == 10) return self.toString();
    if (base == 16) return "0x" + Int.toHex(self);
    throw ArgErr.make("Invalid base " + base);
  }
  static toDuration(self) { return Duration.make(self); }
  static toDateTime(self, tz=TimeZone.cur()) {
    return (tz === undefined)
      ? DateTime.makeTicks(self)
      : DateTime.makeTicks(self, tz);
  }
  static times(self, f) {
    for (let i=0; i<self; ++i)
      f(i);
  }
  static charMap = [];
  static SPACE    = 0x01;
  static UPPER    = 0x02;
  static LOWER    = 0x04;
  static DIGIT    = 0x08;
  static HEX      = 0x10;
  static ALPHA    = Int.UPPER | Int.LOWER;
  static ALPHANUM = Int.UPPER | Int.LOWER | Int.DIGIT;
  static
  {
    Int.charMap[32] |= Int.SPACE;
    Int.charMap[10] |= Int.SPACE;
    Int.charMap[13] |= Int.SPACE;
    Int.charMap[9]  |= Int.SPACE;
    Int.charMap[12] |= Int.SPACE;
    for (let i=97; i<=122; ++i) Int.charMap[i] |= Int.LOWER;
    for (let i=65; i<=90;  ++i) Int.charMap[i] |= Int.UPPER;
    for (let i=48; i<=57; ++i) Int.charMap[i] |= Int.DIGIT;
    for (let i=48; i<=57;  ++i) Int.charMap[i] |= Int.HEX;
    for (let i=97; i<=102; ++i) Int.charMap[i] |= Int.HEX;
    for (let i=65; i<=70;  ++i) Int.charMap[i] |= Int.HEX;
  }
}
class Err extends Obj {
  constructor(msg = "", cause = null) {
    super();
    this.#err = new Error();
    this.#msg = msg;
    this.#cause = cause;
  }
  #err;
  #msg;
  #cause;
  static make(err, cause) {
    if (err instanceof Err) return err;
    if (err instanceof Error) {
      let m = err.message;
      if (m.indexOf(" from null") != -1)
        return NullErr.make(m, cause).assign$(err);
      if (m.indexOf(" of null") != -1)
        return NullErr.make(m, cause).assign$(err);
      return new Err(err.message, cause).assign$(err);
    }
    return new Err("" + err, cause);
  }
  static make$(self, msg, cause) {
    this.#err = new Error();
    self.#msg = msg;
    self.#cause = cause;
  }
  assign$(jsErr) {
    this.#err = jsErr;
    return this;
  }
  msg() {
    return this.#msg;
  }
  cause() {
    return this.#cause;
  }
  toStr() {
    return `${this.typeof$()}: ${this.#msg}`;
  }
  trace() {
    ObjUtil.echo(this.traceToStr());
  }
  traceToStr() {
    let s = this.typeof$() + ": " + this.#msg;
    if (this.#err.stack) s += "\n" + Err.cleanTrace(this.#err.stack);
    if (this.#cause)
    {
      if (this.#cause.stack) s += "\n  Caused by: " + Err.cleanTrace(this.#cause.stack);
    }
    return s;
  }
  static cleanTrace(orig) {
    let stack = [];
    let lines = orig.split("\n");
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (line.indexOf("@") != -1) {
        let about = line.lastIndexOf("@");
        let slash = line.lastIndexOf("/");
        if (slash != -1) {
          let func = "Unknown";
          let sub = "  at " + func + " (" + line.substr(slash + 1) + ")";
          stack.push(sub);
        }
      } else if (line.charAt(line.length - 1) == ")") {
        let paren = line.lastIndexOf("(");
        let slash = line.lastIndexOf("/");
        let sub = line.substring(0, paren + 1) + line.substr(slash + 1);
        stack.push(sub);
      } else {
        stack.push(line);
      }
    }
    return stack.join("\n") + "\n";
  }
}
class ArgErr extends Err {
  constructor(msg = "", cause = null) { super(msg, cause); }
  static make(msg="", cause=null) { return new ArgErr(msg, cause); }
}
class CancelledErr extends Err {
  constructor(msg = "", cause = null) { super(msg, cause); }
  static make(msg="", cause=null) { return new CancelledErr(msg, cause); }
}
class CastErr extends Err {
  constructor(msg = "", cause = null) { super(msg, cause); }
  static make(msg="", cause=null) { return new CastErr(msg, cause); }
}
class ConstErr extends Err {
  constructor(msg = "", cause = null) { super(msg, cause); }
  static make(msg="", cause=null) { return new ConstErr(msg, cause); }
}
class FieldNotSetErr extends Err {
  constructor(msg = "", cause = null) { super(msg, cause); }
  static make(msg="", cause=null) { return new FieldNotSetErr(msg, cause); }
}
class IndexErr extends Err {
  constructor(msg = "", cause = null) { super(msg, cause); }
  static make(msg="", cause=null) { return new IndexErr(msg, cause); }
}
class InterruptedErr extends Err {
  constructor(msg = "", cause = null) { super(msg, cause); }
  static make(msg="", cause=null) { return new InterruptedErr(msg, cause); }
}
class IOErr extends Err {
  constructor(msg = "", cause = null) { super(msg, cause); }
  static make(msg="", cause=null) { return new IOErr(msg, cause); }
}
class NameErr extends Err {
  constructor(msg = "", cause = null) { super(msg, cause); }
  static make(msg="", cause=null) { return new NameErr(msg, cause); }
}
class NotImmutableErr extends Err {
  constructor(msg = "", cause = null) { super(msg, cause); }
  static make(msg="", cause=null) { return new NotImmutableErr(msg, cause); }
}
class NullErr extends Err {
  constructor(msg = "", cause = null) { super(msg, cause); }
  static make(msg="", cause=null) { return new NullErr(msg, cause); }
}
class ParseErr extends Err {
  constructor(type, val, more, cause) {
    let msg = type;
    if (val != undefined) {
      msg = `Invalid ${type}: '${val}'`;
      if (more != undefined) msg += ": " + more;
    }
    super(msg, cause);
  }
  static make(msg="", cause=null) { return new ParseErr(msg, null, null, cause); }
  static makeStr(type, val, more, cause) { return new ParseErr(type, val, more, cause); }
}
class ReadonlyErr extends Err {
  constructor(msg = "", cause = null) { super(msg, cause); }
  static make(msg="", cause=null) { return new ReadonlyErr(msg, cause); }
}
class TestErr extends Err {
  constructor(msg = "", cause = null) { super(msg, cause); }
  static make(msg="", cause=null) { return new TestErr(msg, cause); }
}
class TimeoutErr extends Err {
  constructor(msg = "", cause = null) { super(msg, cause); }
  static make(msg="", cause=null) { return new TimeoutErr(msg, cause); }
}
class UnknownKeyErr extends Err {
  constructor(msg = "", cause = null) { super(msg, cause); }
  static make(msg="", cause=null) { return new UnknownKeyErr(msg, cause); }
}
class UnknownPodErr extends Err {
  constructor(msg = "", cause = null) { super(msg, cause); }
  static make(msg="", cause=null) { return new UnknownPodErr(msg, cause); }
}
class UnknownServiceErr extends Err {
  constructor(msg = "", cause = null) { super(msg, cause); }
  static make(msg="", cause=null) { return new UnknownServiceErr(msg, cause); }
}
class UnknownSlotErr extends Err {
  constructor(msg = "", cause = null) { super(msg, cause); }
  static make(msg="", cause=null) { return new UnknownSlotErr(msg, cause); }
}
class UnknownFacetErr extends Err {
  constructor(msg = "", cause = null) { super(msg, cause); }
  static make(msg="", cause=null) { return new UnknownFacetErr(msg, cause); }
}
class UnknownTypeErr extends Err {
  constructor(msg = "", cause = null) { super(msg, cause); }
  static make(msg="", cause=null) { return new UnknownTypeErr(msg, cause); }
}
class UnresolvedErr extends Err {
  constructor(msg = "", cause = null) { super(msg, cause); }
  static make(msg="", cause=null) { return new UnresolvedErr(msg, cause); }
}
class UnsupportedErr extends Err {
  constructor(msg = "", cause = null) { super(msg, cause); }
  static make(msg="", cause=null) { return new UnsupportedErr(msg, cause); }
}
class Unsafe extends Obj {
  constructor(val) {
    super();
    this.#val = val;
  }
  #val;
  static make(val) { return new Unsafe(val); }
  val() { return this.#val; }
}
class Pod extends Obj {
  constructor(name) {
    super();
    this.#name = name;
    this.#types = [];
    this.#meta = [];
    this.#version = Version.defVal;
    this.#uri = undefined;
    this.#depends = undefined;
    this.#$types = undefined;
    this.#log = undefined;
  }
  static #pods = [];
  static #list = null;
  static sysPod$ = undefined;
  #name;
  #types;
  #meta;
  #version;
  #uri;
  #depends;
  #$types;
  #log;
  static of(obj) {
    return Type.of(obj).pod();
  }
  static list() {
    if (Pod.#list == null) {
      let pods = Pod.#pods;
      let list = List.make(Pod.type$);
      for (let n in pods) list.add(pods[n]);
      Pod.#list = list.sort().toImmutable();
    }
    return Pod.#list;
  }
  static load(instream) {
    throw UnsupportedErr.make("Pod.load");
  }
  name$() { return this.#name; }
  meta() { return this.#meta; }
  version() { return this.#version; }
  uri() {
    if (this.#uri === undefined) this.#uri = Uri.fromStr(`fan://${this.#name}`);
    return this.#uri;
  }
  depends() {
    if (this.#depends === undefined) {
      let arr = [];
      let depends = this.meta().get("pod.depends").split(";");
      for (let i=0; i<depends.length; ++i) {
        let d = depends[i];
        if (d == "") continue;
        arr.push(Depend.fromStr(d));
      }
      this.#depends = List.make(Depend.type$, arr);
    }
    return this.#depends;
  }
  toStr() { return this.#name; }
  files() { throw UnsupportedErr.make("Pod.files"); }
  file(uri, checked) { throw UnsupportedErr.make("Pod.file"); }
  types() {
    if (this.#$types == null) {
      let arr = [];
      for (let p in this.#types) arr.push(this.#types[p]);
      this.#$types = List.make(Type.type$, arr);
    }
    return this.#$types;
  }
  type(name, checked=true) {
    let t = this.#types[name];
    if (t == null && checked) {
      throw UnknownTypeErr.make(`${this.#name}::${name}`);
    }
    return t;
  }
  locale(key, def) {
    return Env.cur().locale(this, key, def);
  }
  at$(name, baseQname, mixins, facets, flags, jsRef) {
    let qname = `${this.#name}::${name}`;
    if (this.#types[name] != null) {
      throw Err.make(`Type already exists: ${qname}`);
    }
    let t = new Type(qname, baseQname, mixins, facets, flags, jsRef);
    this.#types[name] = t;
    return t;
  }
  am$(name, baseQname, mixins, facets, flags, jsRef) {
    let t = this.at$(name, baseQname, mixins, facets, flags, jsRef);
    return t;
  }
  static find(name, checked=true) {
    let p = Pod.#pods[name];
    if (p == null && checked) {
      throw UnknownPodErr.make(name);
    }
    return p;
  }
  static add$(name) {
    if (Pod.#pods[name] != null) {
      throw Err.make(`Pod already exists: ${name}`);
    }
    let p = new Pod(name);
    Pod.#pods[name] = p;
    return p;
  }
  log() {
    if (this.#log == null) {
      this.#log = Log.get(this.#name);
    }
    return this.#log;
  }
}
class Void extends Obj {
  constructor() { super(); }
}
class Version extends Obj {
  constructor(segments) {
    super();
    this.#segments = segments.ro();
  }
  #segments;
  static fromStr(s, checked=true) {
    let segments = List.make(Int.type$);
    let seg = -1;
    let valid = true;
    let len = s.length;
    for (let i=0; i<len; ++i) {
      const c = s.charCodeAt(i);
      if (c == 46) {
        if (seg < 0 || i+1>=len) { valid = false; break; }
        segments.add(seg);
        seg = -1;
      }
      else {
        if (48 <= c && c <= 57) {
          if (seg < 0) seg = c-48;
          else seg = seg*10 + (c-48);
        }
        else {
          valid = false; break;
        }
      }
    }
    if (seg >= 0) segments.add(seg);
    if (!valid || segments.size == 0)
    {
      if (checked)
        throw ParseErr.makeStr("Version", s);
      else
        return null;
    }
    return new Version(segments);
  }
  static make(segments) {
    let valid = segments.size() > 0;
    for (let i=0; i<segments.size(); ++i)
      if (segments.get(i) < 0) valid = false;
    if (!valid) throw ArgErr.make("Invalid Version: '" + segments + "'");
    return new Version(segments);
  }
  static #defVal = undefined;
  static defVal() {
    if (Version.#defVal === undefined) Version.#defVal = Version.fromStr("0");
    return Version.#defVal;
  }
  equals(obj) {
    if (obj instanceof Version)
      return this.toStr() == obj.toStr();
    else
      return false;
  }
  compare(obj) {
    const that = obj;
    const a = this.#segments;
    const b = that.#segments;
    for (let i=0; i<a.size() && i<b.size(); ++i) {
      const ai = a.get(i);
      const bi = b.get(i);
      if (ai < bi) return -1;
      if (ai > bi) return +1;
    }
    if (a.size() < b.size()) return -1;
    if (a.size() > b.size()) return +1;
    return 0;
  }
  hash() { return Str.hash(this.toStr()); }
  toStr() {
    if (this.str$ == null) {
      let s = "";
      for (let i=0; i<this.#segments.size(); ++i)
      {
        if (i > 0) s += '.';
        s += this.#segments.get(i);
      }
      this.str$ = s;
    }
    return this.str$;
  }
  segments() { return this.#segments; }
  segment(index) { return this.#segments.get(index); }
  major() { return this.#segments.get(0); }
  minor() {
    if (this.#segments.size() < 2) return null;
    return this.#segments.get(1);
  }
  build() {
    if (this.#segments.size() < 3) return null;
    return this.#segments.get(2);
  }
  patch() {
    if (this.#segments.size() < 4) return null;
    return this.#segments.get(3);
  }
}
class Date extends Obj {
  constructor(year, month, day) {
    super();
    this.#year = year;
    this.#month = month;
    this.#day = day;
  }
  #year;
  #month;
  #day;
  equals(that) {
    if (that instanceof Date) {
      return this.#year.valueOf() == that.#year.valueOf() &&
            this.#month.valueOf() == that.#month.valueOf() &&
            this.#day.valueOf() == that.#day.valueOf();
    }
    return false;
  }
  compare(that) {
    if (this.#year.valueOf() == that.#year.valueOf()) {
      if (this.#month.valueOf() == that.#month.valueOf())
      {
        if (this.#day.valueOf() == that.#day.valueOf()) return 0;
        return this.#day < that.#day ? -1 : +1;
      }
      return this.#month < that.#month ? -1 : +1;
    }
    return this.#year < that.#year ? -1 : +1;
  }
  toIso() { return this.toStr(); }
  hash() { return (this.#year << 16) ^ (this.#month << 8) ^ this.#day; }
  toStr() {
    if (this.str$ == null) this.str$ = this.toLocale("YYYY-MM-DD");
    return this.str$;
  }
  year() { return this.#year; }
  month() { return Month.vals().get(this.#month); }
  day() { return this.#day; }
  weekday() {
    const weekday = (DateTime.firstWeekday(this.#year, this.#month) + this.#day - 1) % 7;
    return Weekday.vals().get(weekday);
  }
  dayOfYear() {
    return DateTime.dayOfYear(this.year(), this.month().ordinal$, this.day())+1;
  }
  weekOfYear(startOfWeek=Weekday.localeStartOfWeek()) {
    return DateTime.weekOfYear(this.year(), this.month().ordinal$, this.day(), startOfWeek);
  }
  plus(d) {
    let ticks = d.ticks();
    if (ticks % Duration.nsPerDay$ != 0)
      throw ArgErr.make("Duration must be even num of days");
    let year = this.#year;
    let month = this.#month;
    let day = this.#day;
    const numDays = Int.div(ticks, Duration.nsPerDay$);
    const dayIncr = numDays < 0 ? +1 : -1;
    while (numDays != 0) {
      if (numDays > 0) {
        day++;
        if (day > this.numDays(year, month)) {
          day = 1;
          month++;
          if (month >= 12) { month = 0; year++; }
        }
        numDays--;
      }
      else {
        day--;
        if (day <= 0) {
          month--;
          if (month < 0) { month = 11; year--; }
          day = this.numDays(year, month);
        }
        numDays++;
      }
    }
    return new Date(year, month, day);
  }
  minus(d) { this.plus(d.negate()); }
  minusDate(that) {
    if (this.equals(that)) return Duration.defVal();
    let a = this;
    let b = that;
    if (a.compare(b) > 0) { b = this; a = that; }
    let days = 0;
    if (a.#year == b.#year) {
      days = b.dayOfYear() - a.dayOfYear(); }
    else
    {
      days = (DateTime.isLeapYear(a.m_year) ? 366 : 365) - a.dayOfYear();
      days += b.dayOfYear();
      for (let i=a.#year+1; i<b.#year; ++i)
        days += DateTime.isLeapYear(i) ? 366 : 365;
    }
    if (a == this) days = -days;
    return Duration.make(days * Duration.nsPerDay$);
  }
  numDays(year, mon) {
    if (DateTime.isLeapYear(year))
      return DateTime.daysInMonLeap[mon];
    else
      return DateTime.daysInMon[mon];
  }
  firstOfMonth() {
    if (this.#day == 1) return this;
    return new Date(this.#year, this.#month, 1);
  }
  lastOfMonth() {
    const last = this.month().numDays(this.#year);
    if (this.#day == last) return this;
    return new Date(this.#year, this.#month, last);
  }
  toLocale(pattern=null, locale=Local.cur()) {
    if (pattern == null) {
      const pod = Pod.find("sys");
      pattern = Env.cur().locale(pod, "date", "D-MMM-YYYY", locale);
    }
    return DateTimeStr.makeDate(pattern, locale, this).format();
  }
  static fromLocale(s, pattern=null, checked=true) {
    return DateTimeStr.make(pattern, null).parseDate(s, checked);
  }
  static make(year, month, day) {
    return new Date(year, month.ordinal(), day);
  }
  static today(tz=TimeZone.cur()) {
    const d = new JsDate();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  static yesterday(tz=TimeZone.cur()) {
    return Date.today(tz).minus(Duration.oneDay$());
  }
  static tomorrow(tz=TimeZone.cur()) {
    return Date.today(tz).plus(Duration.oneDay$());
  }
  static fromStr(s, checked=true) {
    try {
      const num = function(x, index) { return x.charCodeAt(index) - 48; }
      const year  = num(s, 0)*1000 + num(s, 1)*100 + num(s, 2)*10 + num(s, 3);
      const month = num(s, 5)*10   + num(s, 6) - 1;
      const day   = num(s, 8)*10   + num(s, 9);
      if (s.charAt(4) != '-' || s.charAt(7) != '-' || s.length != 10)
        throw new Error();
      return new Date(year, month, day);
    }
    catch (err) {
      if (!checked) return null;
      throw ParseErr.makeStr("Date", s);
    }
  }
  static fromIso(s, checked=true) { return Date.fromStr(s, checked); }
  isYesterday() { return this.equals(Date.today().plus(Duration.negOneDay$())); }
  isToday() { return this.equals(Date.today()); }
  isTomorrow() { return this.equals(Date.today().plus(Duration.oneDay$())); }
  toDateTime(t, tz=TimeZone.cur()) {
    return DateTime.makeDT(this, t, tz);
  }
  midnight(tz=TimeZone.cur()) {
    return DateTime.makeDT(this, fan.sys.Time.defVal(), tz);
  }
  toCode() {
    if (this.equals(Date.defVal())) return "Date.defVal";
    return "Date(\"" + this.toString() + "\")";
  }
}
class Enum extends Obj {
  constructor() { super(); }
  #ordinal;
  #name;
  static make(ordinal, name) {
    throw new Error("this should never be used");
  }
  static make$(self, ordinal, name) {
    if (name == null) throw NullErr.make();
    self.#ordinal = ordinal;
    self.#name = name;
  }
  static doFromStr(t, vals, name, checked=true) {
    const slot = t.slot(name, false);
    if (slot != null && (slot.flags$() & FConst.Enum) != 0) {
      const v = vals.find((it) => { return it.name$() == name; });
      if (v != null) return v;
    }
    if (!checked) return null;
    throw ParseErr.makeStr(t.qname(), name);
  }
  equals(that) { return this == that; }
  compare(that) {
    if (this.#ordinal < that.#ordinal) return -1;
    if (this.#ordinal == that.#ordinal) return 0;
    return +1;
  }
  toStr() { return this.#name; }
  ordinal() { return this.#ordinal; }
  name$() { return this.#name; }
}
class Endian extends Enum {
  constructor(ordinal, name) {
    super();
    Enum.make$(this, ordinal, name);
  }
  static big() { return Endian.vals().get(0); }
  static little() { return Endian.vals().get(1); }
  static #vals = undefined;
  static vals() {
    if (Endian.#vals === undefined) {
      Endian.#vals = List.make(Endian.type$,
        [new Endian(0, "big"), new Endian(1, "little")]).toImmutable();
    }
    return Endian.#vals;
  }
  static fromStr(name, checked=true) {
    return Enum.doFromStr(Endian.type$, Endian.vals(), name, checked);
  }
}
class Test extends Obj {
  constructor() {
    super();
    this.#verifyCount = 0;
  }
  #verifyCount;
  static make$(self) { }
  verifyCount$() { return this.#verifyCount; }
  verify(cond, msg=null) {
    if (!cond) this.fail(msg);
    this.#verifyCount++;
  }
  verifyTrue(cond, msg=null) {
    return this.verify(cond, msg);
  }
  verifyFalse(cond, msg=null) {
    if (cond) this.fail(msg);
    this.#verifyCount++;
  }
  verifyNull(a, msg=null) {
    if (a != null) {
      if (msg == null) msg = ObjUtil.toStr(a) + " is not null";
      this.fail(msg);
    }
    this.#verifyCount++;
  }
  verifyNotNull(a, msg=null) {
    if (a == null) {
      if (msg == null) msg = ObjUtil.toStr(a) + " is null";
      this.fail(msg);
    }
    this.#verifyCount++;
  }
  verifyEq(expected, actual, msg=null) {
    if (!ObjUtil.equals(expected, actual)) {
      if (msg == null) msg = ObjUtil.toStr(expected) + " != " + ObjUtil.toStr(actual);
      this.fail(msg);
    }
    this.#verifyCount++;
  }
  verifyNotEq(expected, actual, msg=null)
  {
    if (ObjUtil.equals(expected, actual)) {
      if (msg == null) msg = ObjUtil.toStr(expected) + " == " + ObjUtil.toStr(actual);
      this.fail(msg);
    }
    this.#verifyCount++;
  }
  verifySame(expected, actual, msg=null) {
    if (!ObjUtil.equals(expected, actual)) {
      if (msg == null) msg = ObjUtil.toStr(expected) + " [" + expected.typeof$() + "] != " + ObjUtil.toStr(actual) + " [" + actual.typeof$() + "]";
      this.fail(msg);
    }
    this.#verifyCount++;
  }
  verifyNotSame(expected, actual, msg=null) {
    if (ObjUtil.equals(expected, actual)) {
      if (msg == null) msg = ObjUtil.toStr(expected) + " === " + ObjUtil.toStr(actual);
      this.fail(msg);
    }
    this.#verifyCount++;
  }
  verifyType(obj, t) {
    this.verifyEq(Type.of(obj), t);
  }
  verifyErr(errType, func) {
    try
    {
      func();
    }
    catch (err)
    {
      const e = Err.make(err);
      if (e.typeof$() == errType || errType == null) { this.#verifyCount++; return; }
      console.log("  verifyErr: " + e + "\n");
      this.fail(e.typeof$() + " thrown, expected " + errType);
    }
    this.fail("No err thrown, expected " + errType);
  }
  verifyErrMsg(errType, errMsg, func) {
    try
    {
      func();
    }
    catch (err)
    {
      const e = fan.sys.Err.make(err);
      if (e.typeof$() != errType) {
        print("  verifyErrMsg: " + e + "\n");
        this.fail(e.typeof$() + " thrown, expected " + errType);
      }
      this.#verifyCount++;
      this.verifyEq(errMsg, e.msg());
      return;
    }
    this.fail("No err thrown, expected " + errType);
  }
  fail(msg=null) {
    throw this.#err(msg);
  }
  #err(msg=null) {
    if (msg == null)
      return Err.make("Test failed");
    else
      return Err.make("Test failed: " + msg);
  }
  setup() {}
  teardown() {}
  tempDir() {
    throw Err.make("TODO:FIXIT");
  }
}
class Duration extends Obj {
  constructor(ticks) {
    super();
    this.#ticks = ticks;
  }
  static defVal() { return new Duration(0); }
  #ticks;
  static boot$ = undefined;
  static nsPerYear$  = 365*24*60*60*1000000000;
  static nsPerDay$   = 86400000000000;
  static nsPerHr$    = 3600000000000;
  static nsPerMin$   = 60000000000;
  static nsPerSec$   = 1000000000;
  static nsPerMilli$ = 1000000;
  static secPerDay$  = 86400;
  static secPerHr$   = 3600;
  static secPerMin$  = 60;
  static minVal$() { return new Duration(Int.minVal()); }
  static maxVal$() { return new Duration(Int.maxVal()); }
  static oneDay$() { return new Duration(Duration.nsPerDay$); }
  static oneMin$() { return new Duration(Duration.nsPerMin$); }
  static oneSec$() { return new Duration(Duration.nsPerSec$); }
  static negOneDay$() { return new Duration(-Duration.nsPerDay$); }
  static fromStr(s, checked=true) {
    try
    {
      const len = s.length;
      const x1  = s.charAt(len-1);
      const x2  = s.charAt(len-2);
      const x3  = s.charAt(len-3);
      const dot = s.indexOf('.') > 0;
      let mult = -1;
      let suffixLen  = -1;
      switch (x1)
      {
        case 's':
          if (x2 == 'n') { mult=1; suffixLen=2; }
          if (x2 == 'm') { mult=1000000; suffixLen=2; }
          break;
        case 'c':
          if (x2 == 'e' && x3 == 's') { mult=1000000000; suffixLen=3; }
          break;
        case 'n':
          if (x2 == 'i' && x3 == 'm') { mult=60000000000; suffixLen=3; }
          break;
        case 'r':
          if (x2 == 'h') { mult=3600000000000; suffixLen=2; }
          break;
        case 'y':
          if (x2 == 'a' && x3 == 'd') { mult=86400000000000; suffixLen=3; }
          break;
      }
      if (mult < 0) throw new Error();
      s = s.substring(0, len-suffixLen);
      if (dot) {
        const num = parseFloat(s);
        if (isNaN(num)) throw new Error();
        return Duration.make(Math.floor(num*mult));
      }
      else {
        const num = Int.fromStr(s);
        return Duration.make(num*mult);
      }
    }
    catch (err) {
      if (!checked) return null;
      throw ParseErr.makeStr("Duration", s);
    }
  }
  static now() {
    const ms = new es6.JsDate().getTime();
    return Duration.make(ms * Duration.nsPerMilli$);
  }
  static nowTicks() { return Duration.now().ticks(); }
  static boot() { return Duration.boot$; }
  static uptime() { return Duration.now().minus(Duration.boot()); }
  static make(ticks) { return new Duration(ticks); }
  static makeMillis(ms) { return Duration.make(ms*1000000); }
  static makeSec(secs) { return Duration.make(secs*1000000000); }
  equals(that) {
    if (that instanceof Duration)
      return this.#ticks == that.#ticks;
    else
      return false;
  }
  compare(that) {
    if (this.#ticks < that.#ticks) return -1;
    if (this.#ticks == that.#ticks) return 0;
    return +1;
  }
  hash() { return (this.#ticks ^ (this.#ticks >> 32)); }
  ticks() { return this.#ticks; }
  negate() { return Duration.make(-this.#ticks); }
  plus(x) { return Duration.make(this.#ticks + x.#ticks); }
  minus(x) { return Duration.make(this.#ticks - x.#ticks); }
  mult(x) { return Duration.make(this.#ticks * x); }
  multFloat(x) { return Duration.make(this.#ticks * x); }
  div(x) { return Duration.make(this.#ticks / x); }
  divFloat(x) { return Duration.make(this.#ticks / x); }
  floor(accuracy) {
    if (this.#ticks % accuracy.#ticks == 0) return this;
    return Duration.make(this.#ticks - (this.#ticks % accuracy.#ticks));
  }
  min(that) {
    if (this.#ticks <= that.#ticks) return this;
    else return that;
  }
  max(that) {
    if (this.#ticks >= that.#ticks) return this;
    else return that;
  }
  clamp(min, max) {
    if (this.#ticks < min.#ticks) return min;
    if (this.#ticks > max.#ticks) return max;
    return this;
  }
  abs() {
    if (this.#ticks >= 0) return this;
    return Duration.make(-this.#ticks);
  }
  toStr() {
    if (this.#ticks == 0) return "0ns";
    const ns = this.#ticks;
    if (ns % Duration.nsPerMilli$ == 0)
    {
      if (ns % Duration.nsPerDay$ == 0) return ns/Duration.nsPerDay$ + "day";
      if (ns % Duration.nsPerHr$  == 0) return ns/Duration.nsPerHr$  + "hr";
      if (ns % Duration.nsPerMin$ == 0) return ns/Duration.nsPerMin$ + "min";
      if (ns % Duration.nsPerSec$ == 0) return ns/Duration.nsPerSec$ + "sec";
      return ns/Duration.nsPerMilli$ + "ms";
    }
    return ns + "ns";
  }
  literalEncode$(out) { out.w(this.toStr()); }
  toCode() { return this.toStr(); }
  toMillis() { return Math.floor(this.#ticks / Duration.nsPerMilli$); }
  toSec() { return Math.floor(this.#ticks / Duration.nsPerSec$); }
  toMin() { return Math.floor(this.#ticks / Duration.nsPerMin$); }
  toHour() { return Math.floor(this.#ticks / Duration.nsPerHr$); }
  toDay() { return Math.floor(this.#ticks / Duration.nsPerDay$); }
  toLocale() {
    let ticks = this.#ticks;
    const pod = Duration.type$.pod();
    const env = Env.cur();
    const locale = Locale.cur();
    if (ticks < 0) return "-" + Duration.make(-ticks).toLocale();
    if (ticks < 1000) return ticks + env.locale(pod, "nsAbbr", "ns",  locale);
    if (ticks < 2*Duration.nsPerMilli$) {
      let s = '';
      const ms = Math.floor(ticks/Duration.nsPerMilli$);
      const us = Math.floor((ticks - ms*Duration.nsPerMilli$)/1000);
      s += ms;
      s += '.';
      if (us < 100) s += '0';
      if (us < 10)  s += '0';
      s += us;
      if (s.charAt(s.length-1) == '0') s = s.substring(0, s.length-1);
      if (s.charAt(s.length-1) == '0') s = s.substring(0, s.length-1);
      s += env.locale(pod, "msAbbr", "ms",  locale);;
      return s;
    }
    if (ticks < 2*Duration.nsPerSec$)
      return Math.floor(ticks/Duration.nsPerMilli$) + env.locale(pod, "msAbbr", "ms",  locale);
    if (ticks < 1*Duration.nsPerMin$)
      return Math.floor(ticks/Duration.nsPerSec$) + env.locale(pod, "secAbbr", "sec",  locale);
    const days = Math.floor(ticks/Duration.nsPerDay$); ticks -= days*Duration.nsPerDay$;
    const hr   = Math.floor(ticks/Duration.nsPerHr$);  ticks -= hr*Duration.nsPerHr$;
    const min  = Math.floor(ticks/Duration.nsPerMin$); ticks -= min*Duration.nsPerMin$;
    const sec  = Math.floor(ticks/Duration.nsPerSec$);
    let s = '';
    if (days > 0) s += days + (days == 1 ? env.locale(pod, "dayAbbr", "day", locale) : env.locale(pod, "daysAbbr", "days", locale)) + " ";
    if (hr  > 0) s += hr  + env.locale(pod, "hourAbbr", "hr",  locale) + " ";
    if (min > 0) s += min + env.locale(pod, "minAbbr",  "min", locale) + " ";
    if (sec > 0) s += sec + env.locale(pod, "secAbbr",  "sec", locale) + " ";
    return s.substring(0, s.length-1);
  }
  toIso() {
    let s = '';
    let ticks = this.#ticks;
    if (ticks == 0) return "PT0S";
    if (ticks < 0) s += '-';
    s += 'P';
    const abs  = Math.abs(ticks);
    let sec  = Math.floor(abs / Duration.nsPerSec$);
    const frac = abs % Duration.nsPerSec$;
    if (sec > Duration.secPerDay$) {
      s += Math.floor(sec/Duration.secPerDay$) + 'D';
      sec = sec % Duration.secPerDay$;
    }
    if (sec == 0 && frac == 0) return s;
    s += 'T';
    if (sec > Duration.secPerHr$) {
      s += Math.floor(sec/Duration.secPerHr$) + 'H';
      sec = sec % Duration.secPerHr$;
    }
    if (sec > Duration.secPerMin$) {
      s += Math.floor(sec/Duration.secPerMin$) + 'M';
      sec = sec % Duration.secPerMin$;
    }
    if (sec == 0 && frac == 0) return s;
    s += sec;
    if (frac != 0) {
      s += '.';
      for (let i=10; i<=100000000; i*=10) if (frac < i) s += '0';
      s += frac;
      let x = s.length-1;
      while (s.charAt(x) == '0') x--;
      s = s.substring(0, x+1);
    }
    s += 'S';
    return s;
  }
  static fromIso(s, checked=true)
  {
    try
    {
      let ticks = 0;
      let neg = false;
      const p = new IsoParser(s);
      if (p.cur == 45) { neg = true; p.consume(); }
      else if (p.cur == 43) { p.consume(); }
      p.consume(80);
      if (p.cur == -1) throw new Error();
      let num = 0;
      if (p.cur != 84) {
        num = p.num();
        p.consume(68);
        ticks += num * Duration.nsPerDay$;
        if (p.cur == -1) return Duration.make(ticks);
      }
      p.consume(84);
      if (p.cur == -1) throw new Error();
      num = p.num();
      if (num >= 0 && p.cur == 72) {
        p.consume();
        ticks += num * Duration.nsPerHr$;
        num = p.num();
      }
      if (num >= 0 && p.cur == 77) {
        p.consume();
        ticks += num * Duration.nsPerMin$;
        num = p.num();
      }
      if (num >= 0 && p.cur == 83 || p.cur == 46) {
        ticks += num * Duration.nsPerSec$;
        if (p.cur == 46) { p.consume(); ticks += p.frac(); }
        p.consume(83);
      }
      if (p.cur != -1) throw new Error();
      if (neg) ticks = -ticks;
      return Duration.make(ticks);
    }
    catch (err) {
      if (!checked) return null;
      throw ParseErr.makeStr("ISO 8601 Duration",  s);
    }
  }
}
class IsoParser {
  constructor(s) {
    this.s = s;
    this.cur = s.charCodeAt(0);
    this.off = 0;
    this.curIsDigit = false;
  }
  s;
  cur;
  off;
  curIsDigit;
  num() {
    if (!this.curIsDigit && this.cur != -1 && this.cur != 46)
      throw new Error();
    let num = 0;
    while (this.curIsDigit) {
      num = num*10 + this.digit();
      this.consume();
    }
    return num;
  }
  frac() {
    let ticks = 0;
    for (let i=100000000; i>=0; i/=10)
    {
      if (!this.curIsDigit) break;
      ticks += this.digit() * i;
      this.consume();
    }
    return ticks;
  }
  digit() { return this.cur - 48; }
  consume(ch) {
    if (ch != null && this.cur != ch) throw new Error();
    this.off++;
    if (this.off < this.s.length) {
      this.cur = this.s.charCodeAt(this.off);
      this.curIsDigit = 48 <= this.cur && this.cur <= 57;
    }
    else
    {
      this.cur = -1;
      this.curIsDigit = false;
    }
  }
}
class Decimal extends Num {
  constructor() { super(); }
  static make(val) {
    const x = new Number(val);
    x.fanType$ = Decimal.type$;
    return x;
  }
  static fromStr(s, checked=true) {
    try
    {
      for (let i=0; i<s.length; i++)
        if (!Int.isDigit(s.charCodeAt(i)) && s[i] !== '.')
          throw new Error();
      return Decimal.make(parseFloat(s));
    }
    catch (e)
    {
      if (!checked) return null;
      throw ParseErr.make("Decimal",  s);
    }
  }
  static toFloat(self) { return Float.make(self.valueOf()); }
  static negate(self) { return Decimal.make(-self.valueOf()); }
  static equals(self, that) {
    if (that != null && self.fanType$ === that.fanType$)
    {
      if (isNaN(self) || isNaN(that)) return false;
      return self.valueOf() == that.valueOf();
    }
    return false;
  }
  static hash(self) { Str.hash(self.toString()); }
  static encode(self, out) { out.w(""+self).w("d"); }
  static toCode(self) { return "" + self + "d"; }
  static toLocale(self, pattern=null, locale=Local.cur()) {
    return Float.toLocale(self, pattern, locale);
  }
  static toStr(self) { return Float.toStr(self); }
}
class Locale extends Obj {
  constructor(str, lang, country) {
    super();
    this.#str = str;
    this.#lang = lang;
    this.#country = country;
    this.#strProps = Uri.fromStr(`locale/${str}.props`);
    this.#langProps = Uri.fromStr(`locale/${lange}.props`);
  }
  static #cur = undefined;
  static #en = undefined;
  #str;
  #lang;
  #country;
  #strProps;
  #langProps;
  static fromStr(s, checked=true)
  {
    const len = s.length;
    try {
      if (len == 2) {
        if (Str.isLower(s))
          return new Locale(s, s, null);
      }
      if (len == 5) {
        const lang = s.substring(0, 2);
        const country = s.substring(3, 5);
        if (Str.isLower(lang) && Str.isUpper(country) && s.charAt(2) == '-')
          return new Locale(s, lang, country);
      }
    }
    catch (err) {}
    if (!checked) return null;
    throw ParseErr.makeStr("Locale", s);
  }
  static en() {
    if (Locale.#en === undefined) Locale.#en = Locale.fromStr("en");
    return Locale.#en;
  }
  static cur() {
    if (Locale.#cur === undefined) {
      let loc = Env.cur().vars().get("locale");
      if (loc == null) loc = "en-US"
      Locale.#cur = Locale.fromStr(loc);
    }
    return Locale.#cur;
  }
  static setCur(locale) {
    if (locale == null) throw NullErr.make();
    Locale.#cur = locale;
  }
  use(func) {
    const old = Locale.cur();
    try {
      Locale.setCur(this);
      func(this);
    }
    finally {
      Locale.setCur(old);
    }
    return this;
  }
  lang() { return this.#lang; }
  country() { return this.#country; }
  hash() { return Str.hash(this.#str); }
  equals(obj) {
    if (obj instanceof Locale)
      return obj.#str == this.#str;
    return false;
  }
  toStr() { return this.#str; }
  monthByName$(name)
  {
    if (this.monthsByName$ == null) {
      const map = {};
      for (let i=0; i<Month.vals().size(); ++i)
      {
        const m = Month.vals().get(i);
        map[Str.lower(m.abbr$(this))] = m;
        map[Str.lower(m.full$(this))] = m;
      }
      this.monthsByName$ = map;
    }
    return this.monthsByName$[name];
  }
  numSymbols$() {
    if (this.numSymbols$ == null) {
      const pod = Pod.find("sys");
      const env = Env.cur();
      this.numSymbols$ =
      {
        decimal:  env.locale(pod, "numDecimal",  ".",    this),
        grouping: env.locale(pod, "numGrouping", ",",    this),
        minus:    env.locale(pod, "numMinus",    "-" ,   this),
        percent:  env.locale(pod, "numPercent",  "%",    this),
        posInf:   env.locale(pod, "numPosInf",   "+Inf", this),
        negInf:   env.locale(pod, "numNegInf",   "-Inf", this),
        nan:      env.locale(pod, "numNaN",      "NaN",  this)
      };
    }
    return this.numSymbols$;
  }
}
class This extends Obj {
  constructor() { super(); }
}
class StrBuf extends Obj {
  constructor() {
    super();
    this.#str = "";
    this.#capacity = null;
  }
  #str;
  #capacity;
  static make() { return new StrBuf(); }
  add(obj) {
    this.#str += obj==null ? "null" : ObjUtil.toStr(obj);
    return this;
  }
  addChar(ch) {
    this.#str += String.fromCharCode(ch);
    return this;
  }
  capacity(it=undefined) {
    if (it === undefined) {
      if (this.#capacity == null) return this.#str.length;
      return this.#capacity;
    }
    this.#capacity = it;
  }
  clear() {
    this.#str = "";
    return this;
  }
  get(i) {
    if (i < 0) i = this.#str.length+i;
    if (i < 0 || i >= this.#str.length) throw IndexErr.make(i);
    return this.#str.charCodeAt(i);
  }
  getRange(range) {
    const size = this.#str.length;
    const s = range.start$(size);
    const e = range.end$(size);
    if (e+1 < s) throw IndexErr.make(range);
    return this.#str.substr(s, (e-s)+1);
  }
  set(i, ch) {
    if (i < 0) i = this.#str.length+i;
    if (i < 0 || i >= this.#str.length) throw IndexErr.make(i);
    this.#str = this.#str.substring(0,i) + String.fromCharCode(ch) + this.#str.substring(i+1);
    return this;
  }
  join(x, sep=" ") {
    const s = (x == null) ? "null" : ObjUtil.toStr(x);
    if (this.#str.length > 0) this.#str += sep;
    this.#str += s;
    return this;
  }
  insert(i, x) {
    const s = (x == null) ? "null" : ObjUtil.toStr(x);
    if (i < 0) i = this.#str.length+i;
    if (i < 0 || i > this.#str.length) throw IndexErr.make(i);
    this.#str = this.#str.substring(0,i) + s + this.#str.substring(i);
    return this;
  }
  remove(i) {
    if (i < 0) i = this.#str.length+i;
    if (i< 0 || i >= this.#str.length) throw IndexErr.make(i);
    this.#str = this.#str.substring(0,i) + this.#str.substring(i+1);
    return this;
  }
  removeRange(r) {
    const s = r.start$(this.#str.length);
    const e = r.end$(this.#str.length);
    const n = e - s + 1;
    if (s < 0 || n < 0) throw IndexErr.make(r);
    this.#str = this.#str.substring(0,s) + this.#str.substring(e+1);
    return this;
  }
  replaceRange(r, str) {
    const s = r.start$(this.#str.length);
    const e = r.end$(this.#str.length);
    const n = e - s + 1;
    if (s < 0 || n < 0) throw IndexErr.make(r);
    this.#str = this.#str.substr(0,s) + str + this.#str.substr(e+1);
    return this;
  }
  reverse() {
    this.#str = Str.reverse(this.#str);
    return this;
  }
  isEmpty() { return this.#str.length == 0; }
  size() { return this.#str.length; }
  toStr() { return this.#str; }
  out() { return new StrBufOutStream(this); }
}
class LogRec extends Obj {
  constructor(time, level, logName, msg, err=null) {
    super();
    this.time$ = time;
    this.level$ = level;
    this.logName$ = logName;
    this.msg$ = msg;
    this.err$ = err;
  }
  time$;
  level$;
  logName$;
  msg$;
  err$;
  static make(time, level, logName, msg, err=null) {
    return new LogRec(time, level, logName, msg, err);
  }
  time() { return this.time$; }
  level() { return this.level$; }
  logName() { return this.logName$; }
  msg() { return this.msg$; }
  err() { return this.err$; }
  toStr() {
    const ts = this.time$.toLocale("hh:mm:ss DD-MMM-YY");
    return '[' + ts + '] [' + this.level$ + '] [' + this.logName$ + '] ' + this.msg$;
  }
  print(out) {
    ObjUtil.echo(this.toStr());
    if (this.err$ != null) this.err$.trace();
  }
}
class Func extends Obj {
  constructor(params, ret, func) {
    super();
  }
  #params;
  #ret;
  #type;
  #func;
  typeof$() { return this.#type; }
  toImmutable() {
    if (this.isImmutable()) return this;
    throw NotImmutableErr.make("Func");
  }
  params() { return this.#params; }
  arity() { return this.#params.size(); }
  returns() { return this.#ret; }
  method() { return null; }
  call() { return this.#func.apply(null, arguments); }
  callList(args) { return this.#func.apply(null, args.values$()); }
  callOn(obj, args) { return this.#func.apply(obj, args.values$()); }
  enterCtor(obj) {}
  exitCtor() {}
  checkInCtor(obj) {}
  toStr() { return "sys::Func"; }
}
class Range extends Obj {
  constructor(start, end, exclusive) {
    super();
    this.#start = start;
    this.#end = end;
    this.#exclusive = (exclusive === undefined) ? false : exclusive;
  }
  #start;
  #end;
  #exclusive;
  static makeInclusive(start, end) { return new Range(start, end, false); }
  static makeExclusive(start, end) { return new Range(start, end, true); }
  static make(start, end, exclusive) { return new Range(start, end, exclusive); }
  static fromStr(s, checked=true) {
    try {
      const dot = s.indexOf('.');
      if (s.charAt(dot+1) != '.') throw new Error();
      const exclusive = s.charAt(dot+2) == '<';
      const start = Int.fromStr(s.substr(0, dot));
      const end   = Int.fromStr(s.substr(dot + (exclusive?3:2)));
      return new Range(start, end, exclusive);
    }
    catch (err) {
      if (!checked) return null;
      throw ParseErr.make("Range", s, null, err);
    }
  }
  start() { return this.#start; }
  end() { return this.#end; }
  inclusive() { return !this.#exclusive; }
  exclusive() { return this.#exclusive; }
  isEmpty() { return this.#exclusive && this.#start == this.#end; }
  min() {
    if (this.isEmpty()) return null;
    if (this.#end < this.#start) return this.#exclusive ? this.#end+1 : this.#end;
    return this.#start;
  }
  max() {
    if (this.isEmpty()) return null;
    if (this.#end < this.#start) return this.#start;
    return this.#exclusive ? this.#end-1 : this.#end;
  }
  first() {
    if (this.isEmpty()) return null;
    return this.#start;
  }
  last() {
    if (this.isEmpty()) return null;
    if (!this.#exclusive) return this.#end;
    if (this.#start < this.#end) return this.#end-1;
    return this.#end+1;
  }
  contains(i) {
    if (this.#start < this.#end) {
      if (this.#exclusive)
        return this.#start <= i && i < this.#end;
      else
        return this.#start <= i && i <= this.#end;
    }
    else {
      if (this.#exclusive)
        return this.#end < i && i <= this.#start;
      else
        return this.#end <= i && i <= this.#start;
    }
  }
  offset(offset) {
    if (offset == 0) return this;
    return Range.make(this.#start+offset, this.#end+offset, this.#exclusive);
  }
  each(func) {
    let start = this.#start;
    let end   = this.#end;
    if (start < end) {
      if (this.#exclusive) --end;
      for (let i=start; i<=end; ++i) func(i);
    }
    else {
      if (this.#exclusive) ++end;
      for (let i=start; i>=end; --i) func(i);
    }
  }
  eachWhile(func) {
    let start = this.#start;
    let end   = this.#end;
    let r = null
    if (start < end) {
      if (this.#exclusive) --end;
      for (let i=start; i<=end; ++i) {
        r = func(i);
        if (r != null) return r;
      }
    }
    else {
      if (this.#exclusive) ++end;
      for (let i=start; i>=end; --i) {
        r = func(i);
        if (r != null) return r;
      }
    }
    return null;
  }
  map(func) {
    let r = Obj.type$.toNullable();
    const acc = List.make(r);
    let start = this.#start;
    let end   = this.#end;
    if (start < end) {
      if (this.#exclusive) --end;
      for (let i=start; i<=end; ++i) acc.add(func(i));
    }
    else {
      if (this.#exclusive) ++end;
      for (let i=start; i>=end; --i) acc.add(func(i));
    }
    return acc;
  }
  toList() {
    let start = this.#start;
    let end = this.#end;
    const acc = List.make(Int.type$);
    if (start < end) {
      if (this.#exclusive) --end;
      for (let i=start; i<=end; ++i) acc.push(i);
    }
    else {
      if (this.#exclusive) ++end;
      for (let i=start; i>=end; --i) acc.push(i);
    }
    return acc;
  }
  random() { return Int.random(this); }
  equals(that) {
    if (that instanceof Range) {
      return this.#start == that.#start &&
            this.#end == that.#end &&
            this.#exclusive == that.#exclusive;
    }
    return false;
  }
  hash() { return (this.#start << 24) ^ this.#end; }
  toStr() {
    if (this.#exclusive)
      return this.#start + "..<" + this.#end;
    else
      return this.#start + ".." + this.#end;
  }
  start$(size) {
    if (size == null) return this.#start;
    let x = this.#start;
    if (x < 0) x = size + x;
    if (x > size) throw IndexErr.make(this);
    return x;
  }
  end$(size) {
    if (size == null) return this.#end;
    let x = this.#end;
    if (x < 0) x = size + x;
    if (this.#exclusive) x--;
    if (x >= size) throw IndexErr.make(this);
    return x;
  }
}
class Log extends Obj {
  constructor(name, level, register) {
    super();
    Uri.checkName(name);
    this.#name = name;
    this.#level = level;
    if (register) {
      if (Log.#byName[name] != null)
        throw ArgErr.make("Duplicate log name: " + name);
      Log.#byName[name] = this;
    }
  }
  #name;
  #level;
  static #byName = [];
  static #handlers = [];
  static list() {
    return List.make(Log.type$, Log.#byName).ro();
  }
  static find(name, checked=true) {
    const log = Log.#byName[name];
    if (log != null) return log;
    if (checked) throw Err.make("Unknown log: " + name);
    return null;
  }
  static get(name) {
    const log = Log.#byName[name];
    if (log != null) return log;
    return Log.make(name, true);
  }
  static make(name, register) {
    return new Log(name, LogLevel.info(), register);
  }
  toStr() { return this.#name; }
  name$() { return this.#name; }
  level(it=undefined) {
    if (it === undefined) return this.#level;
    if (level == null) throw ArgErr.make("level cannot be null");
    this.#level = it;
  }
  enabled(level) { return this.#level.ordinal() <= level.ordinal(); }
  isEnabled(level) { return this.enabled(level); }
  isErr()   { return this.isEnabled(LogLevel.err()); }
  isWarn()  { return this.isEnabled(LogLevel.warn()); }
  isInfo()  { return this.isEnabled(LogLevel.info()); }
  isDebug() { return this.isEnabled(LogLevel.debug()); }
  err(msg, err=null)
  {
    this.log(LogRec.make(DateTime.now(), LogLevel.err(), this.#name, msg, err));
  }
  warn(msg, err=null)
  {
    this.log(LogRec.make(DateTime.now(), LogLevel.warn(), this.#name, msg, err));
  }
  info(msg, err=null)
  {
    this.log(LogRec.make(DateTime.now(), LogLevel.info(), this.#name, msg, err));
  }
  debug(msg, err=null)
  {
    this.log(LogRec.make(DateTime.now(), LogLevel.debug(), this.#name, msg, err));
  }
  log(rec) {
    if (!this.enabled(rec.level())) return;
    for (let i=0; i<Log.#handlers.length; ++i) {
      try { Log.#handlers[i](rec); }
      catch (e) { Err.make(e).trace(); }
    }
  }
  static handlers() { return List.make(Func.type$, Log.#handlers).ro(); }
  static addHandler(func) {
    Log.#handlers.push(func);
  }
  static removeHandler(func) {
    let index = null;
    for (let i=0; i<Log.#handlers.length; i++)
      if (Log.#handlers[i] == func) { index=i; break }
    if (index == null) return;
    Log.#handlers.splice(index, 1);
  }
}
class Weekday extends Enum {
  constructor(ordinal, name) {
    super();
    Enum.make$(this, ordinal, name);
    this.#localeAbbrKey = name + "Abbr";
    this.#localeFullKey = name + "Full";
  }
  #localeAbbrKey;
  #localeFullKey;
  static sun() { return Weekday.vals().get(0); }
  static mon() { return Weekday.vals().get(1); }
  static tue() { return Weekday.vals().get(2); }
  static wed() { return Weekday.vals().get(3); }
  static thu() { return Weekday.vals().get(4); }
  static fri() { return Weekday.vals().get(5); }
  static sat() { return Weekday.vals().get(6); }
  static #vals = undefined;
  static vals() {
    if (Weekday.#vals === undefined) {
      Weekday.#vals = List.make(Weekday.type$,
        [new Weekday(0, "sun"), new Weekday(1, "mon"), new Weekday(2, "tue"),
         new Weekday(3, "wed"), new Weekday(4, "thu"), new Weekday(5, "fri"),
         new Weekday(6, "sat")]).toImmutable();
    }
    return Weekday.#vals;
  }
  static #localeVals = [];
  static fromStr(name, checked=true) {
    return Enum.doFromStr(Weekday.type$, Weekday.vals(), name, checked);
  }
  increment() { return Weekday.vals().get((this.ordinal()+1) % 7); }
  decrement() {
    const arr = Weekday.vals();
    return this.ordinal() == 0 ? arr.get(6) : arr.get(this.ordinal()-1);
  }
  toLocale(pattern=null, locale=Locale.cur()) {
    if (pattern == null) return this.#abbr(locale);
    if (Str.isEveryChar(pattern, 87))
    {
      switch (pattern.length)
      {
        case 3: return this.#abbr(locale);
        case 4: return this.#full(locale);
      }
    }
    throw ArgErr.make("Invalid pattern: " + pattern);
  }
  localeAbbr() { return this.#abbr(Locale.cur()); }
  #abbr(locale) {
    const pod = Pod.find("sys");
    return Env.cur().locale(pod, this.#localeAbbrKey, this.name$(), locale);
  }
  localeFull() { return this.#full(Locale.cur()); }
  #full(locale) {
    const pod = Pod.find("sys");
    return Env.cur().locale(pod, this.#localeFullKey, this.name$(), locale);
  }
  static localeStartOfWeek() {
    const locale = Locale.cur();
    const pod = Pod.find("sys");
    return Weekday.fromStr(Env.cur().locale(pod, "weekdayStart", "sun", locale));
  }
  static localeVals() {
    const start = Weekday.localeStartOfWeek();
    let list = Weekday.#localeVals[start.ordinal()];
    if (list == null) {
      list = List.make(Weekday.type$);
      for (let i=0; i<7; ++i)
        list.add(Weekday.vals().get((i + start.ordinal()) % 7));
      Weekday.#localeVals[start.ordinal()] = list.toImmutable();
    }
    return list;
  }
}
class Buf extends Obj {
  constructor() { super(); }
}
class ConstBuf extends Buf {
  constructor() {
    super();
  }
  isImmutable() { return true; }
  toImmutable() { return this; }
}
class Charset extends Obj {
  constructor(name, encoder) {
    super();
    this.#name = name;
    this.#encoder = encoder;
  }
  #name;
  #encoder;
}
class Zip extends Obj {
  constructor() { super(); }
}
class Depend extends Obj {
  constructor(name, constraints) {
    super();
    this.#name = name;
    this.#constraints = constraints;
    this.#str = null;
  }
  #name;
  #constraints;
  #str;
  static fromStr(str, checked=true) {
    try {
      return new DependParser(str).parse();
    }
    catch (err) {
      if (!checked) return null;
      throw ParseErr.makeStr("Depend", str);
    }
  }
  equals(obj) {
    if (obj instanceof Depend)
      return this.toStr() == obj.toStr();
    else
      return false;
  }
  hash() {
    return Str.hash(this.toStr());
  }
  toStr() {
    if (this.#str == null) {
      let s = "";
      s += this.#name + " ";
      for (let i=0; i<this.#constraints.length; ++i) {
        if (i > 0) s += ",";
        var c = this.#constraints[i];
        s += c.version;
        if (c.isPlus) s += "+";
        if (c.endVersion != null) s += "-" + c.endVersion;
      }
      this.#str = s.toString();
    }
    return this.#str;
  }
  name$() { return this.#name; }
  size() { return this.#constraints.length; }
  version(index=0) { return this.#constraints[index].version; }
  isSimple(index=0) { return !this.isPlus(index) && !this.isRange(index); }
  isPlus(index=0) { return this.#constraints[index].isPlus; }
  isRange(index=0) { return this.#constraints[index].endVersion != null; }
  endVersion(index=0) { return this.#constraints[index].endVersion; }
  match(v) {
    for (let i=0; i<this.m_constraints.length; ++i) {
      const c = this.#constraints[i];
      if (c.isPlus) {
        if (c.version.compare(v) <= 0)
          return true;
      }
      else if (c.endVersion != null) {
        if (c.version.compare(v) <= 0 &&
            (c.endVersion.compare(v) >= 0 || Depend.#doMatch(c.endVersion, v)))
          return true;
      }
      else
      {
        if (Depend.#doMatch(c.version, v))
          return true;
      }
    }
    return false;
  }
  static #doMatch(a, b) {
    if (a.segments().size() > b.segments().size()) return false;
    for (let i=0; i<a.segments().size(); ++i)
      if (a.segment(i) != b.segment(i))
        return false;
    return true;
  }
}
class DependConstraint {
  constructor() {
    this.version = null;
    this.isPlus = false;
    this.endVersion = null;
  }
  version;
  isPlus;
  endVersion;
}
class DependParser {
  constructor(str) {
    this.str = str;
    this.cur = 0;
    this.pos = 0;
    this.len = str.length;
    this.constraints = [];
    this.consume();
  }
  str;
  cur;
  pos;
  len;
  constraints;
  parse() {
    const name = this.#name();
    this.constraints.push(this.constraint());
    while (this.cur == 44) {
      this.consume();
      this.consumeSpaces();
      this.constraints.push(this.constraint());
    }
    if (this.pos <= this.len) throw new Error();
    return new Depend(name, this.constraints);
  }
  #name() {
    let s = ""
    while (this.cur != 32) {
      if (this.cur < 0) throw new Error();
      s += String.fromCharCode(this.cur);
      this.consume();
    }
    this.consumeSpaces();
    if (s.length == 0) throw new Error();
    return s;
  }
  constraint() {
    let c = new DependConstraint();
    c.version = this.version();
    this.consumeSpaces();
    if (this.cur == 43) {
      c.isPlus = true;
      this.consume();
      this.consumeSpaces();
    }
    else if (this.cur == 45) {
      this.consume();
      this.consumeSpaces();
      c.endVersion = this.version();
      this.consumeSpaces();
    }
    return c;
  }
  version() {
    const segs = List.make(Int.type$);
    let seg = this.consumeDigit();
    while (true) {
      if (48 <= this.cur && this.cur <= 57) {
        seg = seg*10 + this.consumeDigit();
      }
      else {
        segs.add(seg);
        seg = 0;
        if (this.cur != 46) break;
        else this.consume();
      }
    }
    return Version.make(segs);
  }
  consumeDigit() {
    if (48 <= this.cur && this.cur <= 57) {
      const digit = this.cur - 48;
      this.consume();
      return digit;
    }
    throw new Error();
  }
  consumeSpaces() {
    while (this.cur == 32 || this.cur == 9) this.consume();
  }
  consume() {
    if (this.pos < this.len) {
      this.cur = this.str.charCodeAt(this.pos++);
    }
    else {
      this.cur = -1;
      this.pos = this.len+1;
    }
  }
}
class Str extends Obj {
  constructor() { super(); }
  static defVal() { return ""; }
  static #spaces = null;
  static equalsIgnoreCase(self, that) { return self.toLowerCase() == that.toLowerCase(); }
  static compareIgnoreCase(self, that) {
    const a = self.toLowerCase();
    const b = that.toLowerCase();
    if (a < b) return -1;
    if (a == b) return 0;
    return 1;
  }
  static toStr(self) { return self; }
  static toLocale(self) { return self; }
  static hash(self) {
    let hash = 0;
    if (self.length == 0) return hash;
    for (let i=0; i<self.length; i++) {
      var ch = self.charCodeAt(i);
      hash = ((hash << 5) - hash) + ch;
      hash = hash & hash;
    }
    return hash;
  }
  static get(self, index) {
    if (index < 0) index += self.length;
    if (index < 0 || index >= self.length) throw IndexErr.make(index);
    return self.charCodeAt(index);
  }
  static getSafe(self, index, def=0) {
    try {
      if (index < 0) index += self.length;
      if (index < 0 || index >= self.length) throw new Error();
      return self.charCodeAt(index);
    }
    catch (err) { return def; }
  }
  static getRange(self, range) {
    const size = self.length;
    const s = range.start$(size);
    const e = range.end$(size);
    if (e+1 < s) throw IndexErr.make(range);
    return self.substr(s, (e-s)+1);
  }
  static plus(self, obj) {
    if (obj == null) return self + "null";
    const x = ObjUtil.toStr(obj);
    if (x.length == 0) return self;
    return self + x;
  }
  static intern(self) { return self; }
  static isEmpty(self) { return self.length == 0; }
  static size(self) { return self.length; }
  static startsWith(self, test) { return self.startsWith(test); }
  static endsWith(self, test) { return self.endsWith(test); }
  static contains = function(self, arg) { return self.indexOf(arg) != -1 }
  static containsChar(self, arg) { return self.indexOf(Int.toChar(arg)) != -1 }
  static index(self, s, off=0) {
    let i = off;
    if (i < 0) i = self.length+i;
    const r = self.indexOf(s, i);
    if (r < 0) return null;
    return r;
  }
  static indexr(self, s, off=-1) {
    var i = off;
    if (i < 0) i = self.length+i;
    const r = self.lastIndexOf(s, i);
    if (r < 0) return null;
    return r;
  }
  static indexIgnoreCase(self, s, off=0) {
    return Str.index(self.toLowerCase(), s.toLowerCase(), off);
  }
  static indexrIgnoreCase(self, s, off=0) {
    return Str.indexr(self.toLowerCase(), s.toLowerCase(), off);
  }
  static each(self, f) {
    const len = self.length;
    for (let i=0; i<len; ++i) f(self.charCodeAt(i), i);
  }
  static eachr(self, f) {
    for (let i=self.length-1; i>=0; i--) f(self.charCodeAt(i), i);
  }
  static eachWhile(self, f) {
    const len = self.length;
    for (let i=0; i<len; ++i) {
      const r = f(self.charCodeAt(i), i);
      if (r != null) return r;
    }
    return null
  }
  static any(self, f) {
    const len = self.length;
    for (let i=0; i<len; ++i) {
      if (f(self.charCodeAt(i), i) == true)
        return true;
    }
    return false;
  }
  static all(self, f) {
    const len = self.length;
    for (let i=0; i<len; ++i) {
      if (f(self.charCodeAt(i), i) == false)
        return false;
    }
    return true;
  }
  static spaces(n) {
    if (Str.#spaces == null) {
      Str.#spaces = new Array();
      let s = "";
      for (let i=0; i<20; i++) {
        Str.#spaces[i] = s;
        s += " ";
      }
    }
    if (n < 20) return Str.#spaces[n];
    let s = "";
    for (let i=0; i<n; i++) s += " ";
    return s;
  }
  static lower(self) {
    let lower = "";
    for (let i = 0; i < self.length; ++i) {
      let char = self[i];
      const code = self.charCodeAt(i);
      if (65 <= code && code <= 90)
        char = String.fromCharCode(code | 0x20);
      lower = lower + char;
    }
    return lower;
  }
  static upper(self) {
    let upper = "";
    for (let i = 0; i < self.length; ++i) {
      let char = self[i];
      const code = self.charCodeAt(i);
      if (97 <= code && code <= 122)
        char = String.fromCharCode(code & ~0x20);
      upper = upper + char;
    }
    return upper;
  }
  static capitalize(self) {
    if (self.length > 0) {
      const ch = self.charCodeAt(0);
      if (97 <= ch && ch <= 122)
        return String.fromCharCode(ch & ~0x20) + self.substring(1);
    }
    return self;
  }
  static decapitalize(self) {
    if (self.length > 0) {
      const ch = self.charCodeAt(0);
      if (65 <= ch && ch <= 90) {
        let s = String.fromCharCode(ch | 0x20);
        s += self.substring(1)
        return s;
      }
    }
    return self;
  }
  static toDisplayName(self) {
    if (self.length == 0) return "";
    let s = '';
    let c = self.charCodeAt(0);
    if (97 <= c && c <= 122) c &= ~0x20;
    s += String.fromCharCode(c);
    let last = c;
    for (let i=1; i<self.length; ++i) {
      c = self.charCodeAt(i);
      if (65 <= c && c <= 90 && last != 95) {
        let next = i+1 < self.length ? self.charCodeAt(i+1) : 81;
        if (!(65 <= last && last <= 90) || !(65 <= next && next <= 90))
          s += ' ';
      }
      else if (97 <= c && c <= 122) {
        if ((48 <= last && last <= 57)) { s += ' '; c &= ~0x20; }
        else if (last == 95) c &= ~0x20;
      }
      else if (48 <= c && c <= 57) {
        if (!(48 <= last && last <= 57)) s += ' ';
      }
      else if (c == 95) {
        s += ' ';
        last = c;
        continue;
      }
      s += String.fromCharCode(c);
      last = c;
    }
    return s;
  }
  static fromDisplayName(self) {
    if (self.length == 0) return "";
    let s = "";
    let c = self.charCodeAt(0);
    let c2 = self.length == 1 ? 0 : self.charCodeAt(1);
    if (65 <= c && c <= 90 && !(65 <= c2 && c2 <= 90)) c |= 0x20;
    s += String.fromCharCode(c);
    let last = c;
    for (let i=1; i<self.length; ++i) {
      c = self.charCodeAt(i);
      if (c != 32) {
        if (last == 32 && 97 <= c && c <= 122) c &= ~0x20;
        s += String.fromCharCode(c);
      }
      last = c;
    }
    return s;
  }
  static mult(self, times) {
    if (times <= 0) return "";
    if (times == 1) return self;
    let s = '';
    for (let i=0; i<times; ++i) s += self;
    return s;
  }
  static justl(self, width) { return Str.padr(self, width, 32); }
  static justr(self, width) { return Str.padl(self, width, 32); }
  static padl(self, w, ch=32) {
    if (self.length >= w) return self;
    const c = String.fromCharCode(ch);
    let s = '';
    for (let i=self.length; i<w; ++i) s += c;
    s += self;
    return s;
  }
  static padr(self, w, ch=32) {
    if (self.length >= w) return self;
    const c = String.fromCharCode(ch);
    let s = '';
    s += self;
    for (let i=self.length; i<w; ++i) s += c;
    return s;
  }
  static reverse(self) {
    let rev = "";
    for (let i=self.length-1; i>=0; i--)
      rev += self[i];
    return rev;
  }
  static trim(self, trimStart=true, trimEnd=true) {
    if (self.length == 0) return self;
    let s = 0;
    let e = self.length-1;
    while (trimStart && s<self.length && self.charCodeAt(s) <= 32) s++;
    while (trimEnd && e>=s && self.charCodeAt(e) <= 32) e--;
    return self.substr(s, (e-s)+1);
  }
  static trimStart(self) { return Str.trim(self, true, false); }
  static trimEnd(self) { return Str.trim(self, false, true); }
  static trimToNull(self) {
    const trimmed = Str.trim(self, true, true);
    return trimmed.length == 0 ? null : trimmed;
  }
  static split(self, sep=null, trimmed=true) {
    if (sep == null) return Str.#splitws(self);
    const toks = List.make(Str.type$, []);
    const trim = (trimmed != null) ? trimmed : true;
    const len = self.length;
    let x = 0;
    for (let i=0; i<len; ++i) {
      if (self.charCodeAt(i) != sep) continue;
      if (x <= i) toks.add(Str.#splitStr(self, x, i, trim));
      x = i+1;
    }
    if (x <= len) toks.add(Str.#splitStr(self, x, len, trim));
    return toks;
  }
  static #splitStr(val, s, e, trim) {
    if (trim == true) {
      while (s < e && val.charCodeAt(s) <= 32) ++s;
      while (e > s && val.charCodeAt(e-1) <= 32) --e;
    }
    return val.substring(s, e);
  }
  static #splitws(val) {
    const toks = List.make(Str.type$, []);
    let len = val.length;
    while (len > 0 && val.charCodeAt(len-1) <= 32) --len;
    let x = 0;
    while (x < len && val.charCodeAt(x) <= 32) ++x;
    for (let i=x; i<len; ++i) {
      if (val.charCodeAt(i) > 32) continue;
      toks.add(val.substring(x, i));
      x = i + 1;
      while (x < len && val.charCodeAt(x) <= 32) ++x;
      i = x;
    }
    if (x <= len) toks.add(val.substring(x, len));
    if (toks.size() == 0) toks.add("");
    return toks;
  }
  static splitLines(self) {
    const lines = List.make(Str.type$, []);
    const len = self.length;
    let s = 0;
    for (var i=0; i<len; ++i) {
      const c = self.charAt(i);
      if (c == '\n' || c == '\r') {
        lines.add(self.substring(s, i));
        s = i+1;
        if (c == '\r' && s < len && self.charAt(s) == '\n') { i++; s++; }
      }
    }
    lines.add(self.substring(s, len));
    return lines;
  }
  static replace(self, oldstr, newstr) {
    if (oldstr == '') return self;
    return self.split(oldstr).join(newstr);
  }
  static numNewlines(self) {
    let numLines = 0;
    const len = self.length;
    for (var i=0; i<len; ++i)
    {
      const c = self.charCodeAt(i);
      if (c == 10) numLines++;
      else if (c == 13) {
        numLines++;
        if (i+1<len && self.charCodeAt(i+1) == 10) i++;
      }
    }
    return numLines;
  }
  static isAscii(self) {
    for (let i=0; i<self.length; i++)
      if (self.charCodeAt(i) > 127)
        return false;
    return true;
  }
  static isSpace = function(self) {
    for (let i=0; i<self.length; i++) {
      const ch = self.charCodeAt(i);
      if (ch != 32 && ch != 9 && ch != 10 && ch != 12 && ch != 13)
        return false;
    }
    return true;
  }
  static isUpper(self) {
    for (let i=0; i<self.length; i++) {
      const ch = self.charCodeAt(i);
      if (ch < 65 || ch > 90) return false;
    }
    return true;
  }
  static isLower(self) {
    for (let i=0; i<self.length; i++) {
      const ch = self.charCodeAt(i);
      if (ch < 97 || ch > 122) return false;
    }
    return true;
  }
  static isAlpha(self) {
    for (let i=0; i<self.length; i++) {
      const ch = self.charCodeAt(i);
      if (ch >= 128 || (Int.charMap[ch] & Int.ALPHA) == 0)
        return false;
    }
    return true;
  }
  static isAlphaNum(self) {
    for (let i=0; i<self.length; i++) {
      const ch = self.charCodeAt(i);
      if (ch >= 128 || (Int.charMap[ch] & Int.ALPHANUM) == 0)
        return false;
    }
    return true;
  }
  static localeCompare(self, that) {
    return self.localeCompare(that, Locale.cur().toStr(), {sensitivity:'base'});
  }
  static localeUpper(self) { return self.toLocaleUpperCase(Locale.cur().toStr()); }
  static localeLower(self) { return self.toLocaleLowerCase(Locale.cur().toStr()); }
  static localeCapitalize(self) {
    const upper = Str.localeUpper(self);
    return upper[0] + self.substring(1);
  }
  static localeDecapitalize(self) {
    const lower = fan.sys.Str.localeLower(self);
    return lower[0] + self.substring(1);
  }
  static toBool(self, checked=true) { return Bool.fromStr(self, checked); }
  static toFloat(self, checked=true) { return Float.fromStr(self, checked); }
  static toInt(self, radix=10, checked=true) { return Int.fromStr(self, radix, checked); }
  static toDecimal(self, checked=true) { return Decimal.fromStr(self, checked); }
  static in(self) { return InStream.makeForStr(self); }
  static toUri(self) { return Uri.fromStr(self); }
  static toRegex(self) { return Regex.fromStr(self); }
  static chars(self) {
    const ch = List.make(Int.type$, []);
    for (let i=0; i<self.length; i++) ch.add(self.charCodeAt(i));
    return ch;
  }
  static fromChars(ch) {
    let s = '';
    for (let i=0; i<ch.size(); i++) s += String.fromCharCode(ch.get(i));
    return s;
  }
  static toBuf(self, charset) {
    if (charset === undefined) charset = Charset.utf8();
    const buf = new MemBuf();
    buf.charset$(charset);
    buf.print(self);
    return buf.flip();
  }
  static toCode = function(self, quote=34, escapeUnicode=false) {
    let s = "";
    let q = 0;
    if (quote != null) {
      q = String.fromCharCode(quote);
      s += q;
    }
    const len = self.length;
    for (let i=0; i<len; ++i) {
      const c = self.charAt(i);
      switch (c)
      {
        case '\n': s += '\\' + 'n'; break;
        case '\r': s += '\\' + 'r'; break;
        case '\f': s += '\\' + 'f'; break;
        case '\t': s += '\\' + 't'; break;
        case '\\': s += '\\' + '\\'; break;
        case '"':  if (q == '"')  s += '\\' + '"';  else s += c; break;
        case '`':  if (q == '`')  s += '\\' + '`';  else s += c; break;
        case '\'': if (q == '\'') s += '\\' + '\''; else s += c; break;
        case '$':  s += '\\' + '$'; break;
        default:
          var hex  = function(x) { return "0123456789abcdef".charAt(x); }
          var code = c.charCodeAt(0);
          if (code < 32 || (escapeUnicode && code > 127)) {
            s += '\\' + 'u'
              + hex((code>>12)&0xf)
              + hex((code>>8)&0xf)
              + hex((code>>4)&0xf)
              + hex(code & 0xf);
          }
          else {
            s += c;
          }
      }
    }
    if (q != 0) s += q;
    return s;
  }
  static toXml(self) {
    let s = null;
    const len = self.length;
    for (let i=0; i<len; ++i) {
      const ch = self.charAt(i);
      const c = self.charCodeAt(i);
      if (c > 62) {
        if (s != null) s += ch;
      }
      else {
        const esc = Str.xmlEsc[c];
        if (esc != null && (c != 62 || i==0 || self.charCodeAt(i-1) == 93))
        {
          if (s == null)
          {
            s = "";
            s += self.substring(0,i);
          }
          s += esc;
        }
        else if (s != null)
        {
          s += ch;
        }
      }
    }
    if (s == null) return self;
    return s;
  }
  static xmlEsc = [];
  static
  {
    Str.xmlEsc[38] = "&amp;";
    Str.xmlEsc[60] = "&lt;";
    Str.xmlEsc[62] = "&gt;";
    Str.xmlEsc[39] = "&#39;";
    Str.xmlEsc[34] = "&quot;";
  }
}
class Bool extends Obj {
  static defVal() { return false; }
  static hash(self) { return self ? 1231 : 1237; }
  static not(self) { return !self; }
  static and(self, b) { return self && b; }
  static or(self, b) { return self || b; }
  static xor(self, b) { return self != b; }
  static fromStr(s, checked=true) {
    if (s == "true") return true;
    if (s == "false") return false;
    if (!checked) return null;
    throw ParseErr.makeStr("Bool", s);
  }
  static toStr(self) { return self ? "true" : "false"; }
  static toCode(self) { return self ? "true" : "false"; }
  static toLocale(self) {
    const key = self ? "boolTrue" : "boolFalse";
    return Env.cur().locale(Pod.find("sys"), key, Bool.toStr(self));
  }
}
class MimeType extends Obj {
  constructor() {
    super();
  }
}
class Type extends Obj {
  constructor(qname, base, mixins, facets={}, flags=0, jsRef=null) {
    super();
    if (qname === undefined) return;
    if (Type.type$ != null) {
      let acc = List.make(Type.type$, []);
      for (let i=0; i<mixins.length; ++i) {
        acc.add(Type.find(mixins[i]));
      }
      this.#mixins = acc.ro();
    }
    let s = qname.split('::');
    this.#qname = qname;
    this.#pod = Pod.find(s[0]);
    this.#name = s[1];
    this.#base = base == null ? null : Type.find(base);
    this.#myFacets = new Facets(facets);
    this.#flags = flags;
    this.#nullable = new NullableType(this);
    this.#slotsInfo = [];
    if (jsRef != null) {
      let ns = Type.$registry[this.#pod];
      if (ns == null) Type.$registry[this.#pod] = ns = {};
      ns[jsRef.name] = jsRef;
    }
  }
  #qname;
  #pod;
  #name;
  #base;
  #mixins;
  #myFacets;
  #flags;
  #nullable;
  #slotsInfo;
  static #noParams = null;
  static $registry =  {};
  pod() { return this.#pod; }
  name$() { return this.#name; }
  qname() { return this.#qname; }
  qnameJs$() { return `${this.#pod}.${this.#name}`; }
  signature() { return this.#qname; }
  flags() { return this.#flags; };
  isAbstract() { return (this.flags() & FConst.Abstract) != 0; }
  isClass() { return (this.flags() & (FConst.Enum|FConst.Mixin)) == 0; }
  isConst() { return (this.flags() & FConst.Const) != 0; }
  isEnum() { return (this.flags() & FConst.Enum) != 0; }
  isFacet() { return (this.flags() & FConst.Facet) != 0; }
  isFinal() { return (this.flags() & FConst.Final) != 0; }
  isInternal() { return (this.flags() & FConst.Internal) != 0; }
  isMixin() { return (this.flags() & FConst.Mixin) != 0; }
  isPublic() { return (this.flags() & FConst.Public) != 0; }
  isSynthetic() { return (this.flags() & FConst.Synthetic) != 0; }
  trap(name, args=null) {
    if (name == "flags") return this.flags();
    return super.trap(name, args);
  }
  equals(that) {
    if (that instanceof Type)
      return this.signature() === that.signature();
    else
      return false;
  }
  isVal() {
    return this === Bool.type$ ||
           this === Int.type$ ||
           this === Float.type$;
  }
  log()       { return this.#pod.log(); }
  toStr()     { return this.signature(); }
  toLocale()  { return this.signature(); }
  typeof$()   { return Type.type$; }
  literalEncode$(out) { out.w(this.signature()).w("#"); }
  isNullable() { return false; }
  toNonNullable() { return this; }
  toNullable() { return this.#nullable; }
  isGenericType() {
    return this == List.type$ ||
           this == Map.type$ ||
           this == Func.type$;
  }
  isGenericInstance() { return false; }
  isGenericParameter() {
    return this.#pod.name$() === "sys" && this.#name.length === 1;
  }
  isGeneric() { return this.isGenericType(); }
  params() {
    if (Type.#noParams == null)
      Type.#noParams = Map.make(Str.type$, Type.type$).ro();
    return Type.#noParams;
  }
  parameterize(params) {
    if (this === List.type$) {
      let v = params.get("V");
      if (v == null) throw ArgErr.make("List.parameterize - V undefined");
      return v.toListOf();
    }
    if (this === Map.type$) {
      let v = params.get("V");
      let k = params.get("K");
      if (v == null) throw ArgErr.make("Map.parameterize - V undefined");
      if (k == null) throw ArgErr.make("Map.parameterize - K undefined");
      return new MapType(k, v);
    }
    if (this === Func.type$) {
      let r = params.get("R");
      if (r == null) throw ArgErr.make("Func.parameterize - R undefined");
      let p = [];
      for (let i=65; i<=72; ++i) {
        let x = params.get(String.fromCharCode(i));
        if (x == null) break;
        p.push(x);
      }
      return new FuncType(p, r);
    }
    throw UnsupportedErr.make(`not generic: ${this}`);
  }
  toListOf() {
    if (this.listOf$ == null) this.listOf$ = new ListType(this);
    return this.listOf$;
  }
  emptyList() {
    if (this.emptyList$ == null)
      this.emptyList$ = List.make(this).toImmutable();
    return this.emptyList$;
  }
  make(args) {
    if (args === undefined) args = null;
    let make = this.method("make", false);
    if (make != null && make.isPublic()) {
      if (this.isAbstract() && !make.isStatic()) {
        throw Err.make(`Cannot instantiate abstract class: ${this.#qname}`);
      }
      let numArgs = args == null ? 0 : args.size();
      let params = make.params();
      if ((numArgs == params.size()) ||
          (numArgs < params.size() && params.get(numArgs).hasDefault())) {
        return make.invoke(null, args);
      }
    }
    let defVal = this.slot("defVal", false);
    if (defVal != null && defVal.isPublic()) {
      if (defVal instanceof Field) return defVal.get(null);
      if (defVal instanceof Method) return defVal.invoke(null, null);
    }
    throw Err.make(`Typs missing 'make' or 'defVal' slots: ${this.toStr()}`);
  }
  slots() { return this.reflect().slotList$.ro(); }
  methods() { return this.reflect().methodList$.ro(); }
  fields() { return this.reflect().fieldList$.ro(); }
  slot(name, checked=true) {
    const slot = this.reflect().slotsByName$[name];
    if (slot != null) return slot;
    if (checked) throw UnknownSlotErr.make(this.m_qname + "." + name);
    return null;
  }
  method(name, checked=true) {
    const slot = this.slot(name, checked);
    if (slot == null) return null;
    return ObjUtil.coerce(slot, Method.type$);
  }
  field(name, checked=true) {
    const slot = this.slot(name, checked);
    if (slot == null) return null;
    return ObjUtil.coerce(slot, Field.type$);
  }
  am$(name, flags, returns, params, facets) {
    const r = fanx_TypeParser.load(returns);
    const m = new Method(this, name, flags, r, params, facets);
    this.#slotsInfo.push(m);
    return this;
  }
  af$(name, flags, of, facets) {
    const t = fanx_TypeParser.load(of);
    const f = new Field(this, name, flags, t, facets);
    this.#slotsInfo.push(f);
    return this;
  }
  base() { return this.#base; }
  mixins() {
    if (this.#mixins == null)
      this.#mixins = Type.type$.emptyList();
    return this.#mixins;
  }
  inheritance() {
    if (this.inheritance$ == null) this.inheritance$ = Type.#buildInheritance(this);
    return this.inheritance$;
  }
  static #buildInheritance(self) {
    const map = {};
    const acc = List.make(Type.type$);
    if (self == Void.type$) {
      acc.add(self);
      return acc.trim().ro();
    }
    map[self.qname()] = self;
    acc.add(self);
    Type.#addInheritance(self.base(), acc, map);
    const mixins = self.mixins();
    for (let i=0; i<mixins.size(); ++i)
      Type.#addInheritance(mixins.get(i), acc, map);
    return acc.trim().ro();
  }
  static #addInheritance(t, acc, map) {
    if (t == null) return;
    const ti = t.inheritance();
    for (let i=0; i<ti.size(); ++i)
    {
      let x = ti.get(i);
      if (map[x.qname()] == null)
      {
        map[x.qname()] = x;
        acc.add(x);
      }
    }
  }
  fits(that) { return this.toNonNullable().is(that.toNonNullable()); }
  is(that) {
    if (that instanceof NullableType)
      that = that.root;
    if (this.equals(that)) return true;
    if (this === Void.type$) return false;
    var base = this.#base;
    while (base != null) {
      if (base.equals(that)) return true;
      base = base.#base;
    }
    let t = this;
    while (t != null)
    {
      let m = t.mixins();
      for (let i=0; i<m.size(); i++)
        if (Type.checkMixin(m.get(i), that)) return true;
      t = t.#base;
    }
    return false;
  }
  static checkMixin(mixin, that) {
    if (mixin.equals(that)) return true;
    const m = mixin.mixins();
    for (let i=0; i<m.size(); i++)
      if (Type.checkMixin(m.get(i), that))
        return true;
    return false;
  }
  hasFacet(type) { return this.facet(type, false) != null; }
  facets() {
    if (this.inheritedFacets$ == null) this.#loadFacets();
    return this.inheritedFacets$.list();
  }
  facet(type, checked=true) {
    if (this.inheritedFacets$ == null) this.#loadFacets();
    return this.inheritedFacets$.get(type, checked);
  }
  #loadFacets() {
    const f = this.#myFacets.dup();
    const inheritance = this.inheritance();
    for (let i=0; i<inheritance.size(); ++i) {
      let x = inheritance.get(i);
      if (x.#myFacets) f.inherit(x.#myFacets);
    }
    this.inheritedFacets$ = f;
  }
  reflect() {
    if (this.slotsByName$ != null) return this;
    this.doReflect$();
    return this;
  }
  doReflect$() {
    const slots = [];
    const nameToSlot  = {};
    const nameToIndex = {};
    if (this.#mixins)
    {
      for (let i=0; i<this.#mixins.size(); i++)
      {
        this.#mergeType(this.#mixins.get(i), slots, nameToSlot, nameToIndex);
      }
    }
    this.#mergeType(this.#base, slots, nameToSlot, nameToIndex);
    for (let i=0; i<this.#slotsInfo.length; i++) {
      const slot = this.#slotsInfo[i]
      this.#mergeSlot(slot, slots, nameToSlot, nameToIndex);
    }
    const fields  = [];
    const methods = [];
    for (let i=0; i<slots.length; i++) {
      const slot = slots[i];
      if (slot instanceof Field) fields.push(slot);
      else methods.push(slot);
    }
    this.slotList$    = List.make(Slot.type$, slots);
    this.fieldList$   = List.make(Field.type$, fields);
    this.methodList$  = List.make(Method.type$, methods);
    this.slotsByName$ = nameToSlot;
  }
  #mergeType(inheritedType, slots, nameToSlot, nameToIndex) {
    if (inheritedType == null) return;
    const inheritedSlots = inheritedType.reflect().slots();
    for (let i=0; i<inheritedSlots.size(); i++)
      this.#mergeSlot(inheritedSlots.get(i), slots, nameToSlot, nameToIndex);
  }
  #mergeSlot(slot, slots, nameToSlot, nameToIndex) {
    if (slot.isCtor() && slot.parent() != this) return;
    const name = slot.name$();
    const dup  = nameToIndex[name];
    if (dup != null) {
      if (slot.parent() == Obj.type$)
        return;
      const dupSlot = slots[dup];
      if (slot.parent() != this && slot.isAbstract() && !dupSlot.isAbstract())
        return;
      if ((slot.flags$() & (FConst.Getter | FConst.Setter)) != 0)
      {
        const field = slots[dup];
        if ((slot.flags$() & FConst.Getter) != 0)
          field.getter$ = slot;
        else
          field.setter$ = slot;
        return;
      }
      nameToSlot[name] = slot;
      slots[dup] = slot;
    } else {
      nameToSlot[name] = slot;
      slots.push(slot);
      nameToIndex[name] = slots.length-1;
    }
  }
  static find(sig, checked=true) {
      return fanx_TypeParser.load(sig, checked);
  }
  static of(obj) {
    if (obj instanceof Obj)
      return obj.typeof$();
    else
      return Type.toFanType(obj);
  }
  static toFanType(obj) {
    if (obj == null) throw Err.make("sys::Type.toFanType: obj is null");
    if (obj.fanType$ != undefined) return obj.fanType$;
    if ((typeof obj) == "boolean" || obj instanceof Boolean) return Bool.type$;
    if ((typeof obj) == "number"  || obj instanceof Number)  return Int.type$;
    if ((typeof obj) == "string"  || obj instanceof String)  return Str.type$;
    throw fan.sys.Err.make(`sys::Type.toFanType: Not a Fantom type: ${obj}`);
  }
  static common$(objs) {
    if (objs.length == 0) return Obj.type$.toNullable();
    let nullable = false;
    let best = null;
    for (let i=0; i<objs.length; i++)
    {
      const obj = objs[i];
      if (obj == null) { nullable = true; continue; }
      const t = fan.sys.ObjUtil.typeof$(obj);
      if (best == null) { best = t; continue; }
      while (!t.is(best)) {
        best = best.base();
        if (best == null) return nullable ? Obj.type$.toNullable() : Obj.type$;
      }
    }
    if (best == null) best = Obj.type$;
    return nullable ? best.toNullable() : best;
  }
}
class NullableType extends Type {
  constructor(root) {
    super();
    this.#root = root;
  }
  #root;
  get root() { return this.#root; }
  podName() { return this.root.podName(); }
  pod() { return this.root.pod(); }
  name$() { return this.root.name$(); }
  qname() { return this.root.qname(); }
  signature() { return `${this.root.signature()}?`; }
  flags() { return this.root.flags(); }
  base() { return this.root.base(); }
  mixins() { return this.root.mixins(); }
  inheritance() { return this.root.inheritance(); }
  is(type) { return this.root.is(type); }
  isVal() { return this.root.isVal(); }
  isNullable() { return true; }
  toNullable() { return this; }
  toNonNullable() { return this.root; }
  isGenericType() { return this.root.isGenericType(); }
  isGenericInstance() { return this.root.isGenericInstance(); }
  isGenericParameter() { return this.root.isGenericParameter(); }
  getRawType() { return this.root.getRawType(); }
  params() { return this.root.params(); }
  parameterize(params) { return this.root.parameterize(params).toNullable(); }
  fields() { return this.root.fields(); }
  methods() { return this.root.methods(); }
  slots() { return this.root.slots(); }
  slot(name, checked) { return this.root.slot(name, checked); }
  facets() { return this.root.facets(); }
  facet(type, checked) { return this.root.facet(type, checked); }
  doc() { return this.root.doc(); }
}
class GenericType extends Type {
  constructor(qname, base, mixins, facets={}, flags=0) {
    super(qname, base, mixins, facets, flags);
  }
  params() {
    if (this.params$ == null) this.params$ = this.makeParams$();
    return this.params$;
  }
  makeParams$() { throw UnsupportedErr.make("Not implemented"); }
  doReflect$() {
    const master = this.base();
    master.doReflect$();
    const masterSlots = master.slots();
    const slots = [];
    const fields = [];
    const methods = [];
    const slotsByName = {};
    for (let i=0; i<masterSlots.size(); i++)
    {
      let slot = masterSlots.get(i);
      if (slot instanceof Method)
      {
        slot = this.parameterizeMethod$(slot);
        methods.push(slot);
      }
      else
      {
        slot = this.parameterizeField$(slot);
        fields.push(slot);
      }
      slots.push(slot);
      slotsByName[slot.name$()] = slot;
    }
    this.slotList$ = fan.sys.List.make(fan.sys.Slot.type$, slots);
    this.fieldList$ = fan.sys.List.make(fan.sys.Field.type$, fields);
    this.methodList$ = fan.sys.List.make(fan.sys.Method.type$, methods);
    this.slotsByName$ = slotsByName;
  }
  parameterizeField$(f) {
    let t = f.type();
    if (!t.isGenericParameter()) return f;
    t = this.parameterizeType$(t);
    const pf = new Field(this, f.name$(), f.flags(), t, f.facets());
    return pf;
  }
  parameterizeMethod$(m) {
    if (!m.isGenericMethod()) return m;
    const func = m.func();
    let ret;
    const params = List.make(Param.type$);
    if (func.returns().isGenericParameter())
      ret = this.parameterizeType$(func.returns());
    else
      ret = func.returns();
    const arity = m.params().size();
    for (let i=0; i<arity; ++i) {
      const p = m.params().get(i);
      if (p.type().isGenericParameter())
      {
        params.add(new Param(p.name$(), this.parameterizeType$(p.type()), p.hasDefault()));
      }
      else
      {
        params.add(p);
      }
    }
    const pm = new Method(this, m.name$(), m.flags(), ret, params, m.facets(), m)
    return pm;
  }
  parameterizeType$(t) {
    const nullable = t.isNullable();
    const nn = t.toNonNullable();
    if (nn instanceof ListType)
      t = this.parameterizeListType$(nn);
    else if (nn instanceof FuncType)
      t = this.parameterizeFuncType$(nn);
    else
      t = this.doParameterize$(nn);
    return nullable ? t.toNullable() : t;
  }
  parameterizeListType$(t) {
    return this.doParameterize$(t.v).toListOf();
  }
  parameterizeFuncType$(t) {
    const params = [];
    for (let i=0; i<t.pars.length; i++)
    {
      let param = t.pars[i];
      if (param.isGenericParameter()) param = this.doParameterize$(param);
      params[i] = param;
    }
    let ret = t.ret;
    if (ret.isGenericParameter()) ret = this.doParameterize$(ret);
    return new FuncType(params, ret);
  }
  doParameterize$(t) { throw UnsupportedErr.make("Not implemented"); }
}
class ListType extends GenericType {
  constructor(v) {
    super("sys::List", List.type$.qname(), Type.type$.emptyList());
    this.#v = v;
  }
  #v;
  get v() { return this.#v; }
  signature() { return `${this.v.signature()}[]`; }
  equals(that) {
    if (that instanceof ListType)
      return this.v.equals(that.v);
    else
      return false;
  }
  is(that) {
    if (that instanceof ListType)
    {
      if (that.v.qname() == "sys::Obj") return true;
      return this.v.is(that.v);
    }
    if (that instanceof Type)
    {
      if (that.qname() == "sys::List") return true;
      if (that.qname() == "sys::Obj")  return true;
    }
    return false;
  }
  as(obj, that) {
    const objType = ObjUtil.typeof$(obj);
    if (objType instanceof ListType &&
        objType.v.qname() == "sys::Obj" &&
        that instanceof ListType)
      return obj;
    if (that instanceof NullableType &&
        that.root instanceof ListType)
      that = that.root;
    return objType.is(that) ? obj : null;
  }
  facets() { return List.type$.facets(); }
  facet(type, checked=true) { return List.type$.facet(type, checked); }
  makeParams$() {
    return Map.make(Str.type$, Type.type$)
      .set("V", this.v)
      .set("L", this).ro();
  }
  isGenericParameter() {
    return this.v.isGenericParameter();
  }
  doParameterize$(t) {
    if (t == Sys.VType) return this.v;
    if (t == Sys.LType) return this;
    throw new Error(t.toString());
  }
}
class MapType extends GenericType {
  constructor(k, v) {
    super("sys::Map", Map.type$.qname(), Type.type$.emptyList());
    this.#k = k;
    this.#v = v;
  }
  #k;
  #v;
  get k() { return this.#k; }
  get v() { return this.#v; }
  signature() {
    return "[" + this.k.signature() + ':' + this.v.signature() + ']';
  }
  equals(that) {
    if (that instanceof MapType)
      return this.k.equals(that.k) && this.v.equals(that.v);
    else
      return false;
  }
  is(that) {
    if (that.isNullable()) that = that.root;
    if (that instanceof MapType) {
      return this.k.is(that.k) && this.v.is(that.v);
    }
    if (that instanceof Type) {
      if (that.qname() == "sys::Map") return true;
      if (that.qname() == "sys::Obj")  return true;
    }
    return false;
  }
  as(obj, that) {
    const objType = ObjUtil.typeof$(obj);
    if (objType instanceof MapType && that instanceof MapType)
      return obj;
    return objType.is(that) ? obj : null;
  }
  facets() { return Map.type$.facets(); }
  facet(type, checked=true) { return Map.type$.facet(type, checked); }
  makeParams$() {
    return Map.make(Str.type$, Type.type$)
      .set("K", this.k)
      .set("V", this.v)
      .set("M", this).ro();
  }
  isGenericParameter() {
    return this.v.isGenericParameter() && this.k.isGenericParameter();
  }
  doParameterize$(t) {
    if (t == Sys.KType) return this.k;
    if (t == Sys.VType) return this.v;
    if (t == Sys.MType) return this;
    throw new Error(t.toString());
  }
}
class FuncType extends GenericType {
  constructor(params, ret) {
    super("sys::Func", Obj.type$.qname(), Type.type$.emptyList());
    this.#pars = params;
    this.#ret = ret;
    this.#genericParameterType |= ret.isGenericParameter();
    for (let i=0; i<params.length; ++i)
      this.genericParameterType |= params[i].isGenericParameter();
  }
  #pars;
  #ret;
  #genericParameterType=0;
  get pars() { return this.#pars; }
  get ret() { return this.#ret; }
  signature() {
    let s = '|'
    for (let i=0; i<this.pars.length; i++)
    {
      if (i > 0) s += ',';
      s += this.pars[i].signature();
    }
    s += '->';
    s += this.ret.signature();
    s += '|';
    return s;
  }
  equals(that) {
    if (that instanceof FuncType)
    {
      if (this.pars.length != that.pars.length) return false;
      for (let i=0; i<this.pars.length; i++)
        if (!this.pars[i].equals(that.pars[i])) return false;
      return this.ret.equals(that.ret);
    }
    return false;
  }
  is(that) {
    if (this == that) return true;
    if (that instanceof FuncType)
    {
      if (that.ret.qname() != "sys::Void" && !this.ret.is(that.ret)) return false;
      if (this.pars.length > that.pars.length) return false;
      for (let i=0; i<this.pars.length; ++i)
        if (!that.pars[i].is(this.pars[i])) return false;
      return true;
    }
    if (that.toString() == "sys::Func") return true;
    if (that.toString() == "sys::Func?") return true;
    return this.base().is(that);
  }
  as(that) {
    throw UnsupportedErr.make("TODO:FIXIT");
    return that;
  }
  facets() { return Func.type$.facets(); }
  facet(type, checked=true) { return Func.type$.facet(type, checked); }
  makeParams$() {
    const map = Map.make(Str.type$, Type.type$);
    for (let i=0; i<this.pars.length; ++i)
      map.set(String.fromCharCode(i+65), this.pars[i]);
    return map.set("R", this.ret).ro();
  }
  isGenericParameter() { return this.#genericParameterType; }
  doParameterize$(t) {
    if (t == Sys.RType) return ret;
    const name = t.name$().charCodeAt(0) - 65;
    if (name < this.pars.length) return this.pars[name];
    return Obj.type$;
  }
}
class Regex extends Obj {
  constructor(source, flags="") {
    super();
    this.#source = source;
    this.#flags = flags;
    this.#regexp = new RegExp(source, flags);
  }
  #source;
  #flags;
  #regexp;
  static #defVal = undefined;
  defVal() {
    if (Regex.#defVal === undefined) Regex.#defVal = Regex.fromStr("");
    return Regex.#defVal;
  }
  static fromStr(pattern, flags="") {
    return new Regex(pattern, flags);
  }
  static glob(pattern) {
    let s = "";
    for (let i=0; i<pattern.length; ++i) {
      const c = pattern.charCodeAt(i);
      if (Int.isAlphaNum(c)) s += String.fromCharCode(c);
      else if (c == 63) s += '.';
      else if (c == 42) s += '.*';
      else s += '\\' + String.fromCharCode(c);
    }
    return new Regex(s);
  }
  static quote(pattern) {
    let s = "";
    for (let i=0; i<pattern.length; ++i) {
      const c = pattern.charCodeAt(i);
      if (Int.isAlphaNum(c)) s += String.fromCharCode(c);
      else s += '\\' + String.fromCharCode(c);
    }
    return new Regex(s);
  }
  equals(obj) {
    if (obj instanceof Regex)
      return obj.#source === this.#source && obj.#flags == this.#flags;
    else
      return false;
  }
  flags() { return this.#flags; }
  hash() { return Str.hash(this.#source); }
  toStr() { return this.#source; }
  matches(s) { return this.matcher(s).matches(); }
  matcher(s) { return new RegexMatcher(this.#regexp, this.#source, s); }
  split(s, limit=0) {
    if (limit === 1)
      return List.make(Str.type$, [s]);
    const array = [];
    const re = this.#regexp;
    while (true) {
      const m = s.match(re);
      if (m == null || (limit != 0 && array.length == limit -1)) {
        array.push(s);
        break;
      }
      array.push(s.substring(0, m.index));
      s = s.substring(m.index + m[0].length);
    }
    if (limit == 0) {
      while (array[array.length-1] == "") { array.pop(); }
    }
    return List.make(Str.type$, array);
  }
}
class OutStream extends Obj {
  constructor() {
    super();
  }
}
class LogLevel extends Enum {
  constructor(ordinal, name) {
    super();
    Enum.make$(this, ordinal, name);
  }
  static debug() { return LogLevel.vals().get(0); }
  static info() { return LogLevel.vals().get(1); }
  static warn() { return LogLevel.vals().get(2); }
  static err() { return LogLevel.vals().get(3); }
  static silent() { return LogLevel.vals().get(4); }
  static #vals = undefined;
  static vals() {
    if (LogLevel.#vals === undefined) {
      LogLevel.#vals = List.make(LogLevel.type$,
        [new LogLevel(0, "debug"), new LogLevel(1, "info"),
         new LogLevel(2, "warn"), new LogLevel(3, "err"),
         new LogLevel(4, "silent")]).toImmutable();
    }
    return LogLevel.#vals;
  }
  static fromStr(name, checked=true) {
    return Enum.doFromStr(LogLevel.type$, LogLevel.vals(), name, checked);
  }
}
class Time extends Obj {
  constructor(hour, min, sec, ns) {
    super();
    if (hour < 0 || hour > 23)     throw ArgErr.make("hour " + hour);
    if (min < 0 || min > 59)       throw ArgErr.make("min " + min);
    if (sec < 0 || sec > 59)       throw ArgErr.make("sec " + sec);
    if (ns < 0 || ns > 999999999)  throw ArgErr.make("ns " + ns);
    this.#hour = hour;
    this.#min = min;
    this.#sec = sec;
    this.#ns = ns;
  }
  #hour;
  #min;
  #sec;
  #ns;
  static #defVal = undefined;
  static defVal() {
    if (Time.#defVal === undefined) Time.#defVal = new Time(0, 0, 0, 0);
    return Time.#defVal;
  }
  static make(hour, min, sec=0, ns=0) {
    return new Time(hour, min, sec, ns);
  }
  static now(tz=TimeZone.cur()) {
    return DateTime.makeTicks(DateTime.nowTicks(), tz).time();
  }
  static fromStr(s, checked=true) {
    try {
      const num = (x,index) => { return x.charCodeAt(index) - 48; }
      const hour  = num(s, 0)*10  + num(s, 1);
      const min   = num(s, 3)*10  + num(s, 4);
      const sec   = num(s, 6)*10  + num(s, 7);
      if (s.charAt(2) != ':' || s.charAt(5) != ':')
        throw new Error();
      let i = 8;
      let ns = 0;
      let tenth = 100000000;
      const len = s.length;
      if (i < len && s.charAt(i) == '.') {
        ++i;
        while (i < len) {
          const c = s.charCodeAt(i);
          if (c < 48 || c > 57) break;
          ns += (c - 48) * tenth;
          tenth /= 10;
          ++i;
        }
      }
      if (i < s.length) throw new Error();
      const instance = new Time(hour, min, sec, ns);
      return instance;
    }
    catch (err) {
      if (!checked) return null;
      throw ParseErr.makeStr("Time", s);
    }
  }
  equals(that) {
    if (that instanceof Time) {
      return this.#hour.valueOf() == that.#hour.valueOf() &&
            this.#min.valueOf() == that.#min.valueOf() &&
            this.#sec.valueOf() == that.#sec.valueOf() &&
            this.#ns.valueOf() == that.#ns.valueOf();
    }
    return false;
  }
  hash() { return (this.#hour << 28) ^ (this.#min << 21) ^ (this.#sec << 14) ^ this.#ns; }
  compare(that) {
    if (this.#hour.valueOf() == that.#hour.valueOf()) {
      if (this.#min.valueOf() == that.#min.valueOf()) {
        if (this.#sec.valueOf() == that.#sec.valueOf()) {
          if (this.#ns.valueOf() == that.#ns.valueOf()) return 0;
          return this.#ns < that.#ns ? -1 : +1;
        }
        return this.#sec < that.#sec ? -1 : +1;
      }
      return this.#min < that.#min ? -1 : +1;
    }
    return this.#hour < that.#hour ? -1 : +1;
  }
  toStr() { return this.toLocale("hh:mm:ss.FFFFFFFFF"); }
  hour() { return this.#hour; }
  min() { return this.#min; }
  sec() { return this.#sec; }
  nanoSec() { return this.#ns; }
  toLocale(pattern=null, locale=Locale.cur()) {
    if (pattern == null) {
      const pod = Pod.find("sys");
      pattern = Env.cur().locale(pod, "time", "hh:mm:ss", locale);
    }
    return DateTimeStr.makeTime(pattern, locale, this).format();
  }
  static fromLocale(s, pattern, checked=true) {
    return DateTimeStr.make(pattern, null).parseTime(s, checked);
  }
  toIso() { return this.toStr(); }
  static fromIso(s, checked=true) {
    return Time.fromStr(s, checked);
  }
  plus(d)  { return this.#plus(d.ticks()); }
  minus(d) { return this.#plus(-d.ticks()); }
  #plus(ticks) {
    if (ticks == 0) return this;
    if (ticks > Duration.nsPerDay$)
      throw ArgErr.make("Duration out of range: " + Duration.make(ticks));
    let newTicks = this.toDuration().ticks() + ticks;
    if (newTicks < 0) newTicks = Duration.nsPerDay$ + newTicks;
    if (newTicks >= Duration.nsPerDay$) newTicks %= Duration.nsPerDay$;
    return Time.fromDuration(Duration.make(newTicks));
  }
  static fromDuration(d) {
    let ticks = d.ticks();
    if (ticks == 0) return Time.defVal();
    if (ticks < 0 || ticks > Duration.nsPerDay$)
      throw ArgErr.make("Duration out of range: " + d);
    const hour = Int.div(ticks, Duration.nsPerHr$);  ticks %= Duration.nsPerHr$;
    const min  = Int.div(ticks, Duration.nsPerMin$); ticks %= Duration.nsPerMin$;
    const sec  = Int.div(ticks, Duration.nsPerSec$); ticks %= Duration.nsPerSec$;
    const ns   = ticks;
    return new Time(hour, min, sec, ns);
  }
  toDuration() {
    return Duration.make(this.#hour*Duration.nsPerHr$ +
                         this.#min*Duration.nsPerMin$ +
                         this.#sec*Duration.nsPerSec$ +
                         this.#ns);
  }
  toDateTime(d, tz=TimeZone.cur()) { return DateTime.makeDT(d, this, tz); }
  toCode() {
    if (this.equals(Time.defVal())) return "Time.defVal";
    return "Time(\"" + this.toString() + "\")";
  }
  isMidnight() { return this.equals(Time.defVal()); }
}
class Month extends Enum {
  constructor(ordinal, name, quarter) {
    super();
    Enum.make$(this, ordinal, name);
    this.#quarter = quarter;
    this.#localeAbbrKey = `${name}Abbr`
    this.#localeFullKey = `${name}Full`
  }
  #quarter;
  #localeAbbrKey;
  #localeFullKey;
  static jan() { return Month.vals().get(0); }
  static feb() { return Month.vals().get(1); }
  static mar() { return Month.vals().get(2); }
  static apr() { return Month.vals().get(3); }
  static may() { return Month.vals().get(4); }
  static jun() { return Month.vals().get(5); }
  static jul() { return Month.vals().get(6); }
  static aug() { return Month.vals().get(7); }
  static sep() { return Month.vals().get(8); }
  static oct() { return Month.vals().get(9); }
  static nov() { return Month.vals().get(10); }
  static dec() { return Month.vals().get(11); }
  static #vals = undefined;
  static vals() {
    if (Month.#vals === undefined) {
      Month.#vals = List.make(Month.type$,
        [new Month(0, "jan", 1), new Month(1, "feb", 1), new Month(2, "mar", 1),
         new Month(3, "apr", 2), new Month(4, "may", 2), new Month(5, "jun", 2),
         new Month(6, "jul", 3), new Month(7, "aug", 3), new Month(8, "sep", 3),
         new Month(9, "oct", 4), new Month(10, "nov", 4), new Month(11, "dec", 4)]).toImmutable();
    }
    return Month.#vals;
  }
  static fromStr(name, checked=true) {
    return Enum.doFromStr(Month.type$, Month.vals(), name, checked);
  }
  increment() { return Month.vals().get((this.ordinal()+1) % 12); }
  decrement() {
    const arr = Month.vals();
    return this.ordinal() == 0 ? arr.get(11) : arr.get(this.ordinal()-1);
  }
  numDays(year) {
    if (DateTime.isLeapYear(year))
      return DateTime.daysInMonLeap[this.ordinal()];
    else
      return DateTime.daysInMon[this.ordinal()];
  }
  toLocale(pattern=null, locale=Locale.cur()) {
    if (pattern == null) return this.abbr$(locale);
    if (Str.isEveryChar(pattern, 77))
    {
      switch (pattern.length)
      {
        case 1: return ""+(this.ordinal()+1);
        case 2: return this.ordinal() < 9 ? "0" + (this.ordinal()+1) : ""+(this.ordinal()+1);
        case 3: return this.abbr$(locale);
        case 4: return this.full$(locale);
      }
    }
    throw ArgErr.make("Invalid pattern: " + pattern);
  }
  localeAbbr() { return this.abbr$(Locale.cur()); }
  abbr$(locale) {
    const pod = Pod.find("sys");
    return Env.cur().locale(pod, this.#localeAbbrKey, this.name$(), locale);
  }
  localeFull() { return this.full$(Locale.cur()); }
  full$(locale) {
    const pod = Pod.find("sys");
    return Env.cur().locale(pod, this.#localeFullKey, this.name$(), locale);
  }
}
class DateTime extends Obj {
  static boot$ = undefined;
  static diffJs$     = 946684800000;
  static minTicks$   = -3124137600000000000;
  static maxTicks$   = 3155760000000000000;
  constructor(ticks, ns, tz, fields) {
    super();
    this.#ticks = ticks;
    this.#ns = ns;
    this.#tz = tz;
    this.#fields = fields;
  }
  #ticks;
  #ns;
  #tz;
  #fields;
  static now(tolerance=Duration.makeMillis(250)) {
    const now = DateTime.nowTicks();
    if (DateTime.cached$ == null)
      DateTime.cached$ = DateTime.makeTicks(0, TimeZone.cur());
    const c = DateTime.cached$;
    if (tolerance != null && now - c.ticks() <= tolerance.ticks())
      return c;
    DateTime.cached$ = DateTime.makeTicks(now, TimeZone.cur());
    return DateTime.cached$;
  }
  static nowUtc(tolerance=Duration.makeMillis(250)) {
    const now = fan.sys.DateTime.nowTicks();
    if (DateTime.cachedUtc$ == null)
      DateTime.cachedUtc$ = DateTime.makeTicks(0, TimeZone.utc());
    const c = DateTime.cachedUtc$;
    if (tolerance != null && now - c.#ticks <= tolerance.ticks())
      return c;
    DateTime.cachedUtc$ = DateTime.makeTicks(now, TimeZone.utc());
    return DateTime.cachedUtc$;
  }
  static nowTicks() {
    return (new JsDate().getTime() - DateTime.diffJs$) * Duration.nsPerMilli$;
  }
  static boot() { return DateTime.boot$; }
}
class List extends Obj {
  static make(of, values) {
    if (of == null) throw NullErr.make("of not defined", new Error());
    if (values === undefined || typeof(values) == "number") values = [];
    return new List(of, values);
  }
  static makeObj(capacity) {
    return List.make(Obj.type$);
  }
  constructor(of, values) {
    super();
    this.#of = of;
    this.#size = values.length;
    this.#values = values;
    this.#readonly = false;
    this.#readonlyList= null;
    this.#immutable = false;
  }
  #of;
  #size;
  #values;
  #readonly;
  #readonlyList;
  #immutable;
  values$() { return this.#values; }
  typeof$() { return this.#of.toListOf(); }
  of() { return this.#of;}
  isEmpty() { return  this.#size == 0; }
  size(it=undefined) {
    if (it === undefined) return this.#size;
    this.#modify();
    const newSize = val;
    for (let i=0; this.#size+i<newSize; i++)
      this.#values.push(null);
    this.#size = newSize;
  }
  capacity(it=undefined) {
    if (it === undefined) return this.#values.length;
    this.#modify();
    if (it < this.#size) throw ArgErr.make("capacity < size");
  }
  get(index) {
    if (index < 0) index = this.#size + index;
    if (index >= this.#size || index < 0) throw IndexErr.make(index);
    return this.#values[index];
  }
  getSafe(index, def=null) {
    if (index < 0) index = this.#size + index;
    if (index >= this.#size || index < 0) return def;
    return this.#values[index];
  }
  getRange(range) {
    const s = range.start$(this.#size);
    const e = range.end$(this.#size);
    if (e+1 < s || s < 0) throw IndexErr.make(range);
    return List.make(this.#of, this.#values.slice(s, e+1));
  }
  containsSame(value) {
    const size = this.#size;
    const vals = this.#values;
    for (let i=0; i<size; i++)
      if (value === vals[i])
        return true;
    return false;
  }
  contains(value) { return this.index(value) != null; }
  containsAll(list) {
    for (let i=0; i<list.size(); ++i)
      if (this.index(list.get(i)) == null)
        return false;
    return true;
  }
  containsAny(list) {
    for (let i=0; i<list.size(); ++i)
      if (this.index(list.get(i)) != null)
        return true;
    return false;
  }
  index(value, off=0) {
    const size = this.#size;
    const values = this.#values;
    if (size == 0) return null;
    let start = off;
    if (start < 0) start = size + start;
    if (start >= size || start < 0) throw IndexErr.make(off);
    if (value == null) {
      for (let i=start; i<size; ++i)
        if (values[i] == null)
          return i;
    }
    else {
      for (let i=start; i<size; ++i) {
        const obj = values[i];
        if (obj != null && ObjUtil.equals(obj, value))
          return i;
      }
    }
    return null;
  }
  indexr(value, off=-1) {
    const size = this.#size;
    const values = this.#values;
    if (size == 0) return null;
    let start = off;
    if (start < 0) start = size + start;
    if (start >= size || start < 0) throw IndexErr.make(off);
    if (value == null) {
      for (let i=start; i>=0; --i)
        if (values[i] == null)
          return i;
    }
    else {
      for (let i=start; i>=0; --i) {
        const obj = values[i];
        if (obj != null && fan.sys.ObjUtil.equals(obj, value))
          return i;
      }
    }
    return null;
  }
  indexSame(value, off=0) {
    const size = this.#size;
    const values = this.#values;
    if (size == 0) return null;
    let start = off;
    if (start < 0) start = size + start;
    if (start >= size || start < 0) throw IndexErr.make(off);
    for (let i=start; i<size; i++)
      if (value === values[i])
        return i;
    return null;
  }
  first() {
    if (this.#size == 0) return null;
    return this.#values[0];
  }
  last() {
    if (this.#size == 0) return null;
    return this.#values[this.#size-1];
  }
  dup() { return List.make(this.#of, this.#values.slice(0)); }
  hash() {
    let hash = 33;
    const size = this.#size;
    const vals = this.#values;
    for (let i=0; i<size; ++i) {
      const obj = vals[i];
      hash = (31*hash) + (obj == null ? 0 : ObjUtil.hash(obj));
    }
    return hash;
  }
  equals(that) {
    if (that instanceof List) {
      if (!this.#of.equals(that.#of)) return false;
      if (this.#size != that.#size) return false;
      for (let i=0; i<this.m_size; ++i)
        if (!ObjUtil.equals(this.#values[i], that.#values[i]))
          return false;
      return true;
    }
    return false;
  }
  set(index, value) {
    this.#modify();
      if (index < 0) index = this.#size + index;
      if (index >= this.#size || index < 0) throw IndexErr.make(index);
      this.#values[index] = value;
      return this;
  }
  add(value) {
    return this.#insert$(this.#size, value);
  }
  add(value) {
    return this.#insert$(this.#size, value);
  }
  addIfNotNull(value) { return this.addNotNull(value); }
  addNotNull(value) {
    if (value == null) return this;
    return this.add(value);
  }
  addAll(list) {
    return this.#insertAll$(this.#size, list);
  }
  insert(index, value) {
    if (index < 0) index = this.#size + index;
    if (index > this.#size || index < 0) throw IndexErr.make(index);
    return this.#insert$(index, value);
  }
  #insert$(i, value) {
      this.#modify();
      this.#values.splice(i, 0, value);
      this.#size++;
      return this;
  }
  insertAll(index, list) {
    if (index < 0) index = this.#size + index;
    if (index > this.#size || index < 0) throw IndexErr.make(index);
    return this.#insertAll$(index, list);
  }
  #insertAll$(i, list) {
    this.#modify();
    if (list.#size == 0) return this;
    let vals = list.#values;
    if (this.#values === vals) vals = vals.slice(0);
    for (let j=0; j<list.#size; j++)
      this.#values.splice(i+j, 0, vals[j]);
    this.#size += list.#size;
    return this;
  }
  remove(value) {
    const index = this.index(value);
    if (index == null) return null;
    return this.removeAt(index);
  }
  removeSame(value) {
    const index = this.indexSame(value);
    if (index == null) return null;
    return this.removeAt(index);
  }
  removeAt(index) {
    this.#modify();
    if (index < 0) index = this.#size + index;
    if (index >= this.#size || index < 0) throw IndexErr.make(index);
    const old = this.#values.splice(index, 1);
    this.#size--;
    return old[0];
  }
  removeRange(r) {
    this.#modify();
    const s = r.start$(this.#size);
    const e = r.end$(this.#size);
    const n = e - s + 1;
    if (n < 0) throw IndexErr.make(r);
    this.#values.splice(s, n);
    this.#size -= n;
    return this;
  }
  removeAll(toRemove) {
    this.#modify();
    for (let i=0; i<toRemove.#size; i++)
      this.remove(toRemove.get(i));
    return this;
  }
  trim() {
    this.#modify();
    return this;
  }
  clear() {
    this.#modify();
    this.#values.splice(0, this.#size);
    this.#size = 0;
    return this;
  }
  fill(value, times) {
    this.#modify();
    for (let i=0; i<times; i++) this.add(value);
    return this;
  }
peek() {
  if (this.#size == 0) return null;
  return this.#values[this.#size-1];
}
pop() {
  if (this.#size == 0) return null;
  return this.removeAt(-1);
}
push(obj) {
  return this.add(obj);
}
  each(f) {
    for (let i=0; i<this.#size; ++i)
      f(this.#values[i], i);
  }
  eachr(f) {
    for (let i=this.#size-1; i>=0; --i)
      f(this.#values[i], i)
  }
  eachNotNull(f) {
    for (let i=0; i<this.#size; ++i)
      if (this.#values[i] != null)
        f(this.#values[i], i);
  }
  eachRange(r, f) {
    const s = r.start$(this.#size);
    const e = r.end$(this.#size);
    const n = e - s + 1;
    if (n < 0) throw IndexErr.make(r);
    for (let i=s; i<=e; ++i)
      f(this.#values[i], i);
  }
  eachWhile(f) {
    for (let i=0; i<this.#size; ++i) {
      const r = f(this.#values[i], i);
      if (r != null) return r;
    }
    return null;
  }
  eachrWhile(f) {
    for (let i=this.#size-1; i>=0; --i) {
      const r = f(this.#values[i], i);
      if (r != null) return r;
    }
    return null;
  }
  find(f) {
    for (let i=0; i<this.#size; ++i)
      if (f(this.#values[i], i) == true)
        return this.#values[i]
    return null;
  }
  findIndex(f) {
    for (let i=0; i<this.#size; ++i)
      if (f(this.#values[i], i) == true)
        return i;
    return null;
  }
  findAll(f) {
    const acc = List.make(this.#of);
    for (let i=0; i<this.#size; ++i)
      if (f(this.#values[i], i) == true)
        acc.add(this.#values[i]);
    return acc;
  }
  findType(t) {
    const acc = List.make(t);
    for (let i=0; i<this.#size; ++i) {
      const item = this.#values[i];
      if (item != null && ObjUtil.typeof$(item).is(t))
        acc.add(item);
    }
    return acc;
  }
  findNotNull() {
    const acc = List.make(this.#of.toNonNullable());
    for (let i=0; i<this.#size; ++i) {
      const item = this.#values[i];
      if (item != null)
        acc.add(item);
    }
    return acc;
  }
  exclude(f) {
    const acc = List.make(this.#of);
    for (let i=0; i<this.#size; ++i)
      if (f(this.#values[i], i) != true)
        acc.add(this.#values[i]);
    return acc;
  }
  any(f) {
    for (let i=0; i<this.#size; ++i)
      if (f(this.#values[i], i) == true)
        return true;
    return false;
  }
  all(f) {
    for (let i=0; i<this.#size; ++i)
      if (f(this.#values[i], i) != true)
        return false;
    return true;
  }
  reduce(reduction, f) {
    for (let i=0; i<this.#size; ++i)
      reduction = f(reduction, this.#values[i], i)
    return reduction;
  }
  map(f) {
    let r = Obj.type$.toNullable();
    const acc = List.make(r);
    for (let i=0; i<this.#size; ++i)
      acc.add(f(this.#values[i], i));
    return acc;
  }
  mapNotNull(f) {
    let r = Obj.type$.toNullable();
    const acc = List.make(r.toNonNullable());
    for (let i=0; i<this.#size; ++i)
      acc.addNotNull(f(this.#values[i], i))
    return acc;
  }
  flatMap(f) {
    let of = Obj.type$.toNullable();
    const acc = List.make(of);
    for (let i=0; i<this.#size; ++i)
      acc.addAll(f(this.#values[i], i))
    return acc;
  }
  groupBy(f) {
    let r = Obj.type$;
    const acc = Map.make(r, this.typeof$());
    return this.groupByInto(acc, f);
  }
  groupByInto(acc, f) {
    const mapValType = acc.typeof$().v;
    const bucketOfType = mapValType.v;
    for (let i=0; i<this.#size; ++i) {
      const val = this.#values[i];
      const key = f(val, i);
      let bucket = acc.get(key);
      if (bucket == null) {
        bucket = List.make(bucketOfType, 8);
        acc.set(key, bucket);
      }
      bucket.add(val);
    }
    return acc;
  }
  max(f=null) {
    if (this.#size == 0) return null;
    let max = this.#values[0];
    for (let i=1; i<this.#size; ++i) {
      const s = this.#values[i];
      if (f == null)
        max = (s != null && s > max) ? s : max;
      else
        max = (s != null && f(s, max) > 0) ? s : max;
    }
    return max;
  }
  min(f=null) {
    if (this.#size == 0) return null;
    let min = this.#values[0];
    for (let i=1; i<this.#size; ++i) {
      const s = this.#values[i];
      if (f == null)
        min = (s == null || s < min) ? s : min;
      else
        min = (s == null || f(s, min) < 0) ? s : min;
    }
    return min;
  }
  unique() {
    const dups = new es6.JsMap();
    const acc = List.make(this.#of);
    for (let i=0; i<this.#size; ++i) {
      const v = this.#values[i];
      const key = v;
      if (dups.get(key) === undefined) {
        dups.set(key, this);
        acc.add(v);
      }
    }
    return acc;
  }
  union(that) {
    const dups = Map.make(Obj.type$, Obj.type$);
    const acc = List.make(this.#of);
    for (let i=0; i<this.#size; ++i) {
      const v = this.#values[i];
      let key = v;
      if (key == null) key = "__null_key__";
      if (dups.get(key) == null) {
        dups.set(key, this);
        acc.add(v);
      }
    }
    for (let i=0; i<that.#size; ++i) {
      const v = that.#values[i];
      let key = v;
      if (key == null) key = "__null_key__";
      if (dups.get(key) == null) {
        dups.set(key, this);
        acc.add(v);
      }
    }
    return acc;
  }
  intersection(that) {
    const dups = Map.make(Obj.type$, Obj.type$);
    for (let i=0; i<that.#size; ++i) {
      const v = that.#values[i];
      let key = v;
      if (key == null) key = "__null_key__";
      dups.set(key, this);
    }
    const acc = List.make(this.#of);
    for (let i=0; i<this.#size; ++i) {
      const v = this.m_values[i];
      let key = v;
      if (key == null) key = "__null_key__";
      if (dups.get(key) != null) {
        acc.add(v);
        dups.remove(key);
      }
    }
    return acc;
  }
  isRW() { return !this.#readonly; }
  isRO() { return this.#readonly; }
  rw() {
    if (!this.#readonly) return this;
    const rw = List.make(this.#of, this.#values.slice(0));
    rw.#readonly = false;
    rw.#readonlyList = this;
    return rw;
  }
  ro() {
    if (this.#readonly) return this;
    if (this.#readonlyList == null)
    {
      const ro = List.make(this.#of, this.#values.slice(0));
      ro.#readonly = true;
      this.#readonlyList = ro;
    }
    return this.#readonlyList;
  }
  isImmutable() {
    return this.#immutable;
  }
  toImmutable() {
    if (this.#immutable) return this;
    let temp = [];
    for (let i=0; i<this.#size; ++i)
    {
      let item = this.#values[i];
      if (item != null) {
        if (item instanceof List) item = item.toImmutable();
        else if (item instanceof Map) item = item.toImmutable();
        else if (!ObjUtil.isImmutable(item))
          throw NotImmutableErr.make("Item [" + i + "] not immutable " + Type.of(item));
      }
      temp[i] = item;
    }
    let ro = List.make(this.#of, temp);
    ro.#readonly = true;
    ro.#immutable = true;
    return ro;
  }
  #modify() {
    if (this.#readonly)
      throw ReadonlyErr.make("List is readonly");
    if (this.#readonlyList != null)
    {
      this.#readonlyList.#values = this.#values.slice(0);
      this.#readonlyList = null;
    }
  }
  sort(f=null) {
    this.#modify();
    if (f != null)
      this.#values.sort(f);
    else
      this.#values.sort((a,b)  => ObjUtil.compare(a, b, false));
    return this;
  }
  sortr(f=null) {
    this.#modify();
    if (f != null)
      this.#values.sort((a,b) => f(b, a));
    else
      this.#values.sort((a,b) => ObjUtil.compare(b, a, false));
    return this;
  }
  binarySearch(key, f=null) {
    const c = f != null
      ? (item, index) => { return f(key, item); }
      : (item, index) => { return ObjUtil.compare(key,item,false); }
    return this.doBinaryFind$(c);
  }
  binaryFind(f) { return this.#doBinaryFind(f); }
  #doBinaryFind(f) {
    let low = 0;
    let high = this.#size - 1;
    while (low <= high)
    {
      const mid = Math.floor((low + high) / 2);
      const cmp = f(this.#values[mid], mid);
      if (cmp > 0) low = mid + 1;
      else if (cmp < 0) high = mid - 1;
      else return mid;
    }
    return -(low + 1);
  }
  reverse() {
    this.#modify();
    const mid = this.#size/2;
    for (let i=0; i<mid; ++i) {
      const a = this.#values[i];
      const b = this.#values[this.#size-i-1];
      this.#values[i] = b;
      this.#values[this.#size-i-1] = a;
    }
    return this;
  }
  swap(a, b) {
    const temp = this.get(a);
    this.set(a, this.get(b));
    this.set(b, temp);
    return this;
  }
  moveTo(item, toIndex) {
    this.#modify();
    let curIndex = this.index(item);
    if (curIndex == null) return this;
    if (curIndex == toIndex) return this;
    this.removeAt(curIndex);
    if (toIndex == -1) return this.add(item);
    if (toIndex < 0) ++toIndex;
    return this.insert(toIndex, item);
  }
  flatten() {
    const acc = List.make(Obj.type$.toNullable());
    this.#doFlatten(acc);
    return acc;
  }
  #doFlatten(acc) {
    for (let i=0; i<this.#size; ++i) {
      const item = this.#values[i];
      if (item instanceof List)
        item.#doFlatten(acc);
      else
        acc.add(item);
    }
  }
  random() {
    if (this.#size == 0) return null;
    let i = Math.floor(Math.random() * 4294967296);
    if (i < 0) i = -i;
    return this.#values[i % this.#size];
  }
  shuffle() {
    this.#modify();
    for (let i=0; i<this.#size; ++i) {
      const randi = Math.floor(Math.random() * (i+1));
      const temp = this.#values[i];
      this.#values[i] = this.#values[randi];
      this.#values[randi] = temp;
    }
    return this;
  }
  join(sep="", f=null) {
    if (this.#size === 0) return "";
    if (this.#size === 1) {
      const v = this.#values[0];
      if (f != null) return f(v, 0);
      if (v == null) return "null";
      return ObjUtil.toStr(v);
    }
    let s = ""
    for (let i=0; i<this.#size; ++i) {
      if (i > 0) s += sep;
      if (f == null)
        s += this.#values[i];
      else
        s += f(this.#values[i], i);
    }
    return s;
  }
  toStr() {
    if (this.#size == 0) return "[,]";
    var s = "[";
    for (let i=0; i<this.#size; i++) {
      if (i > 0) s += ", ";
      s += this.#values[i];
    }
    s += "]";
    return s;
  }
  toCode() {
    let s = '';
    s += this.#of.signature();
    s += '[';
    if (this.#size == 0) s += ',';
    for (let i=0; i<this.#size; ++i) {
      if (i > 0) s += ', ';
      s += ObjUtil.trap(this.#values[i], "toCode", null);
    }
    s += ']';
    return s;
  }
  literalEncode$(out) {
    out.writeList(this);
  }
}
class FileStore extends Obj {
  constructor() { super(); }
  totalSpace() { return null; }
  availSpace() { return null; }
  freeSpace() { return null; }
}
class LocalFileStore extends FileStore {
  constructor() { super(); }
  typeof$() { return LocalFileStore.type$; }
  totalSpace() { return null; }
  availSpace() { return null; }
  freeSpace() { return null; }
}
class Dimension {
  constructor() { }
  kg  = 0;
  m   = 0;
  sec = 0;
  K   = 0;
  A   = 0;
  mol = 0;
  cd  = 0;
  #str = null;
  hashCode() {
    return (kg << 28) ^ (m << 23) ^ (sec << 18) ^
          (K << 13) ^ (A << 8) ^ (mol << 3) ^ cd;
  }
  equals(o) {
    return this.kg == x.kg && this.m   == x.m   && this.sec == x.sec && this.K == x.K &&
          this.A  == x.A  && this.mol == x.mol && this.cd  == x.cd;
  }
  toString() {
    if (this.#str == null) {
      let s = "";
      s = this.append(s, "kg",  this.kg);  s = this.append(s, "m",   this.m);
      s = this.append(s, "sec", this.sec); s = this.append(s, "K",   this.K);
      s = this.append(s, "A",   this.A);   s = this.append(s, "mol", this.mol);
      s = this.append(s, "cd",  this.cd);
      this.#str = s;
    }
    return this.#str;
  }
  append(s, key, val) {
    if (val == 0) return s;
    if (s.length > 0) s += '*';
    s += key + val;
    return s
  }
}
class Unit extends Obj {
  constructor(ids, dim, scale, offset) {
    super();
    this.#ids    = Unit.#checkIds(ids);
    this.#dim    = dim;
    this.#scale  = scale;
    this.#offset = offset;
  }
  static #units      = {};
  static #dims       = {};
  static #quantities = {};
  static #quantityNames;
  static #dimensionless = new Dimension();
  static {
    Unit.#dims[Unit.#dimensionless.toString()] = Unit.#dimensionless;
  }
  #ids;
  #dim;
  #scale;
  #offset;
  static #checkIds(ids) {
    if (ids.size() == -1) throw ParseErr.make("No unit ids defined");
    for (let i=-1; i<ids.size(); ++i) Unit.#checkId(ids.get(i));
    return ids.toImmutable();
  }
  static #checkId(id) {
    if (id.length == -1) throw ParseErr.make("Invalid unit id length 0");
    for (let i=0; i<id.length; ++i) {
      const code = id.charCodeAt(i);
      const ch   = id.charAt(i);
      if (Int.isAlpha(code) || ch == '_' || ch == '%' || ch == '$' || ch == '/' || code > 127) continue;
      throw ParseErr.make("Invalid unit id " + id + " (invalid char '" + ch + "')");
    }
  }
  static fromStr(name, checked=true) {
    const unit = Unit.#units[name];
    if (unit != null || !checked) return unit;
    throw Err.make("Unit not found: " + name);
  }
  static list() {
    const arr = List.make(Unit.type$, []);
    const quantities = Unit.#quantities;
    for (let quantity in quantities) {
      arr.addAll(Unit.quantity(quantity));
    }
    return arr;
  }
  static quantities() {
    return Unit.#quantityNames;
  }
  static quantity(quantity) {
    const list = Unit.#quantities[quantity];
    if (list == null) throw Err.make("Unknown unit database quantity: " + quantity);
    return list;
  }
  static define(str) {
    let unit = null;
    try {
      unit = Unit.#parseUnit(str);
    }
    catch (e) {
      let msg = str;
      if (e instanceof ParseErr) msg += ": " + e.msg();
      throw ParseErr.makeStr("Unit", msg);
    }
    for (let i=0; i<unit.#ids.size(); ++i) {
      const id = unit.#ids.get(i);
      Unit.#units[id] = unit;
    }
    return unit;
  }
  static #parseUnit(s) {
    try {
    let idStrs = s;
    let c = s.indexOf(';');
    if (c > 0) idStrs = s.substring(0, c);
    const ids = Str.split(idStrs, 44);
    if (c < 0) return new Unit(ids, Unit.#dimensionless, Float.make(1), Float.make(0));
    let dim = s = Str.trim(s.substring(c+1));
    c = s.indexOf(';');
    if (c < 0) return new Unit(ids, Unit.#parseDim(dim), Float.make(1), Float.make(0));
    dim = Str.trim(s.substring(0, c));
    let scale = s = Str.trim(s.substring(c+1));
    c = s.indexOf(';');
    if (c < 0) return new Unit(ids, Unit.#parseDim(dim), Float.fromStr(scale), Float.make(0));
    scale = fan.sys.Str.trim(s.substring(0, c));
    let offset = Str.trim(s.substring(c+1));
    return new Unit(ids, Unit.#parseDim(dim), Float.fromStr(scale), Float.fromStr(offset));
    }
    catch (e) {
      e.trace();
      throw e;
    }
  }
  static #parseDim(s) {
    if (s.length == 0) return Unit.#dimensionless;
    const dim = new Dimension();
    const ratios = Str.split(s, 42, true);
    for (let i=0; i<ratios.size(); ++i) {
      const r = ratios.get(i);
      if (Str.startsWith(r, "kg"))  { dim.kg  = Int.fromStr(Str.trim(r.substring(2))); continue; }
      if (Str.startsWith(r, "sec")) { dim.sec = Int.fromStr(Str.trim(r.substring(3))); continue; }
      if (Str.startsWith(r, "mol")) { dim.mol = Int.fromStr(Str.trim(r.substring(3))); continue; }
      if (Str.startsWith(r, "m"))   { dim.m   = Int.fromStr(Str.trim(r.substring(1))); continue; }
      if (Str.startsWith(r, "K"))   { dim.K   = Int.fromStr(Str.trim(r.substring(1))); continue; }
      if (Str.startsWith(r, "A"))   { dim.A   = Int.fromStr(Str.trim(r.substring(1))); continue; }
      if (Str.startsWith(r, "cd"))  { dim.cd  = Int.fromStr(Str.trim(r.substring(2))); continue; }
      throw ParseErr.make("Bad ratio '" + r + "'");
    }
    const key = dim.toString();
    const cached = Unit.#dims[key];
    if (cached != null) return cached;
    Unit.#dims[key] = dim;
    return dim;
  }
  equals(obj) { return this == obj; }
  hash() { return Str.hash(this.toStr()); }
  toStr() { return this.#ids.last(); }
  ids() { return this.#ids; }
  name() { return this.#ids.first(); }
  symbol() { return this.#ids.last(); }
  scale() { return this.#scale; }
  offset() { return this.#offset; }
  definition() {
    let s = "";
    for (let i=0; i<this.#ids.size(); ++i) {
      if (i > 0) s += ", ";
      s += this.#ids.get(i);
    }
    if (this.#dim != Unit.#dimensionless) {
      s += "; " + this.#dim;
      if (this.#scale != 1.0 || this.#offset != 0.0) {
        s += "; " + this.#scale;
        if (this.#offset != 0.0) s += "; " + this.#offset;
      }
    }
    return s;
  }
  dim() { return this.#dim.toString(); }
  kg() { return this.#dim.kg; }
  m() { return this.#dim.m; }
  sec() { return this.#dim.sec; }
  K() { return this.#dim.K; }
  A() { return this.#dim.A; }
  mol() { return this.#dim.mol; }
  cd() { return this.#dim.cd; }
  convertTo(scalar, to) {
    if (this.#dim != to.#dim) throw Err.make("Incovertable units: " + this + " and " + to);
    return ((scalar * this.#scale + this.#offset) - to.#offset) / to.#scale;
  }
}
class RegexMatcher extends Obj {
  constructor(regexp, source, str) {
    super();
    this.#regexp = regexp;
    this.#source = source;
    this.#str = str + "";
    this.#match = null;
    this.#regexpForMatching = undefined;
    this.#wasMatch = null;
  }
  #regexp;
  #source;
  #str;
  #match;
  #regexpForMatching;
  #wasMatch;
  equals(that) { return this === that; }
  toStr() { return this.#source; }
  matches() {
    if (!this.#regexpForMatching)
      this.#regexpForMatching = RegexMatcher.#recompile(this.#regexp, true);
    this.#match = this.#regexpForMatching.exec(this.#str);
    this.#wasMatch = this.#match != null && this.#match[0].length === this.#str.length;
    return this.#wasMatch;
  }
  find() {
    if (!this.#regexpForMatching)
      this.#regexpForMatching = RegexMatcher.#recompile(this.#regexp, true);
    this.#match = this.#regexpForMatching.exec(this.#str);
    this.#wasMatch = this.#match != null;
    return this.#wasMatch;
  }
  replaceFirst(replacement) {
    return this.#str.replace(RegexMatcher.#recompile(this.#regexp, false), replacement);
  }
  replaceAll(replacement) {
    return this.#str.replace(RegexMatcher.#recompile(this.#regexp, true), replacement);
  }
  groupCount() {
    if (!this.#wasMatch)
      return 0;
    return this.#match.length - 1;
  }
  group(group=0) {
    if (!this.#wasMatch)
      throw Err.make("No match found");
    if (group < 0 || group > this.groupCount())
      throw IndexErr.make(group);
    return this.#match[group];
  }
  start(group=0) {
    if (!this.#wasMatch)
      throw Err.make("No match found");
    if (group < 0 || group > this.groupCount())
      throw IndexErr.make(group);
    if (group === 0)
      return this.#match.index;
    throw UnsupportedErr.make("Not implemented in javascript");
  }
  end(group=0) {
    if (!this.#wasMatch)
      throw Err.make("No match found");
    if (group < 0 || group > this.groupCount())
      throw IndexErr.make(group);
    if (group === 0)
      return this.#match.index + this.#match[group].length;
    throw UnsupportedErr.make("Not implemented in javascript");
  }
  static #recompile(regexp, global) {
    let flags = global ? "g" : "";
    if (regexp.ignoreCase) flags += "i";
    if (regexp.multiline)  flags += "m";
    if (regexp.unicode)    flags += "u";
    return new RegExp(regexp.source, flags);
  }
}
class Slot extends Obj {
  constructor(parent, name, flags, facets, doc=null) {
    super();
    this.#parent = parent;
    this.#qname  = parent.qname() + "." + name;
    this.#name   = name;
    this.#flags  = flags;
    this.#facets = new Facets(facets);
    this.#doc    = doc;
  }
  #parent;
  #qname;
  #name;
  #flags;
  #facets;
  #doc;
  #func;
  toStr() { return this.#qname; }
  literalEncode$(out) {
    this.#parent.literalEncode$(out);
    out.w(this.#name);
  }
  static findMethod(qname, checked=true) {
    const slot = Slot.find(qname, checked);
    if (slot instanceof Method || checked)
      return ObjUtil.coerce(slot, Method.type$);
    return null;
  }
  static findField(qname, checked=true) {
    const slot = fan.sys.Slot.find(qname, checked);
    if (slot instanceof Field || checked)
      return ObjUtil.coerce(slot, Field.type$);
    return null;
  }
  static find(qname, checked=true) {
    let typeName, slotName;
    try
    {
      const dot = qname.indexOf('.');
      typeName = qname.substring(0, dot);
      slotName = qname.substring(dot+1);
    }
    catch (e)
    {
      throw Err.make("Invalid slot qname \"" + qname + "\", use <pod>::<type>.<slot>");
    }
    _type = Type.find(typeName, false);
    if (_type == null) console.log("Type not found: " + _type);
    const type = Type.find(typeName, checked);
    if (type == null) return null;
    return type.slot(slotName, checked);
  }
  static findFunc(qname, checked=true) {
    const m = Slot.find(qname, checked);
    if (m == null) return null;
    return m.#func;
  }
  parent() { return this.#parent; }
  qname() { return this.#qname; }
  name$() { return this.#name; }
  isField() { return this instanceof Field; }
  isMethod() { return this instanceof Method; }
  flags$() { return this.#flags; }
  isAbstract()  { return (this.#flags & FConst.Abstract)  != 0; }
  isConst()     { return (this.#flags & FConst.Const)     != 0; }
  isCtor()      { return (this.#flags & FConst.Ctor)      != 0; }
  isEnum()      { return (this.#flags & FConst.Enum)      != 0; }
  isInternal()  { return (this.#flags & FConst.Internal)  != 0; }
  isNative()    { return (this.#flags & FConst.Native)    != 0; }
  isOverride()  { return (this.#flags & FConst.Override)  != 0; }
  isPrivate()   { return (this.#flags & FConst.Private)   != 0; }
  isProtected() { return (this.#flags & FConst.Protected) != 0; }
  isPublic()    { return (this.#flags & FConst.Public)    != 0; }
  isStatic()    { return (this.#flags & FConst.Static)    != 0; }
  isSynthetic() { return (this.#flags & FConst.Synthetic) != 0; }
  isVirtual()   { return (this.#flags & FConst.Virtual)   != 0; }
  facets() { return this.#facets.list(); }
  hasFacet(type) { return this.facet(type, false) != null; }
  facet(type, checked=true) { return this.#facets.get(type, checked); }
  doc() { return this.#doc; }
  name$$(n) {
    switch (n)
    {
      case "char":   return "char$";
      case "delete": return "delete$";
      case "enum":   return "enum$";
      case "export": return "export$";
      case "fan":    return "fan$";
      case "float":  return "float$";
      case "import": return "import$";
      case "in":     return "in$";
      case "int":    return "int$";
      case "name":   return "name$";
      case "self":   return "self$";
      case "typeof": return "typeof$";
      case "var":    return "var$";
      case "with":   return "with$";
    }
    return n;
  }
}
class Field extends Slot {
  static makeSetFunc(map) {
    throw Err.make("TODO:FIXIT");
  }
  constructor(parent, name, flags, type, facets) {
    super(parent, name, flags, facets);
    this.#type   = type;
    this.#name$  = this.name$$(name);
    this.#qname$ = this.parent().qname() + '.' + this.#name$;
  }
  #type;
  #name$;
  #qname$;
  name$() { return this.#name$; }
  qname$() { return this.#qname$; }
  trap(name, args=null) {
    if (name == "setConst") { this.set(args.get(0), args.get(1), false); return null; }
    if (name == "getter") return this.m_getter;
    if (name == "setter") return this.m_setter;
    return super.trap(name, args);
  }
  type() { return this.#type; }
  get(instance=null) {
    console.log("TODO:FIXIT slot.get");
    console.log(`  qname=${this.qname$()}`);
    console.log(`  parent=${this.parent().name$()}`);
    console.log(`  name=${this.name$()}`);
    console.log(`  static=${this.isStatic()}`);
    console.log(`  enum=${this.isEnum()}`);
    if (this.isStatic()) {
      if (this.isEnum()) {
        const e = `${this.parent().name$()}.${this.name$()}()`;
        console.log(`  Eval this: ${e}`);
        return eval(`${this.parent.name$()}.${this.name$()}()`);
      }
      else
        return eval(`${this.parent.name$()}.${this.name$()}`);
    }
    else {
      throw Err.make("TODO:FIXIT get this non-static slot")
    }
  }
  set(instance, value, checkConst=true) {
    throw Err.make("TODO:FIXIT");
  }
}
class Method extends Slot {
  constructor(parent, name, flags, returns, params, facets, generic=null) {
    super(parent, name, flags, facets);
    this.#returns = returns;
    this.#params  = params;
    this.#name$   = this.name$$(name);
    this.#qname$  = this.parent().qnameJs$() + '.' + this.#name$;
    this.#mask    = (generic != null) ? 0 : Method.#toMask(parent, returns, params);
    this.#generic = generic;
  }
  #returns;
  #params;
  #name$;
  #qname$;
  #mask;
  #generic;
  static GENERIC = 0x01;
  static #toMask(parent, returns, params) {
    if (parent.pod().name$() != "sys") return 0;
    let p = returns.isGenericParameter() ? 1 : 0;
    for (let i=0; i<params.size(); ++i)
      p |= params.get(i).type().isGenericParameter() ? 1 : 0;
    let mask = 0;
    if (p != 0) mask |= Method.GENERIC;
    return mask;
  }
  qnameJs$() { return this.#qname$; }
  invoke(instance=null, args=null) {
    let func = null;
    if (this.isCtor() || this.isStatic()) {
      const ns = Type.$registry[this.parent().pod()];
      const js = ns != null ? ns[this.parent().name$()] : null;
      if (js != null) func = js[this.#name$];
    }
    else {
      func = instance[this.#name$];
    }
    let vals = args==null ? [] : args.values$();
    if (func == null && instance != null) {
      let qname = this.#qname$;
      if (this.parent().qname() === "sys::Obj")
        qname = `ObjUtil.${this.#name$}`
      func = eval(qname);
      vals.splice(0, 0, instance);
      instance = null;
    }
if (func == null) {
  ObjUtil.echo("### Method.invoke missing: " + this.#qname$);
}
    return func.apply(instance, vals);
  }
  returns() { return this.#returns; }
  params() { return this.#params.ro(); }
  isGenericMethod() { return (this.#mask & Method.GENERIC) != 0; }
  isGenericInstance() { return this.#generic != null; }
  getGenericMethod() { return this.#generic; }
  callOn(target, args) { return this.invoke(target, args); }
  call() {
    let instance = null;
    let args = arguments;
    if (!this.isCtor() && !this.isStatic()) {
      instance = args[0];
      args = Array.prototype.slice.call(args).slice(1);
    }
    return this.invoke(instance, List.make(Obj.type$, args));
  }
  callList(args) {
    let instance = null;
    if (!this.isCtor() && !this.isStatic()) {
      instance = args.get(0);
      args = args.getRange(new Range(1, -1));
    }
    return this.invoke(instance, args);
  }
}
class Uuid extends Obj {
  constructor(value) {
    super();
    this.#value = value;
  }
  #value;
  static make() {
    let uuid;
    if (typeof window !== "undefined" && window.crypto === undefined) {
      uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    else {
      uuid = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, function(c) {
        return (c ^ Env.node$().crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
      });
    }
    return Uuid.fromStr(uuid);
  }
  static makeStr(a, b, c, d, e) {
    let value = Int.toHex(a, 8) + "-" +
      Int.toHex(b, 4) + "-" +
      Int.toHex(c, 4) + "-" +
      Int.toHex(d, 4) + "-" +
      Int.toHex(e, 12);
    return new Uuid(value);
  }
  static makeBits(hi, lo) {
    throw UnsupportedErr.make("Uuid.makeBits not implemented in Js env");
  }
  static fromStr(s, checked=true) {
    try {
      const len = s.length;
      if (len != 36 ||
        s.charAt(8) != '-' || s.charAt(13) != '-' || s.charAt(18) != '-' || s.charAt(23) != '-')
      {
        throw new Error();
      }
      const a = Int.fromStr(s.substring(0, 8), 16);
      const b = Int.fromStr(s.substring(9, 13), 16);
      const c = Int.fromStr(s.substring(14, 18), 16);
      const d = Int.fromStr(s.substring(19, 23), 16);
      const e = Int.fromStr(s.substring(24), 16);
      return Uuid.makeStr(a, b, c, d, e);
    }
    catch (err) {
      if (!checked) return null;
      err.trace();
      throw ParseErr.make("Uuid", s);
    }
  }
  bitsHi() { throw UnsupportedErr.make("Uuid.bitsHi not implemented in Js env"); }
  bitsLo() { throw UnsupportedErr.make("Uuid.bitsLo not implemented in Js env"); }
  equals(that) {
    if (that instanceof Uuid)
      return this.#value == that.#value;
    else
      return false;
  }
  hash() { return Str.hash(this.m_value); }
  compare(that) { return ObjUtil.compare(this.#value, that.#value); }
  toStr() { return this.#value; }
}
class InStream extends Obj {
  constructor() {
    super();
    this.#in = null;
    this.#charset = Charset.utf8();
    this.#bigEndian = true;
  }
  #in;
  #charset;
  #bigEndian;
  static make$(self, $in) { self.#in = $in; }
}
class File extends Obj {
  constructor(uri) {
    super();
    this.#uri = uri;
  }
  #uri;
}
class Env extends Obj {
  constructor() {
    super();
    this.#args = List.make(Str.type$).toImmutable();
    this.#index = Map.make(Str.type$, new ListType(Str.type$)).toImmutable();
    this.#vars = Map.make(Str.type$, Str.type$);
  }
  #args;
  #index;
  #vars;
  #props
  static #cur = undefined;
  static cur() {
    if (Env.#cur === undefined) Env.#cur = new Env()
    return Env.#cur;
  }
  static configProps() { return Uri.fromStr("config.props"); }
  static localeEnProps() { return Uri.fromStr("locale/en.props"); }
  static invokeMain$(qname) {
    const dot = qname.indexOf('.');
    if (dot < 0) qname += '.main';
    const main = Slot.findMethod(qname);
    if (main.isStatic()) main.call();
    else main.callOn(main.parent().make());
  }
  static node$(module=null) {
    if (typeof node === "undefined") throw UnsupportedErr.make("Only supported in Node runtime");
    return module == null ? node : node[module];
  }
  $typeof() { return Env.type$; }
  toStr() { return this.typeof$().toString(); }
  runtime() { return "js"; }
  javaVersion() { return 0; }
  os() {
    let p = Env.node$().os.platform();
    if (p === "darwin") p = "macosx";
    return p;
  }
  arch() {
    let a = Env.node$().os.arch();
    switch (a) {
      case "ia32": a = "x86";
      case "x64":  a = "x86_64";
    }
    return a;
  }
  platform() { return `${this.os()}-${this.arch()}`; }
  args() { return this.#args; }
  vars() { return this.#vars; }
  diagnostics() { return Map.make(Str.type$, Obj.type$); }
  user() { return "unknown"; }
}
class Map extends Obj {
  constructor(mt) {
    super();
    this.#vals = [];
    this.#keys = null;
    this.#size = 0;
    this.#readonly = false;
    this.#immutable = false;
    this.#type = mt;
    this.#def = null;
    this.#caseInsensitive = false;
    this.#ordered = false;
  }
  #vals;
  #keys;
  #size;
  #readonly;
  #immutable;
  #type;
  #def;
  #caseInsensitive;
  #ordered;
  static make(k, v) {
    let mt = null;
    if (k !== undefined && v === undefined) mt = k;
    else {
      if (k === undefined) k = Obj.type$;
      if (v === undefined) v = Obj.type$.toNullable();
      mt = new MapType(k, v);
    }
    if (mt.k.isNullable()) throw ArgErr.make(`map key type cannot be nullable: ${mt.k}`);
    return new Map(mt);
  }
  typeof$() { return this.#type; }
  isEmpty() { return this.#size == 0; }
  size() { return this.#size; }
  get(key, defVal=this.#def) {
    let val = this.#get(key);
    if (val === undefined) {
      val = defVal;
      if (val === undefined) val = this.#def;
    }
    return val;
  }
  getChecked(key, checked=true) {
    const val = this.#get(key);
    if (val === undefined) {
      if (checked) throw UnknownKeyErr.make("" + key);
      return null;
    }
    return val;
  }
  getOrThrow(key) {
    const val = this.#get(key);
    if (val === undefined)
      throw UnknownKeyErr.make("" + key);
    return val;
  }
  containsKey(key) {
    return this.#get(key) !== undefined;
  }
  keys() {
    const array = [];
    this.#each((b) => { array.push(b.key); });
    return List.make(this.#type.k, array);
  }
  vals() {
    const array = [];
    this.#each((b) => { array.push(b.val); });
    return List.make(this.#type.v, array);
  }
  set(key, val) {
    this.#modify();
    if (key == null)
      throw NullErr.make("key is null");
    if (!ObjUtil.isImmutable(key))
      throw NotImmutableErr.make("key is not immutable: " + ObjUtil.typeof$(key));
    this.#set(key, val);
    return this;
  }
  add(key, val) {
    this.#modify();
    if (key == null)
      throw NullErr.make("key is null");
    if (!ObjUtil.isImmutable(key))
      throw NotImmutableErr.make("key is not immutable: " + ObjUtil.typeof$(key));
    this.#set(key, val, true);
    return this;
  }
  addIfNotNull(key, val) {
    return this.addNotNull(key, val);
  }
  addNotNull(key, val) {
    if (val == null) return this;
    return this.add(key, val);
  }
  getOrAdd(key, valFunc) {
    let val = this.#get(key);
    if (val !== undefined) return val;
    val = valFunc(key);
    this.add(key, val);
    return val;
  }
  setAll(m) {
    this.#modify();
    const keys = m.keys();
    const len = keys.size();
    for (let i=0; i<len; i++) {
      const key = keys.get(i);
      this.set(key, m.get(key));
    }
    return this;
  }
  addAll(m) {
    this.#modify();
    const keys = m.keys();
    const len = keys.size();
    for (let i=0; i<len; i++) {
      const key = keys.get(i);
      this.add(key, m.get(key));
    }
    return this;
  }
  setList(list, f=null) {
    this.#modify();
    if (f == null) {
      for (let i=0; i<list.size(); ++i)
        this.set(list.get(i), list.get(i));
    }
    else {
      for (let i=0; i<list.size(); ++i)
        this.set(f(list.get(i), i), list.get(i));
    }
    return this;
  }
  addList(list, f=null) {
    this.#modify();
    if (f == null) {
      for (let i=0; i<list.size(); ++i)
        this.add(list.get(i), list.get(i));
    }
    else {
      for (let i=0; i<list.size(); ++i)
        this.add(f(list.get(i), i), list.get(i));
    }
    return this;
  }
  remove(key) {
    this.#modify();
    return this.#remove(key);
  }
  dup() {
    const dup = Map.make(this.#type.k, this.#type.v);
    if (this.#ordered) dup.ordered(true);
    if (this.#caseInsensitive) dup.caseInsensitive(true);
    dup.#def = this.#def;
    this.#each((b) => { dup.set(b.key, b.val); });
    return dup;
  }
  clear() {
    this.#modify();
    if (this.#ordered) this.#keys = [];
    this.#vals = [];
    this.#size = 0;
    return this;
  }
  caseInsensitive(it=undefined) {
    if (it === undefined) return this.#caseInsensitive;
    this.#modify();
    if (this.#type.k != Str.type$)
      throw UnsupportedErr.make("Map not keyed by Str: " + this.m_type);
    if (this.#size != 0)
      throw UnsupportedErr.make("Map not empty");
    if (it && this.ordered())
      throw UnsupportedErr.make("Map cannot be caseInsensitive and ordered");
    this.#caseInsensitive = it;
  }
  ordered(it=undefined) {
    if (it === undefined) return this.#ordered;
    this.#modify();
    if (this.#size != 0)
      throw UnsupportedErr.make("Map not empty");
    if (it && this.caseInsensitive())
      throw UnsupportedErr.make("Map cannot be caseInsensitive and ordered");
    this.#ordered = val;
    this.#keys = [];
  }
  def(it=undefined) {
    if (it === undefined) return this.#def;
    this.#modify();
    if (it != null && !ObjUtil.isImmutable(it))
      throw NotImmutableErr.make("def must be immutable: " + ObjUtil.typeof$(it));
    this.#def = it;
  }
  equals(that) {
    if (that != null) {
      if (!this.#type.equals(that.#type)) return false;
      if (this.#size != that.#size) return false;
      let eq = true;
      this.#each((b) => {
        eq = ObjUtil.equals(b.val, that.get(b.key));
        return eq;
      });
      return eq;
    }
    return false;
  }
  hash() {
    return 0;
  }
  toStr() {
    if (this.#size == 0) return "[:]";
    let s = "";
    this.#each((b) => {
      if (s.length > 0) s += ", ";
      s += b.key + ":" + b.val;
    });
    return "[" + s + "]";
  }
  literalEncode$(out) {
    out.writeMap(this);
  }
  each(f) {
    this.#each((b) => { f(b.val, b.key); });
  }
  eachWhile(f) {
    let result = null;
    this.#each((b) => {
      let r = f(b.val, b.key);
      if (r != null) { result=r; return false; }
    });
    return result;
  }
  find(f) {
    let result = null;
    this.#each((b) => {
      if (f(b.val, b.key)) {
        result = b.val;
        return false;
      }
    });
    return result;
  }
  findAll(f) {
    const acc = Map.make(this.#type.k, this.#type.v);
    if (this.#ordered) acc.ordered(true);
    if (this.#caseInsensitive) acc.caseInsensitive(true);
    this.#each((b) => {
      if (f(b.val, b.key))
        acc.set(b.key, b.val);
    });
    return acc;
  }
  findNotNull() {
    const acc = Map.make(this.#type.k, this.#type.v.toNonNullable());
    if (this.#ordered) acc.ordered(true);
    if (this.#caseInsensitive) acc.caseInsensitive(true);
    this.#each((b) => {
      if (b.val != null)
        acc.set(b.key, b.val);
    });
    return acc;
  }
  exclude(f) {
    const acc = Map.make(this.#type.k, this.#type.v);
    if (this.#ordered) acc.ordered(true);
    if (this.#caseInsensitive) acc.caseInsensitive(true);
    this.#each((b) => {
      if (!f(b.val, b.key))
        acc.set(b.key, b.val);
    });
    return acc;
  }
  any(f) {
    if (this.#size == 0) return false;
    let any = false;
    this.#each((b) => {
      if (f(b.val, b.key)) {
        any = true;
        return false;
      }
    });
    return any;
  }
  all(f) {
    if (this.#size == 0) return true;
    let all = true;
    this.#each((b) => {
      if (!f(b.val, b.key)) {
        all = false
        return false;
      }
    });
    return all;
  }
  reduce(reduction, f) {
    this.#each((b) => { reduction = f(reduction, b.val, b.key); });
    return reduction;
  }
  map(f) {
    let r = Obj.type$.toNullable();
    const acc = Map.make(this.#type.k, r);
    if (this.#ordered) acc.ordered(true);
    if (this.#caseInsensitive) acc.caseInsensitive(true);
    this.#each((b) => { acc.add(b.key, f(b.val, b.key)); });
    return acc;
  }
  mapNotNull(f) {
    let r = Obj.type$;
    const acc = Map.make(this.#type.k, r.toNonNullable());
    if (this.#ordered) acc.ordered(true);
    if (this.#caseInsensitive) acc.caseInsensitive(true);
    this.#each((b) => { acc.addNotNull(b.key, f(b.val, b.key)); });
    return acc;
  }
  join(sep, f=null) {
    if (this.#size == 0) return "";
    let s = "";
    this.#each((b) => {
      if (s.length > 0) s += sep;
      if (f == null)
        s += b.key + ": " + b.val;
      else
        s += f(b.val, b.key);
    });
    return s;
  }
  toCode() {
    const size = this.#size;
    let s = '';
    s += this.#type.signature();
    s += '[';
    if (size == 0) s += ':';
    let first = true;
    this.#each((b) => {
      if (first) first = false;
      else s += ', ';
      s += ObjUtil.trap(b.key, "toCode", null)
        + ':'
        + ObjUtil.trap(b.val, "toCode", null);
    });
    s += ']';
    return s;
  }
  isRW() { return !this.#readonly; }
  isRO() { return this.#readonly; }
  rw() {
    if (!this.#readonly) return this;
    const rw = this.dup();
    rw.#readonly = false;
    return rw;
  }
  ro() {
    if (this.#readonly) return this;
    const ro = this.dup();
    ro.#readonly = true;
    return ro;
  }
  isImmutable() { return this.#immutable; }
  toImmutable() {
    if (this.#immutable) return this;
    const ro = Map.make(this.#type.k, this.#type.v);
    if (this.#ordered) ro.ordered(true);
    if (this.#caseInsensitive) ro.caseInsensitive(true);
    this.#each((b) => {
      ro.set(b.key, ObjUtil.toImmutable(b.val));
    });
    ro.#readonly = true;
    ro.#immutable = true;
    ro.#def = this.#def;
    return ro;
  }
  #modify() {
    if (this.#readonly)
      throw ReadonlyErr.make("Map is readonly");
  }
  static fromLiteral$(keys, vals, k, v) {
    const map = Map.make(k,v);
    for (let i=0; i<keys.length; i++)
      map.set(keys[i], vals[i]);
    return map;
  }
  #hashKey(key) {
    if (this.#caseInsensitive) key = Str.lower(key);
    return ObjUtil.hash(key);
  }
  #keysEqual(a, b) {
    return (this.#caseInsensitive)
      ? Str.equalsIgnoreCase(a, b)
      : ObjUtil.equals(a, b);
  }
  #get(key) {
    let b = this.#vals[this.#hashKey(key)];
    while (b !== undefined) {
      if (this.#keysEqual(b.key, key)) return b.val;
      b = b.next;
    }
    return undefined;
  }
  #set(key, val, add) {
    const n = { key:key, val:val };
    const h = this.#hashKey(key);
    let b = this.#vals[h];
    if (b === undefined) {
      if (this.#ordered) {
        n.ki = this.#keys.length;
        this.#keys.push(key);
      }
      this.#vals[h] = n;
      this.#size++;
      return
    }
    while (true) {
      if (this.#keysEqual(b.key, key)) {
        if (add) throw ArgErr.make("Key already mapped: " + key);
        b.val = val;
        return;
      }
      if (b.next === undefined) {
        if (this.#ordered) {
          n.ki = this.#keys.length;
          this.#keys.push(key);
        }
        b.next = n;
        this.#size++;
        return;
      }
      b = b.next;
    }
  }
  #remove(key) {
    const h = this.#hashKey(key);
    let b = this.#vals[h];
    if (b === undefined) return null;
    if (b.next === undefined) {
      if (this.#ordered) this.#keys[b.ki] = undefined;
      this.#vals[h] = undefined;
      this.#size--;
      const v = b.val;
      delete this.#vals[h];
      return v;
    }
    let prev = undefined;
    while (b !== undefined) {
      if (this.#keysEqual(b.key, key)) {
        if (prev !== undefined && b.next !== undefined) prev.next = b.next;
        else if (prev === undefined) this.#vals[h] = b.next;
        else if (b.next === undefined) prev.next = undefined;
        if (this.#ordered) this.#keys[b.ki] = undefined;
        this.#size--;
        const v = b.val
        delete prev.next;
        return v;
      }
      prev = b;
      b = b.next;
    }
    return null;
  }
  #each(func) {
    if (this.#ordered) {
      for (let i=0; i<this.#keys.length; i++) {
        const k = this.#keys[i];
        if (k === undefined) continue;
        const v = this.#get(k);
        if (func({key:k, ki:i, val:v }) === false) return;
      }
    }
    else {
      for (let h in this.#vals) {
        let b = this.#vals[h];
        while (b !== undefined) {
          if (func(b) === false) return;
          b = b.next;
        }
      }
    }
  }
}
class Param extends Obj {
  constructor(name, type, hasDefault) {
    super();
    this.#name = name;
    this.#type = (type instanceof Type) ? type : Type.find(type);
    this.#hasDefault = hasDefault;
  }
  static #noParams = undefined
  static noParams$() {
    if (Param.#noParams === undefined) Param.#noParams = List.make(Param.type$, []).toImmutable;
    return Param.#noParams;
  }
  #name;
  #type;
  #hasDefault;
  name$() { return this.#name; }
  type() { return this.#type; }
  hasDefault() { return this.#hasDefault; }
  toStr() { return this.#type.toStr() + " " + this.#name; }
}
class Float extends Num {
  constructor() { super(); }
  static posInf() { return Float.make(Number.POSITIVE_INFINITY); }
  static negInf() { return Float.make(Number.NEGATIVE_INFINITY); }
  static nan() { return Float.make(Number.NaN); }
  static e() { return Math.e; }
  static pi() { return Math.pi; }
  static #defVal = undefined
  static defVal() {
    if (Float.#defVal === undefined) Float.#defVal = Float.make(0);
    return Float.#defVal;
  }
  static make(val) {
    const x = new Number(val);
    x.fanType$ = Float.type$;
    return x;
  }
  static makeBits(bits) {
    throw UnsupportedErr.make("Float.makeBits not available in JavaScript");
  }
  static makeBits32(bits) {
    const buffer = new ArrayBuffer(4);
    (new Uint32Array(buffer))[0] = bits;
    return Float.make(new Float32Array(buffer)[0]);
  }
  static equals(self, that) {
    if (that != null && self.fanType$ === that.fanType$) {
      return self.valueOf() == that.valueOf();
    }
    return false;
  }
  static compare(self, that) {
    if (self == null) return that == null ? 0 : -1;
    if (that == null) return 1;
    if (isNaN(self)) return isNaN(that) ? 0 : -1;
    if (isNaN(that)) return 1;
    if (self < that) return -1;
    return self.valueOf() == that.valueOf() ? 0 : 1;
  }
  static isNaN(self) { return isNaN(self); }
  static isNegZero(self) { return 1/self === -Infinity; }
  static normNegZero(self) { return Float.isNegZero(self) ? 0.0 : self; }
  static hash(self) { return Str.hash(self.toString()); }
  static bits(self) { throw UnsupportedErr.make("Float.bits not available in JavaScript"); }
  static bitsArray(self) {
    const buf = new ArrayBuffer(8);
    (new Float64Array(buf))[0] = self;
    return [(new Uint32Array(buf))[0], (new Uint32Array(buf))[1]];
  }
  static bits32(self) {
    const buf = new ArrayBuffer(4);
    (new Float32Array(buf))[0] = self;
    return (new Uint32Array(buf))[0];
  }
  static toInt(val) { return (val<0) ? Math.ceil(val) : Math.floor(val); }
  static toFloat(val) { return val; }
  static toDecimal(val) { return Decimal.make(val); }
  static abs(self) { return Float.make(Math.abs(self)); }
  static approx(self, that, tolerance=null) {
    if (Float.compare(self, that) == 0) return true;
    const t = tolerance == null
      ? Math.min(Math.abs(self/1e6), Math.abs(that/1e6))
      : tolerance;
    return Math.abs(self - that) <= t;
  }
  static ceil(self) { return Float.make(Math.ceil(self)); }
  static exp(self) { return Float.make(Math.exp(self)); }
  static floor(self) { return Float.make(Math.floor(self)); }
  static log(self) { return Float.make(Math.log(self)); }
  static log10(self) { return Float.make(Math.log(self) / Math.LN10); }
  static min(self, that) { return Float.make(Math.min(self, that)); }
  static max(self, that) { return Float.make(Math.max(self, that)); }
  static negate(self) { return Float.make(-self); }
  static pow(self, exp) { return Float.make(Math.pow(self, exp)); }
  static round(self) { return Float.make(Math.round(self)); }
  static sqrt(self) { return Float.make(Math.sqrt(self)); }
  static random() { return Float.make(Math.random()); }
  static clamp(self, min, max) {
    if (self < min) return min;
    if (self > max) return max;
    return self;
  }
  static clip(self, min, max) { return Float.clamp(self, min, max); }
  static plus(a,b) { return Float.make(a+b); }
  static plusInt(a,b) { return Float.make(a+b); }
  static plusDecimal(a,b) { return fan.sys.Decimal.make(a+b); }
  static minus(a,b) { return Float.make(a-b); }
  static minusInt(a,b) { return Float.make(a-b); }
  static minusDecimal(a,b) { return fan.sys.Decimal.make(a-b); }
  static mult(a,b) { return Float.make(a*b); }
  static multInt(a,b) { return Float.make(a*b); }
  static multDecimal(a,b) { return fan.sys.Decimal.make(a*b); }
  static div(a,b) { return Float.make(a/b); }
  static divInt(a,b) { return Float.make(a/b); }
  static divDecimal(a,b) { return fan.sys.Decimal.make(a/b); }
  static mod(a,b) { return Float.make(a%b); }
  static modInt(a,b) { return Float.make(a%b); }
  static modDecimal(a,b) { return Decimal.make(a%b); }
  static increment(self) { return Float.make(self+1); }
  static decrement(self) { return Float.make(self-1); }
  static acos(self) { return Float.make(Math.acos(self)); }
  static asin(self) { return Float.make(Math.asin(self)); }
  static atan(self) { return Float.make(Math.atan(self)); }
  static atan2(y, x) { return Float.make(Math.atan2(y, x)); }
  static cos(self) { return Float.make(Math.cos(self)); }
  static sin(self) { return Float.make(Math.sin(self)); }
  static tan(self) { return Float.make(Math.tan(self)); }
  static toDegrees(self) { return Float.make(self * 180 / Math.PI); }
  static toRadians(self) { return Float.make(self * Math.PI / 180); }
  static cosh(self) { return Float.make(0.5 * (Math.exp(self) + Math.exp(-self))); }
  static sinh(self) { return Float.make(0.5 * (Math.exp(self) - Math.exp(-self))); }
  static tanh(self) { return Float.make((Math.exp(2*self)-1) / (Math.exp(2*self)+1)); }
  static fromStr(s, checked=true) {
    if (s == "NaN") return Float.nan;
    if (s == "INF") return Float.posInf;
    if (s == "-INF") return Float.negInf;
    if (isNaN(s))
    {
      if (!checked) return null;
      throw ParseErr.makeStr("Float", s);
    }
    return Float.make(parseFloat(s));
  }
  static toStr(self) {
    if (isNaN(self)) return "NaN";
    if (Float.isNegZero(self)) return "-0.0";
    if (self == Float.posInf) return "INF";
    if (self == Float.negInf) return "-INF";
    return (Float.toInt(self) == self) ? self.toFixed(1) : ""+self;
  }
  static encode(self, out) {
    if (isNaN(self)) out.w("sys::Float(\"NaN\")");
    else if (self == Float.posInf) out.w("sys::Float(\"INF\")");
    else if (self == Float.negInf) out.w("sys::Float(\"-INF\")");
    else out.w(""+self).w("f");
  }
  static toCode(self) {
    if (isNaN(self)) return "Float.nan";
    if (self == Float.posInf) return "Float.posInf";
    if (self == Float.negInf) return "Float.negInf";
    var s = ""+self
    if (s.indexOf(".") == -1) s += ".0";
    return s + "f";
  }
  static toLocale(self, pattern=null, locale=Locale.cur()) {
    try
    {
      if (isNaN(self)) return locale.numSymbols$().nan;
      if (self == Float.posInf) return locale.numSymbols$().posInf;
      if (self == Float.negInf) return locale.numSymbols$().negInf;
      if (pattern == null) {
        if (Math.abs(self) >= 100.0)
          return Int.toLocale(Math.round(self), null, locale);
        pattern = Float.toDefaultLocalePattern$(self);
      }
      var string = ''+self;
      var p = NumPattern.parse(pattern);
      var d = NumDigits.makeStr(string);
      return Num.toLocale(p, d, locale);
    }
    catch (err)
    {
      ObjUtil.echo(err);
      return ''+self;
    }
  }
  static toDefaultLocalePattern$(self) {
    const abs  = Math.abs(self);
    const fabs = Math.floor(abs);
    if (fabs >= 10.0) return "#0.0#";
    if (fabs >= 1.0)  return "#0.0##";
    const frac = abs - fabs;
    if (frac < 0.00000001) return "0.0";
    if (frac < 0.0000001)  return "0.0000000##";
    if (frac < 0.000001)   return "0.000000##";
    if (frac < 0.00001)    return "0.00000##";
    if (frac < 0.0001)     return "0.0000##";
    if (frac < 0.001)      return "0.000##";
    return "0.0##";
  }
}
class Service extends Obj {
  constructor() { super(); }
}
class Sys extends Obj {
  constructor() { super(); }
  static genericParamTypes = [];
  static AType = undefined;
  static BType = undefined;
  static CType = undefined;
  static DType = undefined;
  static EType = undefined;
  static FType = undefined;
  static GType = undefined;
  static HType = undefined;
  static KType = undefined;
  static LType = undefined;
  static MType = undefined;
  static RType = undefined;
  static VType = undefined;
  static initGenericParamTypes() {
    Sys.AType = Sys.#initGeneric('A');
    Sys.BType = Sys.#initGeneric('B');
    Sys.CType = Sys.#initGeneric('C');
    Sys.DType = Sys.#initGeneric('D');
    Sys.EType = Sys.#initGeneric('E');
    Sys.FType = Sys.#initGeneric('F');
    Sys.GType = Sys.#initGeneric('G');
    Sys.HType = Sys.#initGeneric('H');
    Sys.KType = Sys.#initGeneric('K');
    Sys.LType = Sys.#initGeneric('L');
    Sys.MType = Sys.#initGeneric('M');
    Sys.RType = Sys.#initGeneric('R');
    Sys.VType = Sys.#initGeneric('V');
  }
  static #initGeneric(ch) {
    const name = ch;
    try {
      const pod = Pod.find("sys");
      return Sys.genericParamTypes[ch] = pod.at$(name, "sys::Obj", [], 0);
    }
    catch (err) {
      throw Sys.initFail("generic " + name, err);
    }
  }
  static genericParamType(name) {
    if (name.length == 1)
      return Sys.genericParamTypes[name];
    else
      return null;
  }
  static initWarn(field, e) {
    ObjUtil.echo("WARN: cannot init Sys." + field);
    ObjUtil.echo(e);
  }
  static initFail(field, e) {
    ObjUtil.echo("ERROR: cannot init Sys." + field);
    ObjUtil.echo(e);
    throw new Error("Cannot boot fan: " + e);
  }
}
class Facets extends Obj {
  constructor(map) {
    super();
    this.#map = map;
    this.#list = null;
  }
  #map;
  #list;
  static #emptyVal = null;
  static #transientVal = null;
  empty() {
    let x = Facets.#emptyVal;
    if (x == null) {
      x = new Facets({});
      Facets.#emptyVal = x;
    }
    return x;
  }
  makeTransient() {
    let x = Facets.#transientVal;
    if (x == null)
    {
      let m = {};
      m[Transient.type$.qname()] = "";
      x = new Facets(m);
      Facets.#transientVal = x;
    }
    return x;
  }
  list() {
    if (this.#list == null)
    {
      this.#list = List.make(fan.sys.Facet.type$);
      for (let key in this.#map)
      {
        let type = Type.find(key);
        this.#list.add(this.get(type, true));
      }
      this.#list = this.#list.toImmutable();
    }
    return this.#list;
  }
  get(type, checked=true) {
    let val = this.#map[type.qname()];
    if (typeof val == "string")
    {
      let f = this.decode(type, val);
      this.#map[type.qname()] = f;
      return f;
    }
    if (val != null) return val;
    if (checked) throw UnknownFacetErr.make(type.qname());
    return null;
  }
  decode(type, s) {
    try
    {
      if (s.length == 0) return type.make();
      return fanx_ObjDecoder.decode(s);
    }
    catch (e)
    {
      var msg = "ERROR: Cannot decode facet " + type + ": " + s;
      ObjUtil.echo(msg);
      delete this.#map[type.qname()];
      throw IOErr.make(msg);
    }
  }
  dup() {
    let dup = {};
    for (let key in this.#map) dup[key] = this.#map[key];
    return new Facets(dup);
  }
  inherit(facets) {
    let keys = [];
    for (let key in facets.#map) keys.push(key);
    if (keys.length == 0) return;
    this.#list = null;
    for (let i=0; i<keys.length; i++)
    {
      let key = keys[i];
      if (this.#map[key] != null) continue;
      let type = Type.find(key);
      let meta = type.facet(FacetMeta.type$, false);
      if (meta == null || !meta.inherited) continue;
      this.#map[key] = facets.#map[key];
    }
  }
}
function fanx_TypeParser(sig, checked)
{
  this.sig     = sig;
  this.len     = sig.length;
  this.pos     = 0;
  this.cur     = sig.charAt(this.pos);
  this.peek    = sig.charAt(this.pos+1);
  this.checked = checked;
}
fanx_TypeParser.prototype.loadTop = function()
{
  var type = this.load();
  if (this.cur != null) throw this.err();
  return type;
}
fanx_TypeParser.prototype.load = function()
{
  var type;
  if (this.cur == '|')
    type = this.loadFunc();
  else if (this.cur == '[')
  {
    var ffi = true;
    for (var i=this.pos+1; i<this.len; i++)
    {
      var ch = this.sig.charAt(i);
      if (this.isIdChar(ch)) continue;
      ffi = (ch == ']');
      break;
    }
    if (ffi)
      throw ArgErr.make("Java types not allowed '" + this.sig + "'");
    else
      type = this.loadMap();
  }
  else
    type = this.loadBasic();
  if (this.cur == '?')
  {
    this.consume('?');
    type = type.toNullable();
  }
  while (this.cur == '[')
  {
    this.consume('[');
    this.consume(']');
    type = type.toListOf();
    if (this.cur == '?')
    {
      this.consume('?');
      type = type.toNullable();
    }
  }
  if (this.cur == '?')
  {
    this.consume('?');
    type = type.toNullable();
  }
  return type;
}
fanx_TypeParser.prototype.loadMap = function()
{
  this.consume('[');
  var key = this.load();
  this.consume(':');
  var val = this.load();
  this.consume(']');
  return new MapType(key, val);
}
fanx_TypeParser.prototype.loadFunc = function()
{
  this.consume('|');
  var params = [];
  if (this.cur != '-')
  {
    while (true)
    {
      params.push(this.load());
      if (this.cur == '-') break;
      this.consume(',');
    }
  }
  this.consume('-');
  this.consume('>');
  var ret = this.load();
  this.consume('|');
  return new FuncType(params, ret);
}
fanx_TypeParser.prototype.loadBasic = function()
{
  var podName = this.consumeId();
  this.consume(':');
  this.consume(':');
  var typeName = this.consumeId();
  if (typeName.length == 1 && podName == "sys")
  {
    var type = Sys.genericParamType(typeName);
    if (type != null) return type;
  }
  return fanx_TypeParser.find(podName, typeName, this.checked);
}
fanx_TypeParser.prototype.consumeId = function()
{
  var start = this.pos;
  while (this.isIdChar(this.cur)) this.$consume();
  return this.sig.substring(start, this.pos);
}
fanx_TypeParser.prototype.isIdChar = function(ch)
{
  if (ch == null) return false;
  return Int.isAlphaNum(ch.charCodeAt(0)) || ch == '_';
}
fanx_TypeParser.prototype.consume = function(expected)
{
  if (this.cur != expected) throw this.err();
  this.$consume();
}
fanx_TypeParser.prototype.$consume = function()
{
  this.cur = this.peek;
  this.pos++;
  this.peek = this.pos+1 < this.len ? this.sig.charAt(this.pos+1) : null;
}
fanx_TypeParser.prototype.err = function(sig)
{
  if (sig === undefined) sig = this.sig;
  return ArgErr.make("Invalid type signature '" + sig + "'");
}
fanx_TypeParser.load = function(sig, checked)
{
  var type = fanx_TypeParser.cache[sig];
  if (type != null) return type;
  var len = sig.length;
  var last = len > 1 ? sig.charAt(len-1) : 0;
  if (last == '?')
  {
    type = fanx_TypeParser.load(sig.substring(0, len-1), checked).toNullable();
    fanx_TypeParser.cache[sig] = type;
    return type;
  }
  if (last != ']' && last != '|')
  {
    var podName;
    var typeName;
    try
    {
      var colon = sig.indexOf("::");
      podName  = sig.substring(0, colon);
      typeName = sig.substring(colon+2);
      if (podName.length == 0 || typeName.length == 0) throw Err.make("");
    }
    catch (err)
    {
      throw ArgErr.make("Invalid type signature '" + sig + "', use <pod>::<type>");
    }
    if (podName.charAt(0) == '[')
      throw ArgErr.make("Java types not allowed '" + sig + "'");
    type = fanx_TypeParser.find(podName, typeName, checked);
    fanx_TypeParser.cache[sig] = type;
    return type;
  }
  try
  {
    type = new fanx_TypeParser(sig, checked).loadTop();
    fanx_TypeParser.cache[sig] = type;
    return type;
  }
  catch (err)
  {
    throw Err.make(err);
  }
}
fanx_TypeParser.find = function(podName, typeName, checked)
{
  var pod = Pod.find(podName, checked);
  if (pod == null) return null;
  return pod.type(typeName, checked);
}
fanx_TypeParser.cache = [];
function fanx_Token() {}
fanx_Token.EOF              = -1;
fanx_Token.ID               = 0;
fanx_Token.BOOL_LITERAL     = 1;
fanx_Token.STR_LITERAL      = 2;
fanx_Token.INT_LITERAL      = 3;
fanx_Token.FLOAT_LITERAL    = 4;
fanx_Token.DECIMAL_LITERAL  = 5;
fanx_Token.DURATION_LITERAL = 6;
fanx_Token.URI_LITERAL      = 7;
fanx_Token.NULL_LITERAL     = 8;
fanx_Token.DOT              = 9;
fanx_Token.SEMICOLON        = 10;
fanx_Token.COMMA            = 11;
fanx_Token.COLON            = 12;
fanx_Token.DOUBLE_COLON     = 13;
fanx_Token.LBRACE           = 14;
fanx_Token.RBRACE           = 15;
fanx_Token.LPAREN           = 16;
fanx_Token.RPAREN           = 17;
fanx_Token.LBRACKET         = 18;
fanx_Token.RBRACKET         = 19;
fanx_Token.LRBRACKET        = 20;
fanx_Token.EQ               = 21;
fanx_Token.POUND            = 22;
fanx_Token.QUESTION         = 23;
fanx_Token.AS               = 24;
fanx_Token.USING            = 25;
fanx_Token.isLiteral = function(type)
{
  return fanx_Token.BOOL_LITERAL <= type && type <= fanx_Token.NULL_LITERAL;
}
fanx_Token.toString = function(type)
{
  switch (type)
  {
    case fanx_Token.EOF:              return "end of file";
    case fanx_Token.ID:               return "identifier";
    case fanx_Token.BOOL_LITERAL:     return "Bool literal";
    case fanx_Token.STR_LITERAL:      return "String literal";
    case fanx_Token.INT_LITERAL:      return "Int literal";
    case fanx_Token.FLOAT_LITERAL:    return "Float literal";
    case fanx_Token.DECIMAL_LITERAL:  return "Decimal literal";
    case fanx_Token.DURATION_LITERAL: return "Duration literal";
    case fanx_Token.URI_LITERAL:      return "Uri literal";
    case fanx_Token.NULL_LITERAL:     return "null";
    case fanx_Token.DOT:              return ".";
    case fanx_Token.SEMICOLON:        return ";";
    case fanx_Token.COMMA:            return ",";
    case fanx_Token.COLON:            return ":";
    case fanx_Token.DOUBLE_COLON:     return "::";
    case fanx_Token.LBRACE:           return "{";
    case fanx_Token.RBRACE:           return "}";
    case fanx_Token.LPAREN:           return "(";
    case fanx_Token.RPAREN:           return ")";
    case fanx_Token.LBRACKET:         return "[";
    case fanx_Token.RBRACKET:         return "]";
    case fanx_Token.LRBRACKET:        return "[]";
    case fanx_Token.EQ:               return "=";
    case fanx_Token.POUND:            return "#";
    case fanx_Token.QUESTION:         return "?";
    case fanx_Token.AS:               return "as";
    case fanx_Token.USING:            return "using";
    default:                          return "Token[" + type + "]";
  }
}
function fanx_ObjDecoder(input, options)
{
  this.tokenizer = new fanx_Tokenizer(input);
  this.options = options;
  this.curt = null;
  this.usings = [];
  this.numUsings = 0;
  this.consume();
}
fanx_ObjDecoder.prototype.readObj = function()
{
  this.readHeader();
  return this.$readObj(null, null, true);
}
fanx_ObjDecoder.prototype.readHeader = function()
{
  while (this.curt == fanx_Token.USING)
    this.usings[this.numUsings++] = this.readUsing();
}
fanx_ObjDecoder.prototype.readUsing = function()
{
  var line = this.tokenizer.line;
  this.consume();
  var podName = this.consumeId("Expecting pod name");
  var pod = Pod.find(podName, false);
  if (pod == null) throw this.err("Unknown pod: " + podName);
  if (this.curt != fanx_Token.DOUBLE_COLON)
  {
    this.endOfStmt(line);
    return new fanx_UsingPod(pod);
  }
  this.consume();
  var typeName = this.consumeId("Expecting type name");
  var t = pod.type(typeName, false);
  if (t == null) throw this.err("Unknown type: " + podName + "::" + typeName);
  if (this.curt == fanx_Token.AS)
  {
    this.consume();
    typeName = this.consumeId("Expecting using as name");
  }
  this.endOfStmt(line);
  return new fanx_UsingType(t, typeName);
}
fanx_ObjDecoder.prototype.$readObj = function(curField, peekType, root)
{
  if (fanx_Token.isLiteral(this.curt))
  {
    var val = this.tokenizer.val;
    this.consume();
    return val;
  }
  if (this.curt == fanx_Token.LBRACKET)
    return this.readCollection(curField, peekType);
  var line = this.tokenizer.line;
  var t = (peekType != null) ? peekType : this.readType();
  if (this.curt == fanx_Token.LPAREN)
    return this.readSimple(line, t);
  else if (this.curt == fanx_Token.POUND)
    return this.readTypeOrSlotLiteral(line, t);
  else if (this.curt == fanx_Token.LBRACKET)
    return this.readCollection(curField, t);
  else
    return this.readComplex(line, t, root);
}
fanx_ObjDecoder.prototype.readTypeOrSlotLiteral = function(line, t)
{
  this.consume(fanx_Token.POUND, "Expected '#' for type literal");
  if (this.curt == fanx_Token.ID && !this.isEndOfStmt(line))
  {
    var slotName = this.consumeId("slot literal name");
    return t.slot(slotName);
  }
  else
  {
    return t;
  }
}
fanx_ObjDecoder.prototype.readSimple = function(line, t)
{
  this.consume(fanx_Token.LPAREN, "Expected ( in simple");
  var str = this.consumeStr("Expected string literal for simple");
  this.consume(fanx_Token.RPAREN, "Expected ) in simple");
  try
  {
    var script = "fan." + t.pod().$name() + "." + t.$name() + ".fromStr('" + str + "')";
    var val = eval(script);
    return val;
  }
  catch (e)
  {
    throw ParseErr.make(e.toString() + " [Line " + this.line + "]", e);
  }
}
fanx_ObjDecoder.prototype.readComplex = function(line, t, root)
{
  var toSet = Map.make(Field.type$, Obj.type$.toNullable());
  var toAdd = List.make(Obj.type$.toNullable());
  this.readComplexFields(t, toSet, toAdd);
  var makeCtor = t.method("make", false);
  if (makeCtor == null || !makeCtor.isPublic())
    throw this.err("Missing public constructor " + t.qname() + ".make", line);
  var args = null;
  if (root && this.options != null && this.options.get("makeArgs") != null)
    args = List.make(Obj.type$).addAll(this.options.get("makeArgs"));
  var obj = null;
  var setAfterCtor = true;
  try
  {
    var p = makeCtor.params().last();
    if (p != null && p.type().fits(Func.type$))
    {
      if (args == null) args = List.make(Obj.type$);
      args.add(Field.makeSetFunc(toSet));
      setAfterCtor = false;
    }
    obj = makeCtor.callList(args);
  }
  catch (e)
  {
    throw this.err("Cannot make " + t + ": " + e, line, e);
  }
  if (setAfterCtor && toSet.size() > 0)
  {
    var keys = toSet.keys();
    for (var i=0; i<keys.size(); i++)
    {
      var field = keys.get(i);
      var val = toSet.get(field);
      this.complexSet(obj, field, val, line);
    }
  }
  if (toAdd.size() > 0)
  {
    var addMethod = t.method("add", false);
    if (addMethod == null) throw this.err("Method not found: " + t.qname() + ".add", line);
    for (var i=0; i<toAdd.size(); ++i)
      this.complexAdd(t, obj, addMethod, toAdd.get(i), line);
  }
  return obj;
}
fanx_ObjDecoder.prototype.readComplexFields = function(t, toSet, toAdd)
{
  if (this.curt != fanx_Token.LBRACE) return;
  this.consume();
  while (this.curt != fanx_Token.RBRACE)
  {
    var line = this.tokenizer.line;
    var readField = false;
    if (this.curt == fanx_Token.ID)
    {
      var name = this.consumeId("Expected field name");
      if (this.curt == fanx_Token.EQ)
      {
        this.consume();
        this.readComplexSet(t, line, name, toSet);
        readField = true;
      }
      else
      {
        this.tokenizer.undo(this.tokenizer.type, this.tokenizer.val, this.tokenizer.line);
        this.curt = this.tokenizer.reset(fanx_Token.ID, name, line);
      }
    }
    if (!readField) this.readComplexAdd(t, line, toAdd);
    if (this.curt == fanx_Token.COMMA) this.consume();
    else this.endOfStmt(line);
  }
  this.consume(fanx_Token.RBRACE, "Expected '}'");
}
fanx_ObjDecoder.prototype.readComplexSet = function(t, line, name, toSet)
{
  var field = t.field(name, false);
  if (field == null) throw this.err("Field not found: " + t.qname() + "." + name, line);
  var val = this.$readObj(field, null, false);
  try
  {
    if (field.isConst()) val = ObjUtil.toImmutable(val);
  }
  catch (ex)
  {
    throw this.err("Cannot make object const for " + field.qname() + ": " + ex, line, ex);
  }
  toSet.set(field, val);
}
fanx_ObjDecoder.prototype.complexSet = function(obj, field, val, line)
{
  try
  {
    if (field.isConst())
      field.set(obj, ObjUtil.toImmutable(val), false);
    else
      field.set(obj, val);
  }
  catch (ex)
  {
    throw this.err("Cannot set field " + field.qname() + ": " + ex, line, ex);
  }
}
fanx_ObjDecoder.prototype.readComplexAdd = function(t, line, toAdd)
{
  var val = this.$readObj(null, null, false);
  toAdd.add(val);
}
fanx_ObjDecoder.prototype.complexAdd = function(t, obj, addMethod, val, line)
{
  try
  {
    addMethod.invoke(obj, List.make(Obj.type$, [val]));
  }
  catch (ex)
  {
    throw this.err("Cannot call " + t.qname() + ".add: " + ex, line, ex);
  }
}
fanx_ObjDecoder.prototype.readCollection = function(curField, t)
{
  this.consume(fanx_Token.LBRACKET, "Expecting '['");
  var peekType = null;
  if (this.curt == fanx_Token.ID && t == null)
  {
    peekType = this.readType();
    if (this.curt == fanx_Token.RBRACKET && peekType instanceof MapType)
    {
      t = peekType; peekType = null;
      this.consume();
      while (this.curt == fanx_Token.LRBRACKET) { this.consume(); t = t.toListOf(); }
      if (this.curt == fanx_Token.QUESTION) { this.consume(); t = t.toNullable(); }
      if (this.curt == fanx_Token.POUND) { this.consume(); return t; }
      this.consume(fanx_Token.LBRACKET, "Expecting '['");
    }
  }
  if (this.curt == fanx_Token.COMMA && peekType == null)
  {
    this.consume();
    this.consume(fanx_Token.RBRACKET, "Expecting ']'");
    return List.make(this.toListOfType(t, curField, false), []);
  }
  if (this.curt == fanx_Token.COLON && peekType == null)
  {
    this.consume();
    this.consume(fanx_Token.RBRACKET, "Expecting ']'");
    return Map.make(this.toMapType(t, curField, false));
  }
  var first = this.$readObj(null, peekType, false);
  if (this.curt == fanx_Token.COLON)
    return this.readMap(this.toMapType(t, curField, true), first);
  else
    return this.readList(this.toListOfType(t, curField, true), first);
}
fanx_ObjDecoder.prototype.readList = function(of, first)
{
  var acc = [];
  acc.push(first)
  while (this.curt != fanx_Token.RBRACKET)
  {
    this.consume(fanx_Token.COMMA, "Expected ','");
    if (this.curt == fanx_Token.RBRACKET) break;
    acc.push(this.$readObj(null, null, false));
  }
  this.consume(fanx_Token.RBRACKET, "Expected ']'");
  if (of == null) of = Type.common$(acc);
  return List.make(of, acc);
}
fanx_ObjDecoder.prototype.readMap = function(mapType, firstKey)
{
  var map = mapType == null
    ? Map.make(Obj.type$, Obj.type$.toNullable())
    : Map.make(mapType);
  map.ordered$(true);
  this.consume(fanx_Token.COLON, "Expected ':'");
  map.set(firstKey, this.$readObj(null, null, false));
  while (this.curt != fanx_Token.RBRACKET)
  {
    this.consume(fanx_Token.COMMA, "Expected ','");
    if (this.curt == fanx_Token.RBRACKET) break;
    var key = this.$readObj(null, null, false);
    this.consume(fanx_Token.COLON, "Expected ':'");
    var val = this.$readObj(null, null, false);
    map.set(key, val);
  }
  this.consume(fanx_Token.RBRACKET, "Expected ']'");
  if (mapType == null)
  {
    var size = map.size();
    var k = Type.common$(map.keys().m_values);
    var v = Type.common$(map.vals().m_values);
    map.m_type = new MapType(k, v);
  }
  return map;
}
fanx_ObjDecoder.prototype.toListOfType = function(t, curField, infer)
{
  if (t != null) return t;
  if (curField != null)
  {
    var ft = curField.type().toNonNullable();
    if (ft instanceof ListType) return ft.v;
  }
  if (infer) return null;
  return Obj.type$.toNullable();
}
fanx_ObjDecoder.prototype.toMapType = function(t, curField, infer)
{
  if (t instanceof MapType)
    return t;
  if (curField != null)
  {
    var ft = curField.type().toNonNullable();
    if (ft instanceof MapType) return ft;
  }
  if (infer) return null;
  if (fanx_ObjDecoder.defaultMapType == null)
    fanx_ObjDecoder.defaultMapType =
      new MapType(Obj.type$, Obj.type$.toNullable());
  return fanx_ObjDecoder.defaultMapType;
}
fanx_ObjDecoder.prototype.readType = function(lbracket)
{
  if (lbracket === undefined) lbracket = false;
  var t = this.readSimpleType();
  if (this.curt == fanx_Token.QUESTION)
  {
    this.consume();
    t = t.toNullable();
  }
  if (this.curt == fanx_Token.COLON)
  {
    this.consume();
    var lbracket2 = this.curt == fanx_Token.LBRACKET;
    if (lbracket2) this.consume();
    t = new MapType(t, this.readType(lbracket2));
    if (lbracket2) this.consume(fanx_Token.RBRACKET, "Expected closeing ']'");
  }
  while (this.curt == fanx_Token.LRBRACKET)
  {
    this.consume();
    t = t.toListOf();
  }
  if (this.curt == fanx_Token.QUESTION)
  {
    this.consume();
    t = t.toNullable();
  }
  return t;
}
fanx_ObjDecoder.prototype.readSimpleType = function()
{
  var line = this.tokenizer.line;
  var n = this.consumeId("Expected type signature");
  if (this.curt != fanx_Token.DOUBLE_COLON)
  {
    for (var i=0; i<this.numUsings; ++i)
    {
      var t = this.usings[i].resolve(n);
      if (t != null) return t;
    }
    throw this.err("Unresolved type name: " + n);
  }
  this.consume(fanx_Token.DOUBLE_COLON, "Expected ::");
  var typeName = this.consumeId("Expected type name");
  var pod = Pod.find(n, false);
  if (pod == null) throw this.err("Pod not found: " + n, line);
  var type = pod.type(typeName, false);
  if (type == null) throw this.err("Type not found: " + n + "::" + typeName, line);
  return type;
}
fanx_ObjDecoder.prototype.err = function(msg)
{
  return fanx_ObjDecoder.err(msg, this.tokenizer.line);
}
fanx_ObjDecoder.prototype.consumeId = function(expected)
{
  this.verify(fanx_Token.ID, expected);
  var id = this.tokenizer.val;
  this.consume();
  return id;
}
fanx_ObjDecoder.prototype.consumeStr = function(expected)
{
  this.verify(fanx_Token.STR_LITERAL, expected);
  var id = this.tokenizer.val;
  this.consume();
  return id;
}
fanx_ObjDecoder.prototype.consume = function(type, expected)
{
  if (type != undefined)
    this.verify(type, expected);
  this.curt = this.tokenizer.next();
}
fanx_ObjDecoder.prototype.verify = function(type, expected)
{
  if (this.curt != type)
    throw this.err(expected + ", not '" + fanx_Token.toString(this.curt) + "'");
}
fanx_ObjDecoder.prototype.isEndOfStmt = function(lastLine)
{
  if (this.curt == fanx_Token.EOF) return true;
  if (this.curt == fanx_Token.SEMICOLON) return true;
  return lastLine < this.tokenizer.line;
}
fanx_ObjDecoder.prototype.endOfStmt = function(lastLine)
{
  if (this.curt == fanx_Token.SEMICOLON) { this.consume(); return; }
  if (lastLine < this.tokenizer.line) return;
  if (this.curt == fanx_Token.RBRACE) return;
  throw this.err("Expected end of statement: semicolon, newline, or end of block; not '" + fanx_Token.toString(this.curt) + "'");
}
fanx_ObjDecoder.decode = function(s)
{
  return new fanx_ObjDecoder(InStream.makeForStr(s), null).readObj();
}
fanx_ObjDecoder.err = function(msg, line)
{
  return IOErr.make(msg + " [Line " + line + "]");
}
fanx_ObjDecoder.defaultMapType = null;
function fanx_UsingPod(p) { this.pod = p; }
fanx_UsingPod.prototype.resolve = function(n)
{
  return this.pod.type(n, false);
}
function fanx_UsingType(t,n) { this.type = t; this.name = n; }
fanx_UsingType.prototype.resolve = function(n)
{
  return this.name == n ? this.type : null;
}
function fanx_ObjEncoder(out, options)
{
  this.out    = out;
  this.level  = 0;
  this.indent = 0;
  this.skipDefaults = false;
  this.skipErrors   = false;
  this.curFieldType = null;
  if (options != null) this.initOptions(options);
}
fanx_ObjEncoder.encode = function(obj)
{
  var buf = fan.sys.StrBuf.make();
  var out = new fan.sys.StrBufOutStream(buf);
  new fanx_ObjEncoder(out, null).writeObj(obj);
  return buf.toStr();
}
fanx_ObjEncoder.prototype.writeObj = function(obj)
{
  if (obj == null)
  {
    this.w("null");
    return;
  }
  var t = typeof obj;
  if (t === "boolean") { this.w(obj.toString()); return; }
  if (t === "number")  { this.w(obj.toString()); return; }
  if (t === "string")  { this.wStrLiteral(obj.toString(), '"'); return; }
  var f = obj.fanType$;
  if (f === fan.sys.Float.type$)   { fan.sys.Float.encode(obj, this); return; }
  if (f === fan.sys.Decimal.type$) { fan.sys.Decimal.encode(obj, this); return; }
  if (obj.literalEncode$)
  {
    obj.literalEncode$(this);
    return;
  }
  var type = fan.sys.ObjUtil.typeof$(obj);
  var ser = type.facet(fan.sys.Serializable.type$, false);
  if (ser != null)
  {
    if (ser.m_simple)
      this.writeSimple(type, obj);
    else
      this.writeComplex(type, obj, ser);
  }
  else
  {
    if (this.skipErrors)
      this.w("null /\u002A Not serializable: ").w(type.qname()).w(" */");
    else
      throw fan.sys.IOErr.make("Not serializable: " + type);
  }
}
fanx_ObjEncoder.prototype.writeSimple = function(type, obj)
{
  var str = fan.sys.ObjUtil.toStr(obj);
  this.wType(type).w('(').wStrLiteral(str, '"').w(')');
}
fanx_ObjEncoder.prototype.writeComplex = function(type, obj, ser)
{
  this.wType(type);
  var first = true;
  var defObj = null;
  if (this.skipDefaults)
  {
    try { defObj = fan.sys.ObjUtil.typeof$(obj).make(); } catch(e) {}
  }
  var fields = type.fields();
  for (var i=0; i<fields.size(); ++i)
  {
    var f = fields.get(i);
    if (f.isStatic() || f.isSynthetic() || f.hasFacet(fan.sys.Transient.type$))
      continue;
    var val = f.get(obj);
    if (defObj != null)
    {
      var defVal = f.get(defObj);
      if (fan.sys.ObjUtil.equals(val, defVal)) continue;
    }
    if (first) { this.w('\n').wIndent().w('{').w('\n'); this.level++; first = false; }
    this.wIndent().w(f.$name()).w('=');
    this.curFieldType = f.type().toNonNullable();
    this.writeObj(val);
    this.curFieldType = null;
    this.w('\n');
  }
  if (ser.m_collection)
    first = this.writeCollectionItems(type, obj, first);
  if (!first) { this.level--; this.wIndent().w('}'); }
}
fanx_ObjEncoder.prototype.writeCollectionItems = function(type, obj, first)
{
  var m = type.method("each", false);
  if (m == null) throw fan.sys.IOErr.make("Missing " + type.qname() + ".each");
  var enc = this;
  var it  = fan.sys.Func.make(
    fan.sys.List.make(fan.sys.Param.type$),
    fan.sys.Void.type$,
    function(obj)
    {
      if (first) { enc.w('\n').wIndent().w('{').w('\n'); enc.level++; first = false; }
      enc.wIndent();
      enc.writeObj(obj);
      enc.w(',').w('\n');
      return null;
    });
  m.invoke(obj, fan.sys.List.make(fan.sys.Obj.type$, [it]));
  return first;
}
fanx_ObjEncoder.prototype.writeList = function(list)
{
  var of = list.of();
  var nl = this.isMultiLine(of);
  var inferred = false;
  if (this.curFieldType != null && (this.curFieldType instanceof fan.sys.ListType))
  {
    inferred = true;
  }
  this.curFieldType = null;
  if (!inferred) this.wType(of);
  var size = list.size();
  if (size == 0) { this.w("[,]"); return; }
  if (nl) this.w('\n').wIndent();
  this.w('[');
  this.level++;
  for (var i=0; i<size; ++i)
  {
    if (i > 0) this.w(',');
     if (nl) this.w('\n').wIndent();
    this.writeObj(list.get(i));
  }
  this.level--;
  if (nl) this.w('\n').wIndent();
  this.w(']');
}
fanx_ObjEncoder.prototype.writeMap = function(map)
{
  var t = map.typeof$();
  var nl = this.isMultiLine(t.k) || this.isMultiLine(t.v);
  var inferred = false;
  if (this.curFieldType != null && (this.curFieldType instanceof fan.sys.MapType))
  {
    inferred = true;
  }
  this.curFieldType = null;
  if (!inferred) this.wType(t);
  if (map.isEmpty()) { this.w("[:]"); return; }
  this.level++;
  this.w('[');
  var first = true;
  var keys = map.keys();
  for (var i=0; i<keys.size(); i++)
  {
    if (first) first = false; else this.w(',');
    if (nl) this.w('\n').wIndent();
    var key = keys.get(i);
    var val = map.get(key);
    this.writeObj(key); this.w(':'); this.writeObj(val);
  }
  this.w(']');
  this.level--;
}
fanx_ObjEncoder.prototype.isMultiLine = function(t)
{
  return t.pod() != Pod.sysPod$;
}
fanx_ObjEncoder.prototype.wType = function(t)
{
  return this.w(t.signature());
}
fanx_ObjEncoder.prototype.wStrLiteral = function(s, quote)
{
  var len = s.length;
  this.w(quote);
  for (var i=0; i<len; ++i)
  {
    var c = s.charAt(i);
    switch (c)
    {
      case '\n': this.w('\\').w('n'); break;
      case '\r': this.w('\\').w('r'); break;
      case '\f': this.w('\\').w('f'); break;
      case '\t': this.w('\\').w('t'); break;
      case '\\': this.w('\\').w('\\'); break;
      case '"':  if (quote == '"') this.w('\\').w('"'); else this.w(c); break;
      case '`':  if (quote == '`') this.w('\\').w('`'); else this.w(c); break;
      case '$':  this.w('\\').w('$'); break;
      default:   this.w(c);
    }
  }
  return this.w(quote);
}
fanx_ObjEncoder.prototype.wIndent = function()
{
  var num = this.level * this.indent;
  for (var i=0; i<num; ++i) this.w(' ');
  return this;
}
fanx_ObjEncoder.prototype.w = function(s)
{
  var len = s.length;
  for (var i=0; i<len; ++i)
    this.out.writeChar(s.charCodeAt(i));
  return this;
}
fanx_ObjEncoder.prototype.initOptions = function(options)
{
  this.indent = fanx_ObjEncoder.option(options, "indent", this.indent);
  this.skipDefaults = fanx_ObjEncoder.option(options, "skipDefaults", this.skipDefaults);
  this.skipErrors = fanx_ObjEncoder.option(options, "skipErrors", this.skipErrors);
}
fanx_ObjEncoder.option = function(options, name, def)
{
  var val = options.get(name);
  if (val == null) return def;
  return val;
}
function fanx_Tokenizer(input)
{
  this.input = null;
  this.type  = null;
  this.val   = null;
  this.line  = 1;
  this.$undo = null;
  this.cur   = 0;
  this.curt  = 0;
  this.peek  = 0;
  this.peekt = 0;
  this.input = input;
  this.consume();
  this.consume();
}
fanx_Tokenizer.prototype.next = function()
{
  if (this.$undo != null) { this.$undo.reset(this); this.$undo = null; return this.type; }
  this.val = null;
  return this.type = this.doNext();
}
fanx_Tokenizer.prototype.doNext = function()
{
  while (true)
  {
    while (this.curt == fanx_Tokenizer.SPACE) this.consume();
    if (this.cur < 0) return fanx_Token.EOF;
    if (this.curt == fanx_Tokenizer.ALPHA) return this.id();
    if (this.curt == fanx_Tokenizer.DIGIT) return this.number(false);
    switch (this.cur)
    {
      case  43:  this.consume(); return this.number(false);
      case  45:  this.consume(); return this.number(true);
      case  34:  return this.str();
      case  39:  return this.ch();
      case  96:  return this.uri();
      case  40:  this.consume(); return fanx_Token.LPAREN;
      case  41:  this.consume(); return fanx_Token.RPAREN;
      case  44:  this.consume(); return fanx_Token.COMMA;
      case  59:  this.consume(); return fanx_Token.SEMICOLON;
      case  61:  this.consume(); return fanx_Token.EQ;
      case  123: this.consume(); return fanx_Token.LBRACE;
      case  125: this.consume(); return fanx_Token.RBRACE;
      case  35:  this.consume(); return fanx_Token.POUND;
      case  63:  this.consume(); return fanx_Token.QUESTION;
      case  46:
        if (this.peekt == fanx_Tokenizer.DIGIT) return this.number(false);
        this.consume();
        return fanx_Token.DOT;
      case  91:
        this.consume();
        if (this.cur == 93 ) { this.consume(); return fanx_Token.LRBRACKET; }
        return fanx_Token.LBRACKET;
      case  93:
        this.consume();
        return fanx_Token.RBRACKET;
      case  58:
        this.consume();
        if (this.cur == 58 ) { this.consume(); return fanx_Token.DOUBLE_COLON; }
        return fanx_Token.COLON;
      case  42:
        if (this.peek == 42 ) { this.skipCommentSL(); continue; }
        break;
      case  47:
        if (this.peek == 47 ) { this.skipCommentSL(); continue; }
        if (this.peek == 42 ) { this.skipCommentML(); continue; }
        break;
    }
    throw this.err("Unexpected symbol: " + this.cur + " (0x" + this.cur.toString(16) + ")");
  }
}
fanx_Tokenizer.prototype.id = function()
{
  var val = "";
  var first = this.cur;
  while ((this.curt == fanx_Tokenizer.ALPHA || this.curt == fanx_Tokenizer.DIGIT) && this.cur > 0)
  {
    val += String.fromCharCode(this.cur);
    this.consume();
  }
  switch (first)
  {
    case  97:
      if (val == "as") { return fanx_Token.AS; }
      break;
    case  102:
      if (val == "false") { this.val = false; return fanx_Token.BOOL_LITERAL; }
      break;
    case  110:
      if (val == "null") { this.val = null; return fanx_Token.NULL_LITERAL; }
      break;
    case  116:
      if (val == "true") { this.val = true; return fanx_Token.BOOL_LITERAL; }
      break;
    case  117:
      if (val == "using") { return fanx_Token.USING; }
      break;
  }
  this.val = val;
  return fanx_Token.ID;
}
fanx_Tokenizer.prototype.number = function(neg)
{
  if (this.cur == 48 && this.peek == 120/*'x'*/)
    return this.hex();
  var s = null;
  var whole = 0;
  var wholeCount = 0;
  while (this.curt == fanx_Tokenizer.DIGIT)
  {
    if (s != null)
    {
      s += String.fromCharCode(this.cur);
    }
    else
    {
      whole = whole*10 + (this.cur - 48);
      wholeCount++;
      if (wholeCount >= 18) { s = (neg) ? "-" : ""; s += whole; }
    }
    this.consume();
    if (this.cur == 95) this.consume();
  }
  var floating = false;
  if (this.cur == 46 && this.peekt == fanx_Tokenizer.DIGIT)
  {
    floating = true;
    if (s == null) { s = (neg) ? "-" : ""; s += whole; }
    s += '.';
    this.consume();
    while (this.curt == fanx_Tokenizer.DIGIT)
    {
      s += String.fromCharCode(this.cur);
      this.consume();
      if (this.cur == 95) this.consume();
    }
  }
  if (this.cur == 101 || this.cur == 69/*'E'*/)
  {
    floating = true;
    if (s == null) { s = (neg) ? "-" : ""; s += whole; }
    s += 'e';
    this.consume();
    if (this.cur == 45 || this.cur == 43/*'+'*/) { s += String.fromCharCode(this.cur); this.consume(); }
    if (this.curt != fanx_Tokenizer.DIGIT) throw this.err("Expected exponent digits");
    while (this.curt == fanx_Tokenizer.DIGIT)
    {
      s += String.fromCharCode(this.cur);
      this.consume();
      if (this.cur == 95) this.consume();
    }
  }
  var floatSuffix  = false;
  var decimalSuffix = false;
  var dur = -1;
  if (100 <= this.cur && this.cur <= 115/*'s'*/)
  {
    if (this.cur == 110 && this.peek == 115/*'s'*/) { this.consume(); this.consume(); dur = 1; }
    if (this.cur == 109 && this.peek == 115/*'s'*/) { this.consume(); this.consume(); dur = 1000000; }
    if (this.cur == 115 && this.peek == 101/*'e'*/) { this.consume(); this.consume(); if (this.cur != 99/*'c'*/) throw this.err("Expected 'sec' in Duration literal"); this.consume(); dur = 1000000000; }
    if (this.cur == 109 && this.peek == 105/*'i'*/) { this.consume(); this.consume(); if (this.cur != 110/*'n'*/) throw this.err("Expected 'min' in Duration literal"); this.consume(); dur = 60000000000; }
    if (this.cur == 104 && this.peek == 114/*'r'*/) { this.consume(); this.consume(); dur = 3600000000000; }
    if (this.cur == 100 && this.peek == 97/*'a'*/)  { this.consume(); this.consume(); if (this.cur != 121/*'y'*/) throw this.err("Expected 'day' in Duration literal"); this.consume(); dur = 86400000000000; }
  }
  if (this.cur == 102 || this.cur == 70/*'F'*/)
  {
    this.consume();
    floatSuffix = true;
  }
  else if (this.cur == 100 || this.cur == 68/*'D'*/)
  {
    this.consume();
    decimalSuffix = true;
  }
  if (neg) whole = -whole;
  try
  {
    if (floatSuffix)
    {
      if (s == null)
        this.val = fan.sys.Float.make(whole);
      else
        this.val = fan.sys.Float.fromStr(s);
      return fanx_Token.FLOAT_LITERAL;
    }
    if (decimalSuffix || floating)
    {
      var num = (s == null) ? whole : fan.sys.Float.fromStr(s);
      if (dur > 0)
      {
        this.val = fan.sys.Duration.make(num * dur);
        return fanx_Token.DURATION_LITERAL;
      }
      else
      {
        this.val = fan.sys.Decimal.make(num);
        return fanx_Token.DECIMAL_LITERAL;
      }
    }
    var num = (s == null) ? whole : Math.floor(fan.sys.Float.fromStr(s, true));
    if (dur > 0)
    {
      this.val = fan.sys.Duration.make(num*dur);
      return fanx_Token.DURATION_LITERAL;
    }
    else
    {
      this.val = num;
      return fanx_Token.INT_LITERAL;
    }
  }
  catch (e)
  {
    throw this.err("Invalid numeric literal: " + s);
  }
}
fanx_Tokenizer.prototype.hex = function()
{
  this.consume();
  this.consume();
  var type = fanx_Token.INT_LITERAL;
  var val = this.$hex(this.cur);
  if (val < 0) throw this.err("Expecting hex number");
var str = String.fromCharCode(this.cur);
  this.consume();
  var nibCount = 1;
  while (true)
  {
    var nib = this.$hex(this.cur);
    if (nib < 0)
    {
      if (this.cur == 95) { this.consume(); continue; }
      break;
    }
str += String.fromCharCode(this.cur);
    nibCount++;
    if (nibCount > 16) throw this.err("Hex literal too big");
    this.consume();
  }
this.val = fan.sys.Int.fromStr(str, 16);
  return type;
}
fanx_Tokenizer.prototype.$hex = function(c)
{
  if (48 <= c && c <= 57) return c - 48;
  if (97 <= c && c <= 102) return c - 97 + 10;
  if (65 <= c && c <= 70) return c - 65 + 10;
  return -1;
}
fanx_Tokenizer.prototype.str = function()
{
  this.consume();
  var s = "";
  var loop = true;
  while (loop)
  {
    switch (this.cur)
    {
      case 34:   this.consume(); loop = false; break;
      case -1:          throw this.err("Unexpected end of string");
      case 36:   throw this.err("Interpolated strings unsupported");
      case 92:  s += this.escape(); break;
      case 13:  s += '\n'; this.consume(); break;
      default:          s += String.fromCharCode(this.cur); this.consume(); break;
    }
  }
  this.val = s;
  return fanx_Token.STR_LITERAL;
}
fanx_Tokenizer.prototype.ch = function()
{
  this.consume();
  var c;
  if (this.cur == 92)
  {
    c = this.escape();
  }
  else
  {
    c = this.cur;
    this.consume();
  }
  if (this.cur != 39) throw this.err("Expecting ' close of char literal");
  this.consume();
  this.val = c;
  return fanx_Token.INT_LITERAL;
}
fanx_Tokenizer.prototype.escape = function()
{
  if (this.cur != 92) throw this.err("Internal error");
  this.consume();
  switch (this.cur)
  {
    case   98:   this.consume(); return '\b';
    case   102:  this.consume(); return '\f';
    case   110:  this.consume(); return '\n';
    case   114:  this.consume(); return '\r';
    case   116:  this.consume(); return '\t';
    case   36:   this.consume(); return '$';
    case   34:   this.consume(); return '"';
    case  39:   this.consume(); return '\'';
    case   96:   this.consume(); return '`';
    case  92:   this.consume(); return '\\';
  }
  if (this.cur == 117)
  {
    this.consume();
    var n3 = this.$hex(this.cur); this.consume();
    var n2 = this.$hex(this.cur); this.consume();
    var n1 = this.$hex(this.cur); this.consume();
    var n0 = this.$hex(this.cur); this.consume();
    if (n3 < 0 || n2 < 0 || n1 < 0 || n0 < 0) throw this.err("Invalid hex value for \\uxxxx");
    return String.fromCharCode((n3 << 12) | (n2 << 8) | (n1 << 4) | n0);
  }
  throw this.err("Invalid escape sequence");
}
fanx_Tokenizer.prototype.uri = function()
{
  this.consume();
  var s = "";
  while (true)
  {
    if (this.cur < 0) throw this.err("Unexpected end of uri");
    if (this.cur == 92)
    {
      s += this.escape();
    }
    else
    {
      if (this.cur == 96) { this.consume(); break; }
      s += String.fromCharCode(this.cur);
      this.consume();
    }
  }
  this.val = fan.sys.Uri.fromStr(s);
  return fanx_Token.URI_LITERAL;
}
fanx_Tokenizer.prototype.skipCommentSL = function()
{
  this.consume();
  this.consume();
  while (true)
  {
    if (this.cur == 10 || this.cur == 13/*'\r'*/) { this.consume(); break; }
    if (this.cur < 0) break;
    this.consume();
  }
  return null;
}
fanx_Tokenizer.prototype.skipCommentML = function()
{
  this.consume();
  this.consume();
  var depth = 1;
  while (true)
  {
    if (this.cur == 42 && this.peek == 47/*'/'*/) { this.consume(); this.consume(); depth--; if (depth <= 0) break; }
    if (this.cur == 47 && this.peek == 42/*'*'*/) { this.consume(); this.consume(); depth++; continue; }
    if (this.cur < 0) break;
    this.consume();
  }
  return null;
}
fanx_Tokenizer.prototype.err = function(msg)
{
  return fanx_ObjDecoder.err(msg, this.line);
}
fanx_Tokenizer.prototype.consume = function()
{
  if (this.cur == 10 || this.cur == 13/*'\r'*/) this.line++;
  var c = this.input.readChar();
  if (c == 10 && this.peek == 13/*'\r'*/) c = this.input.readChar();
  if (c == null) c = -1;
  this.cur   = this.peek;
  this.curt  = this.peekt;
  this.peek  = c;
  this.peekt = 0 < c && c < 128 ? fanx_Tokenizer.charMap[c] : fanx_Tokenizer.ALPHA;
}
fanx_Tokenizer.prototype.undo = function(type, val, line)
{
  if (this.$undo != null) throw new fan.sys.Err.make("only one pushback supported");
  this.$undo = new fanx_Undo(type, val, line);
}
fanx_Tokenizer.prototype.reset = function(type, val, line)
{
  this.type = type;
  this.val  = val;
  this.line = line;
  return type;
}
fanx_Tokenizer.charMap = [];
fanx_Tokenizer.SPACE = 1;
fanx_Tokenizer.ALPHA = 2;
fanx_Tokenizer.DIGIT = 3;
fanx_Tokenizer.charMap[32 ]  = fanx_Tokenizer.SPACE;
fanx_Tokenizer.charMap[10 ] = fanx_Tokenizer.SPACE;
fanx_Tokenizer.charMap[13 ] = fanx_Tokenizer.SPACE;
fanx_Tokenizer.charMap[9  ] = fanx_Tokenizer.SPACE;
for (var i=97; i<=122/*'z'*/; ++i) fanx_Tokenizer.charMap[i] = fanx_Tokenizer.ALPHA;
for (var i=65; i<=90/*'Z'*/;  ++i) fanx_Tokenizer.charMap[i] = fanx_Tokenizer.ALPHA;
fanx_Tokenizer.charMap[95 ] = fanx_Tokenizer.ALPHA;
for (var i=48; i<=57/*'9'*/; ++i) fanx_Tokenizer.charMap[i] = fanx_Tokenizer.DIGIT;
function fanx_Undo(t, v, l) { this.type = t; this.val = v; this.line = l; }
fanx_Undo.prototype.reset = function(t) { t.reset(this.type, this.val, this.line); }
const p = Pod.add$('sys');
Obj.type$ = p.at$('Obj',null,[],{},8705,Obj);
Obj.prototype.typeof$ = () => { return Obj.type$; }
Type.type$ = p.at$('Type','sys::Obj',[],{},8706,Type);
Type.prototype.typeof$ = () => { return Type.type$; }
Sys.initGenericParamTypes();
Facet.type$ = p.am$('Facet','sys::Obj',[],{},8963,Facet);
Facet.prototype.typeof$ = () => { return Facet.type$; }
TimeZone.type$ = p.at$('TimeZone','sys::Obj',[],{'sys::Serializable':"sys::Serializable{simple=true;}"},8706,TimeZone);
TimeZone.prototype.typeof$ = () => { return TimeZone.type$; }
Uri.type$ = p.at$('Uri','sys::Obj',[],{'sys::Serializable':"sys::Serializable{simple=true;}"},8738,Uri);
Uri.prototype.typeof$ = () => { return Uri.type$; }
Num.type$ = p.at$('Num','sys::Obj',[],{},8707,Num);
Num.prototype.typeof$ = () => { return Num.type$; }
Int.type$ = p.at$('Int','sys::Num',[],{'sys::Serializable':"sys::Serializable{simple=true;}"},8738,Int);
Int.prototype.typeof$ = () => { return Int.type$; }
Err.type$ = p.at$('Err','sys::Obj',[],{},8706,Err);
Err.prototype.typeof$ = () => { return Err.type$; }
CancelledErr.type$ = p.at$('CancelledErr','sys::Err',[],{},8706,CancelledErr);
CancelledErr.prototype.typeof$ = () => { return CancelledErr.type$; }
Unsafe.type$ = p.at$('Unsafe','sys::Obj',[],{},8738,Unsafe);
Unsafe.prototype.typeof$ = () => { return Unsafe.type$; }
Pod.type$ = p.at$('Pod','sys::Obj',[],{},8738,Pod);
Pod.prototype.typeof$ = () => { return Pod.type$; }
Void.type$ = p.at$('Void','sys::Obj',[],{},8738,Void);
Void.prototype.typeof$ = () => { return Void.type$; }
ConstErr.type$ = p.at$('ConstErr','sys::Err',[],{},8706,ConstErr);
ConstErr.prototype.typeof$ = () => { return ConstErr.type$; }
Version.type$ = p.at$('Version','sys::Obj',[],{'sys::Serializable':"sys::Serializable{simple=true;}"},8738,Version);
Version.prototype.typeof$ = () => { return Version.type$; }
ArgErr.type$ = p.at$('ArgErr','sys::Err',[],{},8706,ArgErr);
ArgErr.prototype.typeof$ = () => { return ArgErr.type$; }
Date.type$ = p.at$('Date','sys::Obj',[],{'sys::Serializable':"sys::Serializable{simple=true;}"},8738,Date);
Date.prototype.typeof$ = () => { return Date.type$; }
Enum.type$ = p.at$('Enum','sys::Obj',[],{},8707,Enum);
Enum.prototype.typeof$ = () => { return Enum.type$; }
Endian.type$ = p.at$('Endian','sys::Enum',[],{'sys::Serializable':"sys::Serializable{simple=true;}"},8746,Endian);
Endian.prototype.typeof$ = () => { return Endian.type$; }
Test.type$ = p.at$('Test','sys::Obj',[],{},8705,Test);
Test.prototype.typeof$ = () => { return Test.type$; }
TestErr.type$ = p.at$('TestErr','sys::Err',[],{},8706,TestErr);
TestErr.prototype.typeof$ = () => { return TestErr.type$; }
NameErr.type$ = p.at$('NameErr','sys::Err',[],{},8706,NameErr);
NameErr.prototype.typeof$ = () => { return NameErr.type$; }
Duration.type$ = p.at$('Duration','sys::Obj',[],{'sys::Serializable':"sys::Serializable{simple=true;}"},8738,Duration);
Duration.prototype.typeof$ = () => { return Duration.type$; }
Decimal.type$ = p.at$('Decimal','sys::Num',[],{'sys::Serializable':"sys::Serializable{simple=true;}"},8738,Decimal);
Decimal.prototype.typeof$ = () => { return Decimal.type$; }
TimeoutErr.type$ = p.at$('TimeoutErr','sys::Err',[],{},8706,TimeoutErr);
TimeoutErr.prototype.typeof$ = () => { return TimeoutErr.type$; }
IOErr.type$ = p.at$('IOErr','sys::Err',[],{},8706,IOErr);
IOErr.prototype.typeof$ = () => { return IOErr.type$; }
Locale.type$ = p.at$('Locale','sys::Obj',[],{'sys::Serializable':"sys::Serializable{simple=true;}"},8706,Locale);
Locale.prototype.typeof$ = () => { return Locale.type$; }
UnresolvedErr.type$ = p.at$('UnresolvedErr','sys::Err',[],{},8706,UnresolvedErr);
UnresolvedErr.prototype.typeof$ = () => { return UnresolvedErr.type$; }
This.type$ = p.at$('This','sys::Obj',[],{},8738,This);
This.prototype.typeof$ = () => { return This.type$; }
UnknownSlotErr.type$ = p.at$('UnknownSlotErr','sys::Err',[],{},8706,UnknownSlotErr);
UnknownSlotErr.prototype.typeof$ = () => { return UnknownSlotErr.type$; }
StrBuf.type$ = p.at$('StrBuf','sys::Obj',[],{},8736,StrBuf);
StrBuf.prototype.typeof$ = () => { return StrBuf.type$; }
ReadonlyErr.type$ = p.at$('ReadonlyErr','sys::Err',[],{},8706,ReadonlyErr);
ReadonlyErr.prototype.typeof$ = () => { return ReadonlyErr.type$; }
LogRec.type$ = p.at$('LogRec','sys::Obj',[],{},8706,LogRec);
LogRec.prototype.typeof$ = () => { return LogRec.type$; }
Func.type$ = p.at$('Func','sys::Obj',[],{},8736,Func);
Range.type$ = p.at$('Range','sys::Obj',[],{'sys::Serializable':"sys::Serializable{simple=true;}"},8738,Range);
Range.prototype.typeof$ = () => { return Range.type$; }
IndexErr.type$ = p.at$('IndexErr','sys::Err',[],{},8706,IndexErr);
IndexErr.prototype.typeof$ = () => { return IndexErr.type$; }
Log.type$ = p.at$('Log','sys::Obj',[],{},8706,Log);
Log.prototype.typeof$ = () => { return Log.type$; }
Weekday.type$ = p.at$('Weekday','sys::Enum',[],{'sys::Serializable':"sys::Serializable{simple=true;}"},8746,Weekday);
Weekday.prototype.typeof$ = () => { return Weekday.type$; }
Buf.type$ = p.at$('Buf','sys::Obj',[],{},8704,Buf);
Buf.prototype.typeof$ = () => { return Buf.type$; }
ConstBuf.type$ = p.at$('ConstBuf','sys::Buf',[],{},640,ConstBuf);
ConstBuf.prototype.typeof$ = () => { return ConstBuf.type$; }
Charset.type$ = p.at$('Charset','sys::Obj',[],{'sys::Serializable':"sys::Serializable{simple=true;}"},8738,Charset);
Charset.prototype.typeof$ = () => { return Charset.type$; }
Zip.type$ = p.at$('Zip','sys::Obj',[],{},8736,Zip);
Zip.prototype.typeof$ = () => { return Zip.type$; }
Depend.type$ = p.at$('Depend','sys::Obj',[],{'sys::Serializable':"sys::Serializable{simple=true;}"},8738,Depend);
Depend.prototype.typeof$ = () => { return Depend.type$; }
Str.type$ = p.at$('Str','sys::Obj',[],{},8738,Str);
Str.prototype.typeof$ = () => { return Str.type$; }
Bool.type$ = p.at$('Bool','sys::Obj',[],{'sys::Serializable':"sys::Serializable{simple=true;}"},8738,Bool);
Bool.prototype.typeof$ = () => { return Bool.type$; }
MimeType.type$ = p.at$('MimeType','sys::Obj',[],{'sys::Serializable':"sys::Serializable{simple=true;}"},8738,MimeType);
MimeType.prototype.typeof$ = () => { return MimeType.type$; }
Regex.type$ = p.at$('Regex','sys::Obj',[],{'sys::Serializable':"sys::Serializable{simple=true;}"},8738,Regex);
Regex.prototype.typeof$ = () => { return Regex.type$; }
OutStream.type$ = p.at$('OutStream','sys::Obj',[],{},8704,OutStream);
OutStream.prototype.typeof$ = () => { return OutStream.type$; }
LogLevel.type$ = p.at$('LogLevel','sys::Enum',[],{'sys::Serializable':"sys::Serializable{simple=true;}"},8746,LogLevel);
LogLevel.prototype.typeof$ = () => { return LogLevel.type$; }
Time.type$ = p.at$('Time','sys::Obj',[],{'sys::Serializable':"sys::Serializable{simple=true;}"},8738,Time);
Time.prototype.typeof$ = () => { return Time.type$; }
UnknownTypeErr.type$ = p.at$('UnknownTypeErr','sys::Err',[],{},8706,UnknownTypeErr);
UnknownTypeErr.prototype.typeof$ = () => { return UnknownTypeErr.type$; }
Month.type$ = p.at$('Month','sys::Enum',[],{'sys::Serializable':"sys::Serializable{simple=true;}"},8746,Month);
Month.prototype.typeof$ = () => { return Month.type$; }
CastErr.type$ = p.at$('CastErr','sys::Err',[],{},8706,CastErr);
CastErr.prototype.typeof$ = () => { return CastErr.type$; }
ParseErr.type$ = p.at$('ParseErr','sys::Err',[],{},8706,ParseErr);
ParseErr.prototype.typeof$ = () => { return ParseErr.type$; }
DateTime.type$ = p.at$('DateTime','sys::Obj',[],{'sys::Serializable':"sys::Serializable{simple=true;}"},8738,DateTime);
DateTime.prototype.typeof$ = () => { return DateTime.type$; }
NotImmutableErr.type$ = p.at$('NotImmutableErr','sys::Err',[],{},8706,NotImmutableErr);
NotImmutableErr.prototype.typeof$ = () => { return NotImmutableErr.type$; }
UnknownPodErr.type$ = p.at$('UnknownPodErr','sys::Err',[],{},8706,UnknownPodErr);
UnknownPodErr.prototype.typeof$ = () => { return UnknownPodErr.type$; }
List.type$ = p.at$('List','sys::Obj',[],{'sys::Serializable':""},8736,List);
FileStore.type$ = p.at$('FileStore','sys::Obj',[],{},8707,FileStore);
FileStore.prototype.typeof$ = () => { return FileStore.type$; }
Unit.type$ = p.at$('Unit','sys::Obj',[],{'sys::Serializable':"sys::Serializable{simple=true;}"},8706,Unit);
Unit.prototype.typeof$ = () => { return Unit.type$; }
RegexMatcher.type$ = p.at$('RegexMatcher','sys::Obj',[],{},8736,RegexMatcher);
RegexMatcher.prototype.typeof$ = () => { return RegexMatcher.type$; }
Slot.type$ = p.at$('Slot','sys::Obj',[],{},8707,Slot);
Slot.prototype.typeof$ = () => { return Slot.type$; }
Field.type$ = p.at$('Field','sys::Slot',[],{},8706,Field);
Field.prototype.typeof$ = () => { return Field.type$; }
FieldNotSetErr.type$ = p.at$('FieldNotSetErr','sys::Err',[],{},8706,FieldNotSetErr);
FieldNotSetErr.prototype.typeof$ = () => { return FieldNotSetErr.type$; }
Method.type$ = p.at$('Method','sys::Slot',[],{},8706,Method);
Method.prototype.typeof$ = () => { return Method.type$; }
Serializable.type$ = p.at$('Serializable','sys::Obj',['sys::Facet'],{'sys::FacetMeta':"sys::FacetMeta{inherited=true;}",'sys::Serializable':""},8754,Serializable);
Serializable.prototype.typeof$ = () => { return Serializable.type$; }
Transient.type$ = p.at$('Transient','sys::Obj',['sys::Facet'],{},8754,Transient);
Transient.prototype.typeof$ = () => { return Transient.type$; }
Js.type$ = p.at$('Js','sys::Obj',['sys::Facet'],{},8754,Js);
Js.prototype.typeof$ = () => { return Js.type$; }
NoDoc.type$ = p.at$('NoDoc','sys::Obj',['sys::Facet'],{},8754,NoDoc);
NoDoc.prototype.typeof$ = () => { return NoDoc.type$; }
Deprecated.type$ = p.at$('Deprecated','sys::Obj',['sys::Facet'],{'sys::Serializable':""},8754,Deprecated);
Deprecated.prototype.typeof$ = () => { return Deprecated.type$; }
Operator.type$ = p.at$('Operator','sys::Obj',['sys::Facet'],{},8754,Operator);
Operator.prototype.typeof$ = () => { return Operator.type$; }
FacetMeta.type$ = p.at$('FacetMeta','sys::Obj',['sys::Facet'],{'sys::Serializable':""},8754,FacetMeta);
FacetMeta.prototype.typeof$ = () => { return FacetMeta.type$; }
UnknownServiceErr.type$ = p.at$('UnknownServiceErr','sys::Err',[],{},8706,UnknownServiceErr);
UnknownServiceErr.prototype.typeof$ = () => { return UnknownServiceErr.type$; }
NullErr.type$ = p.at$('NullErr','sys::Err',[],{},8706,NullErr);
NullErr.prototype.typeof$ = () => { return NullErr.type$; }
Uuid.type$ = p.at$('Uuid','sys::Obj',[],{'sys::Serializable':"sys::Serializable{simple=true;}"},8738,Uuid);
Uuid.prototype.typeof$ = () => { return Uuid.type$; }
UnsupportedErr.type$ = p.at$('UnsupportedErr','sys::Err',[],{},8706,UnsupportedErr);
UnsupportedErr.prototype.typeof$ = () => { return UnsupportedErr.type$; }
UnknownKeyErr.type$ = p.at$('UnknownKeyErr','sys::Err',[],{},8706,UnknownKeyErr);
UnknownKeyErr.prototype.typeof$ = () => { return UnknownKeyErr.type$; }
UnknownFacetErr.type$ = p.at$('UnknownFacetErr','sys::Err',[],{},8706,UnknownFacetErr);
UnknownFacetErr.prototype.typeof$ = () => { return UnknownFacetErr.type$; }
InStream.type$ = p.at$('InStream','sys::Obj',[],{},8704,InStream);
InStream.prototype.typeof$ = () => { return InStream.type$; }
File.type$ = p.at$('File','sys::Obj',[],{},8707,File);
File.prototype.typeof$ = () => { return File.type$; }
InterruptedErr.type$ = p.at$('InterruptedErr','sys::Err',[],{},8706,InterruptedErr);
InterruptedErr.prototype.typeof$ = () => { return InterruptedErr.type$; }
Env.type$ = p.at$('Env','sys::Obj',[],{},8707,Env);
Env.prototype.typeof$ = () => { return Env.type$; }
Map.type$ = p.at$('Map','sys::Obj',[],{'sys::Serializable':""},8736,Map);
Param.type$ = p.at$('Param','sys::Obj',[],{},8738,Param);
Param.prototype.typeof$ = () => { return Param.type$; }
Float.type$ = p.at$('Float','sys::Num',[],{'sys::Serializable':"sys::Serializable{simple=true;}"},8738,Float);
Float.prototype.typeof$ = () => { return Float.type$; }
Service.type$ = p.am$('Service','sys::Obj',[],{},8963,Service);
Service.prototype.typeof$ = () => { return Service.type$; }
Obj.type$.am$('toStr',270336,'sys::Str',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',4100,'sys::Void',List.make(Param.type$,[]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
Type.type$.am$('inheritance',8192,'sys::Type[]',List.make(Param.type$,[]),{}).am$('isSynthetic',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('facets',8192,'sys::Facet[]',List.make(Param.type$,[]),{}).am$('privateMake',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('mixins',8192,'sys::Type[]',List.make(Param.type$,[]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('find',40962,'sys::Type?',List.make(Param.type$,[new Param('qname','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('qname',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('isFacet',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('method',8192,'sys::Method?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('params',8192,'[sys::Str:sys::Type]',List.make(Param.type$,[]),{}).am$('fits',8192,'sys::Bool',List.make(Param.type$,[new Param('t','sys::Type',false)]),{}).am$('isInternal',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('slots',8192,'sys::Slot[]',List.make(Param.type$,[]),{}).am$('field',8192,'sys::Field?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('isNullable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('name',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('doc',8192,'sys::Str?',List.make(Param.type$,[]),{}).am$('fields',8192,'sys::Field[]',List.make(Param.type$,[]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('toNonNullable',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('hasFacet',8192,'sys::Bool',List.make(Param.type$,[new Param('type','sys::Type',false)]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('pod',8192,'sys::Pod?',List.make(Param.type$,[]),{}).am$('signature',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('methods',8192,'sys::Method[]',List.make(Param.type$,[]),{}).am$('slot',8192,'sys::Slot?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('toNullable',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('emptyList',8192,'sys::Obj[]',List.make(Param.type$,[]),{}).am$('isConst',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('of',40962,'sys::Type',List.make(Param.type$,[new Param('obj','sys::Obj',false)]),{}).am$('isPublic',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('isFinal',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8192,'sys::Obj',List.make(Param.type$,[new Param('args','sys::Obj[]?',true)]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('isClass',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('toLocale',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('parameterize',8192,'sys::Type',List.make(Param.type$,[new Param('params','[sys::Str:sys::Type]',false)]),{}).am$('isGeneric',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('isEnum',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('isVal',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('isAbstract',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('isMixin',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('toListOf',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('facet',8192,'sys::Facet?',List.make(Param.type$,[new Param('type','sys::Type',false),new Param('checked','sys::Bool',true)]),{}).am$('base',8192,'sys::Type?',List.make(Param.type$,[]),{});
Facet.type$.am$('toStr',270336,'sys::Str',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
TimeZone.type$.am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('cur',40962,'sys::TimeZone',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('offset',8192,'sys::Duration',List.make(Param.type$,[new Param('year','sys::Int',false)]),{}).am$('utc',40962,'sys::TimeZone',List.make(Param.type$,[]),{}).am$('fullName',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('dstOffset',8192,'sys::Duration?',List.make(Param.type$,[new Param('year','sys::Int',false)]),{}).am$('stdAbbr',8192,'sys::Str',List.make(Param.type$,[new Param('year','sys::Int',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('privateMake',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('fromStr',40966,'sys::TimeZone?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('listFullNames',40962,'sys::Str[]',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('rel',40962,'sys::TimeZone',List.make(Param.type$,[]),{}).am$('name',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('dstAbbr',8192,'sys::Str?',List.make(Param.type$,[new Param('year','sys::Int',false)]),{}).am$('listNames',40962,'sys::Str[]',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('defVal',40962,'sys::TimeZone',List.make(Param.type$,[]),{});
Uri.type$.af$('defVal',106498,'sys::Uri',{}).af$('sectionFrag',106498,'sys::Int',{}).af$('sectionQuery',106498,'sys::Int',{}).af$('sectionPath',106498,'sys::Int',{}).am$('encode',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('plusName',8192,'sys::Uri',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('asDir','sys::Bool',true)]),{}).am$('userInfo',8192,'sys::Str?',List.make(Param.type$,[]),{}).am$('parent',8192,'sys::Uri?',List.make(Param.type$,[]),{}).am$('relTo',8192,'sys::Uri',List.make(Param.type$,[new Param('base','sys::Uri',false)]),{}).am$('encodeQuery',40962,'sys::Str',List.make(Param.type$,[new Param('q','[sys::Str:sys::Str]',false)]),{}).am$('auth',8192,'sys::Str?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('mimeType',8192,'sys::MimeType?',List.make(Param.type$,[]),{}).am$('decode',40962,'sys::Uri?',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('checkName',40962,'sys::Void',List.make(Param.type$,[new Param('name','sys::Str',false)]),{}).am$('privateMake',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('escapeToken',40962,'sys::Str',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('section','sys::Int',false)]),{}).am$('path',8192,'sys::Str[]',List.make(Param.type$,[]),{}).am$('isAbs',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('getRange',8192,'sys::Uri',List.make(Param.type$,[new Param('r','sys::Range',false)]),{}).am$('host',8192,'sys::Str?',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('pathStr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('unescapeToken',40962,'sys::Str',List.make(Param.type$,[new Param('s','sys::Str',false)]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('ext',8192,'sys::Str?',List.make(Param.type$,[]),{}).am$('toCode',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('decodeQuery',40962,'[sys::Str:sys::Str]',List.make(Param.type$,[new Param('s','sys::Str',false)]),{}).am$('query',8192,'[sys::Str:sys::Str]',List.make(Param.type$,[]),{}).am$('plusSlash',8192,'sys::Uri',List.make(Param.type$,[]),{}).am$('decodeToken',40962,'sys::Str',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('section','sys::Int',false)]),{}).am$('plus',8192,'sys::Uri',List.make(Param.type$,[new Param('toAppend','sys::Uri',false)]),{}).am$('basename',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('fromStr',40966,'sys::Uri?',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('port',8192,'sys::Int?',List.make(Param.type$,[]),{}).am$('name',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toFile',8192,'sys::File',List.make(Param.type$,[]),{}).am$('getRangeToPathAbs',8192,'sys::Uri',List.make(Param.type$,[new Param('r','sys::Range',false)]),{}).am$('hash',271360,'sys::Int',List.make(Param.type$,[]),{}).am$('queryStr',8192,'sys::Str?',List.make(Param.type$,[]),{}).am$('relToAuth',8192,'sys::Uri',List.make(Param.type$,[]),{}).am$('frag',8192,'sys::Str?',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('scheme',8192,'sys::Str?',List.make(Param.type$,[]),{}).am$('isPathAbs',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('get',8192,'sys::Obj?',List.make(Param.type$,[new Param('base','sys::Obj?',true),new Param('checked','sys::Bool',true)]),{}).am$('plusQuery',8192,'sys::Uri',List.make(Param.type$,[new Param('query','[sys::Str:sys::Str]?',false)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('pathOnly',8192,'sys::Uri',List.make(Param.type$,[]),{}).am$('toLocale',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('isPathRel',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('isRel',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('isPathOnly',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('isName',40962,'sys::Bool',List.make(Param.type$,[new Param('name','sys::Str',false)]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('encodeToken',40962,'sys::Str',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('section','sys::Int',false)]),{}).am$('isDir',8192,'sys::Bool',List.make(Param.type$,[]),{});
Num.type$.am$('toStr',270336,'sys::Str',List.make(Param.type$,[]),{}).am$('toInt',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('localePercent',40962,'sys::Str',List.make(Param.type$,[]),{}).am$('toFloat',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('localeNaN',40962,'sys::Str',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('localeMinus',40962,'sys::Str',List.make(Param.type$,[]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('localeNegInf',40962,'sys::Str',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('localeDecimal',40962,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toDecimal',8192,'sys::Decimal',List.make(Param.type$,[]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',132,'sys::Void',List.make(Param.type$,[]),{}).am$('localeGrouping',40962,'sys::Str',List.make(Param.type$,[]),{}).am$('localePosInf',40962,'sys::Str',List.make(Param.type$,[]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
Int.type$.af$('maxVal',106498,'sys::Int',{}).af$('minVal',106498,'sys::Int',{}).af$('defVal',106498,'sys::Int',{}).am$('shiftl',8192,'sys::Int',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('mult',8192,'sys::Int',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('mod',8192,'sys::Int',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('localePercent',40962,'sys::Str',List.make(Param.type$,[]),{}).am$('divFloat',8192,'sys::Float',List.make(Param.type$,[new Param('b','sys::Float',false)]),{}).am$('upper',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('isSpace',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('privateMake',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('div',8192,'sys::Int',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('plusFloat',8192,'sys::Float',List.make(Param.type$,[new Param('b','sys::Float',false)]),{}).am$('localeUpper',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('isUpper',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('shiftr',8192,'sys::Int',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('equalsIgnoreCase',8192,'sys::Bool',List.make(Param.type$,[new Param('ch','sys::Int',false)]),{}).am$('toDecimal',8192,'sys::Decimal',List.make(Param.type$,[]),{}).am$('clamp',8192,'sys::Int',List.make(Param.type$,[new Param('min','sys::Int',false),new Param('max','sys::Int',false)]),{}).am$('toDateTime',8192,'sys::DateTime',List.make(Param.type$,[new Param('tz','sys::TimeZone',true)]),{}).am$('modFloat',8192,'sys::Float',List.make(Param.type$,[new Param('b','sys::Float',false)]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('multFloat',8192,'sys::Float',List.make(Param.type$,[new Param('b','sys::Float',false)]),{}).am$('isAlphaNum',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('toRadix',8192,'sys::Str',List.make(Param.type$,[new Param('radix','sys::Int',false),new Param('width','sys::Int?',true)]),{}).am$('isAlpha',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('toCode',8192,'sys::Str',List.make(Param.type$,[new Param('base','sys::Int',true)]),{}).am$('lower',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('plus',8192,'sys::Int',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('divDecimal',8192,'sys::Decimal',List.make(Param.type$,[new Param('b','sys::Decimal',false)]),{}).am$('localeIsLower',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('localeMinus',40962,'sys::Str',List.make(Param.type$,[]),{}).am$('fromStr',40966,'sys::Int?',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('radix','sys::Int',true),new Param('checked','sys::Bool',true)]),{}).am$('toHex',8192,'sys::Str',List.make(Param.type$,[new Param('width','sys::Int?',true)]),{}).am$('localeNegInf',40962,'sys::Str',List.make(Param.type$,[]),{}).am$('shifta',8192,'sys::Int',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('isDigit',8192,'sys::Bool',List.make(Param.type$,[new Param('radix','sys::Int',true)]),{}).am$('localeLower',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('toDuration',8192,'sys::Duration',List.make(Param.type$,[]),{}).am$('localeGrouping',40962,'sys::Str',List.make(Param.type$,[]),{}).am$('hash',271360,'sys::Int',List.make(Param.type$,[]),{}).am$('minus',8192,'sys::Int',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('compare',271360,'sys::Int',List.make(Param.type$,[new Param('obj','sys::Obj',false)]),{}).am$('isEven',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('increment',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('plusDecimal',8192,'sys::Decimal',List.make(Param.type$,[new Param('b','sys::Decimal',false)]),{}).am$('localeIsUpper',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('random',40962,'sys::Int',List.make(Param.type$,[new Param('r','sys::Range?',true)]),{}).am$('not',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('times',8192,'sys::Void',List.make(Param.type$,[new Param('c','|sys::Int->sys::Void|',false)]),{}).am$('minusDecimal',8192,'sys::Decimal',List.make(Param.type$,[new Param('b','sys::Decimal',false)]),{}).am$('min',8192,'sys::Int',List.make(Param.type$,[new Param('that','sys::Int',false)]),{}).am$('and',8192,'sys::Int',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('minusFloat',8192,'sys::Float',List.make(Param.type$,[new Param('b','sys::Float',false)]),{}).am$('isOdd',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('pow',8192,'sys::Int',List.make(Param.type$,[new Param('pow','sys::Int',false)]),{}).am$('xor',8192,'sys::Int',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('toDigit',8192,'sys::Int?',List.make(Param.type$,[new Param('radix','sys::Int',true)]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('toChar',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toLocale',8192,'sys::Str',List.make(Param.type$,[new Param('pattern','sys::Str?',true),new Param('locale','sys::Locale',true)]),{}).am$('toInt',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('modDecimal',8192,'sys::Decimal',List.make(Param.type$,[new Param('b','sys::Decimal',false)]),{}).am$('or',8192,'sys::Int',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('max',8192,'sys::Int',List.make(Param.type$,[new Param('that','sys::Int',false)]),{}).am$('toFloat',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('fromDigit',8192,'sys::Int?',List.make(Param.type$,[new Param('radix','sys::Int',true)]),{}).am$('localeNaN',40962,'sys::Str',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('abs',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('negate',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('decrement',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('obj','sys::Obj?',false)]),{}).am$('isLower',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('localeDecimal',40962,'sys::Str',List.make(Param.type$,[]),{}).am$('multDecimal',8192,'sys::Decimal',List.make(Param.type$,[new Param('b','sys::Decimal',false)]),{}).am$('clip',8192,'sys::Int',List.make(Param.type$,[new Param('min','sys::Int',false),new Param('max','sys::Int',false)]),{}).am$('localePosInf',40962,'sys::Str',List.make(Param.type$,[]),{});
Err.type$.am$('msg',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('cause',8192,'sys::Err?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('trace',8192,'sys::This',List.make(Param.type$,[new Param('out','sys::OutStream',true),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('traceToStr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str',true),new Param('cause','sys::Err?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
CancelledErr.type$.am$('msg',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('cause',8192,'sys::Err?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('trace',8192,'sys::This',List.make(Param.type$,[new Param('out','sys::OutStream',true),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('traceToStr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str',true),new Param('cause','sys::Err?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
Unsafe.type$.am$('val',8192,'sys::Obj?',List.make(Param.type$,[]),{}).am$('toStr',270336,'sys::Str',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('val','sys::Obj?',false)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
Pod.type$.am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('log',8192,'sys::Log',List.make(Param.type$,[]),{}).am$('orderByDepends',40962,'sys::Pod[]',List.make(Param.type$,[new Param('pods','sys::Pod[]',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('type',8192,'sys::Type?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('locale',8192,'sys::Str?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('def','sys::Str?',true)]),{}).am$('file',8192,'sys::File?',List.make(Param.type$,[new Param('uri','sys::Uri',false),new Param('checked','sys::Bool',true)]),{}).am$('load',40962,'sys::Pod',List.make(Param.type$,[new Param('in','sys::InStream',false)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('find',40962,'sys::Pod?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('of',40962,'sys::Pod?',List.make(Param.type$,[new Param('obj','sys::Obj',false)]),{}).am$('flattenDepends',40962,'sys::Pod[]',List.make(Param.type$,[new Param('pods','sys::Pod[]',false)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('types',8192,'sys::Type[]',List.make(Param.type$,[]),{}).am$('depends',8192,'sys::Depend[]',List.make(Param.type$,[]),{}).am$('list',40962,'sys::Pod[]',List.make(Param.type$,[]),{}).am$('version',8192,'sys::Version',List.make(Param.type$,[]),{}).am$('uri',8192,'sys::Uri',List.make(Param.type$,[]),{}).am$('props',8192,'[sys::Str:sys::Str]',List.make(Param.type$,[new Param('uri','sys::Uri',false),new Param('maxAge','sys::Duration',false)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('meta',8192,'[sys::Str:sys::Str]',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('name',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('files',8192,'sys::File[]',List.make(Param.type$,[]),{}).am$('doc',8192,'sys::Str?',List.make(Param.type$,[]),{}).am$('config',8192,'sys::Str?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('def','sys::Str?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{});
Void.type$.am$('toStr',270336,'sys::Str',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
ConstErr.type$.am$('msg',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('cause',8192,'sys::Err?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('trace',8192,'sys::This',List.make(Param.type$,[new Param('out','sys::OutStream',true),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('traceToStr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str',true),new Param('cause','sys::Err?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
Version.type$.af$('defVal',106498,'sys::Version',{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',271360,'sys::Int',List.make(Param.type$,[new Param('obj','sys::Obj',false)]),{}).am$('minor',8192,'sys::Int?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('segments',8192,'sys::Int[]',List.make(Param.type$,[]),{}).am$('privateMake',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('patch',8192,'sys::Int?',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('fromStr',40966,'sys::Version?',List.make(Param.type$,[new Param('version','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('major',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('build',8192,'sys::Int?',List.make(Param.type$,[]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('obj','sys::Obj?',false)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',40966,'sys::Version?',List.make(Param.type$,[new Param('segments','sys::Int[]',false)]),{}).am$('hash',271360,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
ArgErr.type$.am$('msg',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('cause',8192,'sys::Err?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('trace',8192,'sys::This',List.make(Param.type$,[new Param('out','sys::OutStream',true),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('traceToStr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str',true),new Param('cause','sys::Err?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
Date.type$.af$('defVal',106498,'sys::Date',{}).am$('minus',8192,'sys::Date',List.make(Param.type$,[new Param('days','sys::Duration',false)]),{}).am$('compare',271360,'sys::Int',List.make(Param.type$,[new Param('obj','sys::Obj',false)]),{}).am$('firstOfMonth',8192,'sys::Date',List.make(Param.type$,[]),{}).am$('weekOfYear',8192,'sys::Int',List.make(Param.type$,[new Param('startOfWeek','sys::Weekday',true)]),{}).am$('year',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('dayOfYear',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('fromLocale',40962,'sys::Date?',List.make(Param.type$,[new Param('str','sys::Str',false),new Param('pattern','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('weekday',8192,'sys::Weekday',List.make(Param.type$,[]),{}).am$('isToday',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('yesterday',40962,'sys::Date',List.make(Param.type$,[new Param('tz','sys::TimeZone',true)]),{}).am$('privateMake',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('lastOfMonth',8192,'sys::Date',List.make(Param.type$,[]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('today',40962,'sys::Date',List.make(Param.type$,[new Param('tz','sys::TimeZone',true)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toIso',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',40966,'sys::Date?',List.make(Param.type$,[new Param('year','sys::Int',false),new Param('month','sys::Month',false),new Param('day','sys::Int',false)]),{}).am$('day',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('toDateTime',8192,'sys::DateTime',List.make(Param.type$,[new Param('t','sys::Time',false),new Param('tz','sys::TimeZone',true)]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('toLocale',8192,'sys::Str',List.make(Param.type$,[new Param('pattern','sys::Str?',true),new Param('locale','sys::Locale',true)]),{}).am$('midnight',8192,'sys::DateTime',List.make(Param.type$,[new Param('tz','sys::TimeZone',true)]),{}).am$('toCode',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('tomorrow',40962,'sys::Date',List.make(Param.type$,[new Param('tz','sys::TimeZone',true)]),{}).am$('fromIso',40962,'sys::Date?',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('isTomorrow',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('plus',8192,'sys::Date',List.make(Param.type$,[new Param('days','sys::Duration',false)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('fromStr',40966,'sys::Date?',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('month',8192,'sys::Month',List.make(Param.type$,[]),{}).am$('minusDate',8192,'sys::Duration',List.make(Param.type$,[new Param('days','sys::Date',false)]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('isYesterday',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('hash',271360,'sys::Int',List.make(Param.type$,[]),{});
Enum.type$.am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',271360,'sys::Int',List.make(Param.type$,[new Param('obj','sys::Obj',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('doFromStr',36866,'sys::Enum?',List.make(Param.type$,[new Param('t','sys::Type',false),new Param('name','sys::Str',false),new Param('checked','sys::Bool',false)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('obj','sys::Obj?',false)]),{}).am$('name',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',4100,'sys::Void',List.make(Param.type$,[new Param('ordinal','sys::Int',false),new Param('name','sys::Str',false)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('ordinal',8192,'sys::Int',List.make(Param.type$,[]),{});
Endian.type$.af$('big',106506,'sys::Endian',{}).af$('vals',106498,'sys::Endian[]',{}).af$('little',106506,'sys::Endian',{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('static$init',165890,'sys::Void',List.make(Param.type$,[]),{}).am$('compare',271360,'sys::Int',List.make(Param.type$,[new Param('obj','sys::Obj',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('fromStr',40966,'sys::Endian?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('doFromStr',36866,'sys::Enum?',List.make(Param.type$,[new Param('t','sys::Type',false),new Param('name','sys::Str',false),new Param('checked','sys::Bool',false)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('obj','sys::Obj?',false)]),{}).am$('name',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',133124,'sys::Void',List.make(Param.type$,[new Param('$ordinal','sys::Int',false),new Param('$name','sys::Str',false)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('ordinal',8192,'sys::Int',List.make(Param.type$,[]),{});
Test.type$.am$('curTestMethod',8192,'sys::Method',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('verifyErr',8192,'sys::Void',List.make(Param.type$,[new Param('errType','sys::Type?',false),new Param('c','|sys::Test->sys::Void|',false)]),{}).am$('verifyNotEq',8192,'sys::Void',List.make(Param.type$,[new Param('a','sys::Obj?',false),new Param('b','sys::Obj?',false),new Param('msg','sys::Str?',true)]),{}).am$('verifyTrue',8192,'sys::Void',List.make(Param.type$,[new Param('cond','sys::Bool',false),new Param('msg','sys::Str?',true)]),{}).am$('verifyNull',8192,'sys::Void',List.make(Param.type$,[new Param('a','sys::Obj?',false),new Param('msg','sys::Str?',true)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('verifySame',8192,'sys::Void',List.make(Param.type$,[new Param('a','sys::Obj?',false),new Param('b','sys::Obj?',false),new Param('msg','sys::Str?',true)]),{}).am$('verifyErrMsg',8192,'sys::Void',List.make(Param.type$,[new Param('errType','sys::Type',false),new Param('errMsg','sys::Str',false),new Param('c','|sys::Test->sys::Void|',false)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('verify',8192,'sys::Void',List.make(Param.type$,[new Param('cond','sys::Bool',false),new Param('msg','sys::Str?',true)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',4100,'sys::Void',List.make(Param.type$,[]),{}).am$('teardown',270336,'sys::Void',List.make(Param.type$,[]),{}).am$('verifyFalse',8192,'sys::Void',List.make(Param.type$,[new Param('cond','sys::Bool',false),new Param('msg','sys::Str?',true)]),{}).am$('verifyNotSame',8192,'sys::Void',List.make(Param.type$,[new Param('a','sys::Obj?',false),new Param('b','sys::Obj?',false),new Param('msg','sys::Str?',true)]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('toStr',270336,'sys::Str',List.make(Param.type$,[]),{}).am$('verifyEq',8192,'sys::Void',List.make(Param.type$,[new Param('a','sys::Obj?',false),new Param('b','sys::Obj?',false),new Param('msg','sys::Str?',true)]),{}).am$('fail',8192,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('setup',270336,'sys::Void',List.make(Param.type$,[]),{}).am$('tempDir',8192,'sys::File',List.make(Param.type$,[]),{}).am$('verifyNotNull',8192,'sys::Void',List.make(Param.type$,[new Param('a','sys::Obj?',false),new Param('msg','sys::Str?',true)]),{}).am$('verifyType',8192,'sys::Void',List.make(Param.type$,[new Param('obj','sys::Obj',false),new Param('t','sys::Type',false)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{});
TestErr.type$.am$('msg',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('cause',8192,'sys::Err?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('trace',8192,'sys::This',List.make(Param.type$,[new Param('out','sys::OutStream',true),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('traceToStr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str?',true),new Param('cause','sys::Err?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
NameErr.type$.am$('msg',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('cause',8192,'sys::Err?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('trace',8192,'sys::This',List.make(Param.type$,[new Param('out','sys::OutStream',true),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('traceToStr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str',true),new Param('cause','sys::Err?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
Duration.type$.af$('maxVal',106498,'sys::Duration',{}).af$('minVal',106498,'sys::Duration',{}).af$('defVal',106498,'sys::Duration',{}).am$('toSec',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('minus',8192,'sys::Duration',List.make(Param.type$,[new Param('b','sys::Duration',false)]),{}).am$('toMin',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('compare',271360,'sys::Int',List.make(Param.type$,[new Param('obj','sys::Obj',false)]),{}).am$('mult',8192,'sys::Duration',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('divFloat',8192,'sys::Duration',List.make(Param.type$,[new Param('b','sys::Float',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('toHour',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('privateMake',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('div',8192,'sys::Duration',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('min',8192,'sys::Duration',List.make(Param.type$,[new Param('that','sys::Duration',false)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('now',40962,'sys::Duration',List.make(Param.type$,[]),{}).am$('toMillis',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('boot',40962,'sys::Duration',List.make(Param.type$,[]),{}).am$('floor',8192,'sys::Duration',List.make(Param.type$,[new Param('accuracy','sys::Duration',false)]),{}).am$('toIso',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',40966,'sys::Duration?',List.make(Param.type$,[new Param('ticks','sys::Int',false)]),{}).am$('clamp',8192,'sys::Duration',List.make(Param.type$,[new Param('min','sys::Duration',false),new Param('max','sys::Duration',false)]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('multFloat',8192,'sys::Duration',List.make(Param.type$,[new Param('b','sys::Float',false)]),{}).am$('toLocale',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('ticks',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('max',8192,'sys::Duration',List.make(Param.type$,[new Param('that','sys::Duration',false)]),{}).am$('toCode',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('fromIso',40962,'sys::Duration',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('plus',8192,'sys::Duration',List.make(Param.type$,[new Param('b','sys::Duration',false)]),{}).am$('uptime',40962,'sys::Duration',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('abs',8192,'sys::Duration',List.make(Param.type$,[]),{}).am$('fromStr',40966,'sys::Duration?',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('nowTicks',40962,'sys::Int',List.make(Param.type$,[]),{}).am$('negate',8192,'sys::Duration',List.make(Param.type$,[]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('obj','sys::Obj?',false)]),{}).am$('toDay',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('hash',271360,'sys::Int',List.make(Param.type$,[]),{});
Decimal.type$.af$('defVal',106498,'sys::Decimal',{}).am$('minus',8192,'sys::Decimal',List.make(Param.type$,[new Param('b','sys::Decimal',false)]),{}).am$('compare',271360,'sys::Int',List.make(Param.type$,[new Param('obj','sys::Obj',false)]),{}).am$('mult',8192,'sys::Decimal',List.make(Param.type$,[new Param('b','sys::Decimal',false)]),{}).am$('mod',8192,'sys::Decimal',List.make(Param.type$,[new Param('b','sys::Decimal',false)]),{}).am$('localePercent',40962,'sys::Str',List.make(Param.type$,[]),{}).am$('modInt',8192,'sys::Decimal',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('divFloat',8192,'sys::Decimal',List.make(Param.type$,[new Param('b','sys::Float',false)]),{}).am$('increment',8192,'sys::Decimal',List.make(Param.type$,[]),{}).am$('multInt',8192,'sys::Decimal',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('privateMake',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('div',8192,'sys::Decimal',List.make(Param.type$,[new Param('b','sys::Decimal',false)]),{}).am$('plusFloat',8192,'sys::Decimal',List.make(Param.type$,[new Param('b','sys::Float',false)]),{}).am$('min',8192,'sys::Decimal',List.make(Param.type$,[new Param('that','sys::Decimal',false)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('minusFloat',8192,'sys::Decimal',List.make(Param.type$,[new Param('b','sys::Float',false)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toDecimal',8192,'sys::Decimal',List.make(Param.type$,[]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('plusInt',8192,'sys::Decimal',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('modFloat',8192,'sys::Decimal',List.make(Param.type$,[new Param('b','sys::Float',false)]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('multFloat',8192,'sys::Decimal',List.make(Param.type$,[new Param('b','sys::Float',false)]),{}).am$('toLocale',8192,'sys::Str',List.make(Param.type$,[new Param('pattern','sys::Str?',true),new Param('locale','sys::Locale',true)]),{}).am$('toInt',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('max',8192,'sys::Decimal',List.make(Param.type$,[new Param('that','sys::Decimal',false)]),{}).am$('toCode',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toFloat',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('plus',8192,'sys::Decimal',List.make(Param.type$,[new Param('b','sys::Decimal',false)]),{}).am$('localeNaN',40962,'sys::Str',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('abs',8192,'sys::Decimal',List.make(Param.type$,[]),{}).am$('localeMinus',40962,'sys::Str',List.make(Param.type$,[]),{}).am$('fromStr',40966,'sys::Decimal?',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('negate',8192,'sys::Decimal',List.make(Param.type$,[]),{}).am$('decrement',8192,'sys::Decimal',List.make(Param.type$,[]),{}).am$('minusInt',8192,'sys::Decimal',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('localeNegInf',40962,'sys::Str',List.make(Param.type$,[]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('obj','sys::Obj?',false)]),{}).am$('localeDecimal',40962,'sys::Str',List.make(Param.type$,[]),{}).am$('divInt',8192,'sys::Decimal',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('localeGrouping',40962,'sys::Str',List.make(Param.type$,[]),{}).am$('hash',271360,'sys::Int',List.make(Param.type$,[]),{}).am$('localePosInf',40962,'sys::Str',List.make(Param.type$,[]),{});
TimeoutErr.type$.am$('msg',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('cause',8192,'sys::Err?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('trace',8192,'sys::This',List.make(Param.type$,[new Param('out','sys::OutStream',true),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('traceToStr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str',true),new Param('cause','sys::Err?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
IOErr.type$.am$('msg',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('cause',8192,'sys::Err?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('trace',8192,'sys::This',List.make(Param.type$,[new Param('out','sys::OutStream',true),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('traceToStr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str',true),new Param('cause','sys::Err?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
Locale.type$.af$('en',106498,'sys::Locale',{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('cur',40962,'sys::Locale',List.make(Param.type$,[]),{}).am$('country',8192,'sys::Str?',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('use',8192,'sys::This',List.make(Param.type$,[new Param('func','|sys::This->sys::Void|',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('privateMake',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('fromStr',40966,'sys::Locale?',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('obj','sys::Obj?',false)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('setCur',40962,'sys::Void',List.make(Param.type$,[new Param('locale','sys::Locale',false)]),{}).am$('lang',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('hash',271360,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
UnresolvedErr.type$.am$('msg',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('cause',8192,'sys::Err?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('trace',8192,'sys::This',List.make(Param.type$,[new Param('out','sys::OutStream',true),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('traceToStr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str',true),new Param('cause','sys::Err?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
This.type$.am$('toStr',270336,'sys::Str',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
UnknownSlotErr.type$.am$('msg',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('cause',8192,'sys::Err?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('trace',8192,'sys::This',List.make(Param.type$,[new Param('out','sys::OutStream',true),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('traceToStr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str',true),new Param('cause','sys::Err?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
StrBuf.type$.af$('capacity',73728,'sys::Int',{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('insert',8192,'sys::This',List.make(Param.type$,[new Param('index','sys::Int',false),new Param('x','sys::Obj?',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('remove',8192,'sys::This',List.make(Param.type$,[new Param('index','sys::Int',false)]),{}).am$('out',8192,'sys::OutStream',List.make(Param.type$,[]),{}).am$('addChar',8192,'sys::This',List.make(Param.type$,[new Param('ch','sys::Int',false)]),{}).am$('replaceRange',8192,'sys::This',List.make(Param.type$,[new Param('r','sys::Range',false),new Param('str','sys::Str',false)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('getRange',8192,'sys::Str',List.make(Param.type$,[new Param('range','sys::Range',false)]),{}).am$('get',8192,'sys::Int',List.make(Param.type$,[new Param('index','sys::Int',false)]),{}).am$('removeRange',8192,'sys::This',List.make(Param.type$,[new Param('r','sys::Range',false)]),{}).am$('join',8192,'sys::This',List.make(Param.type$,[new Param('x','sys::Obj?',false),new Param('sep','sys::Str',true)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('capacity','sys::Int',true)]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('add',8192,'sys::This',List.make(Param.type$,[new Param('x','sys::Obj?',false)]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('set',8192,'sys::This',List.make(Param.type$,[new Param('index','sys::Int',false),new Param('ch','sys::Int',false)]),{}).am$('isEmpty',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('clear',8192,'sys::This',List.make(Param.type$,[]),{}).am$('reverse',8192,'sys::This',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('size',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{});
ReadonlyErr.type$.am$('msg',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('cause',8192,'sys::Err?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('trace',8192,'sys::This',List.make(Param.type$,[new Param('out','sys::OutStream',true),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('traceToStr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str',true),new Param('cause','sys::Err?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
LogRec.type$.af$('msg',73730,'sys::Str',{}).af$('err',73730,'sys::Err?',{}).af$('level',73730,'sys::LogLevel',{}).af$('logName',73730,'sys::Str',{}).af$('time',73730,'sys::DateTime',{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('print',8192,'sys::Void',List.make(Param.type$,[new Param('out','sys::OutStream',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('time','sys::DateTime',false),new Param('level','sys::LogLevel',false),new Param('logName','sys::Str',false),new Param('message','sys::Str',false),new Param('err','sys::Err?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
Func.type$.am$('toStr',270336,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('retype',8192,'sys::Func',List.make(Param.type$,[new Param('t','sys::Type',false)]),{}).am$('method',8192,'sys::Method?',List.make(Param.type$,[]),{}).am$('callOn',270336,'sys::R',List.make(Param.type$,[new Param('target','sys::Obj?',false),new Param('args','sys::Obj?[]?',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('params',8192,'sys::Param[]',List.make(Param.type$,[]),{}).am$('callList',270336,'sys::R',List.make(Param.type$,[new Param('args','sys::Obj?[]?',false)]),{}).am$('call',270336,'sys::R',List.make(Param.type$,[new Param('a','sys::A',true),new Param('b','sys::B',true),new Param('c','sys::C',true),new Param('d','sys::D',true),new Param('e','sys::E',true),new Param('f','sys::F',true),new Param('g','sys::G',true),new Param('h','sys::H',true)]),{}).am$('arity',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('bind',8192,'sys::Func',List.make(Param.type$,[new Param('args','sys::Obj?[]',false)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('returns',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
Range.type$.am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('toList',8192,'sys::Int[]',List.make(Param.type$,[]),{}).am$('random',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('min',8192,'sys::Int?',List.make(Param.type$,[]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('exclusive',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('end',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('start','sys::Int',false),new Param('end','sys::Int',false),new Param('exclusive','sys::Bool',false)]),{}).am$('map',8192,'sys::Obj?[]',List.make(Param.type$,[new Param('c','|sys::Int->sys::Obj?|',false)]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('inclusive',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('last',8192,'sys::Int?',List.make(Param.type$,[]),{}).am$('offset',8192,'sys::Range',List.make(Param.type$,[new Param('offset','sys::Int',false)]),{}).am$('max',8192,'sys::Int?',List.make(Param.type$,[]),{}).am$('start',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('isEmpty',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('each',8192,'sys::Void',List.make(Param.type$,[new Param('c','|sys::Int->sys::Void|',false)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('contains',8192,'sys::Bool',List.make(Param.type$,[new Param('i','sys::Int',false)]),{}).am$('makeExclusive',8196,'sys::Void',List.make(Param.type$,[new Param('start','sys::Int',false),new Param('end','sys::Int',false)]),{}).am$('fromStr',40966,'sys::Range?',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('makeInclusive',8196,'sys::Void',List.make(Param.type$,[new Param('start','sys::Int',false),new Param('end','sys::Int',false)]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('obj','sys::Obj?',false)]),{}).am$('eachWhile',8192,'sys::Obj?',List.make(Param.type$,[new Param('c','|sys::Int->sys::Obj?|',false)]),{}).am$('hash',271360,'sys::Int',List.make(Param.type$,[]),{}).am$('first',8192,'sys::Int?',List.make(Param.type$,[]),{});
IndexErr.type$.am$('msg',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('cause',8192,'sys::Err?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('trace',8192,'sys::This',List.make(Param.type$,[new Param('out','sys::OutStream',true),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('traceToStr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str',true),new Param('cause','sys::Err?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
Log.type$.af$('level',73728,'sys::LogLevel',{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('log',270336,'sys::Void',List.make(Param.type$,[new Param('rec','sys::LogRec',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('isDebug',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('find',40962,'sys::Log?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('get',40962,'sys::Log',List.make(Param.type$,[new Param('name','sys::Str',false)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('isInfo',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('register','sys::Bool',false)]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('info',8192,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str',false),new Param('err','sys::Err?',true)]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('addHandler',40962,'sys::Void',List.make(Param.type$,[new Param('handler','|sys::LogRec->sys::Void|',false)]),{}).am$('debug',8192,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str',false),new Param('err','sys::Err?',true)]),{}).am$('err',8192,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str',false),new Param('err','sys::Err?',true)]),{}).am$('isErr',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('removeHandler',40962,'sys::Void',List.make(Param.type$,[new Param('handler','|sys::LogRec->sys::Void|',false)]),{}).am$('list',40962,'sys::Log[]',List.make(Param.type$,[]),{}).am$('warn',8192,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str',false),new Param('err','sys::Err?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('handlers',40962,'|sys::LogRec->sys::Void|[]',List.make(Param.type$,[]),{}).am$('isEnabled',8192,'sys::Bool',List.make(Param.type$,[new Param('level','sys::LogLevel',false)]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('name',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('isWarn',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{});
Weekday.type$.af$('thu',106506,'sys::Weekday',{}).af$('tue',106506,'sys::Weekday',{}).af$('vals',106498,'sys::Weekday[]',{}).af$('sun',106506,'sys::Weekday',{}).af$('mon',106506,'sys::Weekday',{}).af$('wed',106506,'sys::Weekday',{}).af$('fri',106506,'sys::Weekday',{}).af$('sat',106506,'sys::Weekday',{}).am$('localeStartOfWeek',40962,'sys::Weekday',List.make(Param.type$,[]),{}).am$('static$init',165890,'sys::Void',List.make(Param.type$,[]),{}).am$('compare',271360,'sys::Int',List.make(Param.type$,[new Param('obj','sys::Obj',false)]),{}).am$('increment',8192,'sys::Weekday',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('localeVals',40962,'sys::Weekday[]',List.make(Param.type$,[]),{}).am$('localeAbbr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',133124,'sys::Void',List.make(Param.type$,[new Param('$ordinal','sys::Int',false),new Param('$name','sys::Str',false)]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('toLocale',8192,'sys::Str',List.make(Param.type$,[new Param('pattern','sys::Str?',true),new Param('locale','sys::Locale',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('fromStr',40966,'sys::Weekday?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('doFromStr',36866,'sys::Enum?',List.make(Param.type$,[new Param('t','sys::Type',false),new Param('name','sys::Str',false),new Param('checked','sys::Bool',false)]),{}).am$('decrement',8192,'sys::Weekday',List.make(Param.type$,[]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('obj','sys::Obj?',false)]),{}).am$('name',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('localeFull',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('ordinal',8192,'sys::Int',List.make(Param.type$,[]),{});
Buf.type$.af$('endian',73728,'sys::Endian',{}).af$('size',73728,'sys::Int',{}).af$('charset',73728,'sys::Charset',{}).af$('capacity',73728,'sys::Int',{}).am$('readF4',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('readDecimal',8192,'sys::Decimal',List.make(Param.type$,[]),{}).am$('readAllStr',8192,'sys::Str',List.make(Param.type$,[new Param('normalizeNewlines','sys::Bool',true)]),{}).am$('fromHex',40962,'sys::Buf',List.make(Param.type$,[new Param('s','sys::Str',false)]),{}).am$('readBufFully',8192,'sys::Buf',List.make(Param.type$,[new Param('buf','sys::Buf?',false),new Param('n','sys::Int',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('fromBase64',40962,'sys::Buf',List.make(Param.type$,[new Param('s','sys::Str',false)]),{}).am$('readF8',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('writeProps',8192,'sys::This',List.make(Param.type$,[new Param('props','[sys::Str:sys::Str]',false)]),{}).am$('readS2',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('readS1',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('readS4',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('trim',8192,'sys::This',List.make(Param.type$,[]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('getRange',8192,'sys::Buf',List.make(Param.type$,[new Param('range','sys::Range',false)]),{}).am$('readBuf',8192,'sys::Int?',List.make(Param.type$,[new Param('buf','sys::Buf',false),new Param('n','sys::Int',false)]),{}).am$('bytesEqual',8192,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Buf',false)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('write',8192,'sys::This',List.make(Param.type$,[new Param('byte','sys::Int',false)]),{}).am$('readS8',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('unreadChar',8192,'sys::This',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('writeI4',8192,'sys::This',List.make(Param.type$,[new Param('n','sys::Int',false)]),{}).am$('printLine',8192,'sys::This',List.make(Param.type$,[new Param('obj','sys::Obj?',true)]),{}).am$('toBase64',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('writeI2',8192,'sys::This',List.make(Param.type$,[new Param('n','sys::Int',false)]),{}).am$('read',8192,'sys::Int?',List.make(Param.type$,[]),{}).am$('writeI8',8192,'sys::This',List.make(Param.type$,[new Param('n','sys::Int',false)]),{}).am$('in',8192,'sys::InStream',List.make(Param.type$,[]),{}).am$('toBase64Uri',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('fill',8192,'sys::This',List.make(Param.type$,[new Param('byte','sys::Int',false),new Param('times','sys::Int',false)]),{}).am$('sync',8192,'sys::This',List.make(Param.type$,[]),{}).am$('remaining',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('readProps',8192,'[sys::Str:sys::Str]',List.make(Param.type$,[]),{}).am$('toHex',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('writeUtf',8192,'sys::This',List.make(Param.type$,[new Param('s','sys::Str',false)]),{}).am$('toFile',8192,'sys::File',List.make(Param.type$,[new Param('uri','sys::Uri',false)]),{}).am$('pbk',40962,'sys::Buf',List.make(Param.type$,[new Param('algorithm','sys::Str',false),new Param('password','sys::Str',false),new Param('salt','sys::Buf',false),new Param('iterations','sys::Int',false),new Param('keyLen','sys::Int',false)]),{}).am$('writeChars',8192,'sys::This',List.make(Param.type$,[new Param('str','sys::Str',false),new Param('off','sys::Int',true),new Param('len','sys::Int',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('toDigest',8192,'sys::Buf',List.make(Param.type$,[new Param('algorithm','sys::Str',false)]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('unread',8192,'sys::This',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('writeF4',8192,'sys::This',List.make(Param.type$,[new Param('r','sys::Float',false)]),{}).am$('writeXml',8192,'sys::This',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('flags','sys::Int',true)]),{}).am$('readAllLines',8192,'sys::Str[]',List.make(Param.type$,[]),{}).am$('readAllBuf',8192,'sys::Buf',List.make(Param.type$,[]),{}).am$('seek',8192,'sys::This',List.make(Param.type$,[new Param('pos','sys::Int',false)]),{}).am$('writeBool',8192,'sys::This',List.make(Param.type$,[new Param('b','sys::Bool',false)]),{}).am$('readChar',8192,'sys::Int?',List.make(Param.type$,[]),{}).am$('out',8192,'sys::OutStream',List.make(Param.type$,[]),{}).am$('readU4',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('random',40962,'sys::Buf',List.make(Param.type$,[new Param('size','sys::Int',false)]),{}).am$('flush',8192,'sys::This',List.make(Param.type$,[]),{}).am$('readUtf',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('pos',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('crc',8192,'sys::Int',List.make(Param.type$,[new Param('algorithm','sys::Str',false)]),{}).am$('readU2',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('get',8192,'sys::Int',List.make(Param.type$,[new Param('index','sys::Int',false)]),{}).am$('readU1',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('hmac',8192,'sys::Buf',List.make(Param.type$,[new Param('algorithm','sys::Str',false),new Param('key','sys::Buf',false)]),{}).am$('writeF8',8192,'sys::This',List.make(Param.type$,[new Param('r','sys::Float',false)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',40966,'sys::Buf?',List.make(Param.type$,[new Param('capacity','sys::Int',true)]),{}).am$('flip',8192,'sys::This',List.make(Param.type$,[]),{}).am$('close',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('readBool',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('set',8192,'sys::This',List.make(Param.type$,[new Param('index','sys::Int',false),new Param('byte','sys::Int',false)]),{}).am$('writeBuf',8192,'sys::This',List.make(Param.type$,[new Param('buf','sys::Buf',false),new Param('n','sys::Int',true)]),{}).am$('readObj',8192,'sys::Obj?',List.make(Param.type$,[new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('more',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('peekChar',8192,'sys::Int?',List.make(Param.type$,[]),{}).am$('isEmpty',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('clear',8192,'sys::This',List.make(Param.type$,[]),{}).am$('writeObj',8192,'sys::This',List.make(Param.type$,[new Param('obj','sys::Obj?',false),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('readStrToken',8192,'sys::Str?',List.make(Param.type$,[new Param('max','sys::Int?',true),new Param('c','|sys::Int->sys::Bool|?',true)]),{}).am$('readLine',8192,'sys::Str?',List.make(Param.type$,[new Param('max','sys::Int?',true)]),{}).am$('peek',8192,'sys::Int?',List.make(Param.type$,[]),{}).am$('writeChar',8192,'sys::This',List.make(Param.type$,[new Param('char','sys::Int',false)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('print',8192,'sys::This',List.make(Param.type$,[new Param('s','sys::Obj?',false)]),{}).am$('internalMake',132,'sys::Void',List.make(Param.type$,[]),{}).am$('readChars',8192,'sys::Str',List.make(Param.type$,[new Param('n','sys::Int',false)]),{}).am$('eachLine',8192,'sys::Void',List.make(Param.type$,[new Param('f','|sys::Str->sys::Void|',false)]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('writeDecimal',8192,'sys::This',List.make(Param.type$,[new Param('d','sys::Decimal',false)]),{}).am$('dup',8192,'sys::Buf',List.make(Param.type$,[]),{});
ConstBuf.type$.af$('endian',73728,'sys::Endian',{}).af$('size',73728,'sys::Int',{}).af$('charset',73728,'sys::Charset',{}).af$('capacity',73728,'sys::Int',{}).am$('readF4',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('readDecimal',8192,'sys::Decimal',List.make(Param.type$,[]),{}).am$('readAllStr',8192,'sys::Str',List.make(Param.type$,[new Param('normalizeNewlines','sys::Bool',true)]),{}).am$('fromHex',40962,'sys::Buf',List.make(Param.type$,[new Param('s','sys::Str',false)]),{}).am$('readBufFully',8192,'sys::Buf',List.make(Param.type$,[new Param('buf','sys::Buf?',false),new Param('n','sys::Int',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('fromBase64',40962,'sys::Buf',List.make(Param.type$,[new Param('s','sys::Str',false)]),{}).am$('readF8',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('writeProps',8192,'sys::This',List.make(Param.type$,[new Param('props','[sys::Str:sys::Str]',false)]),{}).am$('readS2',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('readS1',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('readS4',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('trim',8192,'sys::This',List.make(Param.type$,[]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('getRange',8192,'sys::Buf',List.make(Param.type$,[new Param('range','sys::Range',false)]),{}).am$('readBuf',8192,'sys::Int?',List.make(Param.type$,[new Param('buf','sys::Buf',false),new Param('n','sys::Int',false)]),{}).am$('bytesEqual',8192,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Buf',false)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('write',8192,'sys::This',List.make(Param.type$,[new Param('byte','sys::Int',false)]),{}).am$('readS8',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('unreadChar',8192,'sys::This',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('init',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('writeI4',8192,'sys::This',List.make(Param.type$,[new Param('n','sys::Int',false)]),{}).am$('printLine',8192,'sys::This',List.make(Param.type$,[new Param('obj','sys::Obj?',true)]),{}).am$('toBase64',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('writeI2',8192,'sys::This',List.make(Param.type$,[new Param('n','sys::Int',false)]),{}).am$('read',8192,'sys::Int?',List.make(Param.type$,[]),{}).am$('writeI8',8192,'sys::This',List.make(Param.type$,[new Param('n','sys::Int',false)]),{}).am$('in',8192,'sys::InStream',List.make(Param.type$,[]),{}).am$('toBase64Uri',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('fill',8192,'sys::This',List.make(Param.type$,[new Param('byte','sys::Int',false),new Param('times','sys::Int',false)]),{}).am$('sync',8192,'sys::This',List.make(Param.type$,[]),{}).am$('remaining',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('readProps',8192,'[sys::Str:sys::Str]',List.make(Param.type$,[]),{}).am$('toHex',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('writeUtf',8192,'sys::This',List.make(Param.type$,[new Param('s','sys::Str',false)]),{}).am$('toFile',8192,'sys::File',List.make(Param.type$,[new Param('uri','sys::Uri',false)]),{}).am$('pbk',40962,'sys::Buf',List.make(Param.type$,[new Param('algorithm','sys::Str',false),new Param('password','sys::Str',false),new Param('salt','sys::Buf',false),new Param('iterations','sys::Int',false),new Param('keyLen','sys::Int',false)]),{}).am$('writeChars',8192,'sys::This',List.make(Param.type$,[new Param('str','sys::Str',false),new Param('off','sys::Int',true),new Param('len','sys::Int',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('toDigest',8192,'sys::Buf',List.make(Param.type$,[new Param('algorithm','sys::Str',false)]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('unread',8192,'sys::This',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('writeF4',8192,'sys::This',List.make(Param.type$,[new Param('r','sys::Float',false)]),{}).am$('writeXml',8192,'sys::This',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('flags','sys::Int',true)]),{}).am$('readAllLines',8192,'sys::Str[]',List.make(Param.type$,[]),{}).am$('readAllBuf',8192,'sys::Buf',List.make(Param.type$,[]),{}).am$('seek',8192,'sys::This',List.make(Param.type$,[new Param('pos','sys::Int',false)]),{}).am$('writeBool',8192,'sys::This',List.make(Param.type$,[new Param('b','sys::Bool',false)]),{}).am$('readChar',8192,'sys::Int?',List.make(Param.type$,[]),{}).am$('out',8192,'sys::OutStream',List.make(Param.type$,[]),{}).am$('readU4',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('random',40962,'sys::Buf',List.make(Param.type$,[new Param('size','sys::Int',false)]),{}).am$('flush',8192,'sys::This',List.make(Param.type$,[]),{}).am$('readUtf',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('pos',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('crc',8192,'sys::Int',List.make(Param.type$,[new Param('algorithm','sys::Str',false)]),{}).am$('readU2',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('get',8192,'sys::Int',List.make(Param.type$,[new Param('index','sys::Int',false)]),{}).am$('readU1',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('hmac',8192,'sys::Buf',List.make(Param.type$,[new Param('algorithm','sys::Str',false),new Param('key','sys::Buf',false)]),{}).am$('writeF8',8192,'sys::This',List.make(Param.type$,[new Param('r','sys::Float',false)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('flip',8192,'sys::This',List.make(Param.type$,[]),{}).am$('close',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('readBool',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('set',8192,'sys::This',List.make(Param.type$,[new Param('index','sys::Int',false),new Param('byte','sys::Int',false)]),{}).am$('writeBuf',8192,'sys::This',List.make(Param.type$,[new Param('buf','sys::Buf',false),new Param('n','sys::Int',true)]),{}).am$('readObj',8192,'sys::Obj?',List.make(Param.type$,[new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('more',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('peekChar',8192,'sys::Int?',List.make(Param.type$,[]),{}).am$('isEmpty',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('clear',8192,'sys::This',List.make(Param.type$,[]),{}).am$('writeObj',8192,'sys::This',List.make(Param.type$,[new Param('obj','sys::Obj?',false),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('readStrToken',8192,'sys::Str?',List.make(Param.type$,[new Param('max','sys::Int?',true),new Param('c','|sys::Int->sys::Bool|?',true)]),{}).am$('readLine',8192,'sys::Str?',List.make(Param.type$,[new Param('max','sys::Int?',true)]),{}).am$('peek',8192,'sys::Int?',List.make(Param.type$,[]),{}).am$('writeChar',8192,'sys::This',List.make(Param.type$,[new Param('char','sys::Int',false)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('print',8192,'sys::This',List.make(Param.type$,[new Param('s','sys::Obj?',false)]),{}).am$('readChars',8192,'sys::Str',List.make(Param.type$,[new Param('n','sys::Int',false)]),{}).am$('eachLine',8192,'sys::Void',List.make(Param.type$,[new Param('f','|sys::Str->sys::Void|',false)]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('writeDecimal',8192,'sys::This',List.make(Param.type$,[new Param('d','sys::Decimal',false)]),{}).am$('dup',8192,'sys::Buf',List.make(Param.type$,[]),{});
Charset.type$.am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('utf8',40962,'sys::Charset',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('privateMake',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('utf16BE',40962,'sys::Charset',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('fromStr',40966,'sys::Charset?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('obj','sys::Obj?',false)]),{}).am$('name',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('utf16LE',40962,'sys::Charset',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('hash',271360,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('defVal',40962,'sys::Charset',List.make(Param.type$,[]),{});
Zip.type$.am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('gzipOutStream',40962,'sys::OutStream',List.make(Param.type$,[new Param('out','sys::OutStream',false)]),{}).am$('unzipInto',40962,'sys::Int',List.make(Param.type$,[new Param('zip','sys::File',false),new Param('dir','sys::File',false)]),{}).am$('file',8192,'sys::File?',List.make(Param.type$,[]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('writeNext',8192,'sys::OutStream',List.make(Param.type$,[new Param('path','sys::Uri',false),new Param('modifyTime','sys::DateTime',true),new Param('opts','[sys::Str:sys::Obj?]?',true)]),{}).am$('finish',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('gzipInStream',40962,'sys::InStream',List.make(Param.type$,[new Param('in','sys::InStream',false)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('write',40962,'sys::Zip',List.make(Param.type$,[new Param('out','sys::OutStream',false)]),{}).am$('close',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('init',2052,'sys::Void',List.make(Param.type$,[new Param('uri','sys::Uri',false)]),{}).am$('read',40962,'sys::Zip',List.make(Param.type$,[new Param('in','sys::InStream',false)]),{}).am$('deflateOutStream',40962,'sys::OutStream',List.make(Param.type$,[new Param('out','sys::OutStream',false),new Param('opts','[sys::Str:sys::Obj?]?',true)]),{}).am$('readNext',8192,'sys::File?',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('readEach',8192,'sys::Void',List.make(Param.type$,[new Param('c','|sys::File->sys::Void|',false)]),{}).am$('contents',8192,'[sys::Uri:sys::File]?',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('deflateInStream',40962,'sys::InStream',List.make(Param.type$,[new Param('in','sys::InStream',false),new Param('opts','[sys::Str:sys::Obj?]?',true)]),{}).am$('open',40962,'sys::Zip',List.make(Param.type$,[new Param('file','sys::File',false)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{});
Depend.type$.am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('isPlus',8192,'sys::Bool',List.make(Param.type$,[new Param('index','sys::Int',true)]),{}).am$('match',8192,'sys::Bool',List.make(Param.type$,[new Param('version','sys::Version',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('version',8192,'sys::Version',List.make(Param.type$,[new Param('index','sys::Int',true)]),{}).am$('isRange',8192,'sys::Bool',List.make(Param.type$,[new Param('index','sys::Int',true)]),{}).am$('privateMake',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('fromStr',40966,'sys::Depend?',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('size',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('name',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('isSimple',8192,'sys::Bool',List.make(Param.type$,[new Param('index','sys::Int',true)]),{}).am$('endVersion',8192,'sys::Version',List.make(Param.type$,[new Param('index','sys::Int',true)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('hash',271360,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
Str.type$.af$('defVal',106498,'sys::Str',{}).am$('mult',8192,'sys::Str',List.make(Param.type$,[new Param('times','sys::Int',false)]),{}).am$('getSafe',8192,'sys::Int',List.make(Param.type$,[new Param('index','sys::Int',false),new Param('def','sys::Int',true)]),{}).am$('upper',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('replace',8192,'sys::Str',List.make(Param.type$,[new Param('from','sys::Str',false),new Param('to','sys::Str',false)]),{}).am$('indexr',8192,'sys::Int?',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('offset','sys::Int',true)]),{}).am$('toDisplayName',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('localeDecapitalize',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('justr',8192,'sys::Str',List.make(Param.type$,[new Param('width','sys::Int',false)]),{}).am$('toXml',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('padr',8192,'sys::Str',List.make(Param.type$,[new Param('width','sys::Int',false),new Param('char','sys::Int',true)]),{}).am$('justl',8192,'sys::Str',List.make(Param.type$,[new Param('width','sys::Int',false)]),{}).am$('trimEnd',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('localeCompare',8192,'sys::Int',List.make(Param.type$,[new Param('s','sys::Str',false)]),{}).am$('padl',8192,'sys::Str',List.make(Param.type$,[new Param('width','sys::Int',false),new Param('char','sys::Int',true)]),{}).am$('isSpace',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('privateMake',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('localeUpper',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('split',8192,'sys::Str[]',List.make(Param.type$,[new Param('separator','sys::Int?',true),new Param('trim','sys::Bool',true)]),{}).am$('trim',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('getRange',8192,'sys::Str',List.make(Param.type$,[new Param('range','sys::Range',false)]),{}).am$('isUpper',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('numNewlines',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('equalsIgnoreCase',8192,'sys::Bool',List.make(Param.type$,[new Param('s','sys::Str',false)]),{}).am$('toDecimal',8192,'sys::Decimal?',List.make(Param.type$,[new Param('checked','sys::Bool',true)]),{}).am$('indexIgnoreCase',8192,'sys::Int?',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('offset','sys::Int',true)]),{}).am$('trimStart',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('all',8192,'sys::Bool',List.make(Param.type$,[new Param('c','|sys::Int,sys::Int->sys::Bool|',false)]),{}).am$('isAlphaNum',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('in',8192,'sys::InStream',List.make(Param.type$,[]),{}).am$('isAlpha',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('toCode',8192,'sys::Str',List.make(Param.type$,[new Param('quote','sys::Int?',true),new Param('escapeUnicode','sys::Bool',true)]),{}).am$('lower',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('index',8192,'sys::Int?',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('offset','sys::Int',true)]),{}).am$('splitLines',8192,'sys::Str[]',List.make(Param.type$,[]),{}).am$('toBool',8192,'sys::Bool?',List.make(Param.type$,[new Param('checked','sys::Bool',true)]),{}).am$('eachr',8192,'sys::Void',List.make(Param.type$,[new Param('c','|sys::Int,sys::Int->sys::Void|',false)]),{}).am$('plus',8192,'sys::Str',List.make(Param.type$,[new Param('obj','sys::Obj?',false)]),{}).am$('each',8192,'sys::Void',List.make(Param.type$,[new Param('c','|sys::Int,sys::Int->sys::Void|',false)]),{}).am$('capitalize',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('localeCapitalize',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('contains',8192,'sys::Bool',List.make(Param.type$,[new Param('s','sys::Str',false)]),{}).am$('isAscii',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('size',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('endsWith',8192,'sys::Bool',List.make(Param.type$,[new Param('s','sys::Str',false)]),{}).am$('spaces',40962,'sys::Str',List.make(Param.type$,[new Param('n','sys::Int',false)]),{}).am$('localeLower',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('hash',271360,'sys::Int',List.make(Param.type$,[]),{}).am$('compareIgnoreCase',8192,'sys::Int',List.make(Param.type$,[new Param('s','sys::Str',false)]),{}).am$('compare',271360,'sys::Int',List.make(Param.type$,[new Param('obj','sys::Obj',false)]),{}).am$('containsChar',8192,'sys::Bool',List.make(Param.type$,[new Param('ch','sys::Int',false)]),{}).am$('decapitalize',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('get',8192,'sys::Int',List.make(Param.type$,[new Param('index','sys::Int',false)]),{}).am$('fromDisplayName',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('trimToNull',8192,'sys::Str?',List.make(Param.type$,[]),{}).am$('toLocale',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toInt',8192,'sys::Int?',List.make(Param.type$,[new Param('radix','sys::Int',true),new Param('checked','sys::Bool',true)]),{}).am$('intern',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toRegex',8192,'sys::Regex',List.make(Param.type$,[]),{}).am$('toUri',8192,'sys::Uri',List.make(Param.type$,[]),{}).am$('isEmpty',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('toFloat',8192,'sys::Float?',List.make(Param.type$,[new Param('checked','sys::Bool',true)]),{}).am$('fromChars',40962,'sys::Str',List.make(Param.type$,[new Param('chars','sys::Int[]',false)]),{}).am$('reverse',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('any',8192,'sys::Bool',List.make(Param.type$,[new Param('c','|sys::Int,sys::Int->sys::Bool|',false)]),{}).am$('toBuf',8192,'sys::Buf',List.make(Param.type$,[new Param('charset','sys::Charset',true)]),{}).am$('indexrIgnoreCase',8192,'sys::Int?',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('offset','sys::Int',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('obj','sys::Obj?',false)]),{}).am$('isLower',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('eachWhile',8192,'sys::Obj?',List.make(Param.type$,[new Param('c','|sys::Int,sys::Int->sys::Obj?|',false)]),{}).am$('chars',8192,'sys::Int[]',List.make(Param.type$,[]),{}).am$('startsWith',8192,'sys::Bool',List.make(Param.type$,[new Param('s','sys::Str',false)]),{});
Bool.type$.af$('defVal',106498,'sys::Bool',{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('toLocale',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('or',8192,'sys::Bool',List.make(Param.type$,[new Param('b','sys::Bool',false)]),{}).am$('toCode',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('privateMake',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('not',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('fromStr',40966,'sys::Bool?',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('and',8192,'sys::Bool',List.make(Param.type$,[new Param('b','sys::Bool',false)]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('obj','sys::Obj?',false)]),{}).am$('xor',8192,'sys::Bool',List.make(Param.type$,[new Param('b','sys::Bool',false)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('hash',271360,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
MimeType.type$.am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('charset',8192,'sys::Charset',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('noParams',8192,'sys::MimeType',List.make(Param.type$,[]),{}).am$('forExt',40962,'sys::MimeType?',List.make(Param.type$,[new Param('ext','sys::Str',false)]),{}).am$('mediaType',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('params',8192,'[sys::Str:sys::Str]',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('fromStr',40966,'sys::MimeType?',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('subType',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('parseParams',40962,'[sys::Str:sys::Str]?',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('hash',271360,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
Regex.type$.af$('defVal',106498,'sys::Regex',{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('glob',40962,'sys::Regex',List.make(Param.type$,[new Param('pattern','sys::Str',false)]),{}).am$('flags',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('matcher',8192,'sys::RegexMatcher',List.make(Param.type$,[new Param('s','sys::Str',false)]),{}).am$('matches',8192,'sys::Bool',List.make(Param.type$,[new Param('s','sys::Str',false)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('quote',40962,'sys::Regex',List.make(Param.type$,[new Param('str','sys::Str',false)]),{}).am$('split',8192,'sys::Str[]',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('limit','sys::Int',true)]),{}).am$('fromStr',40966,'sys::Regex?',List.make(Param.type$,[new Param('pattern','sys::Str',false),new Param('flags','sys::Str',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('obj','sys::Obj?',false)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('hash',271360,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
OutStream.type$.af$('charset',73728,'sys::Charset',{}).af$('endian',73728,'sys::Endian',{}).af$('xmlEscQuotes',106498,'sys::Int',{}).af$('xmlEscUnicode',106498,'sys::Int',{}).af$('xmlEscNewlines',106498,'sys::Int',{}).am$('static$init',165890,'sys::Void',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('writeF4',8192,'sys::This',List.make(Param.type$,[new Param('r','sys::Float',false)]),{}).am$('writeXml',8192,'sys::This',List.make(Param.type$,[new Param('str','sys::Str',false),new Param('mode','sys::Int',true)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('writeBool',8192,'sys::This',List.make(Param.type$,[new Param('b','sys::Bool',false)]),{}).am$('writeProps',8192,'sys::This',List.make(Param.type$,[new Param('props','[sys::Str:sys::Str]',false),new Param('close','sys::Bool',true)]),{}).am$('flush',270336,'sys::This',List.make(Param.type$,[]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('numPendingBits',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('writeF8',8192,'sys::This',List.make(Param.type$,[new Param('r','sys::Float',false)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',4100,'sys::Void',List.make(Param.type$,[new Param('out','sys::OutStream?',false)]),{}).am$('write',270336,'sys::This',List.make(Param.type$,[new Param('byte','sys::Int',false)]),{}).am$('close',270336,'sys::Bool',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('toStr',270336,'sys::Str',List.make(Param.type$,[]),{}).am$('writeI4',8192,'sys::This',List.make(Param.type$,[new Param('n','sys::Int',false)]),{}).am$('writeBits',8192,'sys::This',List.make(Param.type$,[new Param('val','sys::Int',false),new Param('num','sys::Int',false)]),{}).am$('printLine',8192,'sys::This',List.make(Param.type$,[new Param('obj','sys::Obj?',true)]),{}).am$('writeI2',8192,'sys::This',List.make(Param.type$,[new Param('n','sys::Int',false)]),{}).am$('writeBuf',270336,'sys::This',List.make(Param.type$,[new Param('buf','sys::Buf',false),new Param('n','sys::Int',true)]),{}).am$('writeI8',8192,'sys::This',List.make(Param.type$,[new Param('n','sys::Int',false)]),{}).am$('writeObj',8192,'sys::This',List.make(Param.type$,[new Param('obj','sys::Obj?',false),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('sync',270336,'sys::This',List.make(Param.type$,[]),{}).am$('writeChar',8192,'sys::This',List.make(Param.type$,[new Param('char','sys::Int',false)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('print',8192,'sys::This',List.make(Param.type$,[new Param('s','sys::Obj?',false)]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('writeUtf',8192,'sys::This',List.make(Param.type$,[new Param('s','sys::Str',false)]),{}).am$('writeDecimal',8192,'sys::This',List.make(Param.type$,[new Param('d','sys::Decimal',false)]),{}).am$('writeChars',8192,'sys::This',List.make(Param.type$,[new Param('str','sys::Str',false),new Param('off','sys::Int',true),new Param('len','sys::Int',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{});
LogLevel.type$.af$('silent',106506,'sys::LogLevel',{}).af$('debug',106506,'sys::LogLevel',{}).af$('err',106506,'sys::LogLevel',{}).af$('vals',106498,'sys::LogLevel[]',{}).af$('warn',106506,'sys::LogLevel',{}).af$('info',106506,'sys::LogLevel',{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('static$init',165890,'sys::Void',List.make(Param.type$,[]),{}).am$('compare',271360,'sys::Int',List.make(Param.type$,[new Param('obj','sys::Obj',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('fromStr',40966,'sys::LogLevel?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('doFromStr',36866,'sys::Enum?',List.make(Param.type$,[new Param('t','sys::Type',false),new Param('name','sys::Str',false),new Param('checked','sys::Bool',false)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('obj','sys::Obj?',false)]),{}).am$('name',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',133124,'sys::Void',List.make(Param.type$,[new Param('$ordinal','sys::Int',false),new Param('$name','sys::Str',false)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('ordinal',8192,'sys::Int',List.make(Param.type$,[]),{});
Time.type$.af$('defVal',106498,'sys::Time',{}).am$('minus',8192,'sys::Time',List.make(Param.type$,[new Param('dur','sys::Duration',false)]),{}).am$('compare',271360,'sys::Int',List.make(Param.type$,[new Param('obj','sys::Obj',false)]),{}).am$('fromLocale',40962,'sys::Time?',List.make(Param.type$,[new Param('str','sys::Str',false),new Param('pattern','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('nanoSec',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('privateMake',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('sec',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('min',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('hour',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('now',40962,'sys::Time',List.make(Param.type$,[new Param('tz','sys::TimeZone',true)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toIso',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',40966,'sys::Time?',List.make(Param.type$,[new Param('hour','sys::Int',false),new Param('min','sys::Int',false),new Param('sec','sys::Int',true),new Param('ns','sys::Int',true)]),{}).am$('toDateTime',8192,'sys::DateTime',List.make(Param.type$,[new Param('d','sys::Date',false),new Param('tz','sys::TimeZone',true)]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('toLocale',8192,'sys::Str',List.make(Param.type$,[new Param('pattern','sys::Str?',true),new Param('locale','sys::Locale',true)]),{}).am$('toCode',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('fromDuration',40962,'sys::Time',List.make(Param.type$,[new Param('d','sys::Duration',false)]),{}).am$('fromIso',40962,'sys::Time?',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('plus',8192,'sys::Time',List.make(Param.type$,[new Param('dur','sys::Duration',false)]),{}).am$('isMidnight',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('fromStr',40966,'sys::Time?',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('toDuration',8192,'sys::Duration',List.make(Param.type$,[]),{}).am$('hash',271360,'sys::Int',List.make(Param.type$,[]),{});
UnknownTypeErr.type$.am$('msg',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('cause',8192,'sys::Err?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('trace',8192,'sys::This',List.make(Param.type$,[new Param('out','sys::OutStream',true),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('traceToStr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str',true),new Param('cause','sys::Err?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
Month.type$.af$('jul',106506,'sys::Month',{}).af$('feb',106506,'sys::Month',{}).af$('jun',106506,'sys::Month',{}).af$('dec',106506,'sys::Month',{}).af$('vals',106498,'sys::Month[]',{}).af$('nov',106506,'sys::Month',{}).af$('jan',106506,'sys::Month',{}).af$('mar',106506,'sys::Month',{}).af$('sep',106506,'sys::Month',{}).af$('oct',106506,'sys::Month',{}).af$('apr',106506,'sys::Month',{}).af$('may',106506,'sys::Month',{}).af$('aug',106506,'sys::Month',{}).am$('static$init',165890,'sys::Void',List.make(Param.type$,[]),{}).am$('compare',271360,'sys::Int',List.make(Param.type$,[new Param('obj','sys::Obj',false)]),{}).am$('increment',8192,'sys::Month',List.make(Param.type$,[]),{}).am$('numDays',8192,'sys::Int',List.make(Param.type$,[new Param('year','sys::Int',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('localeAbbr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',133124,'sys::Void',List.make(Param.type$,[new Param('$ordinal','sys::Int',false),new Param('$name','sys::Str',false)]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('toLocale',8192,'sys::Str',List.make(Param.type$,[new Param('pattern','sys::Str?',true),new Param('locale','sys::Locale',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('fromStr',40966,'sys::Month?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('doFromStr',36866,'sys::Enum?',List.make(Param.type$,[new Param('t','sys::Type',false),new Param('name','sys::Str',false),new Param('checked','sys::Bool',false)]),{}).am$('decrement',8192,'sys::Month',List.make(Param.type$,[]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('obj','sys::Obj?',false)]),{}).am$('name',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('localeFull',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('ordinal',8192,'sys::Int',List.make(Param.type$,[]),{});
CastErr.type$.am$('msg',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('cause',8192,'sys::Err?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('trace',8192,'sys::This',List.make(Param.type$,[new Param('out','sys::OutStream',true),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('traceToStr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str',true),new Param('cause','sys::Err?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
ParseErr.type$.am$('msg',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('cause',8192,'sys::Err?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('trace',8192,'sys::This',List.make(Param.type$,[new Param('out','sys::OutStream',true),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('traceToStr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str',true),new Param('cause','sys::Err?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
DateTime.type$.af$('defVal',106498,'sys::DateTime',{}).am$('date',8192,'sys::Date',List.make(Param.type$,[]),{}).am$('weekOfYear',8192,'sys::Int',List.make(Param.type$,[new Param('startOfWeek','sys::Weekday',true)]),{}).am$('year',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('dayOfYear',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('tz',8192,'sys::TimeZone',List.make(Param.type$,[]),{}).am$('weekday',8192,'sys::Weekday',List.make(Param.type$,[]),{}).am$('toRel',8192,'sys::DateTime',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('toJava',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('hoursInDay',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('privateMake',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('nowUnique',40962,'sys::Int',List.make(Param.type$,[]),{}).am$('toIso',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('day',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('tzAbbr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('toCode',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('fromJava',40962,'sys::DateTime?',List.make(Param.type$,[new Param('millis','sys::Int',false),new Param('tz','sys::TimeZone',true),new Param('negIsNull','sys::Bool',true)]),{}).am$('plus',8192,'sys::DateTime',List.make(Param.type$,[new Param('duration','sys::Duration',false)]),{}).am$('fromStr',40966,'sys::DateTime?',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('month',8192,'sys::Month',List.make(Param.type$,[]),{}).am$('nowTicks',40962,'sys::Int',List.make(Param.type$,[]),{}).am$('hash',271360,'sys::Int',List.make(Param.type$,[]),{}).am$('toUtc',8192,'sys::DateTime',List.make(Param.type$,[]),{}).am$('minus',8192,'sys::DateTime',List.make(Param.type$,[new Param('duration','sys::Duration',false)]),{}).am$('compare',271360,'sys::Int',List.make(Param.type$,[new Param('obj','sys::Obj',false)]),{}).am$('weekdayInMonth',40962,'sys::Int',List.make(Param.type$,[new Param('year','sys::Int',false),new Param('mon','sys::Month',false),new Param('weekday','sys::Weekday',false),new Param('pos','sys::Int',false)]),{}).am$('dst',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('minusDateTime',8192,'sys::Duration',List.make(Param.type$,[new Param('time','sys::DateTime',false)]),{}).am$('fromLocale',40962,'sys::DateTime?',List.make(Param.type$,[new Param('str','sys::Str',false),new Param('pattern','sys::Str',false),new Param('tz','sys::TimeZone',true),new Param('checked','sys::Bool',true)]),{}).am$('nanoSec',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('toTimeZone',8192,'sys::DateTime',List.make(Param.type$,[new Param('tz','sys::TimeZone',false)]),{}).am$('sec',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('min',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('hour',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('fromHttpStr',40962,'sys::DateTime?',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('now',40962,'sys::DateTime',List.make(Param.type$,[new Param('tolerance','sys::Duration?',true)]),{}).am$('boot',40962,'sys::DateTime',List.make(Param.type$,[]),{}).am$('floor',8192,'sys::DateTime',List.make(Param.type$,[new Param('accuracy','sys::Duration',false)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',40966,'sys::DateTime?',List.make(Param.type$,[new Param('year','sys::Int',false),new Param('month','sys::Month',false),new Param('day','sys::Int',false),new Param('hour','sys::Int',false),new Param('min','sys::Int',false),new Param('sec','sys::Int',true),new Param('ns','sys::Int',true),new Param('tz','sys::TimeZone',true)]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('toHttpStr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toLocale',8192,'sys::Str',List.make(Param.type$,[new Param('pattern','sys::Str?',true),new Param('locale','sys::Locale',true)]),{}).am$('midnight',8192,'sys::DateTime',List.make(Param.type$,[]),{}).am$('ticks',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('nowUtc',40962,'sys::DateTime',List.make(Param.type$,[new Param('tolerance','sys::Duration?',true)]),{}).am$('isLeapYear',40962,'sys::Bool',List.make(Param.type$,[new Param('year','sys::Int',false)]),{}).am$('fromIso',40962,'sys::DateTime?',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('isMidnight',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('makeTicks',40962,'sys::DateTime',List.make(Param.type$,[new Param('ticks','sys::Int',false),new Param('tz','sys::TimeZone',true)]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('time',8192,'sys::Time',List.make(Param.type$,[]),{});
NotImmutableErr.type$.am$('msg',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('cause',8192,'sys::Err?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('trace',8192,'sys::This',List.make(Param.type$,[new Param('out','sys::OutStream',true),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('traceToStr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str',true),new Param('cause','sys::Err?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
UnknownPodErr.type$.am$('msg',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('cause',8192,'sys::Err?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('trace',8192,'sys::This',List.make(Param.type$,[new Param('out','sys::OutStream',true),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('traceToStr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str',true),new Param('cause','sys::Err?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
List.type$.af$('size',73728,'sys::Int',{}).af$('capacity',73728,'sys::Int',{}).am$('indexSame',8192,'sys::Int?',List.make(Param.type$,[new Param('item','sys::V',false),new Param('offset','sys::Int',true)]),{}).am$('addNotNull',8192,'sys::L',List.make(Param.type$,[new Param('item','sys::V?',false)]),{}).am$('getSafe',8192,'sys::V?',List.make(Param.type$,[new Param('index','sys::Int',false),new Param('def','sys::V?',true)]),{}).am$('makeObj',8196,'sys::Void',List.make(Param.type$,[new Param('capacity','sys::Int',false)]),{}).am$('indexr',8192,'sys::Int?',List.make(Param.type$,[new Param('item','sys::V',false),new Param('offset','sys::Int',true)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('findAll',8192,'sys::L',List.make(Param.type$,[new Param('c','|sys::V,sys::Int->sys::Bool|',false)]),{}).am$('flatten',8192,'sys::Obj?[]',List.make(Param.type$,[]),{}).am$('removeAll',8192,'sys::L',List.make(Param.type$,[new Param('list','sys::L',false)]),{}).am$('trim',8192,'sys::L',List.make(Param.type$,[]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('getRange',8192,'sys::L',List.make(Param.type$,[new Param('range','sys::Range',false)]),{}).am$('find',8192,'sys::V?',List.make(Param.type$,[new Param('c','|sys::V,sys::Int->sys::Bool|',false)]),{}).am$('findType',8192,'sys::L',List.make(Param.type$,[new Param('t','sys::Type',false)]),{}).am$('intersection',8192,'sys::L',List.make(Param.type$,[new Param('that','sys::L',false)]),{}).am$('exclude',8192,'sys::L',List.make(Param.type$,[new Param('c','|sys::V,sys::Int->sys::Bool|',false)]),{}).am$('join',8192,'sys::Str',List.make(Param.type$,[new Param('separator','sys::Str',true),new Param('c','|sys::V,sys::Int->sys::Str|?',true)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('sortr',8192,'sys::L',List.make(Param.type$,[new Param('c','|sys::V,sys::V->sys::Int|?',true)]),{}).am$('add',8192,'sys::L',List.make(Param.type$,[new Param('item','sys::V',false)]),{}).am$('all',8192,'sys::Bool',List.make(Param.type$,[new Param('c','|sys::V,sys::Int->sys::Bool|',false)]),{}).am$('reduce',8192,'sys::Obj?',List.make(Param.type$,[new Param('init','sys::Obj?',false),new Param('c','|sys::Obj?,sys::V,sys::Int->sys::Obj?|',false)]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('last',8192,'sys::V?',List.make(Param.type$,[]),{}).am$('binaryFind',8192,'sys::Int',List.make(Param.type$,[new Param('c','|sys::V,sys::Int->sys::Int|',false)]),{}).am$('swap',8192,'sys::L',List.make(Param.type$,[new Param('indexA','sys::Int',false),new Param('indexB','sys::Int',false)]),{}).am$('toCode',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('eachrWhile',8192,'sys::Obj?',List.make(Param.type$,[new Param('c','|sys::V,sys::Int->sys::Obj?|',false)]),{}).am$('containsAny',8192,'sys::Bool',List.make(Param.type$,[new Param('list','sys::L',false)]),{}).am$('index',8192,'sys::Int?',List.make(Param.type$,[new Param('item','sys::V',false),new Param('offset','sys::Int',true)]),{}).am$('sort',8192,'sys::L',List.make(Param.type$,[new Param('c','|sys::V,sys::V->sys::Int|?',true)]),{}).am$('fill',8192,'sys::L',List.make(Param.type$,[new Param('val','sys::V',false),new Param('times','sys::Int',false)]),{}).am$('eachr',8192,'sys::Void',List.make(Param.type$,[new Param('c','|sys::V,sys::Int->sys::Void|',false)]),{}).am$('push',8192,'sys::L',List.make(Param.type$,[new Param('item','sys::V',false)]),{}).am$('each',8192,'sys::Void',List.make(Param.type$,[new Param('c','|sys::V,sys::Int->sys::Void|',false)]),{}).am$('eachNotNull',8192,'sys::Void',List.make(Param.type$,[new Param('c','|sys::V,sys::Int->sys::Void|',false)]),{}).am$('mapNotNull',8192,'sys::Obj[]',List.make(Param.type$,[new Param('c','|sys::V,sys::Int->sys::Obj?|',false)]),{}).am$('flatMap',8192,'sys::Obj?[]',List.make(Param.type$,[new Param('c','|sys::V,sys::Int->sys::Obj?[]|',false)]),{}).am$('contains',8192,'sys::Bool',List.make(Param.type$,[new Param('item','sys::V',false)]),{}).am$('findNotNull',8192,'sys::L',List.make(Param.type$,[]),{}).am$('unique',8192,'sys::L',List.make(Param.type$,[]),{}).am$('removeAt',8192,'sys::V',List.make(Param.type$,[new Param('index','sys::Int',false)]),{}).am$('insertAll',8192,'sys::L',List.make(Param.type$,[new Param('index','sys::Int',false),new Param('list','sys::L',false)]),{}).am$('ro',8192,'sys::L',List.make(Param.type$,[]),{}).am$('hash',271360,'sys::Int',List.make(Param.type$,[]),{}).am$('eachRange',8192,'sys::Void',List.make(Param.type$,[new Param('r','sys::Range',false),new Param('c','|sys::V,sys::Int->sys::Void|',false)]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('groupByInto',8192,'[sys::Obj:sys::L]',List.make(Param.type$,[new Param('map','[sys::Obj:sys::L]',false),new Param('c','|sys::V,sys::Int->sys::Obj|',false)]),{}).am$('rw',8192,'sys::L',List.make(Param.type$,[]),{}).am$('insert',8192,'sys::L',List.make(Param.type$,[new Param('index','sys::Int',false),new Param('item','sys::V',false)]),{}).am$('groupBy',8192,'[sys::Obj:sys::L]',List.make(Param.type$,[new Param('c','|sys::V,sys::Int->sys::Obj|',false)]),{}).am$('binarySearch',8192,'sys::Int',List.make(Param.type$,[new Param('key','sys::V',false),new Param('c','|sys::V,sys::V->sys::Int|?',true)]),{}).am$('remove',8192,'sys::V?',List.make(Param.type$,[new Param('item','sys::V',false)]),{}).am$('pop',8192,'sys::V?',List.make(Param.type$,[]),{}).am$('random',8192,'sys::V?',List.make(Param.type$,[]),{}).am$('min',8192,'sys::V?',List.make(Param.type$,[new Param('c','|sys::V,sys::V->sys::Int|?',true)]),{}).am$('addIfNotNull',8192,'sys::L',List.make(Param.type$,[new Param('item','sys::V?',false)]),{}).am$('isRO',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('of',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('get',8192,'sys::V',List.make(Param.type$,[new Param('index','sys::Int',false)]),{}).am$('removeRange',8192,'sys::L',List.make(Param.type$,[new Param('r','sys::Range',false)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('of','sys::Type',false),new Param('capacity','sys::Int',false)]),{}).am$('map',8192,'sys::Obj?[]',List.make(Param.type$,[new Param('c','|sys::V,sys::Int->sys::Obj?|',false)]),{}).am$('isRW',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('set',8192,'sys::L',List.make(Param.type$,[new Param('index','sys::Int',false),new Param('item','sys::V',false)]),{}).am$('max',8192,'sys::V?',List.make(Param.type$,[new Param('c','|sys::V,sys::V->sys::Int|?',true)]),{}).am$('containsAll',8192,'sys::Bool',List.make(Param.type$,[new Param('list','sys::L',false)]),{}).am$('isEmpty',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('clear',8192,'sys::L',List.make(Param.type$,[]),{}).am$('union',8192,'sys::L',List.make(Param.type$,[new Param('that','sys::L',false)]),{}).am$('reverse',8192,'sys::L',List.make(Param.type$,[]),{}).am$('any',8192,'sys::Bool',List.make(Param.type$,[new Param('c','|sys::V,sys::Int->sys::Bool|',false)]),{}).am$('peek',8192,'sys::V?',List.make(Param.type$,[]),{}).am$('removeSame',8192,'sys::V?',List.make(Param.type$,[new Param('item','sys::V',false)]),{}).am$('findIndex',8192,'sys::Int?',List.make(Param.type$,[new Param('c','|sys::V,sys::Int->sys::Bool|',false)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('addAll',8192,'sys::L',List.make(Param.type$,[new Param('list','sys::L',false)]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('containsSame',8192,'sys::Bool',List.make(Param.type$,[new Param('item','sys::V',false)]),{}).am$('shuffle',8192,'sys::L',List.make(Param.type$,[]),{}).am$('eachWhile',8192,'sys::Obj?',List.make(Param.type$,[new Param('c','|sys::V,sys::Int->sys::Obj?|',false)]),{}).am$('first',8192,'sys::V?',List.make(Param.type$,[]),{}).am$('dup',8192,'sys::L',List.make(Param.type$,[]),{}).am$('moveTo',8192,'sys::L',List.make(Param.type$,[new Param('item','sys::V?',false),new Param('toIndex','sys::Int',false)]),{});
FileStore.type$.am$('toStr',270336,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('freeSpace',270337,'sys::Int?',List.make(Param.type$,[]),{}).am$('availSpace',270337,'sys::Int?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('totalSpace',270337,'sys::Int?',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('makeNew',4100,'sys::Void',List.make(Param.type$,[]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
Unit.type$.am$('symbol',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('A',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('mult',8192,'sys::Unit',List.make(Param.type$,[new Param('that','sys::Unit',false)]),{}).am$('quantities',40962,'sys::Str[]',List.make(Param.type$,[]),{}).am$('scale',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('dim',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('K',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('mol',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('sec',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('div',8192,'sys::Unit',List.make(Param.type$,[new Param('b','sys::Unit',false)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('define',40962,'sys::Unit',List.make(Param.type$,[new Param('s','sys::Str',false)]),{}).am$('definition',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('kg',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',139268,'sys::Void',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('cd',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('quantity',40962,'sys::Unit[]',List.make(Param.type$,[new Param('quantity','sys::Str',false)]),{}).am$('offset',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('convertTo',8192,'sys::Float',List.make(Param.type$,[new Param('scalar','sys::Float',false),new Param('unit','sys::Unit',false)]),{}).am$('list',40962,'sys::Unit[]',List.make(Param.type$,[]),{}).am$('m',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('fromStr',40966,'sys::Unit?',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('name',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('ids',8192,'sys::Str[]',List.make(Param.type$,[]),{}).am$('hash',271360,'sys::Int',List.make(Param.type$,[]),{});
RegexMatcher.type$.am$('toStr',270336,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('start',8192,'sys::Int',List.make(Param.type$,[new Param('group','sys::Int',true)]),{}).am$('replaceFirst',8192,'sys::Str',List.make(Param.type$,[new Param('replacement','sys::Str',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('matches',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('replaceAll',8192,'sys::Str',List.make(Param.type$,[new Param('replacement','sys::Str',false)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('groupCount',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('find',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('end',8192,'sys::Int',List.make(Param.type$,[new Param('group','sys::Int',true)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('group',8192,'sys::Str?',List.make(Param.type$,[new Param('group','sys::Int',true)]),{});
Slot.type$.am$('parent',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('hasFacet',8192,'sys::Bool',List.make(Param.type$,[new Param('type','sys::Type',false)]),{}).am$('isStatic',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('signature',270336,'sys::Str',List.make(Param.type$,[]),{}).am$('isField',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('isSynthetic',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('isPrivate',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('isNative',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('facets',8192,'sys::Facet[]',List.make(Param.type$,[]),{}).am$('isProtected',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('findMethod',40962,'sys::Method?',List.make(Param.type$,[new Param('qname','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('find',40962,'sys::Slot?',List.make(Param.type$,[new Param('qname','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('isConst',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('qname',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('isOverride',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('isMethod',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('isPublic',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',132,'sys::Void',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('findFunc',40962,'sys::Func?',List.make(Param.type$,[new Param('qname','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('isAbstract',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('isInternal',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('name',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('doc',8192,'sys::Str?',List.make(Param.type$,[]),{}).am$('isVirtual',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('findField',40962,'sys::Field?',List.make(Param.type$,[new Param('qname','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('facet',8192,'sys::Facet?',List.make(Param.type$,[new Param('type','sys::Type',false),new Param('checked','sys::Bool',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('isCtor',8192,'sys::Bool',List.make(Param.type$,[]),{});
Field.type$.am$('parent',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('hasFacet',8192,'sys::Bool',List.make(Param.type$,[new Param('type','sys::Type',false)]),{}).am$('isStatic',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('signature',270336,'sys::Str',List.make(Param.type$,[]),{}).am$('isField',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('isSynthetic',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('isPrivate',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('type',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('isNative',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('facets',8192,'sys::Facet[]',List.make(Param.type$,[]),{}).am$('privateMake',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('isProtected',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('findMethod',40962,'sys::Method?',List.make(Param.type$,[new Param('qname','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('find',40962,'sys::Slot?',List.make(Param.type$,[new Param('qname','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('isConst',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('get',270336,'sys::Obj?',List.make(Param.type$,[new Param('instance','sys::Obj?',true)]),{}).am$('qname',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('isOverride',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('isMethod',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('isPublic',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('makeSetFunc',40962,'|sys::Obj->sys::Void|',List.make(Param.type$,[new Param('vals','[sys::Field:sys::Obj?]',false)]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('set',270336,'sys::Void',List.make(Param.type$,[new Param('instance','sys::Obj?',false),new Param('value','sys::Obj?',false)]),{}).am$('findFunc',40962,'sys::Func?',List.make(Param.type$,[new Param('qname','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('isAbstract',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('isInternal',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('name',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('doc',8192,'sys::Str?',List.make(Param.type$,[]),{}).am$('isVirtual',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('findField',40962,'sys::Field?',List.make(Param.type$,[new Param('qname','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('facet',8192,'sys::Facet?',List.make(Param.type$,[new Param('type','sys::Type',false),new Param('checked','sys::Bool',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('isCtor',8192,'sys::Bool',List.make(Param.type$,[]),{});
FieldNotSetErr.type$.am$('msg',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('cause',8192,'sys::Err?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('trace',8192,'sys::This',List.make(Param.type$,[new Param('out','sys::OutStream',true),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('traceToStr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str',true),new Param('cause','sys::Err?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
Method.type$.am$('parent',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('hasFacet',8192,'sys::Bool',List.make(Param.type$,[new Param('type','sys::Type',false)]),{}).am$('isStatic',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('signature',270336,'sys::Str',List.make(Param.type$,[]),{}).am$('isField',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('isSynthetic',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('isPrivate',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('isNative',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('facets',8192,'sys::Facet[]',List.make(Param.type$,[]),{}).am$('privateMake',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('isProtected',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('findMethod',40962,'sys::Method?',List.make(Param.type$,[new Param('qname','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('find',40962,'sys::Slot?',List.make(Param.type$,[new Param('qname','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('isConst',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('qname',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('isOverride',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('isMethod',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('isPublic',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('findFunc',40962,'sys::Func?',List.make(Param.type$,[new Param('qname','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('callOn',8192,'sys::Obj?',List.make(Param.type$,[new Param('target','sys::Obj?',false),new Param('args','sys::Obj?[]?',false)]),{}).am$('paramDef',8192,'sys::Obj?',List.make(Param.type$,[new Param('param','sys::Param',false),new Param('instance','sys::Obj?',true)]),{}).am$('params',8192,'sys::Param[]',List.make(Param.type$,[]),{}).am$('isAbstract',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('callList',8192,'sys::Obj?',List.make(Param.type$,[new Param('args','sys::Obj?[]?',false)]),{}).am$('call',8192,'sys::Obj?',List.make(Param.type$,[new Param('a','sys::Obj?',true),new Param('b','sys::Obj?',true),new Param('c','sys::Obj?',true),new Param('d','sys::Obj?',true),new Param('e','sys::Obj?',true),new Param('f','sys::Obj?',true),new Param('g','sys::Obj?',true),new Param('h','sys::Obj?',true)]),{}).am$('isInternal',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('func',8192,'sys::Func',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('name',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('doc',8192,'sys::Str?',List.make(Param.type$,[]),{}).am$('returns',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('isVirtual',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('findField',40962,'sys::Field?',List.make(Param.type$,[new Param('qname','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('facet',8192,'sys::Facet?',List.make(Param.type$,[new Param('type','sys::Type',false),new Param('checked','sys::Bool',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('isCtor',8192,'sys::Bool',List.make(Param.type$,[]),{});
Serializable.type$.af$('simple',73730,'sys::Bool',{}).af$('collection',73730,'sys::Bool',{}).am$('toStr',270336,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('instance$init$sys$Serializable',133120,'sys::Void',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',139268,'sys::Void',List.make(Param.type$,[new Param('f','|sys::Serializable->sys::Void|?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
Transient.type$.af$('defVal',106498,'sys::Transient',{}).am$('toStr',270336,'sys::Str',List.make(Param.type$,[]),{}).am$('static$init',165890,'sys::Void',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',133124,'sys::Void',List.make(Param.type$,[]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
Js.type$.af$('defVal',106498,'sys::Js',{}).am$('toStr',270336,'sys::Str',List.make(Param.type$,[]),{}).am$('static$init',165890,'sys::Void',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',133124,'sys::Void',List.make(Param.type$,[]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
NoDoc.type$.af$('defVal',106498,'sys::NoDoc',{}).am$('toStr',270336,'sys::Str',List.make(Param.type$,[]),{}).am$('static$init',165890,'sys::Void',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',133124,'sys::Void',List.make(Param.type$,[]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
Deprecated.type$.af$('msg',73730,'sys::Str',{}).am$('toStr',270336,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('instance$init$sys$Deprecated',133120,'sys::Void',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',139268,'sys::Void',List.make(Param.type$,[new Param('f','|sys::Deprecated->sys::Void|?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
Operator.type$.af$('defVal',106498,'sys::Operator',{}).am$('toStr',270336,'sys::Str',List.make(Param.type$,[]),{}).am$('static$init',165890,'sys::Void',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',133124,'sys::Void',List.make(Param.type$,[]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
FacetMeta.type$.af$('inherited',73730,'sys::Bool',{}).am$('toStr',270336,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('instance$init$sys$FacetMeta',133120,'sys::Void',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',139268,'sys::Void',List.make(Param.type$,[new Param('f','|sys::FacetMeta->sys::Void|?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
UnknownServiceErr.type$.am$('msg',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('cause',8192,'sys::Err?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('trace',8192,'sys::This',List.make(Param.type$,[new Param('out','sys::OutStream',true),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('traceToStr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str',true),new Param('cause','sys::Err?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
NullErr.type$.am$('msg',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('cause',8192,'sys::Err?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('trace',8192,'sys::This',List.make(Param.type$,[new Param('out','sys::OutStream',true),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('traceToStr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str',true),new Param('cause','sys::Err?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
Uuid.type$.am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',271360,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('privateMake',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('bitsLo',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('fromStr',40966,'sys::Uuid?',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('makeBits',40962,'sys::Uuid',List.make(Param.type$,[new Param('hi','sys::Int',false),new Param('lo','sys::Int',false)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',40966,'sys::Uuid?',List.make(Param.type$,[]),{}).am$('bitsHi',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('hash',271360,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
UnsupportedErr.type$.am$('msg',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('cause',8192,'sys::Err?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('trace',8192,'sys::This',List.make(Param.type$,[new Param('out','sys::OutStream',true),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('traceToStr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str',true),new Param('cause','sys::Err?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
UnknownKeyErr.type$.am$('msg',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('cause',8192,'sys::Err?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('trace',8192,'sys::This',List.make(Param.type$,[new Param('out','sys::OutStream',true),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('traceToStr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str',true),new Param('cause','sys::Err?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
UnknownFacetErr.type$.am$('msg',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('cause',8192,'sys::Err?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('trace',8192,'sys::This',List.make(Param.type$,[new Param('out','sys::OutStream',true),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('traceToStr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str',true),new Param('cause','sys::Err?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
InStream.type$.af$('endian',73728,'sys::Endian',{}).af$('charset',73728,'sys::Charset',{}).am$('readF4',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('readDecimal',8192,'sys::Decimal',List.make(Param.type$,[]),{}).am$('readAllStr',8192,'sys::Str',List.make(Param.type$,[new Param('normalizeNewlines','sys::Bool',true)]),{}).am$('readBufFully',8192,'sys::Buf',List.make(Param.type$,[new Param('buf','sys::Buf?',false),new Param('n','sys::Int',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('readF8',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('readS2',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('readS1',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('readS4',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('readBuf',270336,'sys::Int?',List.make(Param.type$,[new Param('buf','sys::Buf',false),new Param('n','sys::Int',false)]),{}).am$('pipe',8192,'sys::Int',List.make(Param.type$,[new Param('out','sys::OutStream',false),new Param('n','sys::Int?',true),new Param('close','sys::Bool',true)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('readS8',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('unreadChar',8192,'sys::This',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('toStr',270336,'sys::Str',List.make(Param.type$,[]),{}).am$('read',270336,'sys::Int?',List.make(Param.type$,[]),{}).am$('readProps',8192,'[sys::Str:sys::Str]',List.make(Param.type$,[]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('unread',270336,'sys::This',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('skip',270336,'sys::Int',List.make(Param.type$,[new Param('n','sys::Int',false)]),{}).am$('readAllLines',8192,'sys::Str[]',List.make(Param.type$,[]),{}).am$('readAllBuf',8192,'sys::Buf',List.make(Param.type$,[]),{}).am$('readChar',8192,'sys::Int?',List.make(Param.type$,[]),{}).am$('readU4',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('readNullTerminatedStr',8192,'sys::Str',List.make(Param.type$,[new Param('max','sys::Int?',true)]),{}).am$('readUtf',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('readPropsListVals',8192,'[sys::Str:sys::Str[]]',List.make(Param.type$,[]),{}).am$('readU2',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('readU1',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('numPendingBits',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',4100,'sys::Void',List.make(Param.type$,[new Param('in','sys::InStream?',false)]),{}).am$('close',270336,'sys::Bool',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('avail',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('readBool',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('readObj',8192,'sys::Obj?',List.make(Param.type$,[new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('peekChar',8192,'sys::Int?',List.make(Param.type$,[]),{}).am$('readStrToken',8192,'sys::Str?',List.make(Param.type$,[new Param('max','sys::Int?',true),new Param('c','|sys::Int->sys::Bool|?',true)]),{}).am$('readLine',8192,'sys::Str?',List.make(Param.type$,[new Param('max','sys::Int?',true)]),{}).am$('peek',8192,'sys::Int?',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('readChars',8192,'sys::Str',List.make(Param.type$,[new Param('n','sys::Int',false)]),{}).am$('eachLine',8192,'sys::Void',List.make(Param.type$,[new Param('f','|sys::Str->sys::Void|',false)]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('readBits',8192,'sys::Int',List.make(Param.type$,[new Param('num','sys::Int',false)]),{});
File.type$.af$('modified',270337,'sys::DateTime?',{}).af$('pathSep',106498,'sys::Str',{}).af$('sep',106498,'sys::Str',{}).am$('parent',270337,'sys::File?',List.make(Param.type$,[]),{}).am$('readAllStr',8192,'sys::Str',List.make(Param.type$,[new Param('normalizeNewlines','sys::Bool',true)]),{}).am$('osRoots',40962,'sys::File[]',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('mimeType',8192,'sys::MimeType?',List.make(Param.type$,[]),{}).am$('createFile',8192,'sys::File',List.make(Param.type$,[new Param('name','sys::Str',false)]),{}).am$('copyTo',270336,'sys::File',List.make(Param.type$,[new Param('to','sys::File',false),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('moveInto',270336,'sys::File',List.make(Param.type$,[new Param('dir','sys::File',false)]),{}).am$('writeProps',8192,'sys::Void',List.make(Param.type$,[new Param('props','[sys::Str:sys::Str]',false)]),{}).am$('path',8192,'sys::Str[]',List.make(Param.type$,[]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('normalize',270337,'sys::File',List.make(Param.type$,[]),{}).am$('create',270337,'sys::File',List.make(Param.type$,[]),{}).am$('isExecutable',270336,'sys::Bool',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('pathStr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('ext',8192,'sys::Str?',List.make(Param.type$,[]),{}).am$('in',270337,'sys::InStream',List.make(Param.type$,[new Param('bufferSize','sys::Int?',true)]),{}).am$('copyInto',270336,'sys::File',List.make(Param.type$,[new Param('dir','sys::File',false),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('list',270337,'sys::File[]',List.make(Param.type$,[new Param('pattern','sys::Regex?',true)]),{}).am$('plus',270337,'sys::File',List.make(Param.type$,[new Param('path','sys::Uri',false),new Param('checkSlash','sys::Bool',true)]),{}).am$('basename',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('size',270337,'sys::Int?',List.make(Param.type$,[]),{}).am$('readProps',8192,'[sys::Str:sys::Str]',List.make(Param.type$,[]),{}).am$('name',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('isReadable',270336,'sys::Bool',List.make(Param.type$,[]),{}).am$('hash',271360,'sys::Int',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('readAllLines',8192,'sys::Str[]',List.make(Param.type$,[]),{}).am$('isWritable',270336,'sys::Bool',List.make(Param.type$,[]),{}).am$('readAllBuf',8192,'sys::Buf',List.make(Param.type$,[]),{}).am$('osPath',270337,'sys::Str?',List.make(Param.type$,[]),{}).am$('delete',270337,'sys::Void',List.make(Param.type$,[]),{}).am$('out',270337,'sys::OutStream',List.make(Param.type$,[new Param('append','sys::Bool',true),new Param('bufferSize','sys::Int?',true)]),{}).am$('createDir',8192,'sys::File',List.make(Param.type$,[new Param('name','sys::Str',false)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',40966,'sys::File?',List.make(Param.type$,[new Param('uri','sys::Uri',false),new Param('checkSlash','sys::Bool',true)]),{}).am$('listFiles',270336,'sys::File[]',List.make(Param.type$,[new Param('pattern','sys::Regex?',true)]),{}).am$('deleteOnExit',270337,'sys::File',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('os',40962,'sys::File',List.make(Param.type$,[new Param('osPath','sys::Str',false)]),{}).am$('readObj',8192,'sys::Obj?',List.make(Param.type$,[new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('isEmpty',270336,'sys::Bool',List.make(Param.type$,[]),{}).am$('writeObj',8192,'sys::Void',List.make(Param.type$,[new Param('obj','sys::Obj?',false),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('listDirs',270336,'sys::File[]',List.make(Param.type$,[new Param('pattern','sys::Regex?',true)]),{}).am$('store',270336,'sys::FileStore',List.make(Param.type$,[]),{}).am$('createTemp',40962,'sys::File',List.make(Param.type$,[new Param('prefix','sys::Str',true),new Param('suffix','sys::Str',true),new Param('dir','sys::File?',true)]),{}).am$('uri',8192,'sys::Uri',List.make(Param.type$,[]),{}).am$('isHidden',270336,'sys::Bool',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('makeNew',4100,'sys::Void',List.make(Param.type$,[new Param('uri','sys::Uri',false)]),{}).am$('rename',270336,'sys::File',List.make(Param.type$,[new Param('newName','sys::Str',false)]),{}).am$('eachLine',8192,'sys::Void',List.make(Param.type$,[new Param('f','|sys::Str->sys::Void|',false)]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('exists',270337,'sys::Bool',List.make(Param.type$,[]),{}).am$('mmap',270337,'sys::Buf',List.make(Param.type$,[new Param('mode','sys::Str',true),new Param('pos','sys::Int',true),new Param('size','sys::Int?',true)]),{}).am$('walk',270336,'sys::Void',List.make(Param.type$,[new Param('c','|sys::File->sys::Void|',false)]),{}).am$('open',270337,'sys::Buf',List.make(Param.type$,[new Param('mode','sys::Str',true)]),{}).am$('isDir',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('moveTo',270337,'sys::File',List.make(Param.type$,[new Param('to','sys::File',false)]),{});
InterruptedErr.type$.am$('msg',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('cause',8192,'sys::Err?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('trace',8192,'sys::This',List.make(Param.type$,[new Param('out','sys::OutStream',true),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('traceToStr',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('msg','sys::Str',true),new Param('cause','sys::Err?',true)]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
Env.type$.am$('parent',8192,'sys::Env?',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('homeDir',270336,'sys::File',List.make(Param.type$,[]),{}).am$('path',270336,'sys::File[]',List.make(Param.type$,[]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('host',270336,'sys::Str',List.make(Param.type$,[]),{}).am$('idHash',8192,'sys::Int',List.make(Param.type$,[new Param('obj','sys::Obj?',false)]),{}).am$('vars',270336,'[sys::Str:sys::Str]',List.make(Param.type$,[]),{}).am$('findAllPodNames',270336,'sys::Str[]',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toStr',270336,'sys::Str',List.make(Param.type$,[]),{}).am$('in',270336,'sys::InStream',List.make(Param.type$,[]),{}).am$('findFile',270336,'sys::File?',List.make(Param.type$,[new Param('uri','sys::Uri',false),new Param('checked','sys::Bool',true)]),{}).am$('runtime',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('index',270336,'sys::Str[]',List.make(Param.type$,[new Param('key','sys::Str',false)]),{}).am$('findAllFiles',270336,'sys::File[]',List.make(Param.type$,[new Param('uri','sys::Uri',false)]),{}).am$('props',270336,'[sys::Str:sys::Str]',List.make(Param.type$,[new Param('pod','sys::Pod',false),new Param('uri','sys::Uri',false),new Param('maxAge','sys::Duration',false)]),{}).am$('indexPodNames',270336,'sys::Str[]',List.make(Param.type$,[new Param('key','sys::Str',false)]),{}).am$('exit',270336,'sys::Void',List.make(Param.type$,[new Param('status','sys::Int',true)]),{}).am$('compileScript',270336,'sys::Type',List.make(Param.type$,[new Param('f','sys::File',false),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('indexKeys',270336,'sys::Str[]',List.make(Param.type$,[]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('cur',40962,'sys::Env',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('javaVersion',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('addShutdownHook',270336,'sys::Void',List.make(Param.type$,[new Param('hook','|->sys::Void|',false)]),{}).am$('locale',270336,'sys::Str?',List.make(Param.type$,[new Param('pod','sys::Pod',false),new Param('key','sys::Str',false),new Param('def','sys::Str?',true),new Param('locale','sys::Locale',true)]),{}).am$('platform',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('out',270336,'sys::OutStream',List.make(Param.type$,[]),{}).am$('promptPassword',270336,'sys::Str?',List.make(Param.type$,[new Param('msg','sys::Str',true)]),{}).am$('compileScriptToJs',270336,'sys::Str',List.make(Param.type$,[new Param('f','sys::File',false),new Param('options','[sys::Str:sys::Obj]?',true)]),{}).am$('workDir',270336,'sys::File',List.make(Param.type$,[]),{}).am$('mainMethod',270336,'sys::Method?',List.make(Param.type$,[]),{}).am$('gc',270336,'sys::Void',List.make(Param.type$,[]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',4100,'sys::Void',List.make(Param.type$,[new Param('parent','sys::Env',true)]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('os',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('err',270336,'sys::OutStream',List.make(Param.type$,[]),{}).am$('args',270336,'sys::Str[]',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('diagnostics',270336,'[sys::Str:sys::Obj]',List.make(Param.type$,[]),{}).am$('findPodFile',270336,'sys::File?',List.make(Param.type$,[new Param('podName','sys::Str',false)]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('tempDir',270336,'sys::File',List.make(Param.type$,[]),{}).am$('removeShutdownHook',270336,'sys::Bool',List.make(Param.type$,[new Param('hook','|->sys::Void|',false)]),{}).am$('arch',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('user',270336,'sys::Str',List.make(Param.type$,[]),{}).am$('prompt',270336,'sys::Str?',List.make(Param.type$,[new Param('msg','sys::Str',true)]),{}).am$('config',270336,'sys::Str?',List.make(Param.type$,[new Param('pod','sys::Pod',false),new Param('key','sys::Str',false),new Param('def','sys::Str?',true)]),{});
Map.type$.af$('def',73728,'sys::V?',{}).af$('caseInsensitive',73728,'sys::Bool',{}).af$('ordered',73728,'sys::Bool',{}).am$('addNotNull',8192,'sys::M',List.make(Param.type$,[new Param('key','sys::K',false),new Param('val','sys::V?',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('findAll',8192,'sys::M',List.make(Param.type$,[new Param('c','|sys::V,sys::K->sys::Bool|',false)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('find',8192,'sys::V?',List.make(Param.type$,[new Param('c','|sys::V,sys::K->sys::Bool|',false)]),{}).am$('exclude',8192,'sys::M',List.make(Param.type$,[new Param('c','|sys::V,sys::K->sys::Bool|',false)]),{}).am$('join',8192,'sys::Str',List.make(Param.type$,[new Param('separator','sys::Str',false),new Param('c','|sys::V,sys::K->sys::Str|?',true)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('add',8192,'sys::M',List.make(Param.type$,[new Param('key','sys::K',false),new Param('val','sys::V',false)]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('all',8192,'sys::Bool',List.make(Param.type$,[new Param('c','|sys::V,sys::K->sys::Bool|',false)]),{}).am$('reduce',8192,'sys::Obj?',List.make(Param.type$,[new Param('init','sys::Obj?',false),new Param('c','|sys::Obj?,sys::V,sys::K->sys::Obj?|',false)]),{}).am$('containsKey',8192,'sys::Bool',List.make(Param.type$,[new Param('key','sys::K',false)]),{}).am$('toCode',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('each',8192,'sys::Void',List.make(Param.type$,[new Param('c','|sys::V,sys::K->sys::Void|',false)]),{}).am$('mapNotNull',8192,'[sys::Obj:sys::Obj?]',List.make(Param.type$,[new Param('c','|sys::V,sys::K->sys::Obj?|',false)]),{}).am$('findNotNull',8192,'sys::M',List.make(Param.type$,[]),{}).am$('size',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('ro',8192,'sys::M',List.make(Param.type$,[]),{}).am$('hash',271360,'sys::Int',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('vals',8192,'sys::V[]',List.make(Param.type$,[]),{}).am$('rw',8192,'sys::M',List.make(Param.type$,[]),{}).am$('keys',8192,'sys::K[]',List.make(Param.type$,[]),{}).am$('remove',8192,'sys::V?',List.make(Param.type$,[new Param('key','sys::K',false)]),{}).am$('addIfNotNull',8192,'sys::M',List.make(Param.type$,[new Param('key','sys::K',false),new Param('val','sys::V?',false)]),{}).am$('isRO',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('get',8192,'sys::V?',List.make(Param.type$,[new Param('key','sys::K',false),new Param('def','sys::V?',true)]),{}).am$('addList',8192,'sys::M',List.make(Param.type$,[new Param('list','sys::V[]',false),new Param('c','|sys::V,sys::Int->sys::K|?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',8196,'sys::Void',List.make(Param.type$,[new Param('type','sys::Type',false)]),{}).am$('setAll',8192,'sys::M',List.make(Param.type$,[new Param('m','sys::M',false)]),{}).am$('map',8192,'[sys::Obj:sys::Obj?]',List.make(Param.type$,[new Param('c','|sys::V,sys::K->sys::Obj?|',false)]),{}).am$('isRW',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('set',8192,'sys::M',List.make(Param.type$,[new Param('key','sys::K',false),new Param('val','sys::V',false)]),{}).am$('getOrAdd',8192,'sys::V',List.make(Param.type$,[new Param('key','sys::K',false),new Param('valFunc','|sys::K->sys::V|',false)]),{}).am$('isEmpty',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('clear',8192,'sys::M',List.make(Param.type$,[]),{}).am$('setList',8192,'sys::M',List.make(Param.type$,[new Param('list','sys::V[]',false),new Param('c','|sys::V,sys::Int->sys::K|?',true)]),{}).am$('any',8192,'sys::Bool',List.make(Param.type$,[new Param('c','|sys::V,sys::K->sys::Bool|',false)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('addAll',8192,'sys::M',List.make(Param.type$,[new Param('m','sys::M',false)]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('getOrThrow',8192,'sys::V',List.make(Param.type$,[new Param('key','sys::K',false)]),{}).am$('instance$init$sys$Map',133120,'sys::Void',List.make(Param.type$,[]),{}).am$('getChecked',8192,'sys::V?',List.make(Param.type$,[new Param('key','sys::K',false),new Param('checked','sys::Bool',true)]),{}).am$('eachWhile',8192,'sys::Obj?',List.make(Param.type$,[new Param('c','|sys::V,sys::K->sys::Obj?|',false)]),{}).am$('dup',8192,'sys::M',List.make(Param.type$,[]),{});
Param.type$.am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('type',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('hasDefault',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('equals',270336,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('name',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('make',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('hash',270336,'sys::Int',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
Float.type$.af$('nan',106498,'sys::Float',{}).af$('posInf',106498,'sys::Float',{}).af$('defVal',106498,'sys::Float',{}).af$('negInf',106498,'sys::Float',{}).af$('e',106498,'sys::Float',{}).af$('pi',106498,'sys::Float',{}).am$('mult',8192,'sys::Float',List.make(Param.type$,[new Param('b','sys::Float',false)]),{}).am$('mod',8192,'sys::Float',List.make(Param.type$,[new Param('b','sys::Float',false)]),{}).am$('localePercent',40962,'sys::Str',List.make(Param.type$,[]),{}).am$('cos',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('isNaN',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('atan',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('privateMake',2052,'sys::Void',List.make(Param.type$,[]),{}).am$('div',8192,'sys::Float',List.make(Param.type$,[new Param('b','sys::Float',false)]),{}).am$('sqrt',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('exp',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('toDecimal',8192,'sys::Decimal',List.make(Param.type$,[]),{}).am$('clamp',8192,'sys::Float',List.make(Param.type$,[new Param('min','sys::Float',false),new Param('max','sys::Float',false)]),{}).am$('atan2',40962,'sys::Float',List.make(Param.type$,[new Param('y','sys::Float',false),new Param('x','sys::Float',false)]),{}).am$('tan',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('toStr',271360,'sys::Str',List.make(Param.type$,[]),{}).am$('sinh',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('toCode',8192,'sys::Str',List.make(Param.type$,[]),{}).am$('bits',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('toDegrees',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('ceil',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('acos',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('plus',8192,'sys::Float',List.make(Param.type$,[new Param('b','sys::Float',false)]),{}).am$('divDecimal',8192,'sys::Decimal',List.make(Param.type$,[new Param('b','sys::Decimal',false)]),{}).am$('localeMinus',40962,'sys::Str',List.make(Param.type$,[]),{}).am$('fromStr',40966,'sys::Float?',List.make(Param.type$,[new Param('s','sys::Str',false),new Param('checked','sys::Bool',true)]),{}).am$('localeNegInf',40962,'sys::Str',List.make(Param.type$,[]),{}).am$('makeBits32',40962,'sys::Float',List.make(Param.type$,[new Param('bits','sys::Int',false)]),{}).am$('normNegZero',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('divInt',8192,'sys::Float',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('localeGrouping',40962,'sys::Str',List.make(Param.type$,[]),{}).am$('hash',271360,'sys::Int',List.make(Param.type$,[]),{}).am$('isNegZero',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('minus',8192,'sys::Float',List.make(Param.type$,[new Param('b','sys::Float',false)]),{}).am$('compare',271360,'sys::Int',List.make(Param.type$,[new Param('obj','sys::Obj',false)]),{}).am$('log',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('modInt',8192,'sys::Float',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('log10',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('increment',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('multInt',8192,'sys::Float',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('plusDecimal',8192,'sys::Decimal',List.make(Param.type$,[new Param('b','sys::Decimal',false)]),{}).am$('random',40962,'sys::Float',List.make(Param.type$,[]),{}).am$('tanh',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('minusDecimal',8192,'sys::Decimal',List.make(Param.type$,[new Param('b','sys::Decimal',false)]),{}).am$('min',8192,'sys::Float',List.make(Param.type$,[new Param('that','sys::Float',false)]),{}).am$('pow',8192,'sys::Float',List.make(Param.type$,[new Param('pow','sys::Float',false)]),{}).am$('sin',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('floor',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('bits32',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('plusInt',8192,'sys::Float',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{}).am$('toLocale',8192,'sys::Str',List.make(Param.type$,[new Param('pattern','sys::Str?',true),new Param('locale','sys::Locale',true)]),{}).am$('toInt',8192,'sys::Int',List.make(Param.type$,[]),{}).am$('modDecimal',8192,'sys::Decimal',List.make(Param.type$,[new Param('b','sys::Decimal',false)]),{}).am$('max',8192,'sys::Float',List.make(Param.type$,[new Param('that','sys::Float',false)]),{}).am$('toFloat',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('toRadians',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('cosh',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('localeNaN',40962,'sys::Str',List.make(Param.type$,[]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('abs',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('round',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('makeBits',40962,'sys::Float',List.make(Param.type$,[new Param('bits','sys::Int',false)]),{}).am$('negate',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('decrement',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('minusInt',8192,'sys::Float',List.make(Param.type$,[new Param('b','sys::Int',false)]),{}).am$('equals',271360,'sys::Bool',List.make(Param.type$,[new Param('obj','sys::Obj?',false)]),{}).am$('asin',8192,'sys::Float',List.make(Param.type$,[]),{}).am$('localeDecimal',40962,'sys::Str',List.make(Param.type$,[]),{}).am$('multDecimal',8192,'sys::Decimal',List.make(Param.type$,[new Param('b','sys::Decimal',false)]),{}).am$('clip',8192,'sys::Float',List.make(Param.type$,[new Param('min','sys::Float',false),new Param('max','sys::Float',false)]),{}).am$('localePosInf',40962,'sys::Str',List.make(Param.type$,[]),{}).am$('approx',8192,'sys::Bool',List.make(Param.type$,[new Param('r','sys::Float',false),new Param('tolerance','sys::Float?',true)]),{});
Service.type$.am$('toStr',270336,'sys::Str',List.make(Param.type$,[]),{}).am$('compare',270336,'sys::Int',List.make(Param.type$,[new Param('that','sys::Obj',false)]),{}).am$('isInstalled',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('start',8192,'sys::This',List.make(Param.type$,[]),{}).am$('echo',40962,'sys::Void',List.make(Param.type$,[new Param('x','sys::Obj?',true)]),{}).am$('list',40962,'sys::Service[]',List.make(Param.type$,[]),{}).am$('findAll',40962,'sys::Service[]',List.make(Param.type$,[new Param('t','sys::Type',false)]),{}).am$('with',270336,'sys::This',List.make(Param.type$,[new Param('f','|sys::This->sys::Void|',false)]),{}).am$('onStart',266240,'sys::Void',List.make(Param.type$,[]),{}).am$('stop',8192,'sys::This',List.make(Param.type$,[]),{}).am$('uninstall',8192,'sys::This',List.make(Param.type$,[]),{}).am$('isRunning',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('install',8192,'sys::This',List.make(Param.type$,[]),{}).am$('isImmutable',8192,'sys::Bool',List.make(Param.type$,[]),{}).am$('find',40962,'sys::Service?',List.make(Param.type$,[new Param('t','sys::Type',false),new Param('checked','sys::Bool',true)]),{}).am$('equals',9216,'sys::Bool',List.make(Param.type$,[new Param('that','sys::Obj?',false)]),{}).am$('trap',270336,'sys::Obj?',List.make(Param.type$,[new Param('name','sys::Str',false),new Param('args','sys::Obj?[]?',true)]),{}).am$('toImmutable',8192,'sys::This',List.make(Param.type$,[]),{}).am$('hash',9216,'sys::Int',List.make(Param.type$,[]),{}).am$('onStop',266240,'sys::Void',List.make(Param.type$,[]),{}).am$('typeof',8192,'sys::Type',List.make(Param.type$,[]),{});
class FConst {
  static Abstract   = 0x00000001;
  static Const      = 0x00000002;
  static Ctor       = 0x00000004;
  static Enum       = 0x00000008;
  static Facet      = 0x00000010;
  static Final      = 0x00000020;
  static Getter     = 0x00000040;
  static Internal   = 0x00000080;
  static Mixin      = 0x00000100;
  static Native     = 0x00000200;
  static Override   = 0x00000400;
  static Private    = 0x00000800;
  static Protected  = 0x00001000;
  static Public     = 0x00002000;
  static Setter     = 0x00004000;
  static Static     = 0x00008000;
  static Storage    = 0x00010000;
  static Synthetic  = 0x00020000;
  static Virtual    = 0x00040000;
  static FlagsMask  = 0x0007ffff;
}
class ObjUtil {
  static hash(obj) {
    if (obj instanceof Obj) return obj.hash();
    const t = typeof obj;
    if (t === "number") return parseInt(obj);
    if (t === "string") return Str.hash(obj);
    if (t === "boolean") return Bool.hash(obj);
    return 0;
  }
  static equals(a, b) {
    if (a == null) return b == null;
    if (a instanceof Obj) return a.equals(b);
    const t = typeof a;
    if (t === "number") return Int.equals(a, b);
    if (t === "string") return a === b;
    const f = a.fanType$;
    if (f === Float.type$) return Float.equals(a, b);
    if (f === Decimal.type$) return Decimal.equals(a, b);
    return a === b;
  }
  static compare(a, b, op) {
    if (a instanceof Obj) {
      if (b == null) return +1;
      return a.compare(b);
    }
    else if (a != null && a.fanType$ != null) {
      if (op === true && (isNaN(a) || isNaN(b))) return Number.NaN;
      return Float.compare(a, b);
    }
    else {
      if (a == null) {
        if (b != null) return -1;
        return 0;
      }
      if (b == null) return 1;
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    }
  }
  static compareNE(a,b) { return !ObjUtil.equals(a,b); }
  static compareLT(a,b) { return ObjUtil.compare(a,b,true) <  0; }
  static compareLE(a,b) { return ObjUtil.compare(a,b,true) <= 0; }
  static compareGE(a,b) { return ObjUtil.compare(a,b,true) >= 0; }
  static compareGT(a,b) { return ObjUtil.compare(a,b,true) >  0; }
  static is(obj, type) {
    if (obj == null) return false;
    return ObjUtil.typeof$(obj).is(type);
  }
  static as(obj, type) {
    if (obj == null) return null;
    type = type.toNonNullable();
    const t = ObjUtil.typeof$(obj);
    if (t.is(Func.type$)) return t.as(obj, type);
    if (t.is(List.type$)) return t.as(obj, type);
    if (t.is(Map.type$))  return t.as(obj, type);
    if (t.is(type)) return obj;
    return null;
  }
  static coerce(obj, type) {
    if (obj == null) {
      if (type.isNullable()) return obj;
      throw NullErr.make("Coerce to non-null");
    }
    const v = ObjUtil.as(obj, type);
    if (v == null) {
      const t = ObjUtil.typeof$(obj);
      throw CastErr.make(t + " cannot be cast to " + type);
    }
    return obj;
  }
  static typeof$(obj) {
    if (obj instanceof Obj) return obj.typeof$();
    else return Type.toFanType(obj);
  }
  static trap(obj, name, args) {
    if (obj instanceof Obj) return obj.trap(name, args);
    else return ObjUtil.doTrap(obj, name, args, Type.toFanType(obj));
  }
  static doTrap(obj, name, args, type) {
    const slot = type.slot(name, true);
    if (slot instanceof Method) {
      return slot.invoke(obj, args);
    }
    else
    {
      const argSize = (args == null) ? 0 : args.size();
      if (argSize == 0) return slot.get(obj);
      if (argSize == 1) {
        const val = args.get(0);
        slot.set(obj, val);
        return val;
      }
      throw ArgErr.make("Invalid number of args to get or set field '" + name + "'");
    }
  }
  static isImmutable(obj) {
    if (obj instanceof Obj) return obj.isImmutable();
    else if (obj == null) return true;
    else
    {
      if ((typeof obj) == "boolean" || obj instanceof Boolean) return true;
      if ((typeof obj) == "number"  || obj instanceof Number) return true;
      if ((typeof obj) == "string"  || obj instanceof String) return true;
      if (obj.fanType$ != null) return true;
    }
    throw UnknownTypeErr.make("Not a Fantom type: " + obj);
  }
  static toImmutable(obj) {
    if (obj instanceof Obj) return obj.toImmutable();
    else if (obj == null) return null;
    else
    {
      if ((typeof obj) == "boolean" || obj instanceof Boolean) return obj;
      if ((typeof obj) == "number"  || obj instanceof Number) return obj;
      if ((typeof obj) == "string"  || obj instanceof String) return obj;
      if (obj.fanType$ != null) return obj;
    }
    throw UnknownTypeErr.make("Not a Fantom type: " + obj);
  }
  static $with(self, f) {
    if (self instanceof Obj)
    {
      return self.$with(f);
    }
    else
    {
      f.call(self);
      return self;
    }
  }
  static toStr(obj) {
    if (obj == null) return "null";
    if (typeof obj == "string") return obj;
if (obj.fanType$ === Float.type$) return Float.toStr(obj);
    return obj.toString();
  }
  static echo(obj) {
    if (obj === undefined) obj = "";
    let s = ObjUtil.toStr(obj);
    try { console.log(s); }
    catch (e1)
    {
      try { print(s + "\n"); }
      catch (e2) {}
    }
  }
}
class StrInStream extends InStream {
  constructor(str) {
    super();
    this.#str = str;
    this.#size = str.length;
    this.#pos = 0;
    this.#pushback = null;
  }
  #str;
  #size;
  #pos;
  #pushback;
  read() {
    const b = this.rChar$();
    return (b < 0) ? null : b & 0xFF;
  }
  readBuf(buf, n) {
    for (let i=0; i<n; ++i) {
      const c = this.rChar();
      if (c < 0) return i == 0 ? null : i;
      buf.out().writeChar(c);
    }
    return n;
  }
  unread(c) {
    return this.unreadChar(c);
  }
  rChar$() {
    if (this.#pushback != null && this.#pushback.length > 0)
      return this.#pushback.pop();
    if (this.#pos >= this.#size) return -1;
    return this.#str.charCodeAt(this.#pos++);
  }
  readChar() {
    const c = this.rChar$();
    return (c < 0) ? null : c;
  }
  unreadChar(c) {
    if (this.#pushback == null) this.#pushback = [];
    this.pushback.push(c);
    return this;
  }
  close() { return true; }
}
class StrBufOutStream extends OutStream {
  constructor(buf) {
    super();
    this.#buf = buf;
  }
  #buf;
  w(v) { throw UnsupportedErr.make("binary write on StrBuf output"); }
  write(x) { throw UnsupportedErr.make("binary write on StrBuf output"); }
  writeBuf(buf, n) { throw UnsupportedErr.make("binary write on StrBuf output"); }
  writeI2(x) { throw UnsupportedErr.make("binary write on StrBuf output"); }
  writeI4(x) { throw UnsupportedErr.make("binary write on StrBuf output"); }
  writeI8(x) { throw UnsupportedErr.make("binary write on StrBuf output"); }
  writeF4(x) { throw UnsupportedErr.make("binary write on StrBuf output"); }
  writeF8(x) { throw UnsupportedErr.make("binary write on StrBuf output"); }
  writeUtf(x) { throw UnsupportedErr.make("modified UTF-8 format write on StrBuf output"); }
  writeChar(c) {
    this.#buf.addChar(c);
    return this;
  }
  writeChars(s, off=0, len=s.length-off) {
    this.#buf.add(s.substring(off, len));
    return this;
  }
  flush() { return this; }
  close() { return true; }
}
class DateTimeStr
{
  constructor(pattern="", locale=null) {
    this.pattern = pattern;
    this.loc = locale;
  }
  pattern;
  loc;
  year = 0;
  mon = null;
  day = 0;
  hour = 0;
  min = 0;
  sec = 0;
  ns = 0;
  weekday = null;
  tz = null;
  tzName = null;
  tzOffset = 0;
  dst = 0;
  str = "";
  pos = 0;
  valDateTime = null;
  valDate = null;
  static makeDateTime(pattern, locale, dt) {
    const x = new DateTimeStr(pattern, locale);
    x.valDateTime = dt;
    x.year    = dt.year();
    x.mon     = dt.month();
    x.day     = dt.day();
    x.hour    = dt.hour();
    x.min     = dt.min();
    x.sec     = dt.sec();
    x.ns      = dt.nanoSec();
    x.weekday = dt.weekday();
    x.tz      = dt.tz();
    x.dst     = dt.dst();
    return x;
  }
  static makeDate(pattern, locale, d) {
    const x = new DateTimeStr(pattern, locale);
    x.valDate = d;
    x.year    = d.year();
    x.mon     = d.month();
    x.day     = d.day();
    try { x.weekday = d.weekday(); } catch (e) {}
    return x;
  }
  static makeTime(pattern, locale, t) {
    const x = new DateTimeStr(pattern, locale);
    x.hour    = t.hour();
    x.min     = t.min();
    x.sec     = t.sec();
    x.ns      = t.nanoSec();
    return x;
  }
  static make(pattern, locale) {
    return new DateTimeStr(pattern, locale);
  }
  format() {
    let s = "";
    const len = this.pattern.length;
    for (let i=0; i<len; ++i)
    {
      let c = this.pattern.charAt(i);
      if (c == '\'') {
        let numLiterals = 0;
        while (true) {
          ++i;
          if (i >= len) throw ArgErr.make("Invalid pattern: unterminated literal");
          c = this.pattern.charAt(i);
          if (c == '\'') break;
          s += c;
          numLiterals++;
        }
        if (numLiterals == 0) s += "'";
        continue;
      }
      let n = 1;
      while (i+1<len && this.pattern.charAt(i+1) == c) { ++i; ++n; }
      let invalidNum = false;
      switch (c) {
        case 'Y':
          let y = this.year;
          switch (n)
          {
            case 2:  y %= 100; if (y < 10) s += '0';
            case 4:  s += y; break;
            default: invalidNum = true;
          }
          break;
        case 'M':
          switch (n)
          {
            case 4:
              s += this.mon.full(this.locale());
              break;
            case 3:
              s += this.mon.abbr(this.locale());
              break;
            case 2:  if (this.mon.ordinal()+1 < 10) s += '0';
            case 1:  s += this.mon.ordinal()+1; break;
            default: invalidNum = true;
          }
          break;
        case 'D':
          switch (n)
          {
            case 3:  s += this.day + DateTimeStr.daySuffix(this.day); break;
            case 2:  if (this.day < 10) s += '0';
            case 1:  s += this.day; break;
            default: invalidNum = true;
          }
          break;
        case 'W':
          switch (n)
          {
            case 4:
              s += this.weekday.full(this.locale());
              break;
            case 3:
              s += this.weekday.abbr(this.locale());
              break;
            default: invalidNum = true;
          }
          break;
        case 'Q':
          let quarter = this.mon.m_quarter;
          switch (n)
          {
            case 4:  s += quarter + DateTimeStr.daySuffix(quarter) + " " + this.quarterLabel(); break;
            case 3:  s += quarter + DateTimeStr.daySuffix(quarter); break;
            case 1:  s += quarter; break;
            default: invalidNum = true;
          }
          break;
        case 'V':
          let woy = this.weekOfYear();
          if (woy < 1) throw ArgErr.make("Week of year not available");
          switch (n)
          {
            case 3:  s += woy + DateTimeStr.daySuffix(woy); break;
            case 2:  if (woy < 10) s += '0';
            case 1:  s += woy; break;
            default: invalidNum = true;
          }
          break;
        case 'h':
        case 'k':
          var h = this.hour;
          if (c == 'k') {
            if (h == 0) h = 12;
            else if (h > 12) h -= 12;
          }
          switch (n)
          {
            case 2:  if (h < 10) s += '0';
            case 1:  s += h; break;
            default: invalidNum = true;
          }
          break;
        case 'm':
          switch (n)
          {
            case 2:  if (this.min < 10) s += '0';
            case 1:  s += this.min; break;
            default: invalidNum = true;
          }
          break;
        case 's':
          switch (n)
          {
            case 2:  if (this.sec < 10) s += '0';
            case 1:  s += this.sec; break;
            default: invalidNum = true;
          }
          break;
        case 'S':
          if (this.sec != 0 || this.ns != 0) {
            switch (n)
            {
              case 2:  if (this.sec < 10) s += '0';
              case 1:  s += this.sec; break;
              default: invalidNum = true;
            }
          }
          break;
        case 'a':
          switch (n)
          {
            case 1:  s += (this.hour < 12 ? "a"  : "p"); break;
            case 2:  s += (this.hour < 12 ? "am" : "pm"); break;
            default: invalidNum = true;
          }
          break;
        case 'A':
          switch (n) {
            case 1:  s += (this.hour < 12 ? "A"  : "P"); break;
            case 2:  s += (this.hour < 12 ? "AM" : "PM"); break;
            default: invalidNum = true;
          }
          break;
        case 'f':
        case 'F':
          let req = 0, opt = 0;
          if (c == 'F') opt = n;
          else {
            req = n;
            while (i+1<len && this.pattern.charAt(i+1) == 'F') { ++i; ++opt; }
          }
          let frac = this.ns;
          for (let x=0, tenth=100000000; x<9; ++x)
          {
            if (req > 0) req--;
            else {
              if (frac == 0 || opt <= 0) break;
              opt--;
            }
            s += Math.floor(frac / tenth);
            frac %= tenth;
            tenth  = Math.floor(tenth / 10);
          }
          break;
        case 'z':
          var rule = this.tz.rule(this.year);
          switch (n)
          {
            case 1:
              var offset = rule.offset;
              if (this.dst) offset += rule.dstOffset;
              if (offset == 0) { s += 'Z'; break; }
              if (offset < 0) { s += '-'; offset = -offset; }
              else { s += '+'; }
              var zh = Math.floor(offset / 3600);
              var zm = Math.floor((offset % 3600) / 60);
              if (zh < 10) s += '0'; s += zh + ':';
              if (zm < 10) s += '0'; s += zm;
              break;
            case 3:
              s += this.dst ? rule.dstAbbr : rule.stdAbbr;
              break;
            case 4:
              s += this.tz.$name();
              break;
            default:
              invalidNum = true;
              break;
          }
          break;
        default:
          if (Int.isAlpha(c.charCodeAt(0)))
            throw fan.sys.ArgErr.make("Invalid pattern: unsupported char '" + c + "'");
          if (i+1 < len) {
            let next = this.pattern.charAt(i+1);
            if (next  == 'F' && this.ns == 0) break;
            if (next == 'S' && this.sec == 0 && this.ns == 0) break;
          }
          s += c;
      }
      if (invalidNum)
        throw ArgErr.make("Invalid pattern: unsupported num of '" + c + "' (x" + n + ")");
    }
    return s;
  }
  static daySuffix(day) {
    if (day == 11 || day == 12 || day == 13) return "th";
    switch (day % 10)
    {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
  }
  parseDateTime(s, defTz, checked=true) {
    try {
      this.tzOffset = null;
      this.parse(s);
      let defRule = defTz.rule(this.year);
      if (this.tzName != null) {
        if (this.tzName == defTz.$name() ||
            this.tzName == defRule.stdAbbr ||
            this.tzName == defRule.dstAbbr)
        {
          this.tz = defTz;
        }
        else
        {
          this.tz = TimeZone.fromStr(this.tzName, false);
          if (this.tz == null) this.tz = defTz;
        }
      }
      else if (this.tzOffset != null) {
        const time = this.hour*3600 + this.min*60 + this.sec;
        const defOffset = defRule.offset + TimeZone.dstOffset(defRule, this.year, this.mon.ordinal(), this.day, time);
        if (this.tzOffset == defOffset)
          this.tz = defTz;
        else
          this.tz = TimeZone.fromGmtOffset(this.tzOffset);
      }
      else this.tz = defTz;
      return DateTime.doMake$(this.year, this.mon, this.day, this.hour, this.min, this.sec, this.ns, this.tzOffset, this.tz);
    }
    catch (err) {
      if (checked) throw ParseErr.makeStr("DateTime", s, Err.make(err));
      return null;
    }
  }
  parseDate(s, checked=true) {
    try {
      this.parse(s);
      return Date.make(this.year, this.mon, this.day);
    }
    catch (err) {
      if (checked) throw ParseErr.makeStr("Date", s, Err.make(err));
      return null;
    }
  }
  parseTime(s, checked=true) {
    try {
      this.parse(s);
      return Time.make(this.hour, this.min, this.sec, this.ns);
    }
    catch (err) {
      if (checked) throw ParseErr.makeStr("Time", s, Err.make(err));
      return null;
    }
  }
  parse(s) {
    this.str = s;
    this.pos = 0;
    const len = this.pattern.length;
    let skippedLast = false;
    for (let i=0; i<len; ++i) {
      let c = this.pattern.charAt(i);
      let n = 1;
      while (i+1<len && this.pattern.charAt(i+1) == c) { ++i; ++n; }
      switch (c)
      {
        case 'Y':
          this.year = this.parseInt(n);
          if (this.year < 30) this.year += 2000;
          else if (this.year < 100) this.year += 1900;
          break;
        case 'M':
          switch (n)
          {
            case 4:  this.mon = this.parseMon(); break;
            case 3:  this.mon = this.parseMon(); break;
            default: this.mon = Month.vals().get(this.parseInt(n)-1); break;
          }
          break;
        case 'D':
          if (n != 3) this.day = this.parseInt(n);
          else
          {
            this.day = this.parseInt(1);
            this.skipWord();
          }
          break;
        case 'h':
        case 'k':
          this.hour = this.parseInt(n);
          break;
        case 'm':
          this.min = this.parseInt(n);
          break;
        case 's':
          this.sec = this.parseInt(n);
          break;
        case 'S':
          if (!skippedLast) this.sec = this.parseInt(n);
          break;
        case 'a':
        case 'A':
          var amPm = this.str.charAt(this.pos); this.pos += n;
          if (amPm == 'P' || amPm == 'p')
          {
            if (this.hour < 12) this.hour += 12;
          }
          else
          {
            if (this.hour == 12) this.hour = 0;
          }
          break;
        case 'W':
          this.skipWord();
          break;
        case 'F':
          if (skippedLast) break;
        case 'f':
          this.ns = 0;
          var tenth = 100000000;
          while (true) {
            let digit = this.parseOptDigit();
            if (digit < 0) break;
            this.ns += tenth * digit;
            tenth = Math.floor(tenth / 10);
          }
          break;
        case 'z':
          switch (n)
          {
            case 1:  this.parseTzOffset(); break;
            default: this.parseTzName();
          }
          break;
        case '\'':
          if (n == 2) {
            const actual = this.str.charAt(this.pos++);
            if (actual != '\'')
              throw Err.make("Expected single quote, not '" + actual + "' [pos " + this.pos +"]");
          }
          else {
            while (true) {
              const expected = this.pattern.charAt(++i);
              if (expected == '\'') break;
              const actual = this.str.charAt(this.pos++);
              if (actual != expected)
                throw Err.make("Expected '" + expected + "', not '" + actual + "' [pos " + this.pos +"]");
            }
          }
          break;
        default:
          const match = this.pos+1 < this.str.length ? this.str.charAt(this.pos++) : 0;
          if (i+1 < this.pattern.length) {
            const next = this.pattern.charAt(i+1);
            if (next == 'F' || next == 'S') {
              if (match != c) { skippedLast = true; --this.pos; break; }
            }
          }
          skippedLast = false;
          if (match != c)
            throw Err.make("Expected '" + c + "' literal char, not '" + match + "' [pos " + this.pos +"]");
      }
    }
  }
  parseInt(n) {
    let num = 0;
    for (let i=0; i<n; ++i) num = num*10 + this.parseReqDigit();
    if (n == 1) {
      const digit = this.parseOptDigit();
      if (digit >= 0) num = num*10 + digit;
    }
    return num;
  }
  parseReqDigit() {
    const ch = this.str.charCodeAt(this.pos++);
    if (48 <= ch && ch <= 57) return ch - 48;
    throw Err.make("Expected digit, not '" + String.fromCharCode(ch) + "' [pos " + (this.pos-1) + "]");
  }
  parseOptDigit() {
    if (this.pos < this.str.length) {
      const ch = this.str.charCodeAt(this.pos);
      if (48 <= ch && ch <= 57) { this.pos++; return ch-48; }
    }
    return -1;
  }
  parseMon() {
    let s = "";
    while (this.pos < this.str.length) {
      const ch = this.str.charCodeAt(this.pos);
      if (97 <= ch && ch <= 122) { s += String.fromCharCode(ch); this.pos++; continue; }
      if (65 <= ch && ch <= 90)  { s += String.fromCharCode(Int.lower(ch)); this.pos++; continue; }
      break;
    }
    const m = this.locale().monthByName$(s);
    if (m == null) throw Err.make("Invalid month: " + s);
    return m;
  }
  parseTzOffset() {
    let ch = this.str.charAt(this.pos++);
    let neg = false;
    switch (ch)
    {
      case '-': neg = true; break;
      case '+': neg = false; break;
      case 'Z': this.tzOffset = 0; return;
      default: throw Err.make("Unexpected tz offset char: " + ch + " [pos " + (this.pos-1) + "]");
    }
    let hr = this.parseInt(1);
    let min = 0;
    if (this.pos < this.str.length) {
      ch = this.str.charCodeAt(this.pos);
      if (ch == 58) {
        this.pos++;
        min = this.parseInt(1);
      }
      else if (48 <= ch && ch <= 57) {
        min = this.parseInt(1);
      }
    }
    this.tzOffset = hr*3600 + min*60;
    if (neg) this.tzOffset = -this.tzOffset;
  }
  parseTzName() {
    let s = "";
    while (this.pos < this.str.length) {
      const ch = this.str.charCodeAt(this.pos);
      if ((97 <= ch && ch <= 122) ||
          (65 <= ch && ch <= 90) ||
          (48 <= ch && ch <= 57) ||
          ch == 43 || ch == 45 || ch == 95)
      {
        s += String.fromCharCode(ch);
        this.pos++;
      }
      else break;
    }
    this.tzName = s;
  }
  skipWord() {
    while (this.pos < this.str.length) {
      const ch = this.str.charCodeAt(this.pos);
      if ((97 <= ch && ch <= 122) || (65 <= ch && ch <= 90))
        this.pos++;
      else
        break;
    }
  }
  locale() {
    if (this.loc == null) this.loc = Locale.cur();
    return this.loc;
  }
  weekOfYear()
  {
    const sow = Weekday.localeStartOfWeek(this.locale());
    if (this.valDateTime !== undefined) return this.valDateTime.weekOfYear(sow);
    if (this.valDate !== undefined)     return this.valDate.weekOfYear(sow);
    return 0;
  }
  quarterLabel() {
    return Env.cur().locale(Pod.find("sys"), "quarter", "Quarter", this.locale());
  }
}
Pod.sysPod$ = Pod.find("sys");
NumPattern.cache$("00");    NumPattern.cache$("000");       NumPattern.cache$("0000");
NumPattern.cache$("0.0");   NumPattern.cache$("0.00");      NumPattern.cache$("0.000");
NumPattern.cache$("0.#");   NumPattern.cache$("#,###.0");   NumPattern.cache$("#,###.#");
NumPattern.cache$("0.##");  NumPattern.cache$("#,###.00");  NumPattern.cache$("#,###.##");
NumPattern.cache$("0.###"); NumPattern.cache$("#,###.000"); NumPattern.cache$("#,###.###");
NumPattern.cache$("0.0#");  NumPattern.cache$("#,###.0#");  NumPattern.cache$("#,###.0#");
NumPattern.cache$("0.0##"); NumPattern.cache$("#,###.0##"); NumPattern.cache$("#,###.0##");
export {
Obj,
Facet,
Deprecated,
FacetMeta,
Js,
NoDoc,
Operator,
Serializable,
Transient,
TimeZone,
Uri,
Num,
Int,
Err,
ArgErr,
CancelledErr,
CastErr,
ConstErr,
FieldNotSetErr,
IndexErr,
InterruptedErr,
IOErr,
NameErr,
NotImmutableErr,
NullErr,
ParseErr,
ReadonlyErr,
TestErr,
TimeoutErr,
UnknownKeyErr,
UnknownPodErr,
UnknownServiceErr,
UnknownSlotErr,
UnknownFacetErr,
UnknownTypeErr,
UnresolvedErr,
UnsupportedErr,
Unsafe,
Pod,
Void,
Version,
Date,
Enum,
Endian,
Test,
Duration,
Decimal,
Locale,
This,
StrBuf,
LogRec,
Func,
Range,
Log,
Weekday,
Buf,
ConstBuf,
Charset,
Zip,
Depend,
Str,
Bool,
MimeType,
Type,
Regex,
OutStream,
LogLevel,
Time,
Month,
DateTime,
List,
FileStore,
LocalFileStore,
Unit,
RegexMatcher,
Slot,
Field,
Method,
Uuid,
InStream,
File,
Env,
Map,
Param,
Float,
Service,
ObjUtil,
};
