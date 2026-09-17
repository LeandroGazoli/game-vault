import fs from "node:fs";
import path from "node:path";

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  let content = fs.readFileSync(filePath, "utf8");

  let modified = false;

  // 1. Patch unminified @protobufjs/codegen
  const isCrlf = content.includes("\r\n");
  const normalized = content.replace(/\r\n/g, "\n");

  const searchPattern = `            if (formatStringOrScope) {
                var scopeKeys   = Object.keys(formatStringOrScope),
                    scopeParams = new Array(scopeKeys.length + 1),
                    scopeValues = new Array(scopeKeys.length),
                    scopeOffset = 0;
                while (scopeOffset < scopeKeys.length) {
                    scopeParams[scopeOffset] = scopeKeys[scopeOffset];
                    scopeValues[scopeOffset] = formatStringOrScope[scopeKeys[scopeOffset++]];
                }
                scopeParams[scopeOffset] = source;
                return Function.apply(null, scopeParams).apply(null, scopeValues); // eslint-disable-line no-new-func
            }
            return Function(source)(); // eslint-disable-line no-new-func`;

  const replacement = `            try {
                if (formatStringOrScope) {
                    var scopeKeys   = Object.keys(formatStringOrScope),
                        scopeParams = new Array(scopeKeys.length + 1),
                        scopeValues = new Array(scopeKeys.length),
                        scopeOffset = 0;
                    while (scopeOffset < scopeKeys.length) {
                        scopeParams[scopeOffset] = scopeKeys[scopeOffset];
                        scopeValues[scopeOffset] = formatStringOrScope[scopeKeys[scopeOffset++]];
                    }
                    scopeParams[scopeOffset] = source;
                    return Function.apply(null, scopeParams).apply(null, scopeValues); // eslint-disable-line no-new-func
                }
                return Function(source)(); // eslint-disable-line no-new-func
            } catch (err) {
                var _bodyLines = body.slice();
                var isCtor = functionParams && functionParams.length === 1 && functionParams[0] === "p";
                var isFromObject = functionName && functionName.endsWith("$fromObject");
                var isToObject = functionName && functionName.endsWith("$toObject");

                if (isFromObject) {
                    return function(d) {
                        if (d instanceof this.ctor) return d;
                        return new this.ctor(d);
                    };
                }
                if (isToObject) {
                    return function(m) {
                        return m || {};
                    };
                }
                return function(p) {
                    for (var _b = 0; _b < _bodyLines.length; ++_b) {
                        var _line = _bodyLines[_b];
                        var _mA = _line.match(/^this(?:\\.([a-zA-Z0-9_$]+)|\\["([^"]+)"\\])=\\[\\]$/);
                        if (_mA) this[_mA[1] || _mA[2]] = [];
                        var _mO = _line.match(/^this(?:\\.([a-zA-Z0-9_$]+)|\\["([^"]+)"\\])={}$/);
                        if (_mO) this[_mO[1] || _mO[2]] = {};
                    }
                    if (p && typeof p === "object") {
                        for (var k in p) {
                            if (Object.prototype.hasOwnProperty.call(p, k) && k !== "__proto__" && p[k] != null) {
                                this[k] = p[k];
                            }
                        }
                    }
                };
            }`;

  if (normalized.includes(searchPattern)) {
    const patched = normalized.replace(searchPattern, replacement);
    content = isCrlf ? patched.replace(/\n/g, "\r\n") : patched;
    modified = true;
  }

  // 2. Patch minified bundle chunks in .next and .open-next
  // Note: in minified chunk, function signature is function c3(a4,d2){... e4=[] ...}
  // where a4 is functionParams, d2 is functionName, e4 is body
  const minifiedFallback = `catch{var _isF=d2&&d2.endsWith("$fromObject"),_isT=d2&&d2.endsWith("$toObject");if(_isF)return function(d){if(d instanceof this.ctor)return d;return new this.ctor(d)};if(_isT)return function(m){return m||{}};return function(p){if(e4)for(var _b=0;_b<e4.length;++_b){var _l=e4[_b],_mA=_l.match(/^this(?:\\.([a-zA-Z0-9_$]+)|\\["([^"]+)"\\])=\\[\\]$/);_mA&&(this[_mA[1]||_mA[2]]=[]);var _mO=_l.match(/^this(?:\\.([a-zA-Z0-9_$]+)|\\["([^"]+)"\\])={}$/);_mO&&(this[_mO[1]||_mO[2]]={})}if(p&&typeof p==="object")for(var k in p)Object.prototype.hasOwnProperty.call(p,k)&&k!=="__proto__"&&p[k]!=null&&(this[k]=p[k])}}`;

  // Pattern A: unpatched minified Function
  const minSearch1 = `h3[j2]=b3,Function.apply(null,h3).apply(null,i5)}return Function(b3)()`;
  const minReplace1 = `h3[j2]=b3;try{return Function.apply(null,h3).apply(null,i5)}` + minifiedFallback + `}try{return Function(b3)()}` + minifiedFallback;

  if (content.includes(minSearch1)) {
    content = content.replace(new RegExp(minSearch1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "g"), minReplace1);
    modified = true;
  }

  // Pattern B: previous simple fallback
  const prevPatternRegex = /catch\{return function\(p\)\{if\(e4\)for.*?Object\.prototype\.hasOwnProperty\.call\(p,k\)&&k!=="__proto__"&&p\[k\]!=null&&\(this\[k\]=p\[k\]\)\}\}/g;
  if (prevPatternRegex.test(content)) {
    content = content.replace(prevPatternRegex, minifiedFallback);
    modified = true;
  }

  const prevPatternRegexSimple = /catch\{return function\(p\)\{if\(p&&typeof p==="object"\)for\(var k in p\)Object\.prototype\.hasOwnProperty\.call\(p,k\)&&k!=="__proto__"&&p\[k\]!=null&&\(this\[k\]=p\[k\]\)\}\}/g;
  if (prevPatternRegexSimple.test(content)) {
    content = content.replace(prevPatternRegexSimple, minifiedFallback);
    modified = true;
  }

  // 3. Patch minimal.js unfreezing util.emptyArray and util.emptyObject
  const freezeSearchArray = `util.emptyArray = Object.freeze ? Object.freeze([]) : /* istanbul ignore next */ [];`;
  const freezeReplaceArray = `util.emptyArray = [];`;
  if (content.includes(freezeSearchArray)) {
    content = content.replace(freezeSearchArray, freezeReplaceArray);
    modified = true;
  }

  const freezeSearchObject = `util.emptyObject = Object.freeze ? Object.freeze({}) : /* istanbul ignore next */ {};`;
  const freezeReplaceObject = `util.emptyObject = {};`;
  if (content.includes(freezeSearchObject)) {
    content = content.replace(freezeSearchObject, freezeReplaceObject);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log("Patched:", filePath);
    return true;
  }

  return false;
}

// Walk directories
function walkAndPatch(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkAndPatch(fullPath);
    } else if (entry.name.endsWith(".js") || entry.name.endsWith(".mjs")) {
      patchFile(fullPath);
    }
  }
}

// 1. Patch node_modules
walkAndPatch(path.resolve("node_modules/@protobufjs"));
walkAndPatch(path.resolve("node_modules/protobufjs"));

// 2. Patch .next and .open-next
walkAndPatch(path.resolve(".next"));
walkAndPatch(path.resolve(".open-next"));
