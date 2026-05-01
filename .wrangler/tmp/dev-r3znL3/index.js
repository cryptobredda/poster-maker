var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// .wrangler/tmp/bundle-2fOxmH/checked-fetch.js
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
var urls;
var init_checked_fetch = __esm({
  ".wrangler/tmp/bundle-2fOxmH/checked-fetch.js"() {
    "use strict";
    urls = /* @__PURE__ */ new Set();
    __name(checkURL, "checkURL");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        const [request, init] = argArray;
        checkURL(request, init);
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
});

// wrangler-modules-watch:wrangler:modules-watch
var init_wrangler_modules_watch = __esm({
  "wrangler-modules-watch:wrangler:modules-watch"() {
    init_checked_fetch();
    init_modules_watch_stub();
  }
});

// node_modules/wrangler/templates/modules-watch-stub.js
var init_modules_watch_stub = __esm({
  "node_modules/wrangler/templates/modules-watch-stub.js"() {
    init_wrangler_modules_watch();
  }
});

// node_modules/pako/lib/utils/common.js
var require_common = __commonJS({
  "node_modules/pako/lib/utils/common.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    var TYPED_OK = typeof Uint8Array !== "undefined" && typeof Uint16Array !== "undefined" && typeof Int32Array !== "undefined";
    function _has(obj, key) {
      return Object.prototype.hasOwnProperty.call(obj, key);
    }
    __name(_has, "_has");
    exports.assign = function(obj) {
      var sources = Array.prototype.slice.call(arguments, 1);
      while (sources.length) {
        var source = sources.shift();
        if (!source) {
          continue;
        }
        if (typeof source !== "object") {
          throw new TypeError(source + "must be non-object");
        }
        for (var p in source) {
          if (_has(source, p)) {
            obj[p] = source[p];
          }
        }
      }
      return obj;
    };
    exports.shrinkBuf = function(buf, size) {
      if (buf.length === size) {
        return buf;
      }
      if (buf.subarray) {
        return buf.subarray(0, size);
      }
      buf.length = size;
      return buf;
    };
    var fnTyped = {
      arraySet: /* @__PURE__ */ __name(function(dest, src, src_offs, len, dest_offs) {
        if (src.subarray && dest.subarray) {
          dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
          return;
        }
        for (var i = 0; i < len; i++) {
          dest[dest_offs + i] = src[src_offs + i];
        }
      }, "arraySet"),
      // Join array of chunks to single array.
      flattenChunks: /* @__PURE__ */ __name(function(chunks) {
        var i, l, len, pos, chunk, result;
        len = 0;
        for (i = 0, l = chunks.length; i < l; i++) {
          len += chunks[i].length;
        }
        result = new Uint8Array(len);
        pos = 0;
        for (i = 0, l = chunks.length; i < l; i++) {
          chunk = chunks[i];
          result.set(chunk, pos);
          pos += chunk.length;
        }
        return result;
      }, "flattenChunks")
    };
    var fnUntyped = {
      arraySet: /* @__PURE__ */ __name(function(dest, src, src_offs, len, dest_offs) {
        for (var i = 0; i < len; i++) {
          dest[dest_offs + i] = src[src_offs + i];
        }
      }, "arraySet"),
      // Join array of chunks to single array.
      flattenChunks: /* @__PURE__ */ __name(function(chunks) {
        return [].concat.apply([], chunks);
      }, "flattenChunks")
    };
    exports.setTyped = function(on) {
      if (on) {
        exports.Buf8 = Uint8Array;
        exports.Buf16 = Uint16Array;
        exports.Buf32 = Int32Array;
        exports.assign(exports, fnTyped);
      } else {
        exports.Buf8 = Array;
        exports.Buf16 = Array;
        exports.Buf32 = Array;
        exports.assign(exports, fnUntyped);
      }
    };
    exports.setTyped(TYPED_OK);
  }
});

// node_modules/pako/lib/zlib/trees.js
var require_trees = __commonJS({
  "node_modules/pako/lib/zlib/trees.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    var utils = require_common();
    var Z_FIXED = 4;
    var Z_BINARY = 0;
    var Z_TEXT = 1;
    var Z_UNKNOWN = 2;
    function zero(buf) {
      var len = buf.length;
      while (--len >= 0) {
        buf[len] = 0;
      }
    }
    __name(zero, "zero");
    var STORED_BLOCK = 0;
    var STATIC_TREES = 1;
    var DYN_TREES = 2;
    var MIN_MATCH = 3;
    var MAX_MATCH = 258;
    var LENGTH_CODES = 29;
    var LITERALS = 256;
    var L_CODES = LITERALS + 1 + LENGTH_CODES;
    var D_CODES = 30;
    var BL_CODES = 19;
    var HEAP_SIZE = 2 * L_CODES + 1;
    var MAX_BITS = 15;
    var Buf_size = 16;
    var MAX_BL_BITS = 7;
    var END_BLOCK = 256;
    var REP_3_6 = 16;
    var REPZ_3_10 = 17;
    var REPZ_11_138 = 18;
    var extra_lbits = (
      /* extra bits for each length code */
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]
    );
    var extra_dbits = (
      /* extra bits for each distance code */
      [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]
    );
    var extra_blbits = (
      /* extra bits for each bit length code */
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7]
    );
    var bl_order = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
    var DIST_CODE_LEN = 512;
    var static_ltree = new Array((L_CODES + 2) * 2);
    zero(static_ltree);
    var static_dtree = new Array(D_CODES * 2);
    zero(static_dtree);
    var _dist_code = new Array(DIST_CODE_LEN);
    zero(_dist_code);
    var _length_code = new Array(MAX_MATCH - MIN_MATCH + 1);
    zero(_length_code);
    var base_length = new Array(LENGTH_CODES);
    zero(base_length);
    var base_dist = new Array(D_CODES);
    zero(base_dist);
    function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {
      this.static_tree = static_tree;
      this.extra_bits = extra_bits;
      this.extra_base = extra_base;
      this.elems = elems;
      this.max_length = max_length;
      this.has_stree = static_tree && static_tree.length;
    }
    __name(StaticTreeDesc, "StaticTreeDesc");
    var static_l_desc;
    var static_d_desc;
    var static_bl_desc;
    function TreeDesc(dyn_tree, stat_desc) {
      this.dyn_tree = dyn_tree;
      this.max_code = 0;
      this.stat_desc = stat_desc;
    }
    __name(TreeDesc, "TreeDesc");
    function d_code(dist) {
      return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
    }
    __name(d_code, "d_code");
    function put_short(s, w) {
      s.pending_buf[s.pending++] = w & 255;
      s.pending_buf[s.pending++] = w >>> 8 & 255;
    }
    __name(put_short, "put_short");
    function send_bits(s, value, length) {
      if (s.bi_valid > Buf_size - length) {
        s.bi_buf |= value << s.bi_valid & 65535;
        put_short(s, s.bi_buf);
        s.bi_buf = value >> Buf_size - s.bi_valid;
        s.bi_valid += length - Buf_size;
      } else {
        s.bi_buf |= value << s.bi_valid & 65535;
        s.bi_valid += length;
      }
    }
    __name(send_bits, "send_bits");
    function send_code(s, c, tree) {
      send_bits(
        s,
        tree[c * 2],
        tree[c * 2 + 1]
        /*.Len*/
      );
    }
    __name(send_code, "send_code");
    function bi_reverse(code, len) {
      var res = 0;
      do {
        res |= code & 1;
        code >>>= 1;
        res <<= 1;
      } while (--len > 0);
      return res >>> 1;
    }
    __name(bi_reverse, "bi_reverse");
    function bi_flush(s) {
      if (s.bi_valid === 16) {
        put_short(s, s.bi_buf);
        s.bi_buf = 0;
        s.bi_valid = 0;
      } else if (s.bi_valid >= 8) {
        s.pending_buf[s.pending++] = s.bi_buf & 255;
        s.bi_buf >>= 8;
        s.bi_valid -= 8;
      }
    }
    __name(bi_flush, "bi_flush");
    function gen_bitlen(s, desc) {
      var tree = desc.dyn_tree;
      var max_code = desc.max_code;
      var stree = desc.stat_desc.static_tree;
      var has_stree = desc.stat_desc.has_stree;
      var extra = desc.stat_desc.extra_bits;
      var base = desc.stat_desc.extra_base;
      var max_length = desc.stat_desc.max_length;
      var h;
      var n, m;
      var bits;
      var xbits;
      var f;
      var overflow = 0;
      for (bits = 0; bits <= MAX_BITS; bits++) {
        s.bl_count[bits] = 0;
      }
      tree[s.heap[s.heap_max] * 2 + 1] = 0;
      for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
        n = s.heap[h];
        bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
        if (bits > max_length) {
          bits = max_length;
          overflow++;
        }
        tree[n * 2 + 1] = bits;
        if (n > max_code) {
          continue;
        }
        s.bl_count[bits]++;
        xbits = 0;
        if (n >= base) {
          xbits = extra[n - base];
        }
        f = tree[n * 2];
        s.opt_len += f * (bits + xbits);
        if (has_stree) {
          s.static_len += f * (stree[n * 2 + 1] + xbits);
        }
      }
      if (overflow === 0) {
        return;
      }
      do {
        bits = max_length - 1;
        while (s.bl_count[bits] === 0) {
          bits--;
        }
        s.bl_count[bits]--;
        s.bl_count[bits + 1] += 2;
        s.bl_count[max_length]--;
        overflow -= 2;
      } while (overflow > 0);
      for (bits = max_length; bits !== 0; bits--) {
        n = s.bl_count[bits];
        while (n !== 0) {
          m = s.heap[--h];
          if (m > max_code) {
            continue;
          }
          if (tree[m * 2 + 1] !== bits) {
            s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
            tree[m * 2 + 1] = bits;
          }
          n--;
        }
      }
    }
    __name(gen_bitlen, "gen_bitlen");
    function gen_codes(tree, max_code, bl_count) {
      var next_code = new Array(MAX_BITS + 1);
      var code = 0;
      var bits;
      var n;
      for (bits = 1; bits <= MAX_BITS; bits++) {
        next_code[bits] = code = code + bl_count[bits - 1] << 1;
      }
      for (n = 0; n <= max_code; n++) {
        var len = tree[n * 2 + 1];
        if (len === 0) {
          continue;
        }
        tree[n * 2] = bi_reverse(next_code[len]++, len);
      }
    }
    __name(gen_codes, "gen_codes");
    function tr_static_init() {
      var n;
      var bits;
      var length;
      var code;
      var dist;
      var bl_count = new Array(MAX_BITS + 1);
      length = 0;
      for (code = 0; code < LENGTH_CODES - 1; code++) {
        base_length[code] = length;
        for (n = 0; n < 1 << extra_lbits[code]; n++) {
          _length_code[length++] = code;
        }
      }
      _length_code[length - 1] = code;
      dist = 0;
      for (code = 0; code < 16; code++) {
        base_dist[code] = dist;
        for (n = 0; n < 1 << extra_dbits[code]; n++) {
          _dist_code[dist++] = code;
        }
      }
      dist >>= 7;
      for (; code < D_CODES; code++) {
        base_dist[code] = dist << 7;
        for (n = 0; n < 1 << extra_dbits[code] - 7; n++) {
          _dist_code[256 + dist++] = code;
        }
      }
      for (bits = 0; bits <= MAX_BITS; bits++) {
        bl_count[bits] = 0;
      }
      n = 0;
      while (n <= 143) {
        static_ltree[n * 2 + 1] = 8;
        n++;
        bl_count[8]++;
      }
      while (n <= 255) {
        static_ltree[n * 2 + 1] = 9;
        n++;
        bl_count[9]++;
      }
      while (n <= 279) {
        static_ltree[n * 2 + 1] = 7;
        n++;
        bl_count[7]++;
      }
      while (n <= 287) {
        static_ltree[n * 2 + 1] = 8;
        n++;
        bl_count[8]++;
      }
      gen_codes(static_ltree, L_CODES + 1, bl_count);
      for (n = 0; n < D_CODES; n++) {
        static_dtree[n * 2 + 1] = 5;
        static_dtree[n * 2] = bi_reverse(n, 5);
      }
      static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
      static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES, MAX_BITS);
      static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES, MAX_BL_BITS);
    }
    __name(tr_static_init, "tr_static_init");
    function init_block(s) {
      var n;
      for (n = 0; n < L_CODES; n++) {
        s.dyn_ltree[n * 2] = 0;
      }
      for (n = 0; n < D_CODES; n++) {
        s.dyn_dtree[n * 2] = 0;
      }
      for (n = 0; n < BL_CODES; n++) {
        s.bl_tree[n * 2] = 0;
      }
      s.dyn_ltree[END_BLOCK * 2] = 1;
      s.opt_len = s.static_len = 0;
      s.last_lit = s.matches = 0;
    }
    __name(init_block, "init_block");
    function bi_windup(s) {
      if (s.bi_valid > 8) {
        put_short(s, s.bi_buf);
      } else if (s.bi_valid > 0) {
        s.pending_buf[s.pending++] = s.bi_buf;
      }
      s.bi_buf = 0;
      s.bi_valid = 0;
    }
    __name(bi_windup, "bi_windup");
    function copy_block(s, buf, len, header) {
      bi_windup(s);
      if (header) {
        put_short(s, len);
        put_short(s, ~len);
      }
      utils.arraySet(s.pending_buf, s.window, buf, len, s.pending);
      s.pending += len;
    }
    __name(copy_block, "copy_block");
    function smaller(tree, n, m, depth) {
      var _n2 = n * 2;
      var _m2 = m * 2;
      return tree[_n2] < tree[_m2] || tree[_n2] === tree[_m2] && depth[n] <= depth[m];
    }
    __name(smaller, "smaller");
    function pqdownheap(s, tree, k) {
      var v = s.heap[k];
      var j = k << 1;
      while (j <= s.heap_len) {
        if (j < s.heap_len && smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
          j++;
        }
        if (smaller(tree, v, s.heap[j], s.depth)) {
          break;
        }
        s.heap[k] = s.heap[j];
        k = j;
        j <<= 1;
      }
      s.heap[k] = v;
    }
    __name(pqdownheap, "pqdownheap");
    function compress_block(s, ltree, dtree) {
      var dist;
      var lc;
      var lx = 0;
      var code;
      var extra;
      if (s.last_lit !== 0) {
        do {
          dist = s.pending_buf[s.d_buf + lx * 2] << 8 | s.pending_buf[s.d_buf + lx * 2 + 1];
          lc = s.pending_buf[s.l_buf + lx];
          lx++;
          if (dist === 0) {
            send_code(s, lc, ltree);
          } else {
            code = _length_code[lc];
            send_code(s, code + LITERALS + 1, ltree);
            extra = extra_lbits[code];
            if (extra !== 0) {
              lc -= base_length[code];
              send_bits(s, lc, extra);
            }
            dist--;
            code = d_code(dist);
            send_code(s, code, dtree);
            extra = extra_dbits[code];
            if (extra !== 0) {
              dist -= base_dist[code];
              send_bits(s, dist, extra);
            }
          }
        } while (lx < s.last_lit);
      }
      send_code(s, END_BLOCK, ltree);
    }
    __name(compress_block, "compress_block");
    function build_tree(s, desc) {
      var tree = desc.dyn_tree;
      var stree = desc.stat_desc.static_tree;
      var has_stree = desc.stat_desc.has_stree;
      var elems = desc.stat_desc.elems;
      var n, m;
      var max_code = -1;
      var node;
      s.heap_len = 0;
      s.heap_max = HEAP_SIZE;
      for (n = 0; n < elems; n++) {
        if (tree[n * 2] !== 0) {
          s.heap[++s.heap_len] = max_code = n;
          s.depth[n] = 0;
        } else {
          tree[n * 2 + 1] = 0;
        }
      }
      while (s.heap_len < 2) {
        node = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0;
        tree[node * 2] = 1;
        s.depth[node] = 0;
        s.opt_len--;
        if (has_stree) {
          s.static_len -= stree[node * 2 + 1];
        }
      }
      desc.max_code = max_code;
      for (n = s.heap_len >> 1; n >= 1; n--) {
        pqdownheap(s, tree, n);
      }
      node = elems;
      do {
        n = s.heap[
          1
          /*SMALLEST*/
        ];
        s.heap[
          1
          /*SMALLEST*/
        ] = s.heap[s.heap_len--];
        pqdownheap(
          s,
          tree,
          1
          /*SMALLEST*/
        );
        m = s.heap[
          1
          /*SMALLEST*/
        ];
        s.heap[--s.heap_max] = n;
        s.heap[--s.heap_max] = m;
        tree[node * 2] = tree[n * 2] + tree[m * 2];
        s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
        tree[n * 2 + 1] = tree[m * 2 + 1] = node;
        s.heap[
          1
          /*SMALLEST*/
        ] = node++;
        pqdownheap(
          s,
          tree,
          1
          /*SMALLEST*/
        );
      } while (s.heap_len >= 2);
      s.heap[--s.heap_max] = s.heap[
        1
        /*SMALLEST*/
      ];
      gen_bitlen(s, desc);
      gen_codes(tree, max_code, s.bl_count);
    }
    __name(build_tree, "build_tree");
    function scan_tree(s, tree, max_code) {
      var n;
      var prevlen = -1;
      var curlen;
      var nextlen = tree[0 * 2 + 1];
      var count = 0;
      var max_count = 7;
      var min_count = 4;
      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      }
      tree[(max_code + 1) * 2 + 1] = 65535;
      for (n = 0; n <= max_code; n++) {
        curlen = nextlen;
        nextlen = tree[(n + 1) * 2 + 1];
        if (++count < max_count && curlen === nextlen) {
          continue;
        } else if (count < min_count) {
          s.bl_tree[curlen * 2] += count;
        } else if (curlen !== 0) {
          if (curlen !== prevlen) {
            s.bl_tree[curlen * 2]++;
          }
          s.bl_tree[REP_3_6 * 2]++;
        } else if (count <= 10) {
          s.bl_tree[REPZ_3_10 * 2]++;
        } else {
          s.bl_tree[REPZ_11_138 * 2]++;
        }
        count = 0;
        prevlen = curlen;
        if (nextlen === 0) {
          max_count = 138;
          min_count = 3;
        } else if (curlen === nextlen) {
          max_count = 6;
          min_count = 3;
        } else {
          max_count = 7;
          min_count = 4;
        }
      }
    }
    __name(scan_tree, "scan_tree");
    function send_tree(s, tree, max_code) {
      var n;
      var prevlen = -1;
      var curlen;
      var nextlen = tree[0 * 2 + 1];
      var count = 0;
      var max_count = 7;
      var min_count = 4;
      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      }
      for (n = 0; n <= max_code; n++) {
        curlen = nextlen;
        nextlen = tree[(n + 1) * 2 + 1];
        if (++count < max_count && curlen === nextlen) {
          continue;
        } else if (count < min_count) {
          do {
            send_code(s, curlen, s.bl_tree);
          } while (--count !== 0);
        } else if (curlen !== 0) {
          if (curlen !== prevlen) {
            send_code(s, curlen, s.bl_tree);
            count--;
          }
          send_code(s, REP_3_6, s.bl_tree);
          send_bits(s, count - 3, 2);
        } else if (count <= 10) {
          send_code(s, REPZ_3_10, s.bl_tree);
          send_bits(s, count - 3, 3);
        } else {
          send_code(s, REPZ_11_138, s.bl_tree);
          send_bits(s, count - 11, 7);
        }
        count = 0;
        prevlen = curlen;
        if (nextlen === 0) {
          max_count = 138;
          min_count = 3;
        } else if (curlen === nextlen) {
          max_count = 6;
          min_count = 3;
        } else {
          max_count = 7;
          min_count = 4;
        }
      }
    }
    __name(send_tree, "send_tree");
    function build_bl_tree(s) {
      var max_blindex;
      scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
      scan_tree(s, s.dyn_dtree, s.d_desc.max_code);
      build_tree(s, s.bl_desc);
      for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
        if (s.bl_tree[bl_order[max_blindex] * 2 + 1] !== 0) {
          break;
        }
      }
      s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
      return max_blindex;
    }
    __name(build_bl_tree, "build_bl_tree");
    function send_all_trees(s, lcodes, dcodes, blcodes) {
      var rank;
      send_bits(s, lcodes - 257, 5);
      send_bits(s, dcodes - 1, 5);
      send_bits(s, blcodes - 4, 4);
      for (rank = 0; rank < blcodes; rank++) {
        send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1], 3);
      }
      send_tree(s, s.dyn_ltree, lcodes - 1);
      send_tree(s, s.dyn_dtree, dcodes - 1);
    }
    __name(send_all_trees, "send_all_trees");
    function detect_data_type(s) {
      var black_mask = 4093624447;
      var n;
      for (n = 0; n <= 31; n++, black_mask >>>= 1) {
        if (black_mask & 1 && s.dyn_ltree[n * 2] !== 0) {
          return Z_BINARY;
        }
      }
      if (s.dyn_ltree[9 * 2] !== 0 || s.dyn_ltree[10 * 2] !== 0 || s.dyn_ltree[13 * 2] !== 0) {
        return Z_TEXT;
      }
      for (n = 32; n < LITERALS; n++) {
        if (s.dyn_ltree[n * 2] !== 0) {
          return Z_TEXT;
        }
      }
      return Z_BINARY;
    }
    __name(detect_data_type, "detect_data_type");
    var static_init_done = false;
    function _tr_init(s) {
      if (!static_init_done) {
        tr_static_init();
        static_init_done = true;
      }
      s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
      s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
      s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);
      s.bi_buf = 0;
      s.bi_valid = 0;
      init_block(s);
    }
    __name(_tr_init, "_tr_init");
    function _tr_stored_block(s, buf, stored_len, last) {
      send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);
      copy_block(s, buf, stored_len, true);
    }
    __name(_tr_stored_block, "_tr_stored_block");
    function _tr_align(s) {
      send_bits(s, STATIC_TREES << 1, 3);
      send_code(s, END_BLOCK, static_ltree);
      bi_flush(s);
    }
    __name(_tr_align, "_tr_align");
    function _tr_flush_block(s, buf, stored_len, last) {
      var opt_lenb, static_lenb;
      var max_blindex = 0;
      if (s.level > 0) {
        if (s.strm.data_type === Z_UNKNOWN) {
          s.strm.data_type = detect_data_type(s);
        }
        build_tree(s, s.l_desc);
        build_tree(s, s.d_desc);
        max_blindex = build_bl_tree(s);
        opt_lenb = s.opt_len + 3 + 7 >>> 3;
        static_lenb = s.static_len + 3 + 7 >>> 3;
        if (static_lenb <= opt_lenb) {
          opt_lenb = static_lenb;
        }
      } else {
        opt_lenb = static_lenb = stored_len + 5;
      }
      if (stored_len + 4 <= opt_lenb && buf !== -1) {
        _tr_stored_block(s, buf, stored_len, last);
      } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {
        send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
        compress_block(s, static_ltree, static_dtree);
      } else {
        send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
        send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
        compress_block(s, s.dyn_ltree, s.dyn_dtree);
      }
      init_block(s);
      if (last) {
        bi_windup(s);
      }
    }
    __name(_tr_flush_block, "_tr_flush_block");
    function _tr_tally(s, dist, lc) {
      s.pending_buf[s.d_buf + s.last_lit * 2] = dist >>> 8 & 255;
      s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 255;
      s.pending_buf[s.l_buf + s.last_lit] = lc & 255;
      s.last_lit++;
      if (dist === 0) {
        s.dyn_ltree[lc * 2]++;
      } else {
        s.matches++;
        dist--;
        s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]++;
        s.dyn_dtree[d_code(dist) * 2]++;
      }
      return s.last_lit === s.lit_bufsize - 1;
    }
    __name(_tr_tally, "_tr_tally");
    exports._tr_init = _tr_init;
    exports._tr_stored_block = _tr_stored_block;
    exports._tr_flush_block = _tr_flush_block;
    exports._tr_tally = _tr_tally;
    exports._tr_align = _tr_align;
  }
});

// node_modules/pako/lib/zlib/adler32.js
var require_adler32 = __commonJS({
  "node_modules/pako/lib/zlib/adler32.js"(exports, module) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    function adler32(adler, buf, len, pos) {
      var s1 = adler & 65535 | 0, s2 = adler >>> 16 & 65535 | 0, n = 0;
      while (len !== 0) {
        n = len > 2e3 ? 2e3 : len;
        len -= n;
        do {
          s1 = s1 + buf[pos++] | 0;
          s2 = s2 + s1 | 0;
        } while (--n);
        s1 %= 65521;
        s2 %= 65521;
      }
      return s1 | s2 << 16 | 0;
    }
    __name(adler32, "adler32");
    module.exports = adler32;
  }
});

// node_modules/pako/lib/zlib/crc32.js
var require_crc32 = __commonJS({
  "node_modules/pako/lib/zlib/crc32.js"(exports, module) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    function makeTable() {
      var c, table = [];
      for (var n = 0; n < 256; n++) {
        c = n;
        for (var k = 0; k < 8; k++) {
          c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
        }
        table[n] = c;
      }
      return table;
    }
    __name(makeTable, "makeTable");
    var crcTable = makeTable();
    function crc32(crc, buf, len, pos) {
      var t = crcTable, end = pos + len;
      crc ^= -1;
      for (var i = pos; i < end; i++) {
        crc = crc >>> 8 ^ t[(crc ^ buf[i]) & 255];
      }
      return crc ^ -1;
    }
    __name(crc32, "crc32");
    module.exports = crc32;
  }
});

// node_modules/pako/lib/zlib/messages.js
var require_messages = __commonJS({
  "node_modules/pako/lib/zlib/messages.js"(exports, module) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    module.exports = {
      2: "need dictionary",
      /* Z_NEED_DICT       2  */
      1: "stream end",
      /* Z_STREAM_END      1  */
      0: "",
      /* Z_OK              0  */
      "-1": "file error",
      /* Z_ERRNO         (-1) */
      "-2": "stream error",
      /* Z_STREAM_ERROR  (-2) */
      "-3": "data error",
      /* Z_DATA_ERROR    (-3) */
      "-4": "insufficient memory",
      /* Z_MEM_ERROR     (-4) */
      "-5": "buffer error",
      /* Z_BUF_ERROR     (-5) */
      "-6": "incompatible version"
      /* Z_VERSION_ERROR (-6) */
    };
  }
});

// node_modules/pako/lib/zlib/deflate.js
var require_deflate = __commonJS({
  "node_modules/pako/lib/zlib/deflate.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    var utils = require_common();
    var trees = require_trees();
    var adler32 = require_adler32();
    var crc32 = require_crc32();
    var msg = require_messages();
    var Z_NO_FLUSH = 0;
    var Z_PARTIAL_FLUSH = 1;
    var Z_FULL_FLUSH = 3;
    var Z_FINISH = 4;
    var Z_BLOCK = 5;
    var Z_OK = 0;
    var Z_STREAM_END = 1;
    var Z_STREAM_ERROR = -2;
    var Z_DATA_ERROR = -3;
    var Z_BUF_ERROR = -5;
    var Z_DEFAULT_COMPRESSION = -1;
    var Z_FILTERED = 1;
    var Z_HUFFMAN_ONLY = 2;
    var Z_RLE = 3;
    var Z_FIXED = 4;
    var Z_DEFAULT_STRATEGY = 0;
    var Z_UNKNOWN = 2;
    var Z_DEFLATED = 8;
    var MAX_MEM_LEVEL = 9;
    var MAX_WBITS = 15;
    var DEF_MEM_LEVEL = 8;
    var LENGTH_CODES = 29;
    var LITERALS = 256;
    var L_CODES = LITERALS + 1 + LENGTH_CODES;
    var D_CODES = 30;
    var BL_CODES = 19;
    var HEAP_SIZE = 2 * L_CODES + 1;
    var MAX_BITS = 15;
    var MIN_MATCH = 3;
    var MAX_MATCH = 258;
    var MIN_LOOKAHEAD = MAX_MATCH + MIN_MATCH + 1;
    var PRESET_DICT = 32;
    var INIT_STATE = 42;
    var EXTRA_STATE = 69;
    var NAME_STATE = 73;
    var COMMENT_STATE = 91;
    var HCRC_STATE = 103;
    var BUSY_STATE = 113;
    var FINISH_STATE = 666;
    var BS_NEED_MORE = 1;
    var BS_BLOCK_DONE = 2;
    var BS_FINISH_STARTED = 3;
    var BS_FINISH_DONE = 4;
    var OS_CODE = 3;
    function err(strm, errorCode) {
      strm.msg = msg[errorCode];
      return errorCode;
    }
    __name(err, "err");
    function rank(f) {
      return (f << 1) - (f > 4 ? 9 : 0);
    }
    __name(rank, "rank");
    function zero(buf) {
      var len = buf.length;
      while (--len >= 0) {
        buf[len] = 0;
      }
    }
    __name(zero, "zero");
    function flush_pending(strm) {
      var s = strm.state;
      var len = s.pending;
      if (len > strm.avail_out) {
        len = strm.avail_out;
      }
      if (len === 0) {
        return;
      }
      utils.arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);
      strm.next_out += len;
      s.pending_out += len;
      strm.total_out += len;
      strm.avail_out -= len;
      s.pending -= len;
      if (s.pending === 0) {
        s.pending_out = 0;
      }
    }
    __name(flush_pending, "flush_pending");
    function flush_block_only(s, last) {
      trees._tr_flush_block(s, s.block_start >= 0 ? s.block_start : -1, s.strstart - s.block_start, last);
      s.block_start = s.strstart;
      flush_pending(s.strm);
    }
    __name(flush_block_only, "flush_block_only");
    function put_byte(s, b) {
      s.pending_buf[s.pending++] = b;
    }
    __name(put_byte, "put_byte");
    function putShortMSB(s, b) {
      s.pending_buf[s.pending++] = b >>> 8 & 255;
      s.pending_buf[s.pending++] = b & 255;
    }
    __name(putShortMSB, "putShortMSB");
    function read_buf(strm, buf, start, size) {
      var len = strm.avail_in;
      if (len > size) {
        len = size;
      }
      if (len === 0) {
        return 0;
      }
      strm.avail_in -= len;
      utils.arraySet(buf, strm.input, strm.next_in, len, start);
      if (strm.state.wrap === 1) {
        strm.adler = adler32(strm.adler, buf, len, start);
      } else if (strm.state.wrap === 2) {
        strm.adler = crc32(strm.adler, buf, len, start);
      }
      strm.next_in += len;
      strm.total_in += len;
      return len;
    }
    __name(read_buf, "read_buf");
    function longest_match(s, cur_match) {
      var chain_length = s.max_chain_length;
      var scan = s.strstart;
      var match;
      var len;
      var best_len = s.prev_length;
      var nice_match = s.nice_match;
      var limit = s.strstart > s.w_size - MIN_LOOKAHEAD ? s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0;
      var _win = s.window;
      var wmask = s.w_mask;
      var prev = s.prev;
      var strend = s.strstart + MAX_MATCH;
      var scan_end1 = _win[scan + best_len - 1];
      var scan_end = _win[scan + best_len];
      if (s.prev_length >= s.good_match) {
        chain_length >>= 2;
      }
      if (nice_match > s.lookahead) {
        nice_match = s.lookahead;
      }
      do {
        match = cur_match;
        if (_win[match + best_len] !== scan_end || _win[match + best_len - 1] !== scan_end1 || _win[match] !== _win[scan] || _win[++match] !== _win[scan + 1]) {
          continue;
        }
        scan += 2;
        match++;
        do {
        } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && scan < strend);
        len = MAX_MATCH - (strend - scan);
        scan = strend - MAX_MATCH;
        if (len > best_len) {
          s.match_start = cur_match;
          best_len = len;
          if (len >= nice_match) {
            break;
          }
          scan_end1 = _win[scan + best_len - 1];
          scan_end = _win[scan + best_len];
        }
      } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);
      if (best_len <= s.lookahead) {
        return best_len;
      }
      return s.lookahead;
    }
    __name(longest_match, "longest_match");
    function fill_window(s) {
      var _w_size = s.w_size;
      var p, n, m, more, str;
      do {
        more = s.window_size - s.lookahead - s.strstart;
        if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {
          utils.arraySet(s.window, s.window, _w_size, _w_size, 0);
          s.match_start -= _w_size;
          s.strstart -= _w_size;
          s.block_start -= _w_size;
          n = s.hash_size;
          p = n;
          do {
            m = s.head[--p];
            s.head[p] = m >= _w_size ? m - _w_size : 0;
          } while (--n);
          n = _w_size;
          p = n;
          do {
            m = s.prev[--p];
            s.prev[p] = m >= _w_size ? m - _w_size : 0;
          } while (--n);
          more += _w_size;
        }
        if (s.strm.avail_in === 0) {
          break;
        }
        n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
        s.lookahead += n;
        if (s.lookahead + s.insert >= MIN_MATCH) {
          str = s.strstart - s.insert;
          s.ins_h = s.window[str];
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + 1]) & s.hash_mask;
          while (s.insert) {
            s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;
            s.prev[str & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = str;
            str++;
            s.insert--;
            if (s.lookahead + s.insert < MIN_MATCH) {
              break;
            }
          }
        }
      } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);
    }
    __name(fill_window, "fill_window");
    function deflate_stored(s, flush) {
      var max_block_size = 65535;
      if (max_block_size > s.pending_buf_size - 5) {
        max_block_size = s.pending_buf_size - 5;
      }
      for (; ; ) {
        if (s.lookahead <= 1) {
          fill_window(s);
          if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
            return BS_NEED_MORE;
          }
          if (s.lookahead === 0) {
            break;
          }
        }
        s.strstart += s.lookahead;
        s.lookahead = 0;
        var max_start = s.block_start + max_block_size;
        if (s.strstart === 0 || s.strstart >= max_start) {
          s.lookahead = s.strstart - max_start;
          s.strstart = max_start;
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
        if (s.strstart - s.block_start >= s.w_size - MIN_LOOKAHEAD) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
      }
      s.insert = 0;
      if (flush === Z_FINISH) {
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        return BS_FINISH_DONE;
      }
      if (s.strstart > s.block_start) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
      return BS_NEED_MORE;
    }
    __name(deflate_stored, "deflate_stored");
    function deflate_fast(s, flush) {
      var hash_head;
      var bflush;
      for (; ; ) {
        if (s.lookahead < MIN_LOOKAHEAD) {
          fill_window(s);
          if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
            return BS_NEED_MORE;
          }
          if (s.lookahead === 0) {
            break;
          }
        }
        hash_head = 0;
        if (s.lookahead >= MIN_MATCH) {
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
        }
        if (hash_head !== 0 && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
          s.match_length = longest_match(s, hash_head);
        }
        if (s.match_length >= MIN_MATCH) {
          bflush = trees._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);
          s.lookahead -= s.match_length;
          if (s.match_length <= s.max_lazy_match && s.lookahead >= MIN_MATCH) {
            s.match_length--;
            do {
              s.strstart++;
              s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
              hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = s.strstart;
            } while (--s.match_length !== 0);
            s.strstart++;
          } else {
            s.strstart += s.match_length;
            s.match_length = 0;
            s.ins_h = s.window[s.strstart];
            s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + 1]) & s.hash_mask;
          }
        } else {
          bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
          s.lookahead--;
          s.strstart++;
        }
        if (bflush) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
      }
      s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
      if (flush === Z_FINISH) {
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        return BS_FINISH_DONE;
      }
      if (s.last_lit) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
      return BS_BLOCK_DONE;
    }
    __name(deflate_fast, "deflate_fast");
    function deflate_slow(s, flush) {
      var hash_head;
      var bflush;
      var max_insert;
      for (; ; ) {
        if (s.lookahead < MIN_LOOKAHEAD) {
          fill_window(s);
          if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
            return BS_NEED_MORE;
          }
          if (s.lookahead === 0) {
            break;
          }
        }
        hash_head = 0;
        if (s.lookahead >= MIN_MATCH) {
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
        }
        s.prev_length = s.match_length;
        s.prev_match = s.match_start;
        s.match_length = MIN_MATCH - 1;
        if (hash_head !== 0 && s.prev_length < s.max_lazy_match && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
          s.match_length = longest_match(s, hash_head);
          if (s.match_length <= 5 && (s.strategy === Z_FILTERED || s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096)) {
            s.match_length = MIN_MATCH - 1;
          }
        }
        if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
          max_insert = s.strstart + s.lookahead - MIN_MATCH;
          bflush = trees._tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
          s.lookahead -= s.prev_length - 1;
          s.prev_length -= 2;
          do {
            if (++s.strstart <= max_insert) {
              s.ins_h = (s.ins_h << s.hash_shift ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
              hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = s.strstart;
            }
          } while (--s.prev_length !== 0);
          s.match_available = 0;
          s.match_length = MIN_MATCH - 1;
          s.strstart++;
          if (bflush) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
        } else if (s.match_available) {
          bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
          if (bflush) {
            flush_block_only(s, false);
          }
          s.strstart++;
          s.lookahead--;
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        } else {
          s.match_available = 1;
          s.strstart++;
          s.lookahead--;
        }
      }
      if (s.match_available) {
        bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);
        s.match_available = 0;
      }
      s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
      if (flush === Z_FINISH) {
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        return BS_FINISH_DONE;
      }
      if (s.last_lit) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
      return BS_BLOCK_DONE;
    }
    __name(deflate_slow, "deflate_slow");
    function deflate_rle(s, flush) {
      var bflush;
      var prev;
      var scan, strend;
      var _win = s.window;
      for (; ; ) {
        if (s.lookahead <= MAX_MATCH) {
          fill_window(s);
          if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
            return BS_NEED_MORE;
          }
          if (s.lookahead === 0) {
            break;
          }
        }
        s.match_length = 0;
        if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
          scan = s.strstart - 1;
          prev = _win[scan];
          if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
            strend = s.strstart + MAX_MATCH;
            do {
            } while (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && scan < strend);
            s.match_length = MAX_MATCH - (strend - scan);
            if (s.match_length > s.lookahead) {
              s.match_length = s.lookahead;
            }
          }
        }
        if (s.match_length >= MIN_MATCH) {
          bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH);
          s.lookahead -= s.match_length;
          s.strstart += s.match_length;
          s.match_length = 0;
        } else {
          bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
          s.lookahead--;
          s.strstart++;
        }
        if (bflush) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
      }
      s.insert = 0;
      if (flush === Z_FINISH) {
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        return BS_FINISH_DONE;
      }
      if (s.last_lit) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
      return BS_BLOCK_DONE;
    }
    __name(deflate_rle, "deflate_rle");
    function deflate_huff(s, flush) {
      var bflush;
      for (; ; ) {
        if (s.lookahead === 0) {
          fill_window(s);
          if (s.lookahead === 0) {
            if (flush === Z_NO_FLUSH) {
              return BS_NEED_MORE;
            }
            break;
          }
        }
        s.match_length = 0;
        bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
        s.lookahead--;
        s.strstart++;
        if (bflush) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
      }
      s.insert = 0;
      if (flush === Z_FINISH) {
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        return BS_FINISH_DONE;
      }
      if (s.last_lit) {
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
      }
      return BS_BLOCK_DONE;
    }
    __name(deflate_huff, "deflate_huff");
    function Config(good_length, max_lazy, nice_length, max_chain, func) {
      this.good_length = good_length;
      this.max_lazy = max_lazy;
      this.nice_length = nice_length;
      this.max_chain = max_chain;
      this.func = func;
    }
    __name(Config, "Config");
    var configuration_table;
    configuration_table = [
      /*      good lazy nice chain */
      new Config(0, 0, 0, 0, deflate_stored),
      /* 0 store only */
      new Config(4, 4, 8, 4, deflate_fast),
      /* 1 max speed, no lazy matches */
      new Config(4, 5, 16, 8, deflate_fast),
      /* 2 */
      new Config(4, 6, 32, 32, deflate_fast),
      /* 3 */
      new Config(4, 4, 16, 16, deflate_slow),
      /* 4 lazy matches */
      new Config(8, 16, 32, 32, deflate_slow),
      /* 5 */
      new Config(8, 16, 128, 128, deflate_slow),
      /* 6 */
      new Config(8, 32, 128, 256, deflate_slow),
      /* 7 */
      new Config(32, 128, 258, 1024, deflate_slow),
      /* 8 */
      new Config(32, 258, 258, 4096, deflate_slow)
      /* 9 max compression */
    ];
    function lm_init(s) {
      s.window_size = 2 * s.w_size;
      zero(s.head);
      s.max_lazy_match = configuration_table[s.level].max_lazy;
      s.good_match = configuration_table[s.level].good_length;
      s.nice_match = configuration_table[s.level].nice_length;
      s.max_chain_length = configuration_table[s.level].max_chain;
      s.strstart = 0;
      s.block_start = 0;
      s.lookahead = 0;
      s.insert = 0;
      s.match_length = s.prev_length = MIN_MATCH - 1;
      s.match_available = 0;
      s.ins_h = 0;
    }
    __name(lm_init, "lm_init");
    function DeflateState() {
      this.strm = null;
      this.status = 0;
      this.pending_buf = null;
      this.pending_buf_size = 0;
      this.pending_out = 0;
      this.pending = 0;
      this.wrap = 0;
      this.gzhead = null;
      this.gzindex = 0;
      this.method = Z_DEFLATED;
      this.last_flush = -1;
      this.w_size = 0;
      this.w_bits = 0;
      this.w_mask = 0;
      this.window = null;
      this.window_size = 0;
      this.prev = null;
      this.head = null;
      this.ins_h = 0;
      this.hash_size = 0;
      this.hash_bits = 0;
      this.hash_mask = 0;
      this.hash_shift = 0;
      this.block_start = 0;
      this.match_length = 0;
      this.prev_match = 0;
      this.match_available = 0;
      this.strstart = 0;
      this.match_start = 0;
      this.lookahead = 0;
      this.prev_length = 0;
      this.max_chain_length = 0;
      this.max_lazy_match = 0;
      this.level = 0;
      this.strategy = 0;
      this.good_match = 0;
      this.nice_match = 0;
      this.dyn_ltree = new utils.Buf16(HEAP_SIZE * 2);
      this.dyn_dtree = new utils.Buf16((2 * D_CODES + 1) * 2);
      this.bl_tree = new utils.Buf16((2 * BL_CODES + 1) * 2);
      zero(this.dyn_ltree);
      zero(this.dyn_dtree);
      zero(this.bl_tree);
      this.l_desc = null;
      this.d_desc = null;
      this.bl_desc = null;
      this.bl_count = new utils.Buf16(MAX_BITS + 1);
      this.heap = new utils.Buf16(2 * L_CODES + 1);
      zero(this.heap);
      this.heap_len = 0;
      this.heap_max = 0;
      this.depth = new utils.Buf16(2 * L_CODES + 1);
      zero(this.depth);
      this.l_buf = 0;
      this.lit_bufsize = 0;
      this.last_lit = 0;
      this.d_buf = 0;
      this.opt_len = 0;
      this.static_len = 0;
      this.matches = 0;
      this.insert = 0;
      this.bi_buf = 0;
      this.bi_valid = 0;
    }
    __name(DeflateState, "DeflateState");
    function deflateResetKeep(strm) {
      var s;
      if (!strm || !strm.state) {
        return err(strm, Z_STREAM_ERROR);
      }
      strm.total_in = strm.total_out = 0;
      strm.data_type = Z_UNKNOWN;
      s = strm.state;
      s.pending = 0;
      s.pending_out = 0;
      if (s.wrap < 0) {
        s.wrap = -s.wrap;
      }
      s.status = s.wrap ? INIT_STATE : BUSY_STATE;
      strm.adler = s.wrap === 2 ? 0 : 1;
      s.last_flush = Z_NO_FLUSH;
      trees._tr_init(s);
      return Z_OK;
    }
    __name(deflateResetKeep, "deflateResetKeep");
    function deflateReset(strm) {
      var ret = deflateResetKeep(strm);
      if (ret === Z_OK) {
        lm_init(strm.state);
      }
      return ret;
    }
    __name(deflateReset, "deflateReset");
    function deflateSetHeader(strm, head) {
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      if (strm.state.wrap !== 2) {
        return Z_STREAM_ERROR;
      }
      strm.state.gzhead = head;
      return Z_OK;
    }
    __name(deflateSetHeader, "deflateSetHeader");
    function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
      if (!strm) {
        return Z_STREAM_ERROR;
      }
      var wrap = 1;
      if (level === Z_DEFAULT_COMPRESSION) {
        level = 6;
      }
      if (windowBits < 0) {
        wrap = 0;
        windowBits = -windowBits;
      } else if (windowBits > 15) {
        wrap = 2;
        windowBits -= 16;
      }
      if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED || windowBits < 8 || windowBits > 15 || level < 0 || level > 9 || strategy < 0 || strategy > Z_FIXED) {
        return err(strm, Z_STREAM_ERROR);
      }
      if (windowBits === 8) {
        windowBits = 9;
      }
      var s = new DeflateState();
      strm.state = s;
      s.strm = strm;
      s.wrap = wrap;
      s.gzhead = null;
      s.w_bits = windowBits;
      s.w_size = 1 << s.w_bits;
      s.w_mask = s.w_size - 1;
      s.hash_bits = memLevel + 7;
      s.hash_size = 1 << s.hash_bits;
      s.hash_mask = s.hash_size - 1;
      s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);
      s.window = new utils.Buf8(s.w_size * 2);
      s.head = new utils.Buf16(s.hash_size);
      s.prev = new utils.Buf16(s.w_size);
      s.lit_bufsize = 1 << memLevel + 6;
      s.pending_buf_size = s.lit_bufsize * 4;
      s.pending_buf = new utils.Buf8(s.pending_buf_size);
      s.d_buf = 1 * s.lit_bufsize;
      s.l_buf = (1 + 2) * s.lit_bufsize;
      s.level = level;
      s.strategy = strategy;
      s.method = method;
      return deflateReset(strm);
    }
    __name(deflateInit2, "deflateInit2");
    function deflateInit(strm, level) {
      return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
    }
    __name(deflateInit, "deflateInit");
    function deflate(strm, flush) {
      var old_flush, s;
      var beg, val;
      if (!strm || !strm.state || flush > Z_BLOCK || flush < 0) {
        return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
      }
      s = strm.state;
      if (!strm.output || !strm.input && strm.avail_in !== 0 || s.status === FINISH_STATE && flush !== Z_FINISH) {
        return err(strm, strm.avail_out === 0 ? Z_BUF_ERROR : Z_STREAM_ERROR);
      }
      s.strm = strm;
      old_flush = s.last_flush;
      s.last_flush = flush;
      if (s.status === INIT_STATE) {
        if (s.wrap === 2) {
          strm.adler = 0;
          put_byte(s, 31);
          put_byte(s, 139);
          put_byte(s, 8);
          if (!s.gzhead) {
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
            put_byte(s, OS_CODE);
            s.status = BUSY_STATE;
          } else {
            put_byte(
              s,
              (s.gzhead.text ? 1 : 0) + (s.gzhead.hcrc ? 2 : 0) + (!s.gzhead.extra ? 0 : 4) + (!s.gzhead.name ? 0 : 8) + (!s.gzhead.comment ? 0 : 16)
            );
            put_byte(s, s.gzhead.time & 255);
            put_byte(s, s.gzhead.time >> 8 & 255);
            put_byte(s, s.gzhead.time >> 16 & 255);
            put_byte(s, s.gzhead.time >> 24 & 255);
            put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
            put_byte(s, s.gzhead.os & 255);
            if (s.gzhead.extra && s.gzhead.extra.length) {
              put_byte(s, s.gzhead.extra.length & 255);
              put_byte(s, s.gzhead.extra.length >> 8 & 255);
            }
            if (s.gzhead.hcrc) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
            }
            s.gzindex = 0;
            s.status = EXTRA_STATE;
          }
        } else {
          var header = Z_DEFLATED + (s.w_bits - 8 << 4) << 8;
          var level_flags = -1;
          if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
            level_flags = 0;
          } else if (s.level < 6) {
            level_flags = 1;
          } else if (s.level === 6) {
            level_flags = 2;
          } else {
            level_flags = 3;
          }
          header |= level_flags << 6;
          if (s.strstart !== 0) {
            header |= PRESET_DICT;
          }
          header += 31 - header % 31;
          s.status = BUSY_STATE;
          putShortMSB(s, header);
          if (s.strstart !== 0) {
            putShortMSB(s, strm.adler >>> 16);
            putShortMSB(s, strm.adler & 65535);
          }
          strm.adler = 1;
        }
      }
      if (s.status === EXTRA_STATE) {
        if (s.gzhead.extra) {
          beg = s.pending;
          while (s.gzindex < (s.gzhead.extra.length & 65535)) {
            if (s.pending === s.pending_buf_size) {
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              flush_pending(strm);
              beg = s.pending;
              if (s.pending === s.pending_buf_size) {
                break;
              }
            }
            put_byte(s, s.gzhead.extra[s.gzindex] & 255);
            s.gzindex++;
          }
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          if (s.gzindex === s.gzhead.extra.length) {
            s.gzindex = 0;
            s.status = NAME_STATE;
          }
        } else {
          s.status = NAME_STATE;
        }
      }
      if (s.status === NAME_STATE) {
        if (s.gzhead.name) {
          beg = s.pending;
          do {
            if (s.pending === s.pending_buf_size) {
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              flush_pending(strm);
              beg = s.pending;
              if (s.pending === s.pending_buf_size) {
                val = 1;
                break;
              }
            }
            if (s.gzindex < s.gzhead.name.length) {
              val = s.gzhead.name.charCodeAt(s.gzindex++) & 255;
            } else {
              val = 0;
            }
            put_byte(s, val);
          } while (val !== 0);
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          if (val === 0) {
            s.gzindex = 0;
            s.status = COMMENT_STATE;
          }
        } else {
          s.status = COMMENT_STATE;
        }
      }
      if (s.status === COMMENT_STATE) {
        if (s.gzhead.comment) {
          beg = s.pending;
          do {
            if (s.pending === s.pending_buf_size) {
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              flush_pending(strm);
              beg = s.pending;
              if (s.pending === s.pending_buf_size) {
                val = 1;
                break;
              }
            }
            if (s.gzindex < s.gzhead.comment.length) {
              val = s.gzhead.comment.charCodeAt(s.gzindex++) & 255;
            } else {
              val = 0;
            }
            put_byte(s, val);
          } while (val !== 0);
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          if (val === 0) {
            s.status = HCRC_STATE;
          }
        } else {
          s.status = HCRC_STATE;
        }
      }
      if (s.status === HCRC_STATE) {
        if (s.gzhead.hcrc) {
          if (s.pending + 2 > s.pending_buf_size) {
            flush_pending(strm);
          }
          if (s.pending + 2 <= s.pending_buf_size) {
            put_byte(s, strm.adler & 255);
            put_byte(s, strm.adler >> 8 & 255);
            strm.adler = 0;
            s.status = BUSY_STATE;
          }
        } else {
          s.status = BUSY_STATE;
        }
      }
      if (s.pending !== 0) {
        flush_pending(strm);
        if (strm.avail_out === 0) {
          s.last_flush = -1;
          return Z_OK;
        }
      } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) && flush !== Z_FINISH) {
        return err(strm, Z_BUF_ERROR);
      }
      if (s.status === FINISH_STATE && strm.avail_in !== 0) {
        return err(strm, Z_BUF_ERROR);
      }
      if (strm.avail_in !== 0 || s.lookahead !== 0 || flush !== Z_NO_FLUSH && s.status !== FINISH_STATE) {
        var bstate = s.strategy === Z_HUFFMAN_ONLY ? deflate_huff(s, flush) : s.strategy === Z_RLE ? deflate_rle(s, flush) : configuration_table[s.level].func(s, flush);
        if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
          s.status = FINISH_STATE;
        }
        if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
          if (strm.avail_out === 0) {
            s.last_flush = -1;
          }
          return Z_OK;
        }
        if (bstate === BS_BLOCK_DONE) {
          if (flush === Z_PARTIAL_FLUSH) {
            trees._tr_align(s);
          } else if (flush !== Z_BLOCK) {
            trees._tr_stored_block(s, 0, 0, false);
            if (flush === Z_FULL_FLUSH) {
              zero(s.head);
              if (s.lookahead === 0) {
                s.strstart = 0;
                s.block_start = 0;
                s.insert = 0;
              }
            }
          }
          flush_pending(strm);
          if (strm.avail_out === 0) {
            s.last_flush = -1;
            return Z_OK;
          }
        }
      }
      if (flush !== Z_FINISH) {
        return Z_OK;
      }
      if (s.wrap <= 0) {
        return Z_STREAM_END;
      }
      if (s.wrap === 2) {
        put_byte(s, strm.adler & 255);
        put_byte(s, strm.adler >> 8 & 255);
        put_byte(s, strm.adler >> 16 & 255);
        put_byte(s, strm.adler >> 24 & 255);
        put_byte(s, strm.total_in & 255);
        put_byte(s, strm.total_in >> 8 & 255);
        put_byte(s, strm.total_in >> 16 & 255);
        put_byte(s, strm.total_in >> 24 & 255);
      } else {
        putShortMSB(s, strm.adler >>> 16);
        putShortMSB(s, strm.adler & 65535);
      }
      flush_pending(strm);
      if (s.wrap > 0) {
        s.wrap = -s.wrap;
      }
      return s.pending !== 0 ? Z_OK : Z_STREAM_END;
    }
    __name(deflate, "deflate");
    function deflateEnd(strm) {
      var status;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      status = strm.state.status;
      if (status !== INIT_STATE && status !== EXTRA_STATE && status !== NAME_STATE && status !== COMMENT_STATE && status !== HCRC_STATE && status !== BUSY_STATE && status !== FINISH_STATE) {
        return err(strm, Z_STREAM_ERROR);
      }
      strm.state = null;
      return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
    }
    __name(deflateEnd, "deflateEnd");
    function deflateSetDictionary(strm, dictionary) {
      var dictLength = dictionary.length;
      var s;
      var str, n;
      var wrap;
      var avail;
      var next;
      var input;
      var tmpDict;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      s = strm.state;
      wrap = s.wrap;
      if (wrap === 2 || wrap === 1 && s.status !== INIT_STATE || s.lookahead) {
        return Z_STREAM_ERROR;
      }
      if (wrap === 1) {
        strm.adler = adler32(strm.adler, dictionary, dictLength, 0);
      }
      s.wrap = 0;
      if (dictLength >= s.w_size) {
        if (wrap === 0) {
          zero(s.head);
          s.strstart = 0;
          s.block_start = 0;
          s.insert = 0;
        }
        tmpDict = new utils.Buf8(s.w_size);
        utils.arraySet(tmpDict, dictionary, dictLength - s.w_size, s.w_size, 0);
        dictionary = tmpDict;
        dictLength = s.w_size;
      }
      avail = strm.avail_in;
      next = strm.next_in;
      input = strm.input;
      strm.avail_in = dictLength;
      strm.next_in = 0;
      strm.input = dictionary;
      fill_window(s);
      while (s.lookahead >= MIN_MATCH) {
        str = s.strstart;
        n = s.lookahead - (MIN_MATCH - 1);
        do {
          s.ins_h = (s.ins_h << s.hash_shift ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;
          s.prev[str & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = str;
          str++;
        } while (--n);
        s.strstart = str;
        s.lookahead = MIN_MATCH - 1;
        fill_window(s);
      }
      s.strstart += s.lookahead;
      s.block_start = s.strstart;
      s.insert = s.lookahead;
      s.lookahead = 0;
      s.match_length = s.prev_length = MIN_MATCH - 1;
      s.match_available = 0;
      strm.next_in = next;
      strm.input = input;
      strm.avail_in = avail;
      s.wrap = wrap;
      return Z_OK;
    }
    __name(deflateSetDictionary, "deflateSetDictionary");
    exports.deflateInit = deflateInit;
    exports.deflateInit2 = deflateInit2;
    exports.deflateReset = deflateReset;
    exports.deflateResetKeep = deflateResetKeep;
    exports.deflateSetHeader = deflateSetHeader;
    exports.deflate = deflate;
    exports.deflateEnd = deflateEnd;
    exports.deflateSetDictionary = deflateSetDictionary;
    exports.deflateInfo = "pako deflate (from Nodeca project)";
  }
});

// node_modules/pako/lib/utils/strings.js
var require_strings = __commonJS({
  "node_modules/pako/lib/utils/strings.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    var utils = require_common();
    var STR_APPLY_OK = true;
    var STR_APPLY_UIA_OK = true;
    try {
      String.fromCharCode.apply(null, [0]);
    } catch (__) {
      STR_APPLY_OK = false;
    }
    try {
      String.fromCharCode.apply(null, new Uint8Array(1));
    } catch (__) {
      STR_APPLY_UIA_OK = false;
    }
    var _utf8len = new utils.Buf8(256);
    for (q = 0; q < 256; q++) {
      _utf8len[q] = q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1;
    }
    var q;
    _utf8len[254] = _utf8len[254] = 1;
    exports.string2buf = function(str) {
      var buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;
      for (m_pos = 0; m_pos < str_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
          c2 = str.charCodeAt(m_pos + 1);
          if ((c2 & 64512) === 56320) {
            c = 65536 + (c - 55296 << 10) + (c2 - 56320);
            m_pos++;
          }
        }
        buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
      }
      buf = new utils.Buf8(buf_len);
      for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
        c = str.charCodeAt(m_pos);
        if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
          c2 = str.charCodeAt(m_pos + 1);
          if ((c2 & 64512) === 56320) {
            c = 65536 + (c - 55296 << 10) + (c2 - 56320);
            m_pos++;
          }
        }
        if (c < 128) {
          buf[i++] = c;
        } else if (c < 2048) {
          buf[i++] = 192 | c >>> 6;
          buf[i++] = 128 | c & 63;
        } else if (c < 65536) {
          buf[i++] = 224 | c >>> 12;
          buf[i++] = 128 | c >>> 6 & 63;
          buf[i++] = 128 | c & 63;
        } else {
          buf[i++] = 240 | c >>> 18;
          buf[i++] = 128 | c >>> 12 & 63;
          buf[i++] = 128 | c >>> 6 & 63;
          buf[i++] = 128 | c & 63;
        }
      }
      return buf;
    };
    function buf2binstring(buf, len) {
      if (len < 65534) {
        if (buf.subarray && STR_APPLY_UIA_OK || !buf.subarray && STR_APPLY_OK) {
          return String.fromCharCode.apply(null, utils.shrinkBuf(buf, len));
        }
      }
      var result = "";
      for (var i = 0; i < len; i++) {
        result += String.fromCharCode(buf[i]);
      }
      return result;
    }
    __name(buf2binstring, "buf2binstring");
    exports.buf2binstring = function(buf) {
      return buf2binstring(buf, buf.length);
    };
    exports.binstring2buf = function(str) {
      var buf = new utils.Buf8(str.length);
      for (var i = 0, len = buf.length; i < len; i++) {
        buf[i] = str.charCodeAt(i);
      }
      return buf;
    };
    exports.buf2string = function(buf, max) {
      var i, out, c, c_len;
      var len = max || buf.length;
      var utf16buf = new Array(len * 2);
      for (out = 0, i = 0; i < len; ) {
        c = buf[i++];
        if (c < 128) {
          utf16buf[out++] = c;
          continue;
        }
        c_len = _utf8len[c];
        if (c_len > 4) {
          utf16buf[out++] = 65533;
          i += c_len - 1;
          continue;
        }
        c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
        while (c_len > 1 && i < len) {
          c = c << 6 | buf[i++] & 63;
          c_len--;
        }
        if (c_len > 1) {
          utf16buf[out++] = 65533;
          continue;
        }
        if (c < 65536) {
          utf16buf[out++] = c;
        } else {
          c -= 65536;
          utf16buf[out++] = 55296 | c >> 10 & 1023;
          utf16buf[out++] = 56320 | c & 1023;
        }
      }
      return buf2binstring(utf16buf, out);
    };
    exports.utf8border = function(buf, max) {
      var pos;
      max = max || buf.length;
      if (max > buf.length) {
        max = buf.length;
      }
      pos = max - 1;
      while (pos >= 0 && (buf[pos] & 192) === 128) {
        pos--;
      }
      if (pos < 0) {
        return max;
      }
      if (pos === 0) {
        return max;
      }
      return pos + _utf8len[buf[pos]] > max ? pos : max;
    };
  }
});

// node_modules/pako/lib/zlib/zstream.js
var require_zstream = __commonJS({
  "node_modules/pako/lib/zlib/zstream.js"(exports, module) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    function ZStream() {
      this.input = null;
      this.next_in = 0;
      this.avail_in = 0;
      this.total_in = 0;
      this.output = null;
      this.next_out = 0;
      this.avail_out = 0;
      this.total_out = 0;
      this.msg = "";
      this.state = null;
      this.data_type = 2;
      this.adler = 0;
    }
    __name(ZStream, "ZStream");
    module.exports = ZStream;
  }
});

// node_modules/pako/lib/deflate.js
var require_deflate2 = __commonJS({
  "node_modules/pako/lib/deflate.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    var zlib_deflate = require_deflate();
    var utils = require_common();
    var strings = require_strings();
    var msg = require_messages();
    var ZStream = require_zstream();
    var toString = Object.prototype.toString;
    var Z_NO_FLUSH = 0;
    var Z_FINISH = 4;
    var Z_OK = 0;
    var Z_STREAM_END = 1;
    var Z_SYNC_FLUSH = 2;
    var Z_DEFAULT_COMPRESSION = -1;
    var Z_DEFAULT_STRATEGY = 0;
    var Z_DEFLATED = 8;
    function Deflate(options) {
      if (!(this instanceof Deflate)) return new Deflate(options);
      this.options = utils.assign({
        level: Z_DEFAULT_COMPRESSION,
        method: Z_DEFLATED,
        chunkSize: 16384,
        windowBits: 15,
        memLevel: 8,
        strategy: Z_DEFAULT_STRATEGY,
        to: ""
      }, options || {});
      var opt = this.options;
      if (opt.raw && opt.windowBits > 0) {
        opt.windowBits = -opt.windowBits;
      } else if (opt.gzip && opt.windowBits > 0 && opt.windowBits < 16) {
        opt.windowBits += 16;
      }
      this.err = 0;
      this.msg = "";
      this.ended = false;
      this.chunks = [];
      this.strm = new ZStream();
      this.strm.avail_out = 0;
      var status = zlib_deflate.deflateInit2(
        this.strm,
        opt.level,
        opt.method,
        opt.windowBits,
        opt.memLevel,
        opt.strategy
      );
      if (status !== Z_OK) {
        throw new Error(msg[status]);
      }
      if (opt.header) {
        zlib_deflate.deflateSetHeader(this.strm, opt.header);
      }
      if (opt.dictionary) {
        var dict;
        if (typeof opt.dictionary === "string") {
          dict = strings.string2buf(opt.dictionary);
        } else if (toString.call(opt.dictionary) === "[object ArrayBuffer]") {
          dict = new Uint8Array(opt.dictionary);
        } else {
          dict = opt.dictionary;
        }
        status = zlib_deflate.deflateSetDictionary(this.strm, dict);
        if (status !== Z_OK) {
          throw new Error(msg[status]);
        }
        this._dict_set = true;
      }
    }
    __name(Deflate, "Deflate");
    Deflate.prototype.push = function(data, mode) {
      var strm = this.strm;
      var chunkSize = this.options.chunkSize;
      var status, _mode;
      if (this.ended) {
        return false;
      }
      _mode = mode === ~~mode ? mode : mode === true ? Z_FINISH : Z_NO_FLUSH;
      if (typeof data === "string") {
        strm.input = strings.string2buf(data);
      } else if (toString.call(data) === "[object ArrayBuffer]") {
        strm.input = new Uint8Array(data);
      } else {
        strm.input = data;
      }
      strm.next_in = 0;
      strm.avail_in = strm.input.length;
      do {
        if (strm.avail_out === 0) {
          strm.output = new utils.Buf8(chunkSize);
          strm.next_out = 0;
          strm.avail_out = chunkSize;
        }
        status = zlib_deflate.deflate(strm, _mode);
        if (status !== Z_STREAM_END && status !== Z_OK) {
          this.onEnd(status);
          this.ended = true;
          return false;
        }
        if (strm.avail_out === 0 || strm.avail_in === 0 && (_mode === Z_FINISH || _mode === Z_SYNC_FLUSH)) {
          if (this.options.to === "string") {
            this.onData(strings.buf2binstring(utils.shrinkBuf(strm.output, strm.next_out)));
          } else {
            this.onData(utils.shrinkBuf(strm.output, strm.next_out));
          }
        }
      } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== Z_STREAM_END);
      if (_mode === Z_FINISH) {
        status = zlib_deflate.deflateEnd(this.strm);
        this.onEnd(status);
        this.ended = true;
        return status === Z_OK;
      }
      if (_mode === Z_SYNC_FLUSH) {
        this.onEnd(Z_OK);
        strm.avail_out = 0;
        return true;
      }
      return true;
    };
    Deflate.prototype.onData = function(chunk) {
      this.chunks.push(chunk);
    };
    Deflate.prototype.onEnd = function(status) {
      if (status === Z_OK) {
        if (this.options.to === "string") {
          this.result = this.chunks.join("");
        } else {
          this.result = utils.flattenChunks(this.chunks);
        }
      }
      this.chunks = [];
      this.err = status;
      this.msg = this.strm.msg;
    };
    function deflate(input, options) {
      var deflator = new Deflate(options);
      deflator.push(input, true);
      if (deflator.err) {
        throw deflator.msg || msg[deflator.err];
      }
      return deflator.result;
    }
    __name(deflate, "deflate");
    function deflateRaw(input, options) {
      options = options || {};
      options.raw = true;
      return deflate(input, options);
    }
    __name(deflateRaw, "deflateRaw");
    function gzip(input, options) {
      options = options || {};
      options.gzip = true;
      return deflate(input, options);
    }
    __name(gzip, "gzip");
    exports.Deflate = Deflate;
    exports.deflate = deflate;
    exports.deflateRaw = deflateRaw;
    exports.gzip = gzip;
  }
});

// node_modules/pako/lib/zlib/inffast.js
var require_inffast = __commonJS({
  "node_modules/pako/lib/zlib/inffast.js"(exports, module) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    var BAD = 30;
    var TYPE = 12;
    module.exports = /* @__PURE__ */ __name(function inflate_fast(strm, start) {
      var state;
      var _in;
      var last;
      var _out;
      var beg;
      var end;
      var dmax;
      var wsize;
      var whave;
      var wnext;
      var s_window;
      var hold;
      var bits;
      var lcode;
      var dcode;
      var lmask;
      var dmask;
      var here;
      var op;
      var len;
      var dist;
      var from;
      var from_source;
      var input, output;
      state = strm.state;
      _in = strm.next_in;
      input = strm.input;
      last = _in + (strm.avail_in - 5);
      _out = strm.next_out;
      output = strm.output;
      beg = _out - (start - strm.avail_out);
      end = _out + (strm.avail_out - 257);
      dmax = state.dmax;
      wsize = state.wsize;
      whave = state.whave;
      wnext = state.wnext;
      s_window = state.window;
      hold = state.hold;
      bits = state.bits;
      lcode = state.lencode;
      dcode = state.distcode;
      lmask = (1 << state.lenbits) - 1;
      dmask = (1 << state.distbits) - 1;
      top:
        do {
          if (bits < 15) {
            hold += input[_in++] << bits;
            bits += 8;
            hold += input[_in++] << bits;
            bits += 8;
          }
          here = lcode[hold & lmask];
          dolen:
            for (; ; ) {
              op = here >>> 24;
              hold >>>= op;
              bits -= op;
              op = here >>> 16 & 255;
              if (op === 0) {
                output[_out++] = here & 65535;
              } else if (op & 16) {
                len = here & 65535;
                op &= 15;
                if (op) {
                  if (bits < op) {
                    hold += input[_in++] << bits;
                    bits += 8;
                  }
                  len += hold & (1 << op) - 1;
                  hold >>>= op;
                  bits -= op;
                }
                if (bits < 15) {
                  hold += input[_in++] << bits;
                  bits += 8;
                  hold += input[_in++] << bits;
                  bits += 8;
                }
                here = dcode[hold & dmask];
                dodist:
                  for (; ; ) {
                    op = here >>> 24;
                    hold >>>= op;
                    bits -= op;
                    op = here >>> 16 & 255;
                    if (op & 16) {
                      dist = here & 65535;
                      op &= 15;
                      if (bits < op) {
                        hold += input[_in++] << bits;
                        bits += 8;
                        if (bits < op) {
                          hold += input[_in++] << bits;
                          bits += 8;
                        }
                      }
                      dist += hold & (1 << op) - 1;
                      if (dist > dmax) {
                        strm.msg = "invalid distance too far back";
                        state.mode = BAD;
                        break top;
                      }
                      hold >>>= op;
                      bits -= op;
                      op = _out - beg;
                      if (dist > op) {
                        op = dist - op;
                        if (op > whave) {
                          if (state.sane) {
                            strm.msg = "invalid distance too far back";
                            state.mode = BAD;
                            break top;
                          }
                        }
                        from = 0;
                        from_source = s_window;
                        if (wnext === 0) {
                          from += wsize - op;
                          if (op < len) {
                            len -= op;
                            do {
                              output[_out++] = s_window[from++];
                            } while (--op);
                            from = _out - dist;
                            from_source = output;
                          }
                        } else if (wnext < op) {
                          from += wsize + wnext - op;
                          op -= wnext;
                          if (op < len) {
                            len -= op;
                            do {
                              output[_out++] = s_window[from++];
                            } while (--op);
                            from = 0;
                            if (wnext < len) {
                              op = wnext;
                              len -= op;
                              do {
                                output[_out++] = s_window[from++];
                              } while (--op);
                              from = _out - dist;
                              from_source = output;
                            }
                          }
                        } else {
                          from += wnext - op;
                          if (op < len) {
                            len -= op;
                            do {
                              output[_out++] = s_window[from++];
                            } while (--op);
                            from = _out - dist;
                            from_source = output;
                          }
                        }
                        while (len > 2) {
                          output[_out++] = from_source[from++];
                          output[_out++] = from_source[from++];
                          output[_out++] = from_source[from++];
                          len -= 3;
                        }
                        if (len) {
                          output[_out++] = from_source[from++];
                          if (len > 1) {
                            output[_out++] = from_source[from++];
                          }
                        }
                      } else {
                        from = _out - dist;
                        do {
                          output[_out++] = output[from++];
                          output[_out++] = output[from++];
                          output[_out++] = output[from++];
                          len -= 3;
                        } while (len > 2);
                        if (len) {
                          output[_out++] = output[from++];
                          if (len > 1) {
                            output[_out++] = output[from++];
                          }
                        }
                      }
                    } else if ((op & 64) === 0) {
                      here = dcode[(here & 65535) + (hold & (1 << op) - 1)];
                      continue dodist;
                    } else {
                      strm.msg = "invalid distance code";
                      state.mode = BAD;
                      break top;
                    }
                    break;
                  }
              } else if ((op & 64) === 0) {
                here = lcode[(here & 65535) + (hold & (1 << op) - 1)];
                continue dolen;
              } else if (op & 32) {
                state.mode = TYPE;
                break top;
              } else {
                strm.msg = "invalid literal/length code";
                state.mode = BAD;
                break top;
              }
              break;
            }
        } while (_in < last && _out < end);
      len = bits >> 3;
      _in -= len;
      bits -= len << 3;
      hold &= (1 << bits) - 1;
      strm.next_in = _in;
      strm.next_out = _out;
      strm.avail_in = _in < last ? 5 + (last - _in) : 5 - (_in - last);
      strm.avail_out = _out < end ? 257 + (end - _out) : 257 - (_out - end);
      state.hold = hold;
      state.bits = bits;
      return;
    }, "inflate_fast");
  }
});

// node_modules/pako/lib/zlib/inftrees.js
var require_inftrees = __commonJS({
  "node_modules/pako/lib/zlib/inftrees.js"(exports, module) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    var utils = require_common();
    var MAXBITS = 15;
    var ENOUGH_LENS = 852;
    var ENOUGH_DISTS = 592;
    var CODES = 0;
    var LENS = 1;
    var DISTS = 2;
    var lbase = [
      /* Length codes 257..285 base */
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      13,
      15,
      17,
      19,
      23,
      27,
      31,
      35,
      43,
      51,
      59,
      67,
      83,
      99,
      115,
      131,
      163,
      195,
      227,
      258,
      0,
      0
    ];
    var lext = [
      /* Length codes 257..285 extra */
      16,
      16,
      16,
      16,
      16,
      16,
      16,
      16,
      17,
      17,
      17,
      17,
      18,
      18,
      18,
      18,
      19,
      19,
      19,
      19,
      20,
      20,
      20,
      20,
      21,
      21,
      21,
      21,
      16,
      72,
      78
    ];
    var dbase = [
      /* Distance codes 0..29 base */
      1,
      2,
      3,
      4,
      5,
      7,
      9,
      13,
      17,
      25,
      33,
      49,
      65,
      97,
      129,
      193,
      257,
      385,
      513,
      769,
      1025,
      1537,
      2049,
      3073,
      4097,
      6145,
      8193,
      12289,
      16385,
      24577,
      0,
      0
    ];
    var dext = [
      /* Distance codes 0..29 extra */
      16,
      16,
      16,
      16,
      17,
      17,
      18,
      18,
      19,
      19,
      20,
      20,
      21,
      21,
      22,
      22,
      23,
      23,
      24,
      24,
      25,
      25,
      26,
      26,
      27,
      27,
      28,
      28,
      29,
      29,
      64,
      64
    ];
    module.exports = /* @__PURE__ */ __name(function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts) {
      var bits = opts.bits;
      var len = 0;
      var sym = 0;
      var min = 0, max = 0;
      var root = 0;
      var curr = 0;
      var drop = 0;
      var left = 0;
      var used = 0;
      var huff = 0;
      var incr;
      var fill;
      var low;
      var mask;
      var next;
      var base = null;
      var base_index = 0;
      var end;
      var count = new utils.Buf16(MAXBITS + 1);
      var offs = new utils.Buf16(MAXBITS + 1);
      var extra = null;
      var extra_index = 0;
      var here_bits, here_op, here_val;
      for (len = 0; len <= MAXBITS; len++) {
        count[len] = 0;
      }
      for (sym = 0; sym < codes; sym++) {
        count[lens[lens_index + sym]]++;
      }
      root = bits;
      for (max = MAXBITS; max >= 1; max--) {
        if (count[max] !== 0) {
          break;
        }
      }
      if (root > max) {
        root = max;
      }
      if (max === 0) {
        table[table_index++] = 1 << 24 | 64 << 16 | 0;
        table[table_index++] = 1 << 24 | 64 << 16 | 0;
        opts.bits = 1;
        return 0;
      }
      for (min = 1; min < max; min++) {
        if (count[min] !== 0) {
          break;
        }
      }
      if (root < min) {
        root = min;
      }
      left = 1;
      for (len = 1; len <= MAXBITS; len++) {
        left <<= 1;
        left -= count[len];
        if (left < 0) {
          return -1;
        }
      }
      if (left > 0 && (type === CODES || max !== 1)) {
        return -1;
      }
      offs[1] = 0;
      for (len = 1; len < MAXBITS; len++) {
        offs[len + 1] = offs[len] + count[len];
      }
      for (sym = 0; sym < codes; sym++) {
        if (lens[lens_index + sym] !== 0) {
          work[offs[lens[lens_index + sym]]++] = sym;
        }
      }
      if (type === CODES) {
        base = extra = work;
        end = 19;
      } else if (type === LENS) {
        base = lbase;
        base_index -= 257;
        extra = lext;
        extra_index -= 257;
        end = 256;
      } else {
        base = dbase;
        extra = dext;
        end = -1;
      }
      huff = 0;
      sym = 0;
      len = min;
      next = table_index;
      curr = root;
      drop = 0;
      low = -1;
      used = 1 << root;
      mask = used - 1;
      if (type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS) {
        return 1;
      }
      for (; ; ) {
        here_bits = len - drop;
        if (work[sym] < end) {
          here_op = 0;
          here_val = work[sym];
        } else if (work[sym] > end) {
          here_op = extra[extra_index + work[sym]];
          here_val = base[base_index + work[sym]];
        } else {
          here_op = 32 + 64;
          here_val = 0;
        }
        incr = 1 << len - drop;
        fill = 1 << curr;
        min = fill;
        do {
          fill -= incr;
          table[next + (huff >> drop) + fill] = here_bits << 24 | here_op << 16 | here_val | 0;
        } while (fill !== 0);
        incr = 1 << len - 1;
        while (huff & incr) {
          incr >>= 1;
        }
        if (incr !== 0) {
          huff &= incr - 1;
          huff += incr;
        } else {
          huff = 0;
        }
        sym++;
        if (--count[len] === 0) {
          if (len === max) {
            break;
          }
          len = lens[lens_index + work[sym]];
        }
        if (len > root && (huff & mask) !== low) {
          if (drop === 0) {
            drop = root;
          }
          next += min;
          curr = len - drop;
          left = 1 << curr;
          while (curr + drop < max) {
            left -= count[curr + drop];
            if (left <= 0) {
              break;
            }
            curr++;
            left <<= 1;
          }
          used += 1 << curr;
          if (type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS) {
            return 1;
          }
          low = huff & mask;
          table[low] = root << 24 | curr << 16 | next - table_index | 0;
        }
      }
      if (huff !== 0) {
        table[next + huff] = len - drop << 24 | 64 << 16 | 0;
      }
      opts.bits = root;
      return 0;
    }, "inflate_table");
  }
});

// node_modules/pako/lib/zlib/inflate.js
var require_inflate = __commonJS({
  "node_modules/pako/lib/zlib/inflate.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    var utils = require_common();
    var adler32 = require_adler32();
    var crc32 = require_crc32();
    var inflate_fast = require_inffast();
    var inflate_table = require_inftrees();
    var CODES = 0;
    var LENS = 1;
    var DISTS = 2;
    var Z_FINISH = 4;
    var Z_BLOCK = 5;
    var Z_TREES = 6;
    var Z_OK = 0;
    var Z_STREAM_END = 1;
    var Z_NEED_DICT = 2;
    var Z_STREAM_ERROR = -2;
    var Z_DATA_ERROR = -3;
    var Z_MEM_ERROR = -4;
    var Z_BUF_ERROR = -5;
    var Z_DEFLATED = 8;
    var HEAD = 1;
    var FLAGS = 2;
    var TIME = 3;
    var OS = 4;
    var EXLEN = 5;
    var EXTRA = 6;
    var NAME = 7;
    var COMMENT = 8;
    var HCRC = 9;
    var DICTID = 10;
    var DICT = 11;
    var TYPE = 12;
    var TYPEDO = 13;
    var STORED = 14;
    var COPY_ = 15;
    var COPY = 16;
    var TABLE = 17;
    var LENLENS = 18;
    var CODELENS = 19;
    var LEN_ = 20;
    var LEN = 21;
    var LENEXT = 22;
    var DIST = 23;
    var DISTEXT = 24;
    var MATCH = 25;
    var LIT = 26;
    var CHECK = 27;
    var LENGTH = 28;
    var DONE = 29;
    var BAD = 30;
    var MEM = 31;
    var SYNC = 32;
    var ENOUGH_LENS = 852;
    var ENOUGH_DISTS = 592;
    var MAX_WBITS = 15;
    var DEF_WBITS = MAX_WBITS;
    function zswap32(q) {
      return (q >>> 24 & 255) + (q >>> 8 & 65280) + ((q & 65280) << 8) + ((q & 255) << 24);
    }
    __name(zswap32, "zswap32");
    function InflateState() {
      this.mode = 0;
      this.last = false;
      this.wrap = 0;
      this.havedict = false;
      this.flags = 0;
      this.dmax = 0;
      this.check = 0;
      this.total = 0;
      this.head = null;
      this.wbits = 0;
      this.wsize = 0;
      this.whave = 0;
      this.wnext = 0;
      this.window = null;
      this.hold = 0;
      this.bits = 0;
      this.length = 0;
      this.offset = 0;
      this.extra = 0;
      this.lencode = null;
      this.distcode = null;
      this.lenbits = 0;
      this.distbits = 0;
      this.ncode = 0;
      this.nlen = 0;
      this.ndist = 0;
      this.have = 0;
      this.next = null;
      this.lens = new utils.Buf16(320);
      this.work = new utils.Buf16(288);
      this.lendyn = null;
      this.distdyn = null;
      this.sane = 0;
      this.back = 0;
      this.was = 0;
    }
    __name(InflateState, "InflateState");
    function inflateResetKeep(strm) {
      var state;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      strm.total_in = strm.total_out = state.total = 0;
      strm.msg = "";
      if (state.wrap) {
        strm.adler = state.wrap & 1;
      }
      state.mode = HEAD;
      state.last = 0;
      state.havedict = 0;
      state.dmax = 32768;
      state.head = null;
      state.hold = 0;
      state.bits = 0;
      state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS);
      state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS);
      state.sane = 1;
      state.back = -1;
      return Z_OK;
    }
    __name(inflateResetKeep, "inflateResetKeep");
    function inflateReset(strm) {
      var state;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      state.wsize = 0;
      state.whave = 0;
      state.wnext = 0;
      return inflateResetKeep(strm);
    }
    __name(inflateReset, "inflateReset");
    function inflateReset2(strm, windowBits) {
      var wrap;
      var state;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      if (windowBits < 0) {
        wrap = 0;
        windowBits = -windowBits;
      } else {
        wrap = (windowBits >> 4) + 1;
        if (windowBits < 48) {
          windowBits &= 15;
        }
      }
      if (windowBits && (windowBits < 8 || windowBits > 15)) {
        return Z_STREAM_ERROR;
      }
      if (state.window !== null && state.wbits !== windowBits) {
        state.window = null;
      }
      state.wrap = wrap;
      state.wbits = windowBits;
      return inflateReset(strm);
    }
    __name(inflateReset2, "inflateReset2");
    function inflateInit2(strm, windowBits) {
      var ret;
      var state;
      if (!strm) {
        return Z_STREAM_ERROR;
      }
      state = new InflateState();
      strm.state = state;
      state.window = null;
      ret = inflateReset2(strm, windowBits);
      if (ret !== Z_OK) {
        strm.state = null;
      }
      return ret;
    }
    __name(inflateInit2, "inflateInit2");
    function inflateInit(strm) {
      return inflateInit2(strm, DEF_WBITS);
    }
    __name(inflateInit, "inflateInit");
    var virgin = true;
    var lenfix;
    var distfix;
    function fixedtables(state) {
      if (virgin) {
        var sym;
        lenfix = new utils.Buf32(512);
        distfix = new utils.Buf32(32);
        sym = 0;
        while (sym < 144) {
          state.lens[sym++] = 8;
        }
        while (sym < 256) {
          state.lens[sym++] = 9;
        }
        while (sym < 280) {
          state.lens[sym++] = 7;
        }
        while (sym < 288) {
          state.lens[sym++] = 8;
        }
        inflate_table(LENS, state.lens, 0, 288, lenfix, 0, state.work, { bits: 9 });
        sym = 0;
        while (sym < 32) {
          state.lens[sym++] = 5;
        }
        inflate_table(DISTS, state.lens, 0, 32, distfix, 0, state.work, { bits: 5 });
        virgin = false;
      }
      state.lencode = lenfix;
      state.lenbits = 9;
      state.distcode = distfix;
      state.distbits = 5;
    }
    __name(fixedtables, "fixedtables");
    function updatewindow(strm, src, end, copy) {
      var dist;
      var state = strm.state;
      if (state.window === null) {
        state.wsize = 1 << state.wbits;
        state.wnext = 0;
        state.whave = 0;
        state.window = new utils.Buf8(state.wsize);
      }
      if (copy >= state.wsize) {
        utils.arraySet(state.window, src, end - state.wsize, state.wsize, 0);
        state.wnext = 0;
        state.whave = state.wsize;
      } else {
        dist = state.wsize - state.wnext;
        if (dist > copy) {
          dist = copy;
        }
        utils.arraySet(state.window, src, end - copy, dist, state.wnext);
        copy -= dist;
        if (copy) {
          utils.arraySet(state.window, src, end - copy, copy, 0);
          state.wnext = copy;
          state.whave = state.wsize;
        } else {
          state.wnext += dist;
          if (state.wnext === state.wsize) {
            state.wnext = 0;
          }
          if (state.whave < state.wsize) {
            state.whave += dist;
          }
        }
      }
      return 0;
    }
    __name(updatewindow, "updatewindow");
    function inflate(strm, flush) {
      var state;
      var input, output;
      var next;
      var put;
      var have, left;
      var hold;
      var bits;
      var _in, _out;
      var copy;
      var from;
      var from_source;
      var here = 0;
      var here_bits, here_op, here_val;
      var last_bits, last_op, last_val;
      var len;
      var ret;
      var hbuf = new utils.Buf8(4);
      var opts;
      var n;
      var order = (
        /* permutation of code lengths */
        [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]
      );
      if (!strm || !strm.state || !strm.output || !strm.input && strm.avail_in !== 0) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      if (state.mode === TYPE) {
        state.mode = TYPEDO;
      }
      put = strm.next_out;
      output = strm.output;
      left = strm.avail_out;
      next = strm.next_in;
      input = strm.input;
      have = strm.avail_in;
      hold = state.hold;
      bits = state.bits;
      _in = have;
      _out = left;
      ret = Z_OK;
      inf_leave:
        for (; ; ) {
          switch (state.mode) {
            case HEAD:
              if (state.wrap === 0) {
                state.mode = TYPEDO;
                break;
              }
              while (bits < 16) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (state.wrap & 2 && hold === 35615) {
                state.check = 0;
                hbuf[0] = hold & 255;
                hbuf[1] = hold >>> 8 & 255;
                state.check = crc32(state.check, hbuf, 2, 0);
                hold = 0;
                bits = 0;
                state.mode = FLAGS;
                break;
              }
              state.flags = 0;
              if (state.head) {
                state.head.done = false;
              }
              if (!(state.wrap & 1) || /* check if zlib header allowed */
              (((hold & 255) << 8) + (hold >> 8)) % 31) {
                strm.msg = "incorrect header check";
                state.mode = BAD;
                break;
              }
              if ((hold & 15) !== Z_DEFLATED) {
                strm.msg = "unknown compression method";
                state.mode = BAD;
                break;
              }
              hold >>>= 4;
              bits -= 4;
              len = (hold & 15) + 8;
              if (state.wbits === 0) {
                state.wbits = len;
              } else if (len > state.wbits) {
                strm.msg = "invalid window size";
                state.mode = BAD;
                break;
              }
              state.dmax = 1 << len;
              strm.adler = state.check = 1;
              state.mode = hold & 512 ? DICTID : TYPE;
              hold = 0;
              bits = 0;
              break;
            case FLAGS:
              while (bits < 16) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.flags = hold;
              if ((state.flags & 255) !== Z_DEFLATED) {
                strm.msg = "unknown compression method";
                state.mode = BAD;
                break;
              }
              if (state.flags & 57344) {
                strm.msg = "unknown header flags set";
                state.mode = BAD;
                break;
              }
              if (state.head) {
                state.head.text = hold >> 8 & 1;
              }
              if (state.flags & 512) {
                hbuf[0] = hold & 255;
                hbuf[1] = hold >>> 8 & 255;
                state.check = crc32(state.check, hbuf, 2, 0);
              }
              hold = 0;
              bits = 0;
              state.mode = TIME;
            /* falls through */
            case TIME:
              while (bits < 32) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (state.head) {
                state.head.time = hold;
              }
              if (state.flags & 512) {
                hbuf[0] = hold & 255;
                hbuf[1] = hold >>> 8 & 255;
                hbuf[2] = hold >>> 16 & 255;
                hbuf[3] = hold >>> 24 & 255;
                state.check = crc32(state.check, hbuf, 4, 0);
              }
              hold = 0;
              bits = 0;
              state.mode = OS;
            /* falls through */
            case OS:
              while (bits < 16) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (state.head) {
                state.head.xflags = hold & 255;
                state.head.os = hold >> 8;
              }
              if (state.flags & 512) {
                hbuf[0] = hold & 255;
                hbuf[1] = hold >>> 8 & 255;
                state.check = crc32(state.check, hbuf, 2, 0);
              }
              hold = 0;
              bits = 0;
              state.mode = EXLEN;
            /* falls through */
            case EXLEN:
              if (state.flags & 1024) {
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.length = hold;
                if (state.head) {
                  state.head.extra_len = hold;
                }
                if (state.flags & 512) {
                  hbuf[0] = hold & 255;
                  hbuf[1] = hold >>> 8 & 255;
                  state.check = crc32(state.check, hbuf, 2, 0);
                }
                hold = 0;
                bits = 0;
              } else if (state.head) {
                state.head.extra = null;
              }
              state.mode = EXTRA;
            /* falls through */
            case EXTRA:
              if (state.flags & 1024) {
                copy = state.length;
                if (copy > have) {
                  copy = have;
                }
                if (copy) {
                  if (state.head) {
                    len = state.head.extra_len - state.length;
                    if (!state.head.extra) {
                      state.head.extra = new Array(state.head.extra_len);
                    }
                    utils.arraySet(
                      state.head.extra,
                      input,
                      next,
                      // extra field is limited to 65536 bytes
                      // - no need for additional size check
                      copy,
                      /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                      len
                    );
                  }
                  if (state.flags & 512) {
                    state.check = crc32(state.check, input, copy, next);
                  }
                  have -= copy;
                  next += copy;
                  state.length -= copy;
                }
                if (state.length) {
                  break inf_leave;
                }
              }
              state.length = 0;
              state.mode = NAME;
            /* falls through */
            case NAME:
              if (state.flags & 2048) {
                if (have === 0) {
                  break inf_leave;
                }
                copy = 0;
                do {
                  len = input[next + copy++];
                  if (state.head && len && state.length < 65536) {
                    state.head.name += String.fromCharCode(len);
                  }
                } while (len && copy < have);
                if (state.flags & 512) {
                  state.check = crc32(state.check, input, copy, next);
                }
                have -= copy;
                next += copy;
                if (len) {
                  break inf_leave;
                }
              } else if (state.head) {
                state.head.name = null;
              }
              state.length = 0;
              state.mode = COMMENT;
            /* falls through */
            case COMMENT:
              if (state.flags & 4096) {
                if (have === 0) {
                  break inf_leave;
                }
                copy = 0;
                do {
                  len = input[next + copy++];
                  if (state.head && len && state.length < 65536) {
                    state.head.comment += String.fromCharCode(len);
                  }
                } while (len && copy < have);
                if (state.flags & 512) {
                  state.check = crc32(state.check, input, copy, next);
                }
                have -= copy;
                next += copy;
                if (len) {
                  break inf_leave;
                }
              } else if (state.head) {
                state.head.comment = null;
              }
              state.mode = HCRC;
            /* falls through */
            case HCRC:
              if (state.flags & 512) {
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (hold !== (state.check & 65535)) {
                  strm.msg = "header crc mismatch";
                  state.mode = BAD;
                  break;
                }
                hold = 0;
                bits = 0;
              }
              if (state.head) {
                state.head.hcrc = state.flags >> 9 & 1;
                state.head.done = true;
              }
              strm.adler = state.check = 0;
              state.mode = TYPE;
              break;
            case DICTID:
              while (bits < 32) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              strm.adler = state.check = zswap32(hold);
              hold = 0;
              bits = 0;
              state.mode = DICT;
            /* falls through */
            case DICT:
              if (state.havedict === 0) {
                strm.next_out = put;
                strm.avail_out = left;
                strm.next_in = next;
                strm.avail_in = have;
                state.hold = hold;
                state.bits = bits;
                return Z_NEED_DICT;
              }
              strm.adler = state.check = 1;
              state.mode = TYPE;
            /* falls through */
            case TYPE:
              if (flush === Z_BLOCK || flush === Z_TREES) {
                break inf_leave;
              }
            /* falls through */
            case TYPEDO:
              if (state.last) {
                hold >>>= bits & 7;
                bits -= bits & 7;
                state.mode = CHECK;
                break;
              }
              while (bits < 3) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.last = hold & 1;
              hold >>>= 1;
              bits -= 1;
              switch (hold & 3) {
                case 0:
                  state.mode = STORED;
                  break;
                case 1:
                  fixedtables(state);
                  state.mode = LEN_;
                  if (flush === Z_TREES) {
                    hold >>>= 2;
                    bits -= 2;
                    break inf_leave;
                  }
                  break;
                case 2:
                  state.mode = TABLE;
                  break;
                case 3:
                  strm.msg = "invalid block type";
                  state.mode = BAD;
              }
              hold >>>= 2;
              bits -= 2;
              break;
            case STORED:
              hold >>>= bits & 7;
              bits -= bits & 7;
              while (bits < 32) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if ((hold & 65535) !== (hold >>> 16 ^ 65535)) {
                strm.msg = "invalid stored block lengths";
                state.mode = BAD;
                break;
              }
              state.length = hold & 65535;
              hold = 0;
              bits = 0;
              state.mode = COPY_;
              if (flush === Z_TREES) {
                break inf_leave;
              }
            /* falls through */
            case COPY_:
              state.mode = COPY;
            /* falls through */
            case COPY:
              copy = state.length;
              if (copy) {
                if (copy > have) {
                  copy = have;
                }
                if (copy > left) {
                  copy = left;
                }
                if (copy === 0) {
                  break inf_leave;
                }
                utils.arraySet(output, input, next, copy, put);
                have -= copy;
                next += copy;
                left -= copy;
                put += copy;
                state.length -= copy;
                break;
              }
              state.mode = TYPE;
              break;
            case TABLE:
              while (bits < 14) {
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              state.nlen = (hold & 31) + 257;
              hold >>>= 5;
              bits -= 5;
              state.ndist = (hold & 31) + 1;
              hold >>>= 5;
              bits -= 5;
              state.ncode = (hold & 15) + 4;
              hold >>>= 4;
              bits -= 4;
              if (state.nlen > 286 || state.ndist > 30) {
                strm.msg = "too many length or distance symbols";
                state.mode = BAD;
                break;
              }
              state.have = 0;
              state.mode = LENLENS;
            /* falls through */
            case LENLENS:
              while (state.have < state.ncode) {
                while (bits < 3) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.lens[order[state.have++]] = hold & 7;
                hold >>>= 3;
                bits -= 3;
              }
              while (state.have < 19) {
                state.lens[order[state.have++]] = 0;
              }
              state.lencode = state.lendyn;
              state.lenbits = 7;
              opts = { bits: state.lenbits };
              ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
              state.lenbits = opts.bits;
              if (ret) {
                strm.msg = "invalid code lengths set";
                state.mode = BAD;
                break;
              }
              state.have = 0;
              state.mode = CODELENS;
            /* falls through */
            case CODELENS:
              while (state.have < state.nlen + state.ndist) {
                for (; ; ) {
                  here = state.lencode[hold & (1 << state.lenbits) - 1];
                  here_bits = here >>> 24;
                  here_op = here >>> 16 & 255;
                  here_val = here & 65535;
                  if (here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (here_val < 16) {
                  hold >>>= here_bits;
                  bits -= here_bits;
                  state.lens[state.have++] = here_val;
                } else {
                  if (here_val === 16) {
                    n = here_bits + 2;
                    while (bits < n) {
                      if (have === 0) {
                        break inf_leave;
                      }
                      have--;
                      hold += input[next++] << bits;
                      bits += 8;
                    }
                    hold >>>= here_bits;
                    bits -= here_bits;
                    if (state.have === 0) {
                      strm.msg = "invalid bit length repeat";
                      state.mode = BAD;
                      break;
                    }
                    len = state.lens[state.have - 1];
                    copy = 3 + (hold & 3);
                    hold >>>= 2;
                    bits -= 2;
                  } else if (here_val === 17) {
                    n = here_bits + 3;
                    while (bits < n) {
                      if (have === 0) {
                        break inf_leave;
                      }
                      have--;
                      hold += input[next++] << bits;
                      bits += 8;
                    }
                    hold >>>= here_bits;
                    bits -= here_bits;
                    len = 0;
                    copy = 3 + (hold & 7);
                    hold >>>= 3;
                    bits -= 3;
                  } else {
                    n = here_bits + 7;
                    while (bits < n) {
                      if (have === 0) {
                        break inf_leave;
                      }
                      have--;
                      hold += input[next++] << bits;
                      bits += 8;
                    }
                    hold >>>= here_bits;
                    bits -= here_bits;
                    len = 0;
                    copy = 11 + (hold & 127);
                    hold >>>= 7;
                    bits -= 7;
                  }
                  if (state.have + copy > state.nlen + state.ndist) {
                    strm.msg = "invalid bit length repeat";
                    state.mode = BAD;
                    break;
                  }
                  while (copy--) {
                    state.lens[state.have++] = len;
                  }
                }
              }
              if (state.mode === BAD) {
                break;
              }
              if (state.lens[256] === 0) {
                strm.msg = "invalid code -- missing end-of-block";
                state.mode = BAD;
                break;
              }
              state.lenbits = 9;
              opts = { bits: state.lenbits };
              ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
              state.lenbits = opts.bits;
              if (ret) {
                strm.msg = "invalid literal/lengths set";
                state.mode = BAD;
                break;
              }
              state.distbits = 6;
              state.distcode = state.distdyn;
              opts = { bits: state.distbits };
              ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
              state.distbits = opts.bits;
              if (ret) {
                strm.msg = "invalid distances set";
                state.mode = BAD;
                break;
              }
              state.mode = LEN_;
              if (flush === Z_TREES) {
                break inf_leave;
              }
            /* falls through */
            case LEN_:
              state.mode = LEN;
            /* falls through */
            case LEN:
              if (have >= 6 && left >= 258) {
                strm.next_out = put;
                strm.avail_out = left;
                strm.next_in = next;
                strm.avail_in = have;
                state.hold = hold;
                state.bits = bits;
                inflate_fast(strm, _out);
                put = strm.next_out;
                output = strm.output;
                left = strm.avail_out;
                next = strm.next_in;
                input = strm.input;
                have = strm.avail_in;
                hold = state.hold;
                bits = state.bits;
                if (state.mode === TYPE) {
                  state.back = -1;
                }
                break;
              }
              state.back = 0;
              for (; ; ) {
                here = state.lencode[hold & (1 << state.lenbits) - 1];
                here_bits = here >>> 24;
                here_op = here >>> 16 & 255;
                here_val = here & 65535;
                if (here_bits <= bits) {
                  break;
                }
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if (here_op && (here_op & 240) === 0) {
                last_bits = here_bits;
                last_op = here_op;
                last_val = here_val;
                for (; ; ) {
                  here = state.lencode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
                  here_bits = here >>> 24;
                  here_op = here >>> 16 & 255;
                  here_val = here & 65535;
                  if (last_bits + here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                hold >>>= last_bits;
                bits -= last_bits;
                state.back += last_bits;
              }
              hold >>>= here_bits;
              bits -= here_bits;
              state.back += here_bits;
              state.length = here_val;
              if (here_op === 0) {
                state.mode = LIT;
                break;
              }
              if (here_op & 32) {
                state.back = -1;
                state.mode = TYPE;
                break;
              }
              if (here_op & 64) {
                strm.msg = "invalid literal/length code";
                state.mode = BAD;
                break;
              }
              state.extra = here_op & 15;
              state.mode = LENEXT;
            /* falls through */
            case LENEXT:
              if (state.extra) {
                n = state.extra;
                while (bits < n) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.length += hold & (1 << state.extra) - 1;
                hold >>>= state.extra;
                bits -= state.extra;
                state.back += state.extra;
              }
              state.was = state.length;
              state.mode = DIST;
            /* falls through */
            case DIST:
              for (; ; ) {
                here = state.distcode[hold & (1 << state.distbits) - 1];
                here_bits = here >>> 24;
                here_op = here >>> 16 & 255;
                here_val = here & 65535;
                if (here_bits <= bits) {
                  break;
                }
                if (have === 0) {
                  break inf_leave;
                }
                have--;
                hold += input[next++] << bits;
                bits += 8;
              }
              if ((here_op & 240) === 0) {
                last_bits = here_bits;
                last_op = here_op;
                last_val = here_val;
                for (; ; ) {
                  here = state.distcode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
                  here_bits = here >>> 24;
                  here_op = here >>> 16 & 255;
                  here_val = here & 65535;
                  if (last_bits + here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                hold >>>= last_bits;
                bits -= last_bits;
                state.back += last_bits;
              }
              hold >>>= here_bits;
              bits -= here_bits;
              state.back += here_bits;
              if (here_op & 64) {
                strm.msg = "invalid distance code";
                state.mode = BAD;
                break;
              }
              state.offset = here_val;
              state.extra = here_op & 15;
              state.mode = DISTEXT;
            /* falls through */
            case DISTEXT:
              if (state.extra) {
                n = state.extra;
                while (bits < n) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.offset += hold & (1 << state.extra) - 1;
                hold >>>= state.extra;
                bits -= state.extra;
                state.back += state.extra;
              }
              if (state.offset > state.dmax) {
                strm.msg = "invalid distance too far back";
                state.mode = BAD;
                break;
              }
              state.mode = MATCH;
            /* falls through */
            case MATCH:
              if (left === 0) {
                break inf_leave;
              }
              copy = _out - left;
              if (state.offset > copy) {
                copy = state.offset - copy;
                if (copy > state.whave) {
                  if (state.sane) {
                    strm.msg = "invalid distance too far back";
                    state.mode = BAD;
                    break;
                  }
                }
                if (copy > state.wnext) {
                  copy -= state.wnext;
                  from = state.wsize - copy;
                } else {
                  from = state.wnext - copy;
                }
                if (copy > state.length) {
                  copy = state.length;
                }
                from_source = state.window;
              } else {
                from_source = output;
                from = put - state.offset;
                copy = state.length;
              }
              if (copy > left) {
                copy = left;
              }
              left -= copy;
              state.length -= copy;
              do {
                output[put++] = from_source[from++];
              } while (--copy);
              if (state.length === 0) {
                state.mode = LEN;
              }
              break;
            case LIT:
              if (left === 0) {
                break inf_leave;
              }
              output[put++] = state.length;
              left--;
              state.mode = LEN;
              break;
            case CHECK:
              if (state.wrap) {
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold |= input[next++] << bits;
                  bits += 8;
                }
                _out -= left;
                strm.total_out += _out;
                state.total += _out;
                if (_out) {
                  strm.adler = state.check = /*UPDATE(state.check, put - _out, _out);*/
                  state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out);
                }
                _out = left;
                if ((state.flags ? hold : zswap32(hold)) !== state.check) {
                  strm.msg = "incorrect data check";
                  state.mode = BAD;
                  break;
                }
                hold = 0;
                bits = 0;
              }
              state.mode = LENGTH;
            /* falls through */
            case LENGTH:
              if (state.wrap && state.flags) {
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (hold !== (state.total & 4294967295)) {
                  strm.msg = "incorrect length check";
                  state.mode = BAD;
                  break;
                }
                hold = 0;
                bits = 0;
              }
              state.mode = DONE;
            /* falls through */
            case DONE:
              ret = Z_STREAM_END;
              break inf_leave;
            case BAD:
              ret = Z_DATA_ERROR;
              break inf_leave;
            case MEM:
              return Z_MEM_ERROR;
            case SYNC:
            /* falls through */
            default:
              return Z_STREAM_ERROR;
          }
        }
      strm.next_out = put;
      strm.avail_out = left;
      strm.next_in = next;
      strm.avail_in = have;
      state.hold = hold;
      state.bits = bits;
      if (state.wsize || _out !== strm.avail_out && state.mode < BAD && (state.mode < CHECK || flush !== Z_FINISH)) {
        if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) {
          state.mode = MEM;
          return Z_MEM_ERROR;
        }
      }
      _in -= strm.avail_in;
      _out -= strm.avail_out;
      strm.total_in += _in;
      strm.total_out += _out;
      state.total += _out;
      if (state.wrap && _out) {
        strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
        state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out);
      }
      strm.data_type = state.bits + (state.last ? 64 : 0) + (state.mode === TYPE ? 128 : 0) + (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
      if ((_in === 0 && _out === 0 || flush === Z_FINISH) && ret === Z_OK) {
        ret = Z_BUF_ERROR;
      }
      return ret;
    }
    __name(inflate, "inflate");
    function inflateEnd(strm) {
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      var state = strm.state;
      if (state.window) {
        state.window = null;
      }
      strm.state = null;
      return Z_OK;
    }
    __name(inflateEnd, "inflateEnd");
    function inflateGetHeader(strm, head) {
      var state;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      if ((state.wrap & 2) === 0) {
        return Z_STREAM_ERROR;
      }
      state.head = head;
      head.done = false;
      return Z_OK;
    }
    __name(inflateGetHeader, "inflateGetHeader");
    function inflateSetDictionary(strm, dictionary) {
      var dictLength = dictionary.length;
      var state;
      var dictid;
      var ret;
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      if (state.wrap !== 0 && state.mode !== DICT) {
        return Z_STREAM_ERROR;
      }
      if (state.mode === DICT) {
        dictid = 1;
        dictid = adler32(dictid, dictionary, dictLength, 0);
        if (dictid !== state.check) {
          return Z_DATA_ERROR;
        }
      }
      ret = updatewindow(strm, dictionary, dictLength, dictLength);
      if (ret) {
        state.mode = MEM;
        return Z_MEM_ERROR;
      }
      state.havedict = 1;
      return Z_OK;
    }
    __name(inflateSetDictionary, "inflateSetDictionary");
    exports.inflateReset = inflateReset;
    exports.inflateReset2 = inflateReset2;
    exports.inflateResetKeep = inflateResetKeep;
    exports.inflateInit = inflateInit;
    exports.inflateInit2 = inflateInit2;
    exports.inflate = inflate;
    exports.inflateEnd = inflateEnd;
    exports.inflateGetHeader = inflateGetHeader;
    exports.inflateSetDictionary = inflateSetDictionary;
    exports.inflateInfo = "pako inflate (from Nodeca project)";
  }
});

// node_modules/pako/lib/zlib/constants.js
var require_constants = __commonJS({
  "node_modules/pako/lib/zlib/constants.js"(exports, module) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    module.exports = {
      /* Allowed flush values; see deflate() and inflate() below for details */
      Z_NO_FLUSH: 0,
      Z_PARTIAL_FLUSH: 1,
      Z_SYNC_FLUSH: 2,
      Z_FULL_FLUSH: 3,
      Z_FINISH: 4,
      Z_BLOCK: 5,
      Z_TREES: 6,
      /* Return codes for the compression/decompression functions. Negative values
      * are errors, positive values are used for special but normal events.
      */
      Z_OK: 0,
      Z_STREAM_END: 1,
      Z_NEED_DICT: 2,
      Z_ERRNO: -1,
      Z_STREAM_ERROR: -2,
      Z_DATA_ERROR: -3,
      //Z_MEM_ERROR:     -4,
      Z_BUF_ERROR: -5,
      //Z_VERSION_ERROR: -6,
      /* compression levels */
      Z_NO_COMPRESSION: 0,
      Z_BEST_SPEED: 1,
      Z_BEST_COMPRESSION: 9,
      Z_DEFAULT_COMPRESSION: -1,
      Z_FILTERED: 1,
      Z_HUFFMAN_ONLY: 2,
      Z_RLE: 3,
      Z_FIXED: 4,
      Z_DEFAULT_STRATEGY: 0,
      /* Possible values of the data_type field (though see inflate()) */
      Z_BINARY: 0,
      Z_TEXT: 1,
      //Z_ASCII:                1, // = Z_TEXT (deprecated)
      Z_UNKNOWN: 2,
      /* The deflate compression method */
      Z_DEFLATED: 8
      //Z_NULL:                 null // Use -1 or null inline, depending on var type
    };
  }
});

// node_modules/pako/lib/zlib/gzheader.js
var require_gzheader = __commonJS({
  "node_modules/pako/lib/zlib/gzheader.js"(exports, module) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    function GZheader() {
      this.text = 0;
      this.time = 0;
      this.xflags = 0;
      this.os = 0;
      this.extra = null;
      this.extra_len = 0;
      this.name = "";
      this.comment = "";
      this.hcrc = 0;
      this.done = false;
    }
    __name(GZheader, "GZheader");
    module.exports = GZheader;
  }
});

// node_modules/pako/lib/inflate.js
var require_inflate2 = __commonJS({
  "node_modules/pako/lib/inflate.js"(exports) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    var zlib_inflate = require_inflate();
    var utils = require_common();
    var strings = require_strings();
    var c = require_constants();
    var msg = require_messages();
    var ZStream = require_zstream();
    var GZheader = require_gzheader();
    var toString = Object.prototype.toString;
    function Inflate(options) {
      if (!(this instanceof Inflate)) return new Inflate(options);
      this.options = utils.assign({
        chunkSize: 16384,
        windowBits: 0,
        to: ""
      }, options || {});
      var opt = this.options;
      if (opt.raw && opt.windowBits >= 0 && opt.windowBits < 16) {
        opt.windowBits = -opt.windowBits;
        if (opt.windowBits === 0) {
          opt.windowBits = -15;
        }
      }
      if (opt.windowBits >= 0 && opt.windowBits < 16 && !(options && options.windowBits)) {
        opt.windowBits += 32;
      }
      if (opt.windowBits > 15 && opt.windowBits < 48) {
        if ((opt.windowBits & 15) === 0) {
          opt.windowBits |= 15;
        }
      }
      this.err = 0;
      this.msg = "";
      this.ended = false;
      this.chunks = [];
      this.strm = new ZStream();
      this.strm.avail_out = 0;
      var status = zlib_inflate.inflateInit2(
        this.strm,
        opt.windowBits
      );
      if (status !== c.Z_OK) {
        throw new Error(msg[status]);
      }
      this.header = new GZheader();
      zlib_inflate.inflateGetHeader(this.strm, this.header);
      if (opt.dictionary) {
        if (typeof opt.dictionary === "string") {
          opt.dictionary = strings.string2buf(opt.dictionary);
        } else if (toString.call(opt.dictionary) === "[object ArrayBuffer]") {
          opt.dictionary = new Uint8Array(opt.dictionary);
        }
        if (opt.raw) {
          status = zlib_inflate.inflateSetDictionary(this.strm, opt.dictionary);
          if (status !== c.Z_OK) {
            throw new Error(msg[status]);
          }
        }
      }
    }
    __name(Inflate, "Inflate");
    Inflate.prototype.push = function(data, mode) {
      var strm = this.strm;
      var chunkSize = this.options.chunkSize;
      var dictionary = this.options.dictionary;
      var status, _mode;
      var next_out_utf8, tail, utf8str;
      var allowBufError = false;
      if (this.ended) {
        return false;
      }
      _mode = mode === ~~mode ? mode : mode === true ? c.Z_FINISH : c.Z_NO_FLUSH;
      if (typeof data === "string") {
        strm.input = strings.binstring2buf(data);
      } else if (toString.call(data) === "[object ArrayBuffer]") {
        strm.input = new Uint8Array(data);
      } else {
        strm.input = data;
      }
      strm.next_in = 0;
      strm.avail_in = strm.input.length;
      do {
        if (strm.avail_out === 0) {
          strm.output = new utils.Buf8(chunkSize);
          strm.next_out = 0;
          strm.avail_out = chunkSize;
        }
        status = zlib_inflate.inflate(strm, c.Z_NO_FLUSH);
        if (status === c.Z_NEED_DICT && dictionary) {
          status = zlib_inflate.inflateSetDictionary(this.strm, dictionary);
        }
        if (status === c.Z_BUF_ERROR && allowBufError === true) {
          status = c.Z_OK;
          allowBufError = false;
        }
        if (status !== c.Z_STREAM_END && status !== c.Z_OK) {
          this.onEnd(status);
          this.ended = true;
          return false;
        }
        if (strm.next_out) {
          if (strm.avail_out === 0 || status === c.Z_STREAM_END || strm.avail_in === 0 && (_mode === c.Z_FINISH || _mode === c.Z_SYNC_FLUSH)) {
            if (this.options.to === "string") {
              next_out_utf8 = strings.utf8border(strm.output, strm.next_out);
              tail = strm.next_out - next_out_utf8;
              utf8str = strings.buf2string(strm.output, next_out_utf8);
              strm.next_out = tail;
              strm.avail_out = chunkSize - tail;
              if (tail) {
                utils.arraySet(strm.output, strm.output, next_out_utf8, tail, 0);
              }
              this.onData(utf8str);
            } else {
              this.onData(utils.shrinkBuf(strm.output, strm.next_out));
            }
          }
        }
        if (strm.avail_in === 0 && strm.avail_out === 0) {
          allowBufError = true;
        }
      } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== c.Z_STREAM_END);
      if (status === c.Z_STREAM_END) {
        _mode = c.Z_FINISH;
      }
      if (_mode === c.Z_FINISH) {
        status = zlib_inflate.inflateEnd(this.strm);
        this.onEnd(status);
        this.ended = true;
        return status === c.Z_OK;
      }
      if (_mode === c.Z_SYNC_FLUSH) {
        this.onEnd(c.Z_OK);
        strm.avail_out = 0;
        return true;
      }
      return true;
    };
    Inflate.prototype.onData = function(chunk) {
      this.chunks.push(chunk);
    };
    Inflate.prototype.onEnd = function(status) {
      if (status === c.Z_OK) {
        if (this.options.to === "string") {
          this.result = this.chunks.join("");
        } else {
          this.result = utils.flattenChunks(this.chunks);
        }
      }
      this.chunks = [];
      this.err = status;
      this.msg = this.strm.msg;
    };
    function inflate(input, options) {
      var inflator = new Inflate(options);
      inflator.push(input, true);
      if (inflator.err) {
        throw inflator.msg || msg[inflator.err];
      }
      return inflator.result;
    }
    __name(inflate, "inflate");
    function inflateRaw(input, options) {
      options = options || {};
      options.raw = true;
      return inflate(input, options);
    }
    __name(inflateRaw, "inflateRaw");
    exports.Inflate = Inflate;
    exports.inflate = inflate;
    exports.inflateRaw = inflateRaw;
    exports.ungzip = inflate;
  }
});

// node_modules/pako/index.js
var require_pako = __commonJS({
  "node_modules/pako/index.js"(exports, module) {
    "use strict";
    init_checked_fetch();
    init_modules_watch_stub();
    var assign = require_common().assign;
    var deflate = require_deflate2();
    var inflate = require_inflate2();
    var constants = require_constants();
    var pako = {};
    assign(pako, deflate, inflate, constants);
    module.exports = pako;
  }
});

// node_modules/upng-js/UPNG.js
var require_UPNG = __commonJS({
  "node_modules/upng-js/UPNG.js"(exports, module) {
    init_checked_fetch();
    init_modules_watch_stub();
    (function() {
      var UPNG2 = {};
      var pako;
      if (typeof module == "object") {
        module.exports = UPNG2;
      } else {
        window.UPNG = UPNG2;
      }
      if (typeof __require == "function") {
        pako = require_pako();
      } else {
        pako = window.pako;
      }
      function log() {
        if (typeof process == "undefined" || true) console.log.apply(console, arguments);
      }
      __name(log, "log");
      (function(UPNG3, pako2) {
        UPNG3.toRGBA8 = function(out) {
          var w = out.width, h = out.height;
          if (out.tabs.acTL == null) return [UPNG3.toRGBA8.decodeImage(out.data, w, h, out).buffer];
          var frms = [];
          if (out.frames[0].data == null) out.frames[0].data = out.data;
          var img, empty = new Uint8Array(w * h * 4);
          for (var i = 0; i < out.frames.length; i++) {
            var frm = out.frames[i];
            var fx = frm.rect.x, fy = frm.rect.y, fw = frm.rect.width, fh = frm.rect.height;
            var fdata = UPNG3.toRGBA8.decodeImage(frm.data, fw, fh, out);
            if (i == 0) img = fdata;
            else if (frm.blend == 0) UPNG3._copyTile(fdata, fw, fh, img, w, h, fx, fy, 0);
            else if (frm.blend == 1) UPNG3._copyTile(fdata, fw, fh, img, w, h, fx, fy, 1);
            frms.push(img.buffer);
            img = img.slice(0);
            if (frm.dispose == 0) {
            } else if (frm.dispose == 1) UPNG3._copyTile(empty, fw, fh, img, w, h, fx, fy, 0);
            else if (frm.dispose == 2) {
              var pi = i - 1;
              while (out.frames[pi].dispose == 2) pi--;
              img = new Uint8Array(frms[pi]).slice(0);
            }
          }
          return frms;
        };
        UPNG3.toRGBA8.decodeImage = function(data, w, h, out) {
          var area = w * h, bpp = UPNG3.decode._getBPP(out);
          var bpl = Math.ceil(w * bpp / 8);
          var bf = new Uint8Array(area * 4), bf32 = new Uint32Array(bf.buffer);
          var ctype = out.ctype, depth = out.depth;
          var rs = UPNG3._bin.readUshort;
          if (ctype == 6) {
            var qarea = area << 2;
            if (depth == 8) for (var i = 0; i < qarea; i++) {
              bf[i] = data[i];
            }
            if (depth == 16) for (var i = 0; i < qarea; i++) {
              bf[i] = data[i << 1];
            }
          } else if (ctype == 2) {
            var ts = out.tabs["tRNS"], tr = -1, tg = -1, tb = -1;
            if (ts) {
              tr = ts[0];
              tg = ts[1];
              tb = ts[2];
            }
            if (depth == 8) for (var i = 0; i < area; i++) {
              var qi = i << 2, ti = i * 3;
              bf[qi] = data[ti];
              bf[qi + 1] = data[ti + 1];
              bf[qi + 2] = data[ti + 2];
              bf[qi + 3] = 255;
              if (tr != -1 && data[ti] == tr && data[ti + 1] == tg && data[ti + 2] == tb) bf[qi + 3] = 0;
            }
            if (depth == 16) for (var i = 0; i < area; i++) {
              var qi = i << 2, ti = i * 6;
              bf[qi] = data[ti];
              bf[qi + 1] = data[ti + 2];
              bf[qi + 2] = data[ti + 4];
              bf[qi + 3] = 255;
              if (tr != -1 && rs(data, ti) == tr && rs(data, ti + 2) == tg && rs(data, ti + 4) == tb) bf[qi + 3] = 0;
            }
          } else if (ctype == 3) {
            var p = out.tabs["PLTE"], ap = out.tabs["tRNS"], tl = ap ? ap.length : 0;
            if (depth == 1) for (var y = 0; y < h; y++) {
              var s0 = y * bpl, t0 = y * w;
              for (var i = 0; i < w; i++) {
                var qi = t0 + i << 2, j = data[s0 + (i >> 3)] >> 7 - ((i & 7) << 0) & 1, cj = 3 * j;
                bf[qi] = p[cj];
                bf[qi + 1] = p[cj + 1];
                bf[qi + 2] = p[cj + 2];
                bf[qi + 3] = j < tl ? ap[j] : 255;
              }
            }
            if (depth == 2) for (var y = 0; y < h; y++) {
              var s0 = y * bpl, t0 = y * w;
              for (var i = 0; i < w; i++) {
                var qi = t0 + i << 2, j = data[s0 + (i >> 2)] >> 6 - ((i & 3) << 1) & 3, cj = 3 * j;
                bf[qi] = p[cj];
                bf[qi + 1] = p[cj + 1];
                bf[qi + 2] = p[cj + 2];
                bf[qi + 3] = j < tl ? ap[j] : 255;
              }
            }
            if (depth == 4) for (var y = 0; y < h; y++) {
              var s0 = y * bpl, t0 = y * w;
              for (var i = 0; i < w; i++) {
                var qi = t0 + i << 2, j = data[s0 + (i >> 1)] >> 4 - ((i & 1) << 2) & 15, cj = 3 * j;
                bf[qi] = p[cj];
                bf[qi + 1] = p[cj + 1];
                bf[qi + 2] = p[cj + 2];
                bf[qi + 3] = j < tl ? ap[j] : 255;
              }
            }
            if (depth == 8) for (var i = 0; i < area; i++) {
              var qi = i << 2, j = data[i], cj = 3 * j;
              bf[qi] = p[cj];
              bf[qi + 1] = p[cj + 1];
              bf[qi + 2] = p[cj + 2];
              bf[qi + 3] = j < tl ? ap[j] : 255;
            }
          } else if (ctype == 4) {
            if (depth == 8) for (var i = 0; i < area; i++) {
              var qi = i << 2, di = i << 1, gr = data[di];
              bf[qi] = gr;
              bf[qi + 1] = gr;
              bf[qi + 2] = gr;
              bf[qi + 3] = data[di + 1];
            }
            if (depth == 16) for (var i = 0; i < area; i++) {
              var qi = i << 2, di = i << 2, gr = data[di];
              bf[qi] = gr;
              bf[qi + 1] = gr;
              bf[qi + 2] = gr;
              bf[qi + 3] = data[di + 2];
            }
          } else if (ctype == 0) {
            var tr = out.tabs["tRNS"] ? out.tabs["tRNS"] : -1;
            if (depth == 1) for (var i = 0; i < area; i++) {
              var gr = 255 * (data[i >> 3] >> 7 - (i & 7) & 1), al = gr == tr * 255 ? 0 : 255;
              bf32[i] = al << 24 | gr << 16 | gr << 8 | gr;
            }
            if (depth == 2) for (var i = 0; i < area; i++) {
              var gr = 85 * (data[i >> 2] >> 6 - ((i & 3) << 1) & 3), al = gr == tr * 85 ? 0 : 255;
              bf32[i] = al << 24 | gr << 16 | gr << 8 | gr;
            }
            if (depth == 4) for (var i = 0; i < area; i++) {
              var gr = 17 * (data[i >> 1] >> 4 - ((i & 1) << 2) & 15), al = gr == tr * 17 ? 0 : 255;
              bf32[i] = al << 24 | gr << 16 | gr << 8 | gr;
            }
            if (depth == 8) for (var i = 0; i < area; i++) {
              var gr = data[i], al = gr == tr ? 0 : 255;
              bf32[i] = al << 24 | gr << 16 | gr << 8 | gr;
            }
            if (depth == 16) for (var i = 0; i < area; i++) {
              var gr = data[i << 1], al = rs(data, i << 1) == tr ? 0 : 255;
              bf32[i] = al << 24 | gr << 16 | gr << 8 | gr;
            }
          }
          return bf;
        };
        UPNG3.decode = function(buff) {
          var data = new Uint8Array(buff), offset = 8, bin = UPNG3._bin, rUs = bin.readUshort, rUi = bin.readUint;
          var out = { tabs: {}, frames: [] };
          var dd = new Uint8Array(data.length), doff = 0;
          var fd, foff = 0;
          var mgck = [137, 80, 78, 71, 13, 10, 26, 10];
          for (var i = 0; i < 8; i++) if (data[i] != mgck[i]) throw "The input is not a PNG file!";
          while (offset < data.length) {
            var len = bin.readUint(data, offset);
            offset += 4;
            var type = bin.readASCII(data, offset, 4);
            offset += 4;
            if (type == "IHDR") {
              UPNG3.decode._IHDR(data, offset, out);
            } else if (type == "IDAT") {
              for (var i = 0; i < len; i++) dd[doff + i] = data[offset + i];
              doff += len;
            } else if (type == "acTL") {
              out.tabs[type] = { num_frames: rUi(data, offset), num_plays: rUi(data, offset + 4) };
              fd = new Uint8Array(data.length);
            } else if (type == "fcTL") {
              if (foff != 0) {
                var fr = out.frames[out.frames.length - 1];
                fr.data = UPNG3.decode._decompress(out, fd.slice(0, foff), fr.rect.width, fr.rect.height);
                foff = 0;
              }
              var rct = { x: rUi(data, offset + 12), y: rUi(data, offset + 16), width: rUi(data, offset + 4), height: rUi(data, offset + 8) };
              var del = rUs(data, offset + 22);
              del = rUs(data, offset + 20) / (del == 0 ? 100 : del);
              var frm = { rect: rct, delay: Math.round(del * 1e3), dispose: data[offset + 24], blend: data[offset + 25] };
              out.frames.push(frm);
            } else if (type == "fdAT") {
              for (var i = 0; i < len - 4; i++) fd[foff + i] = data[offset + i + 4];
              foff += len - 4;
            } else if (type == "pHYs") {
              out.tabs[type] = [bin.readUint(data, offset), bin.readUint(data, offset + 4), data[offset + 8]];
            } else if (type == "cHRM") {
              out.tabs[type] = [];
              for (var i = 0; i < 8; i++) out.tabs[type].push(bin.readUint(data, offset + i * 4));
            } else if (type == "tEXt") {
              if (out.tabs[type] == null) out.tabs[type] = {};
              var nz = bin.nextZero(data, offset);
              var keyw = bin.readASCII(data, offset, nz - offset);
              var text = bin.readASCII(data, nz + 1, offset + len - nz - 1);
              out.tabs[type][keyw] = text;
            } else if (type == "iTXt") {
              if (out.tabs[type] == null) out.tabs[type] = {};
              var nz = 0, off = offset;
              nz = bin.nextZero(data, off);
              var keyw = bin.readASCII(data, off, nz - off);
              off = nz + 1;
              var cflag = data[off], cmeth = data[off + 1];
              off += 2;
              nz = bin.nextZero(data, off);
              var ltag = bin.readASCII(data, off, nz - off);
              off = nz + 1;
              nz = bin.nextZero(data, off);
              var tkeyw = bin.readUTF8(data, off, nz - off);
              off = nz + 1;
              var text = bin.readUTF8(data, off, len - (off - offset));
              out.tabs[type][keyw] = text;
            } else if (type == "PLTE") {
              out.tabs[type] = bin.readBytes(data, offset, len);
            } else if (type == "hIST") {
              var pl = out.tabs["PLTE"].length / 3;
              out.tabs[type] = [];
              for (var i = 0; i < pl; i++) out.tabs[type].push(rUs(data, offset + i * 2));
            } else if (type == "tRNS") {
              if (out.ctype == 3) out.tabs[type] = bin.readBytes(data, offset, len);
              else if (out.ctype == 0) out.tabs[type] = rUs(data, offset);
              else if (out.ctype == 2) out.tabs[type] = [rUs(data, offset), rUs(data, offset + 2), rUs(data, offset + 4)];
            } else if (type == "gAMA") out.tabs[type] = bin.readUint(data, offset) / 1e5;
            else if (type == "sRGB") out.tabs[type] = data[offset];
            else if (type == "bKGD") {
              if (out.ctype == 0 || out.ctype == 4) out.tabs[type] = [rUs(data, offset)];
              else if (out.ctype == 2 || out.ctype == 6) out.tabs[type] = [rUs(data, offset), rUs(data, offset + 2), rUs(data, offset + 4)];
              else if (out.ctype == 3) out.tabs[type] = data[offset];
            } else if (type == "IEND") {
              if (foff != 0) {
                var fr = out.frames[out.frames.length - 1];
                fr.data = UPNG3.decode._decompress(out, fd.slice(0, foff), fr.rect.width, fr.rect.height);
                foff = 0;
              }
              out.data = UPNG3.decode._decompress(out, dd, out.width, out.height);
              break;
            }
            offset += len;
            var crc = bin.readUint(data, offset);
            offset += 4;
          }
          delete out.compress;
          delete out.interlace;
          delete out.filter;
          return out;
        };
        UPNG3.decode._decompress = function(out, dd, w, h) {
          if (out.compress == 0) dd = UPNG3.decode._inflate(dd);
          if (out.interlace == 0) dd = UPNG3.decode._filterZero(dd, out, 0, w, h);
          else if (out.interlace == 1) dd = UPNG3.decode._readInterlace(dd, out);
          return dd;
        };
        UPNG3.decode._inflate = function(data) {
          return pako2["inflate"](data);
        };
        UPNG3.decode._readInterlace = function(data, out) {
          var w = out.width, h = out.height;
          var bpp = UPNG3.decode._getBPP(out), cbpp = bpp >> 3, bpl = Math.ceil(w * bpp / 8);
          var img = new Uint8Array(h * bpl);
          var di = 0;
          var starting_row = [0, 0, 4, 0, 2, 0, 1];
          var starting_col = [0, 4, 0, 2, 0, 1, 0];
          var row_increment = [8, 8, 8, 4, 4, 2, 2];
          var col_increment = [8, 8, 4, 4, 2, 2, 1];
          var pass = 0;
          while (pass < 7) {
            var ri = row_increment[pass], ci = col_increment[pass];
            var sw = 0, sh = 0;
            var cr = starting_row[pass];
            while (cr < h) {
              cr += ri;
              sh++;
            }
            var cc = starting_col[pass];
            while (cc < w) {
              cc += ci;
              sw++;
            }
            var bpll = Math.ceil(sw * bpp / 8);
            UPNG3.decode._filterZero(data, out, di, sw, sh);
            var y = 0, row = starting_row[pass];
            while (row < h) {
              var col = starting_col[pass];
              var cdi = di + y * bpll << 3;
              while (col < w) {
                if (bpp == 1) {
                  var val = data[cdi >> 3];
                  val = val >> 7 - (cdi & 7) & 1;
                  img[row * bpl + (col >> 3)] |= val << 7 - ((col & 3) << 0);
                }
                if (bpp == 2) {
                  var val = data[cdi >> 3];
                  val = val >> 6 - (cdi & 7) & 3;
                  img[row * bpl + (col >> 2)] |= val << 6 - ((col & 3) << 1);
                }
                if (bpp == 4) {
                  var val = data[cdi >> 3];
                  val = val >> 4 - (cdi & 7) & 15;
                  img[row * bpl + (col >> 1)] |= val << 4 - ((col & 1) << 2);
                }
                if (bpp >= 8) {
                  var ii = row * bpl + col * cbpp;
                  for (var j = 0; j < cbpp; j++) img[ii + j] = data[(cdi >> 3) + j];
                }
                cdi += bpp;
                col += ci;
              }
              y++;
              row += ri;
            }
            if (sw * sh != 0) di += sh * (1 + bpll);
            pass = pass + 1;
          }
          return img;
        };
        UPNG3.decode._getBPP = function(out) {
          var noc = [1, null, 3, 1, 2, null, 4][out.ctype];
          return noc * out.depth;
        };
        UPNG3.decode._filterZero = function(data, out, off, w, h) {
          var bpp = UPNG3.decode._getBPP(out), bpl = Math.ceil(w * bpp / 8), paeth = UPNG3.decode._paeth;
          bpp = Math.ceil(bpp / 8);
          for (var y = 0; y < h; y++) {
            var i = off + y * bpl, di = i + y + 1;
            var type = data[di - 1];
            if (type == 0) for (var x = 0; x < bpl; x++) data[i + x] = data[di + x];
            else if (type == 1) {
              for (var x = 0; x < bpp; x++) data[i + x] = data[di + x];
              for (var x = bpp; x < bpl; x++) data[i + x] = data[di + x] + data[i + x - bpp] & 255;
            } else if (y == 0) {
              for (var x = 0; x < bpp; x++) data[i + x] = data[di + x];
              if (type == 2) for (var x = bpp; x < bpl; x++) data[i + x] = data[di + x] & 255;
              if (type == 3) for (var x = bpp; x < bpl; x++) data[i + x] = data[di + x] + (data[i + x - bpp] >> 1) & 255;
              if (type == 4) for (var x = bpp; x < bpl; x++) data[i + x] = data[di + x] + paeth(data[i + x - bpp], 0, 0) & 255;
            } else {
              if (type == 2) {
                for (var x = 0; x < bpl; x++) data[i + x] = data[di + x] + data[i + x - bpl] & 255;
              }
              if (type == 3) {
                for (var x = 0; x < bpp; x++) data[i + x] = data[di + x] + (data[i + x - bpl] >> 1) & 255;
                for (var x = bpp; x < bpl; x++) data[i + x] = data[di + x] + (data[i + x - bpl] + data[i + x - bpp] >> 1) & 255;
              }
              if (type == 4) {
                for (var x = 0; x < bpp; x++) data[i + x] = data[di + x] + paeth(0, data[i + x - bpl], 0) & 255;
                for (var x = bpp; x < bpl; x++) data[i + x] = data[di + x] + paeth(data[i + x - bpp], data[i + x - bpl], data[i + x - bpp - bpl]) & 255;
              }
            }
          }
          return data;
        };
        UPNG3.decode._paeth = function(a, b, c) {
          var p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          if (pa <= pb && pa <= pc) return a;
          else if (pb <= pc) return b;
          return c;
        };
        UPNG3.decode._IHDR = function(data, offset, out) {
          var bin = UPNG3._bin;
          out.width = bin.readUint(data, offset);
          offset += 4;
          out.height = bin.readUint(data, offset);
          offset += 4;
          out.depth = data[offset];
          offset++;
          out.ctype = data[offset];
          offset++;
          out.compress = data[offset];
          offset++;
          out.filter = data[offset];
          offset++;
          out.interlace = data[offset];
          offset++;
        };
        UPNG3._bin = {
          nextZero: /* @__PURE__ */ __name(function(data, p) {
            while (data[p] != 0) p++;
            return p;
          }, "nextZero"),
          readUshort: /* @__PURE__ */ __name(function(buff, p) {
            return buff[p] << 8 | buff[p + 1];
          }, "readUshort"),
          writeUshort: /* @__PURE__ */ __name(function(buff, p, n) {
            buff[p] = n >> 8 & 255;
            buff[p + 1] = n & 255;
          }, "writeUshort"),
          readUint: /* @__PURE__ */ __name(function(buff, p) {
            return buff[p] * (256 * 256 * 256) + (buff[p + 1] << 16 | buff[p + 2] << 8 | buff[p + 3]);
          }, "readUint"),
          writeUint: /* @__PURE__ */ __name(function(buff, p, n) {
            buff[p] = n >> 24 & 255;
            buff[p + 1] = n >> 16 & 255;
            buff[p + 2] = n >> 8 & 255;
            buff[p + 3] = n & 255;
          }, "writeUint"),
          readASCII: /* @__PURE__ */ __name(function(buff, p, l) {
            var s = "";
            for (var i = 0; i < l; i++) s += String.fromCharCode(buff[p + i]);
            return s;
          }, "readASCII"),
          writeASCII: /* @__PURE__ */ __name(function(data, p, s) {
            for (var i = 0; i < s.length; i++) data[p + i] = s.charCodeAt(i);
          }, "writeASCII"),
          readBytes: /* @__PURE__ */ __name(function(buff, p, l) {
            var arr = [];
            for (var i = 0; i < l; i++) arr.push(buff[p + i]);
            return arr;
          }, "readBytes"),
          pad: /* @__PURE__ */ __name(function(n) {
            return n.length < 2 ? "0" + n : n;
          }, "pad"),
          readUTF8: /* @__PURE__ */ __name(function(buff, p, l) {
            var s = "", ns;
            for (var i = 0; i < l; i++) s += "%" + UPNG3._bin.pad(buff[p + i].toString(16));
            try {
              ns = decodeURIComponent(s);
            } catch (e) {
              return UPNG3._bin.readASCII(buff, p, l);
            }
            return ns;
          }, "readUTF8")
        };
        UPNG3._copyTile = function(sb, sw, sh, tb, tw, th, xoff, yoff, mode) {
          var w = Math.min(sw, tw), h = Math.min(sh, th);
          var si = 0, ti = 0;
          for (var y = 0; y < h; y++)
            for (var x = 0; x < w; x++) {
              if (xoff >= 0 && yoff >= 0) {
                si = y * sw + x << 2;
                ti = (yoff + y) * tw + xoff + x << 2;
              } else {
                si = (-yoff + y) * sw - xoff + x << 2;
                ti = y * tw + x << 2;
              }
              if (mode == 0) {
                tb[ti] = sb[si];
                tb[ti + 1] = sb[si + 1];
                tb[ti + 2] = sb[si + 2];
                tb[ti + 3] = sb[si + 3];
              } else if (mode == 1) {
                var fa = sb[si + 3] * (1 / 255), fr = sb[si] * fa, fg = sb[si + 1] * fa, fb = sb[si + 2] * fa;
                var ba = tb[ti + 3] * (1 / 255), br = tb[ti] * ba, bg = tb[ti + 1] * ba, bb = tb[ti + 2] * ba;
                var ifa = 1 - fa, oa = fa + ba * ifa, ioa = oa == 0 ? 0 : 1 / oa;
                tb[ti + 3] = 255 * oa;
                tb[ti + 0] = (fr + br * ifa) * ioa;
                tb[ti + 1] = (fg + bg * ifa) * ioa;
                tb[ti + 2] = (fb + bb * ifa) * ioa;
              } else if (mode == 2) {
                var fa = sb[si + 3], fr = sb[si], fg = sb[si + 1], fb = sb[si + 2];
                var ba = tb[ti + 3], br = tb[ti], bg = tb[ti + 1], bb = tb[ti + 2];
                if (fa == ba && fr == br && fg == bg && fb == bb) {
                  tb[ti] = 0;
                  tb[ti + 1] = 0;
                  tb[ti + 2] = 0;
                  tb[ti + 3] = 0;
                } else {
                  tb[ti] = fr;
                  tb[ti + 1] = fg;
                  tb[ti + 2] = fb;
                  tb[ti + 3] = fa;
                }
              } else if (mode == 3) {
                var fa = sb[si + 3], fr = sb[si], fg = sb[si + 1], fb = sb[si + 2];
                var ba = tb[ti + 3], br = tb[ti], bg = tb[ti + 1], bb = tb[ti + 2];
                if (fa == ba && fr == br && fg == bg && fb == bb) continue;
                if (fa < 220 && ba > 20) return false;
              }
            }
          return true;
        };
        UPNG3.encode = function(bufs, w, h, ps, dels, forbidPlte) {
          if (ps == null) ps = 0;
          if (forbidPlte == null) forbidPlte = false;
          var data = new Uint8Array(bufs[0].byteLength * bufs.length + 100);
          var wr = [137, 80, 78, 71, 13, 10, 26, 10];
          for (var i = 0; i < 8; i++) data[i] = wr[i];
          var offset = 8, bin = UPNG3._bin, crc = UPNG3.crc.crc, wUi = bin.writeUint, wUs = bin.writeUshort, wAs = bin.writeASCII;
          var nimg = UPNG3.encode.compressPNG(bufs, w, h, ps, forbidPlte);
          wUi(data, offset, 13);
          offset += 4;
          wAs(data, offset, "IHDR");
          offset += 4;
          wUi(data, offset, w);
          offset += 4;
          wUi(data, offset, h);
          offset += 4;
          data[offset] = nimg.depth;
          offset++;
          data[offset] = nimg.ctype;
          offset++;
          data[offset] = 0;
          offset++;
          data[offset] = 0;
          offset++;
          data[offset] = 0;
          offset++;
          wUi(data, offset, crc(data, offset - 17, 17));
          offset += 4;
          wUi(data, offset, 1);
          offset += 4;
          wAs(data, offset, "sRGB");
          offset += 4;
          data[offset] = 1;
          offset++;
          wUi(data, offset, crc(data, offset - 5, 5));
          offset += 4;
          var anim = bufs.length > 1;
          if (anim) {
            wUi(data, offset, 8);
            offset += 4;
            wAs(data, offset, "acTL");
            offset += 4;
            wUi(data, offset, bufs.length);
            offset += 4;
            wUi(data, offset, 0);
            offset += 4;
            wUi(data, offset, crc(data, offset - 12, 12));
            offset += 4;
          }
          if (nimg.ctype == 3) {
            var dl = nimg.plte.length;
            wUi(data, offset, dl * 3);
            offset += 4;
            wAs(data, offset, "PLTE");
            offset += 4;
            for (var i = 0; i < dl; i++) {
              var ti = i * 3, c = nimg.plte[i], r = c & 255, g = c >> 8 & 255, b = c >> 16 & 255;
              data[offset + ti + 0] = r;
              data[offset + ti + 1] = g;
              data[offset + ti + 2] = b;
            }
            offset += dl * 3;
            wUi(data, offset, crc(data, offset - dl * 3 - 4, dl * 3 + 4));
            offset += 4;
            if (nimg.gotAlpha) {
              wUi(data, offset, dl);
              offset += 4;
              wAs(data, offset, "tRNS");
              offset += 4;
              for (var i = 0; i < dl; i++) data[offset + i] = nimg.plte[i] >> 24 & 255;
              offset += dl;
              wUi(data, offset, crc(data, offset - dl - 4, dl + 4));
              offset += 4;
            }
          }
          var fi = 0;
          for (var j = 0; j < nimg.frames.length; j++) {
            var fr = nimg.frames[j];
            if (anim) {
              wUi(data, offset, 26);
              offset += 4;
              wAs(data, offset, "fcTL");
              offset += 4;
              wUi(data, offset, fi++);
              offset += 4;
              wUi(data, offset, fr.rect.width);
              offset += 4;
              wUi(data, offset, fr.rect.height);
              offset += 4;
              wUi(data, offset, fr.rect.x);
              offset += 4;
              wUi(data, offset, fr.rect.y);
              offset += 4;
              wUs(data, offset, dels[j]);
              offset += 2;
              wUs(data, offset, 1e3);
              offset += 2;
              data[offset] = fr.dispose;
              offset++;
              data[offset] = fr.blend;
              offset++;
              wUi(data, offset, crc(data, offset - 30, 30));
              offset += 4;
            }
            var imgd = fr.cimg, dl = imgd.length;
            wUi(data, offset, dl + (j == 0 ? 0 : 4));
            offset += 4;
            var ioff = offset;
            wAs(data, offset, j == 0 ? "IDAT" : "fdAT");
            offset += 4;
            if (j != 0) {
              wUi(data, offset, fi++);
              offset += 4;
            }
            for (var i = 0; i < dl; i++) data[offset + i] = imgd[i];
            offset += dl;
            wUi(data, offset, crc(data, ioff, offset - ioff));
            offset += 4;
          }
          wUi(data, offset, 0);
          offset += 4;
          wAs(data, offset, "IEND");
          offset += 4;
          wUi(data, offset, crc(data, offset - 4, 4));
          offset += 4;
          return data.buffer.slice(0, offset);
        };
        UPNG3.encode.compressPNG = function(bufs, w, h, ps, forbidPlte) {
          var out = UPNG3.encode.compress(bufs, w, h, ps, false, forbidPlte);
          for (var i = 0; i < bufs.length; i++) {
            var frm = out.frames[i], nw = frm.rect.width, nh = frm.rect.height, bpl = frm.bpl, bpp = frm.bpp;
            var fdata = new Uint8Array(nh * bpl + nh);
            frm.cimg = UPNG3.encode._filterZero(frm.img, nh, bpp, bpl, fdata);
          }
          return out;
        };
        UPNG3.encode.compress = function(bufs, w, h, ps, forGIF, forbidPlte) {
          if (forbidPlte == null) forbidPlte = false;
          var ctype = 6, depth = 8, bpp = 4, alphaAnd = 255;
          for (var j = 0; j < bufs.length; j++) {
            var img = new Uint8Array(bufs[j]), ilen = img.length;
            for (var i = 0; i < ilen; i += 4) alphaAnd &= img[i + 3];
          }
          var gotAlpha = alphaAnd != 255;
          var cmap = {}, plte = [];
          if (bufs.length != 0) {
            cmap[0] = 0;
            plte.push(0);
            if (ps != 0) ps--;
          }
          if (ps != 0) {
            var qres = UPNG3.quantize(bufs, ps, forGIF);
            bufs = qres.bufs;
            for (var i = 0; i < qres.plte.length; i++) {
              var c = qres.plte[i].est.rgba;
              if (cmap[c] == null) {
                cmap[c] = plte.length;
                plte.push(c);
              }
            }
          } else {
            for (var j = 0; j < bufs.length; j++) {
              var img32 = new Uint32Array(bufs[j]), ilen = img32.length;
              for (var i = 0; i < ilen; i++) {
                var c = img32[i];
                if ((i < w || c != img32[i - 1] && c != img32[i - w]) && cmap[c] == null) {
                  cmap[c] = plte.length;
                  plte.push(c);
                  if (plte.length >= 300) break;
                }
              }
            }
          }
          var brute = gotAlpha ? forGIF : false;
          var cc = plte.length;
          if (cc <= 256 && forbidPlte == false) {
            if (cc <= 2) depth = 1;
            else if (cc <= 4) depth = 2;
            else if (cc <= 16) depth = 4;
            else depth = 8;
            if (forGIF) depth = 8;
            gotAlpha = true;
          }
          var frms = [];
          for (var j = 0; j < bufs.length; j++) {
            var cimg = new Uint8Array(bufs[j]), cimg32 = new Uint32Array(cimg.buffer);
            var nx = 0, ny = 0, nw = w, nh = h, blend = 0;
            if (j != 0 && !brute) {
              var tlim = forGIF || j == 1 || frms[frms.length - 2].dispose == 2 ? 1 : 2, tstp = 0, tarea = 1e9;
              for (var it = 0; it < tlim; it++) {
                var pimg = new Uint8Array(bufs[j - 1 - it]), p32 = new Uint32Array(bufs[j - 1 - it]);
                var mix = w, miy = h, max = -1, may = -1;
                for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
                  var i = y * w + x;
                  if (cimg32[i] != p32[i]) {
                    if (x < mix) mix = x;
                    if (x > max) max = x;
                    if (y < miy) miy = y;
                    if (y > may) may = y;
                  }
                }
                var sarea = max == -1 ? 1 : (max - mix + 1) * (may - miy + 1);
                if (sarea < tarea) {
                  tarea = sarea;
                  tstp = it;
                  if (max == -1) {
                    nx = ny = 0;
                    nw = nh = 1;
                  } else {
                    nx = mix;
                    ny = miy;
                    nw = max - mix + 1;
                    nh = may - miy + 1;
                  }
                }
              }
              var pimg = new Uint8Array(bufs[j - 1 - tstp]);
              if (tstp == 1) frms[frms.length - 1].dispose = 2;
              var nimg = new Uint8Array(nw * nh * 4), nimg32 = new Uint32Array(nimg.buffer);
              UPNG3._copyTile(pimg, w, h, nimg, nw, nh, -nx, -ny, 0);
              if (UPNG3._copyTile(cimg, w, h, nimg, nw, nh, -nx, -ny, 3)) {
                UPNG3._copyTile(cimg, w, h, nimg, nw, nh, -nx, -ny, 2);
                blend = 1;
              } else {
                UPNG3._copyTile(cimg, w, h, nimg, nw, nh, -nx, -ny, 0);
                blend = 0;
              }
              cimg = nimg;
              cimg32 = new Uint32Array(cimg.buffer);
            }
            var bpl = 4 * nw;
            if (cc <= 256 && forbidPlte == false) {
              bpl = Math.ceil(depth * nw / 8);
              var nimg = new Uint8Array(bpl * nh);
              for (var y = 0; y < nh; y++) {
                var i = y * bpl, ii = y * nw;
                if (depth == 8) for (var x = 0; x < nw; x++) nimg[i + x] = cmap[cimg32[ii + x]];
                else if (depth == 4) for (var x = 0; x < nw; x++) nimg[i + (x >> 1)] |= cmap[cimg32[ii + x]] << 4 - (x & 1) * 4;
                else if (depth == 2) for (var x = 0; x < nw; x++) nimg[i + (x >> 2)] |= cmap[cimg32[ii + x]] << 6 - (x & 3) * 2;
                else if (depth == 1) for (var x = 0; x < nw; x++) nimg[i + (x >> 3)] |= cmap[cimg32[ii + x]] << 7 - (x & 7) * 1;
              }
              cimg = nimg;
              ctype = 3;
              bpp = 1;
            } else if (gotAlpha == false && bufs.length == 1) {
              var nimg = new Uint8Array(nw * nh * 3), area = nw * nh;
              for (var i = 0; i < area; i++) {
                var ti = i * 3, qi = i * 4;
                nimg[ti] = cimg[qi];
                nimg[ti + 1] = cimg[qi + 1];
                nimg[ti + 2] = cimg[qi + 2];
              }
              cimg = nimg;
              ctype = 2;
              bpp = 3;
              bpl = 3 * nw;
            }
            frms.push({ rect: { x: nx, y: ny, width: nw, height: nh }, img: cimg, bpl, bpp, blend, dispose: brute ? 1 : 0 });
          }
          return { ctype, depth, plte, gotAlpha, frames: frms };
        };
        UPNG3.encode._filterZero = function(img, h, bpp, bpl, data) {
          var fls = [];
          for (var t = 0; t < 5; t++) {
            if (h * bpl > 5e5 && (t == 2 || t == 3 || t == 4)) continue;
            for (var y = 0; y < h; y++) UPNG3.encode._filterLine(data, img, y, bpl, bpp, t);
            fls.push(pako2["deflate"](data));
            if (bpp == 1) break;
          }
          var ti, tsize = 1e9;
          for (var i = 0; i < fls.length; i++) if (fls[i].length < tsize) {
            ti = i;
            tsize = fls[i].length;
          }
          return fls[ti];
        };
        UPNG3.encode._filterLine = function(data, img, y, bpl, bpp, type) {
          var i = y * bpl, di = i + y, paeth = UPNG3.decode._paeth;
          data[di] = type;
          di++;
          if (type == 0) for (var x = 0; x < bpl; x++) data[di + x] = img[i + x];
          else if (type == 1) {
            for (var x = 0; x < bpp; x++) data[di + x] = img[i + x];
            for (var x = bpp; x < bpl; x++) data[di + x] = img[i + x] - img[i + x - bpp] + 256 & 255;
          } else if (y == 0) {
            for (var x = 0; x < bpp; x++) data[di + x] = img[i + x];
            if (type == 2) for (var x = bpp; x < bpl; x++) data[di + x] = img[i + x];
            if (type == 3) for (var x = bpp; x < bpl; x++) data[di + x] = img[i + x] - (img[i + x - bpp] >> 1) + 256 & 255;
            if (type == 4) for (var x = bpp; x < bpl; x++) data[di + x] = img[i + x] - paeth(img[i + x - bpp], 0, 0) + 256 & 255;
          } else {
            if (type == 2) {
              for (var x = 0; x < bpl; x++) data[di + x] = img[i + x] + 256 - img[i + x - bpl] & 255;
            }
            if (type == 3) {
              for (var x = 0; x < bpp; x++) data[di + x] = img[i + x] + 256 - (img[i + x - bpl] >> 1) & 255;
              for (var x = bpp; x < bpl; x++) data[di + x] = img[i + x] + 256 - (img[i + x - bpl] + img[i + x - bpp] >> 1) & 255;
            }
            if (type == 4) {
              for (var x = 0; x < bpp; x++) data[di + x] = img[i + x] + 256 - paeth(0, img[i + x - bpl], 0) & 255;
              for (var x = bpp; x < bpl; x++) data[di + x] = img[i + x] + 256 - paeth(img[i + x - bpp], img[i + x - bpl], img[i + x - bpp - bpl]) & 255;
            }
          }
        };
        UPNG3.crc = {
          table: (function() {
            var tab = new Uint32Array(256);
            for (var n = 0; n < 256; n++) {
              var c = n;
              for (var k = 0; k < 8; k++) {
                if (c & 1) c = 3988292384 ^ c >>> 1;
                else c = c >>> 1;
              }
              tab[n] = c;
            }
            return tab;
          })(),
          update: /* @__PURE__ */ __name(function(c, buf, off, len) {
            for (var i = 0; i < len; i++) c = UPNG3.crc.table[(c ^ buf[off + i]) & 255] ^ c >>> 8;
            return c;
          }, "update"),
          crc: /* @__PURE__ */ __name(function(b, o, l) {
            return UPNG3.crc.update(4294967295, b, o, l) ^ 4294967295;
          }, "crc")
        };
        UPNG3.quantize = function(bufs, ps, roundAlpha) {
          var imgs = [], totl = 0;
          for (var i = 0; i < bufs.length; i++) {
            imgs.push(UPNG3.encode.alphaMul(new Uint8Array(bufs[i]), roundAlpha));
            totl += bufs[i].byteLength;
          }
          var nimg = new Uint8Array(totl), nimg32 = new Uint32Array(nimg.buffer), noff = 0;
          for (var i = 0; i < imgs.length; i++) {
            var img = imgs[i], il = img.length;
            for (var j = 0; j < il; j++) nimg[noff + j] = img[j];
            noff += il;
          }
          var root = { i0: 0, i1: nimg.length, bst: null, est: null, tdst: 0, left: null, right: null };
          root.bst = UPNG3.quantize.stats(nimg, root.i0, root.i1);
          root.est = UPNG3.quantize.estats(root.bst);
          var leafs = [root];
          while (leafs.length < ps) {
            var maxL = 0, mi = 0;
            for (var i = 0; i < leafs.length; i++) if (leafs[i].est.L > maxL) {
              maxL = leafs[i].est.L;
              mi = i;
            }
            if (maxL < 1e-3) break;
            var node = leafs[mi];
            var s0 = UPNG3.quantize.splitPixels(nimg, nimg32, node.i0, node.i1, node.est.e, node.est.eMq255);
            var ln = { i0: node.i0, i1: s0, bst: null, est: null, tdst: 0, left: null, right: null };
            ln.bst = UPNG3.quantize.stats(nimg, ln.i0, ln.i1);
            ln.est = UPNG3.quantize.estats(ln.bst);
            var rn = { i0: s0, i1: node.i1, bst: null, est: null, tdst: 0, left: null, right: null };
            rn.bst = { R: [], m: [], N: node.bst.N - ln.bst.N };
            for (var i = 0; i < 16; i++) rn.bst.R[i] = node.bst.R[i] - ln.bst.R[i];
            for (var i = 0; i < 4; i++) rn.bst.m[i] = node.bst.m[i] - ln.bst.m[i];
            rn.est = UPNG3.quantize.estats(rn.bst);
            node.left = ln;
            node.right = rn;
            leafs[mi] = ln;
            leafs.push(rn);
          }
          leafs.sort(function(a2, b2) {
            return b2.bst.N - a2.bst.N;
          });
          for (var ii = 0; ii < imgs.length; ii++) {
            var planeDst = UPNG3.quantize.planeDst;
            var sb = new Uint8Array(imgs[ii].buffer), tb = new Uint32Array(imgs[ii].buffer), len = sb.length;
            var stack = [], si = 0;
            for (var i = 0; i < len; i += 4) {
              var r = sb[i] * (1 / 255), g = sb[i + 1] * (1 / 255), b = sb[i + 2] * (1 / 255), a = sb[i + 3] * (1 / 255);
              var nd = root;
              while (nd.left) nd = planeDst(nd.est, r, g, b, a) <= 0 ? nd.left : nd.right;
              tb[i >> 2] = nd.est.rgba;
            }
            imgs[ii] = tb.buffer;
          }
          return { bufs: imgs, plte: leafs };
        };
        UPNG3.quantize.getNearest = function(nd, r, g, b, a) {
          if (nd.left == null) {
            nd.tdst = UPNG3.quantize.dist(nd.est.q, r, g, b, a);
            return nd;
          }
          var planeDst = UPNG3.quantize.planeDst(nd.est, r, g, b, a);
          var node0 = nd.left, node1 = nd.right;
          if (planeDst > 0) {
            node0 = nd.right;
            node1 = nd.left;
          }
          var ln = UPNG3.quantize.getNearest(node0, r, g, b, a);
          if (ln.tdst <= planeDst * planeDst) return ln;
          var rn = UPNG3.quantize.getNearest(node1, r, g, b, a);
          return rn.tdst < ln.tdst ? rn : ln;
        };
        UPNG3.quantize.planeDst = function(est, r, g, b, a) {
          var e = est.e;
          return e[0] * r + e[1] * g + e[2] * b + e[3] * a - est.eMq;
        };
        UPNG3.quantize.dist = function(q, r, g, b, a) {
          var d0 = r - q[0], d1 = g - q[1], d2 = b - q[2], d3 = a - q[3];
          return d0 * d0 + d1 * d1 + d2 * d2 + d3 * d3;
        };
        UPNG3.quantize.splitPixels = function(nimg, nimg32, i0, i1, e, eMq) {
          var vecDot = UPNG3.quantize.vecDot;
          i1 -= 4;
          var shfs = 0;
          while (i0 < i1) {
            while (vecDot(nimg, i0, e) <= eMq) i0 += 4;
            while (vecDot(nimg, i1, e) > eMq) i1 -= 4;
            if (i0 >= i1) break;
            var t = nimg32[i0 >> 2];
            nimg32[i0 >> 2] = nimg32[i1 >> 2];
            nimg32[i1 >> 2] = t;
            i0 += 4;
            i1 -= 4;
          }
          while (vecDot(nimg, i0, e) > eMq) i0 -= 4;
          return i0 + 4;
        };
        UPNG3.quantize.vecDot = function(nimg, i, e) {
          return nimg[i] * e[0] + nimg[i + 1] * e[1] + nimg[i + 2] * e[2] + nimg[i + 3] * e[3];
        };
        UPNG3.quantize.stats = function(nimg, i0, i1) {
          var R = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          var m = [0, 0, 0, 0];
          var N = i1 - i0 >> 2;
          for (var i = i0; i < i1; i += 4) {
            var r = nimg[i] * (1 / 255), g = nimg[i + 1] * (1 / 255), b = nimg[i + 2] * (1 / 255), a = nimg[i + 3] * (1 / 255);
            m[0] += r;
            m[1] += g;
            m[2] += b;
            m[3] += a;
            R[0] += r * r;
            R[1] += r * g;
            R[2] += r * b;
            R[3] += r * a;
            R[5] += g * g;
            R[6] += g * b;
            R[7] += g * a;
            R[10] += b * b;
            R[11] += b * a;
            R[15] += a * a;
          }
          R[4] = R[1];
          R[8] = R[2];
          R[12] = R[3];
          R[9] = R[6];
          R[13] = R[7];
          R[14] = R[11];
          return { R, m, N };
        };
        UPNG3.quantize.estats = function(stats) {
          var R = stats.R, m = stats.m, N = stats.N;
          var m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3], iN = N == 0 ? 0 : 1 / N;
          var Rj = [
            R[0] - m0 * m0 * iN,
            R[1] - m0 * m1 * iN,
            R[2] - m0 * m2 * iN,
            R[3] - m0 * m3 * iN,
            R[4] - m1 * m0 * iN,
            R[5] - m1 * m1 * iN,
            R[6] - m1 * m2 * iN,
            R[7] - m1 * m3 * iN,
            R[8] - m2 * m0 * iN,
            R[9] - m2 * m1 * iN,
            R[10] - m2 * m2 * iN,
            R[11] - m2 * m3 * iN,
            R[12] - m3 * m0 * iN,
            R[13] - m3 * m1 * iN,
            R[14] - m3 * m2 * iN,
            R[15] - m3 * m3 * iN
          ];
          var A = Rj, M = UPNG3.M4;
          var b = [0.5, 0.5, 0.5, 0.5], mi = 0, tmi = 0;
          if (N != 0)
            for (var i = 0; i < 10; i++) {
              b = M.multVec(A, b);
              tmi = Math.sqrt(M.dot(b, b));
              b = M.sml(1 / tmi, b);
              if (Math.abs(tmi - mi) < 1e-9) break;
              mi = tmi;
            }
          var q = [m0 * iN, m1 * iN, m2 * iN, m3 * iN];
          var eMq255 = M.dot(M.sml(255, q), b);
          var ia = q[3] < 1e-3 ? 0 : 1 / q[3];
          return {
            Cov: Rj,
            q,
            e: b,
            L: mi,
            eMq255,
            eMq: M.dot(b, q),
            rgba: (Math.round(255 * q[3]) << 24 | Math.round(255 * q[2] * ia) << 16 | Math.round(255 * q[1] * ia) << 8 | Math.round(255 * q[0] * ia) << 0) >>> 0
          };
        };
        UPNG3.M4 = {
          multVec: /* @__PURE__ */ __name(function(m, v) {
            return [
              m[0] * v[0] + m[1] * v[1] + m[2] * v[2] + m[3] * v[3],
              m[4] * v[0] + m[5] * v[1] + m[6] * v[2] + m[7] * v[3],
              m[8] * v[0] + m[9] * v[1] + m[10] * v[2] + m[11] * v[3],
              m[12] * v[0] + m[13] * v[1] + m[14] * v[2] + m[15] * v[3]
            ];
          }, "multVec"),
          dot: /* @__PURE__ */ __name(function(x, y) {
            return x[0] * y[0] + x[1] * y[1] + x[2] * y[2] + x[3] * y[3];
          }, "dot"),
          sml: /* @__PURE__ */ __name(function(a, y) {
            return [a * y[0], a * y[1], a * y[2], a * y[3]];
          }, "sml")
        };
        UPNG3.encode.alphaMul = function(img, roundA) {
          var nimg = new Uint8Array(img.length), area = img.length >> 2;
          for (var i = 0; i < area; i++) {
            var qi = i << 2, ia = img[qi + 3];
            if (roundA) ia = ia < 128 ? 0 : 255;
            var a = ia * (1 / 255);
            nimg[qi + 0] = img[qi + 0] * a;
            nimg[qi + 1] = img[qi + 1] * a;
            nimg[qi + 2] = img[qi + 2] * a;
            nimg[qi + 3] = ia;
          }
          return nimg;
        };
      })(UPNG2, pako);
    })();
  }
});

// .wrangler/tmp/bundle-2fOxmH/middleware-loader.entry.ts
init_checked_fetch();
init_modules_watch_stub();

// .wrangler/tmp/bundle-2fOxmH/middleware-insertion-facade.js
init_checked_fetch();
init_modules_watch_stub();

// src/index.ts
init_checked_fetch();
init_modules_watch_stub();

// src/api.ts
init_checked_fetch();
init_modules_watch_stub();

// src/utils.ts
init_checked_fetch();
init_modules_watch_stub();
function formatTimeHHMM(timeStr) {
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return timeStr;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  if (hours > 12) {
    hours -= 12;
  } else if (hours === 0) {
    hours = 12;
  }
  return `${hours}:${minutes}`;
}
__name(formatTimeHHMM, "formatTimeHHMM");

// src/api.ts
var CALCULATION_METHOD = 2;
var LATITUDE = 52.4590857;
var LONGITUDE = -1.9009277;
async function fetchSingleMonth(year, month) {
  const url = new URL("https://api.aladhan.com/v1/calendar");
  url.searchParams.set("latitude", String(LATITUDE));
  url.searchParams.set("longitude", String(LONGITUDE));
  url.searchParams.set("year", String(year));
  url.searchParams.set("month", String(month));
  url.searchParams.set("method", String(CALCULATION_METHOD));
  url.searchParams.set("timezone", "Europe/London");
  url.searchParams.set("school", "1");
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Aladhan API error: ${response.status}`);
  }
  const json = await response.json();
  if (json.code !== 200 || !json.data) {
    throw new Error("Invalid response from Aladhan API");
  }
  return json.data.map((day) => {
    const gregorian = day.date.gregorian;
    const hijri = day.date.hijri;
    const t = day.timings;
    return {
      date: gregorian.date,
      dayName: gregorian.weekday.en.substring(0, 3).toUpperCase(),
      dayNumber: gregorian.day,
      gregorianDate: `${gregorian.day} ${gregorian.month.en.substring(0, 3)}`,
      hijriDate: hijri.date,
      hijriDay: hijri.day,
      hijriMonth: hijri.month.en,
      hijriYear: hijri.year,
      fajrStart: formatTimeHHMM(t.Fajr),
      fajrJamat: "",
      sunrise: formatTimeHHMM(t.Sunrise),
      dhuhrStart: formatTimeHHMM(t.Dhuhr),
      dhuhrJamat: "",
      asrStart: formatTimeHHMM(t.Asr),
      asrJamat: "",
      maghribJamat: formatTimeHHMM(t.Maghrib),
      ishaStart: formatTimeHHMM(t.Isha),
      ishaJamat: ""
    };
  });
}
__name(fetchSingleMonth, "fetchSingleMonth");
async function fetchPrayerTimesForRange(startDate, endDate) {
  const monthsToFetch = [];
  let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const lastMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  while (current <= lastMonth) {
    monthsToFetch.push({ year: current.getFullYear(), month: current.getMonth() + 1 });
    current.setMonth(current.getMonth() + 1);
  }
  const monthResults = await Promise.all(
    monthsToFetch.map((m) => fetchSingleMonth(m.year, m.month))
  );
  const allTimes = monthResults.flat();
  const filtered = allTimes.filter((t) => {
    const [day, month, year] = t.date.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    d.setHours(0, 0, 0, 0);
    const s = new Date(startDate);
    s.setHours(0, 0, 0, 0);
    const e = new Date(endDate);
    e.setHours(0, 0, 0, 0);
    return d >= s && d <= e;
  });
  filtered.sort((a, b) => {
    const [da, ma, ya] = a.date.split("-").map(Number);
    const [db, mb, yb] = b.date.split("-").map(Number);
    return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
  });
  const startMonthName = monthsToFetch[0] ? new Date(monthsToFetch[0].year, monthsToFetch[0].month - 1).toLocaleDateString("en-GB", { month: "short" }).toUpperCase() : "";
  const endMonthName = monthsToFetch.length > 1 ? new Date(monthsToFetch[monthsToFetch.length - 1].year, monthsToFetch[monthsToFetch.length - 1].month - 1).toLocaleDateString("en-GB", { month: "short" }).toUpperCase() : "";
  const monthLabel = endMonthName && startMonthName !== endMonthName ? `${startMonthName} - ${endMonthName}` : startMonthName;
  return { times: filtered, monthLabel };
}
__name(fetchPrayerTimesForRange, "fetchPrayerTimesForRange");
function calculateJamaatTimes(times) {
  return times.map((t, index) => {
    const isFriday = t.dayName === "FRI";
    const isWeekend = t.dayName === "SAT" || t.dayName === "SUN";
    const addMins = /* @__PURE__ */ __name((time, mins) => {
      const [h, m] = time.split(":").map(Number);
      const date = new Date(2e3, 0, 1, h, m + mins);
      return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    }, "addMins");
    return {
      ...t,
      fajrJamat: addMins(t.fajrStart, 15),
      dhuhrJamat: isFriday ? "12:30" : addMins(t.dhuhrStart, 15),
      asrJamat: addMins(t.asrStart, 15),
      ishaJamat: addMins(t.ishaStart, 15)
    };
  });
}
__name(calculateJamaatTimes, "calculateJamaatTimes");

// src/poster.ts
init_checked_fetch();
init_modules_watch_stub();

// node_modules/@resvg/resvg-wasm/index.mjs
init_checked_fetch();
init_modules_watch_stub();
var wasm;
var heap = new Array(128).fill(void 0);
heap.push(void 0, null, true, false);
var heap_next = heap.length;
function addHeapObject(obj) {
  if (heap_next === heap.length)
    heap.push(heap.length + 1);
  const idx = heap_next;
  heap_next = heap[idx];
  heap[idx] = obj;
  return idx;
}
__name(addHeapObject, "addHeapObject");
function getObject(idx) {
  return heap[idx];
}
__name(getObject, "getObject");
function dropObject(idx) {
  if (idx < 132)
    return;
  heap[idx] = heap_next;
  heap_next = idx;
}
__name(dropObject, "dropObject");
function takeObject(idx) {
  const ret = getObject(idx);
  dropObject(idx);
  return ret;
}
__name(takeObject, "takeObject");
var WASM_VECTOR_LEN = 0;
var cachedUint8Memory0 = null;
function getUint8Memory0() {
  if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
    cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8Memory0;
}
__name(getUint8Memory0, "getUint8Memory0");
var cachedTextEncoder = typeof TextEncoder !== "undefined" ? new TextEncoder("utf-8") : { encode: /* @__PURE__ */ __name(() => {
  throw Error("TextEncoder not available");
}, "encode") };
var encodeString = typeof cachedTextEncoder.encodeInto === "function" ? function(arg, view) {
  return cachedTextEncoder.encodeInto(arg, view);
} : function(arg, view) {
  const buf = cachedTextEncoder.encode(arg);
  view.set(buf);
  return {
    read: arg.length,
    written: buf.length
  };
};
function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === void 0) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr2 = malloc(buf.length, 1) >>> 0;
    getUint8Memory0().subarray(ptr2, ptr2 + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr2;
  }
  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;
  const mem = getUint8Memory0();
  let offset = 0;
  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 127)
      break;
    mem[ptr + offset] = code;
  }
  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
    const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
    const ret = encodeString(arg, view);
    offset += ret.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }
  WASM_VECTOR_LEN = offset;
  return ptr;
}
__name(passStringToWasm0, "passStringToWasm0");
function isLikeNone(x) {
  return x === void 0 || x === null;
}
__name(isLikeNone, "isLikeNone");
var cachedInt32Memory0 = null;
function getInt32Memory0() {
  if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
    cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
  }
  return cachedInt32Memory0;
}
__name(getInt32Memory0, "getInt32Memory0");
var cachedTextDecoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-8", { ignoreBOM: true, fatal: true }) : { decode: /* @__PURE__ */ __name(() => {
  throw Error("TextDecoder not available");
}, "decode") };
if (typeof TextDecoder !== "undefined") {
  cachedTextDecoder.decode();
}
function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}
__name(getStringFromWasm0, "getStringFromWasm0");
function _assertClass(instance, klass) {
  if (!(instance instanceof klass)) {
    throw new Error(`expected instance of ${klass.name}`);
  }
  return instance.ptr;
}
__name(_assertClass, "_assertClass");
function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    wasm.__wbindgen_exn_store(addHeapObject(e));
  }
}
__name(handleError, "handleError");
var BBoxFinalization = typeof FinalizationRegistry === "undefined" ? { register: /* @__PURE__ */ __name(() => {
}, "register"), unregister: /* @__PURE__ */ __name(() => {
}, "unregister") } : new FinalizationRegistry((ptr) => wasm.__wbg_bbox_free(ptr >>> 0));
var BBox = class _BBox {
  static {
    __name(this, "_BBox");
  }
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(_BBox.prototype);
    obj.__wbg_ptr = ptr;
    BBoxFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    BBoxFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_bbox_free(ptr);
  }
  /**
  * @returns {number}
  */
  get x() {
    const ret = wasm.__wbg_get_bbox_x(this.__wbg_ptr);
    return ret;
  }
  /**
  * @param {number} arg0
  */
  set x(arg0) {
    wasm.__wbg_set_bbox_x(this.__wbg_ptr, arg0);
  }
  /**
  * @returns {number}
  */
  get y() {
    const ret = wasm.__wbg_get_bbox_y(this.__wbg_ptr);
    return ret;
  }
  /**
  * @param {number} arg0
  */
  set y(arg0) {
    wasm.__wbg_set_bbox_y(this.__wbg_ptr, arg0);
  }
  /**
  * @returns {number}
  */
  get width() {
    const ret = wasm.__wbg_get_bbox_width(this.__wbg_ptr);
    return ret;
  }
  /**
  * @param {number} arg0
  */
  set width(arg0) {
    wasm.__wbg_set_bbox_width(this.__wbg_ptr, arg0);
  }
  /**
  * @returns {number}
  */
  get height() {
    const ret = wasm.__wbg_get_bbox_height(this.__wbg_ptr);
    return ret;
  }
  /**
  * @param {number} arg0
  */
  set height(arg0) {
    wasm.__wbg_set_bbox_height(this.__wbg_ptr, arg0);
  }
};
var RenderedImageFinalization = typeof FinalizationRegistry === "undefined" ? { register: /* @__PURE__ */ __name(() => {
}, "register"), unregister: /* @__PURE__ */ __name(() => {
}, "unregister") } : new FinalizationRegistry((ptr) => wasm.__wbg_renderedimage_free(ptr >>> 0));
var RenderedImage = class _RenderedImage {
  static {
    __name(this, "_RenderedImage");
  }
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(_RenderedImage.prototype);
    obj.__wbg_ptr = ptr;
    RenderedImageFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    RenderedImageFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_renderedimage_free(ptr);
  }
  /**
  * Get the PNG width
  * @returns {number}
  */
  get width() {
    const ret = wasm.renderedimage_width(this.__wbg_ptr);
    return ret >>> 0;
  }
  /**
  * Get the PNG height
  * @returns {number}
  */
  get height() {
    const ret = wasm.renderedimage_height(this.__wbg_ptr);
    return ret >>> 0;
  }
  /**
  * Write the image data to Uint8Array
  * @returns {Uint8Array}
  */
  asPng() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.renderedimage_asPng(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * Get the RGBA pixels of the image
  * @returns {Uint8Array}
  */
  get pixels() {
    const ret = wasm.renderedimage_pixels(this.__wbg_ptr);
    return takeObject(ret);
  }
};
var ResvgFinalization = typeof FinalizationRegistry === "undefined" ? { register: /* @__PURE__ */ __name(() => {
}, "register"), unregister: /* @__PURE__ */ __name(() => {
}, "unregister") } : new FinalizationRegistry((ptr) => wasm.__wbg_resvg_free(ptr >>> 0));
var Resvg = class {
  static {
    __name(this, "Resvg");
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    ResvgFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_resvg_free(ptr);
  }
  /**
  * @param {Uint8Array | string} svg
  * @param {string | undefined} [options]
  * @param {Array<any> | undefined} [custom_font_buffers]
  */
  constructor(svg, options, custom_font_buffers) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      var ptr0 = isLikeNone(options) ? 0 : passStringToWasm0(options, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len0 = WASM_VECTOR_LEN;
      wasm.resvg_new(retptr, addHeapObject(svg), ptr0, len0, isLikeNone(custom_font_buffers) ? 0 : addHeapObject(custom_font_buffers));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      this.__wbg_ptr = r0 >>> 0;
      return this;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * Get the SVG width
  * @returns {number}
  */
  get width() {
    const ret = wasm.resvg_width(this.__wbg_ptr);
    return ret;
  }
  /**
  * Get the SVG height
  * @returns {number}
  */
  get height() {
    const ret = wasm.resvg_height(this.__wbg_ptr);
    return ret;
  }
  /**
  * Renders an SVG in Wasm
  * @returns {RenderedImage}
  */
  render() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.resvg_render(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return RenderedImage.__wrap(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * Output usvg-simplified SVG string
  * @returns {string}
  */
  toString() {
    let deferred1_0;
    let deferred1_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.resvg_toString(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      deferred1_0 = r0;
      deferred1_1 = r1;
      return getStringFromWasm0(r0, r1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
  * Calculate a maximum bounding box of all visible elements in this SVG.
  *
  * Note: path bounding box are approx values.
  * @returns {BBox | undefined}
  */
  innerBBox() {
    const ret = wasm.resvg_innerBBox(this.__wbg_ptr);
    return ret === 0 ? void 0 : BBox.__wrap(ret);
  }
  /**
  * Calculate a maximum bounding box of all visible elements in this SVG.
  * This will first apply transform.
  * Similar to `SVGGraphicsElement.getBBox()` DOM API.
  * @returns {BBox | undefined}
  */
  getBBox() {
    const ret = wasm.resvg_getBBox(this.__wbg_ptr);
    return ret === 0 ? void 0 : BBox.__wrap(ret);
  }
  /**
  * Use a given `BBox` to crop the svg. Currently this method simply changes
  * the viewbox/size of the svg and do not move the elements for simplicity
  * @param {BBox} bbox
  */
  cropByBBox(bbox) {
    _assertClass(bbox, BBox);
    wasm.resvg_cropByBBox(this.__wbg_ptr, bbox.__wbg_ptr);
  }
  /**
  * @returns {Array<any>}
  */
  imagesToResolve() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.resvg_imagesToResolve(retptr, this.__wbg_ptr);
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      var r2 = getInt32Memory0()[retptr / 4 + 2];
      if (r2) {
        throw takeObject(r1);
      }
      return takeObject(r0);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
  * @param {string} href
  * @param {Uint8Array} buffer
  */
  resolveImage(href, buffer) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      const ptr0 = passStringToWasm0(href, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      const len0 = WASM_VECTOR_LEN;
      wasm.resvg_resolveImage(retptr, this.__wbg_ptr, ptr0, len0, addHeapObject(buffer));
      var r0 = getInt32Memory0()[retptr / 4 + 0];
      var r1 = getInt32Memory0()[retptr / 4 + 1];
      if (r1) {
        throw takeObject(r0);
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
};
async function __wbg_load(module, imports) {
  if (typeof Response === "function" && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        if (module.headers.get("Content-Type") != "application/wasm") {
          console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
        } else {
          throw e;
        }
      }
    }
    const bytes = await module.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module, imports);
    if (instance instanceof WebAssembly.Instance) {
      return { instance, module };
    } else {
      return instance;
    }
  }
}
__name(__wbg_load, "__wbg_load");
function __wbg_get_imports() {
  const imports = {};
  imports.wbg = {};
  imports.wbg.__wbg_new_28c511d9baebfa89 = function(arg0, arg1) {
    const ret = new Error(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_memory = function() {
    const ret = wasm.memory;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_buffer_12d079cc21e14bdb = function(arg0) {
    const ret = getObject(arg0).buffer;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_newwithbyteoffsetandlength_aa4a17c33a06e5cb = function(arg0, arg1, arg2) {
    const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
    takeObject(arg0);
  };
  imports.wbg.__wbg_new_63b92bc8671ed464 = function(arg0) {
    const ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_values_839f3396d5aac002 = function(arg0) {
    const ret = getObject(arg0).values();
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_next_196c84450b364254 = function() {
    return handleError(function(arg0) {
      const ret = getObject(arg0).next();
      return addHeapObject(ret);
    }, arguments);
  };
  imports.wbg.__wbg_done_298b57d23c0fc80c = function(arg0) {
    const ret = getObject(arg0).done;
    return ret;
  };
  imports.wbg.__wbg_value_d93c65011f51a456 = function(arg0) {
    const ret = getObject(arg0).value;
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_instanceof_Uint8Array_2b3bbecd033d19f6 = function(arg0) {
    let result;
    try {
      result = getObject(arg0) instanceof Uint8Array;
    } catch (_) {
      result = false;
    }
    const ret = result;
    return ret;
  };
  imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof obj === "string" ? obj : void 0;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
  };
  imports.wbg.__wbg_new_16b304a2cfa7ff4a = function() {
    const ret = new Array();
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
  };
  imports.wbg.__wbg_push_a5b05aedc7234f9f = function(arg0, arg1) {
    const ret = getObject(arg0).push(getObject(arg1));
    return ret;
  };
  imports.wbg.__wbg_length_c20a40f15020d68a = function(arg0) {
    const ret = getObject(arg0).length;
    return ret;
  };
  imports.wbg.__wbg_set_a47bac70306a19a7 = function(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
  };
  imports.wbg.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
  };
  return imports;
}
__name(__wbg_get_imports, "__wbg_get_imports");
function __wbg_init_memory(imports, maybe_memory) {
}
__name(__wbg_init_memory, "__wbg_init_memory");
function __wbg_finalize_init(instance, module) {
  wasm = instance.exports;
  __wbg_init.__wbindgen_wasm_module = module;
  cachedInt32Memory0 = null;
  cachedUint8Memory0 = null;
  return wasm;
}
__name(__wbg_finalize_init, "__wbg_finalize_init");
async function __wbg_init(input) {
  if (wasm !== void 0)
    return wasm;
  if (typeof input === "undefined") {
    input = new URL("index_bg.wasm", void 0);
  }
  const imports = __wbg_get_imports();
  if (typeof input === "string" || typeof Request === "function" && input instanceof Request || typeof URL === "function" && input instanceof URL) {
    input = fetch(input);
  }
  __wbg_init_memory(imports);
  const { instance, module } = await __wbg_load(await input, imports);
  return __wbg_finalize_init(instance, module);
}
__name(__wbg_init, "__wbg_init");
var dist_default = __wbg_init;
var initialized = false;
var initWasm = /* @__PURE__ */ __name(async (module_or_path) => {
  if (initialized) {
    throw new Error("Already initialized. The `initWasm()` function can be used only once.");
  }
  await dist_default(await module_or_path);
  initialized = true;
}, "initWasm");
var Resvg2 = class extends Resvg {
  static {
    __name(this, "Resvg2");
  }
  /**
   * @param {Uint8Array | string} svg
   * @param {ResvgRenderOptions | undefined} options
   */
  constructor(svg, options) {
    if (!initialized)
      throw new Error("Wasm has not been initialized. Call `initWasm()` function.");
    const font = options?.font;
    if (!!font && isCustomFontsOptions(font)) {
      const serializableOptions = {
        ...options,
        font: {
          ...font,
          fontBuffers: void 0
        }
      };
      super(svg, JSON.stringify(serializableOptions), font.fontBuffers);
    } else {
      super(svg, JSON.stringify(options));
    }
  }
};
function isCustomFontsOptions(value) {
  return Object.prototype.hasOwnProperty.call(value, "fontBuffers");
}
__name(isCustomFontsOptions, "isCustomFontsOptions");

// src/poster.ts
var import_upng_js = __toESM(require_UPNG(), 1);

// src/template-config.ts
init_checked_fetch();
init_modules_watch_stub();
var TEMPLATE_CONFIG = {
  width: 1024,
  height: 1536,
  tableArea: {
    x: 50,
    y: 480,
    width: 924
  }
};

// src/poster.ts
import resvgWasm from "./dd4dd8881e2df4e64203b5c0ae65e1648ab55207-resvg.wasm";
import posterPng from "./5ebd9101b8aabf40bf0a34de5579317d7cbd1c4f-poster.png";

// src/font-paths.json
var font_paths_default = { inter: { regular: { "0": { d: "M646-20Q480-20 363 70Q246 160 184 330.50Q122 501 122 744Q122 986 184.50 1157Q247 1328 364 1419Q481 1510 646 1510Q811 1510 928.50 1419Q1046 1328 1108 1157Q1170 986 1170 744Q1170 502 1108.50 331Q1047 160 930 70Q813-20 646-20ZM646 146Q755 146 831 217Q907 288 947 421.50Q987 555 987 744Q987 934 947 1068.50Q907 1203 831 1274Q755 1345 646 1345Q537 1345 461 1273.50Q385 1202 345 1068Q305 934 305 744Q305 555 345 421.50Q385 288 461 217Q537 146 646 146Z", aw: 1292, x1: 122, y1: -20, x2: 1170, y2: 1510 }, "1": { d: "M420 1490L653 1490L653 0L466 0L466 1314L456 1314L96 1047L96 1251Z", aw: 833, x1: 96, y1: 0, x2: 653, y2: 1490 }, "2": { d: "M1103 0L154 0L154 137L649 674Q732 764 787 832Q842 900 870 961.50Q898 1023 898 1092Q898 1170 861 1227Q824 1284 761 1314.50Q698 1345 618 1345Q533 1345 470.50 1310.50Q408 1276 374 1213.50Q340 1151 340 1067L158 1067Q158 1199 219 1299Q280 1399 385 1454.50Q490 1510 623 1510Q756 1510 858.50 1454.50Q961 1399 1019.50 1305Q1078 1211 1078 1094Q1078 1013 1049 936.50Q1020 860 947 763Q874 666 742 526L416 179L416 167L1103 167Z", aw: 1249, x1: 154, y1: 0, x2: 1103, y2: 1510 }, "3": { d: "M635-20Q489-20 376 30Q263 80 196.50 169Q130 258 125 376L317 376Q323 305 365.50 253.50Q408 202 477.50 174.50Q547 147 632 147Q726 147 798.50 179.50Q871 212 913 271Q955 330 955 407Q955 488 914.50 549.50Q874 611 797 646Q720 681 609 681L488 681L488 846L609 846Q696 846 762.50 877.50Q829 909 866 966Q903 1023 903 1100Q903 1174 870.50 1229Q838 1284 778 1314.50Q718 1345 637 1345Q561 1345 494.50 1317.50Q428 1290 385.50 1239Q343 1188 340 1115L157 1115Q161 1232 227 1321Q293 1410 401.50 1460Q510 1510 641 1510Q780 1510 880.50 1454Q981 1398 1035 1307Q1089 1216 1089 1110Q1089 984 1022.50 896Q956 808 842 774L842 762Q937 747 1004.50 698Q1072 649 1107.50 574Q1143 499 1143 405Q1143 283 1077 187Q1011 91 896 35.50Q781-20 635-20Z", aw: 1265, x1: 125, y1: -20, x2: 1143, y2: 1510 }, "4": { d: "M821 303L120 303L120 458L772 1490L1003 1490L1003 470L1205 470L1205 303L1003 303L1003 0L821 0ZM323 470L822 470L822 1252L810 1252L323 482Z", aw: 1323, x1: 120, y1: 0, x2: 1205, y2: 1490 }, "5": { d: "M596-20Q465-20 361 31.50Q257 83 195 172.50Q133 262 128 376L312 376Q318 310 357 258Q396 206 458.50 176.50Q521 147 596 147Q686 147 756.50 189Q827 231 867 305Q907 379 907 473Q907 569 865 645Q823 721 750.50 764.50Q678 808 584 808Q515 808 444 786Q373 764 329 730L151 752L239 1490L1023 1490L1023 1323L399 1323L348 888L356 888Q402 926 472 950.50Q542 975 619 975Q721 975 807.50 938Q894 901 958 833.50Q1022 766 1057.50 675Q1093 584 1093 476Q1093 333 1028.50 221Q964 109 852 44.50Q740-20 596-20Z", aw: 1215, x1: 128, y1: -20, x2: 1093, y2: 1490 }, "6": { d: "M646-20Q553-20 460 14Q367 48 290.50 128Q214 208 168 345Q122 482 122 688Q122 885 159.50 1037.50Q197 1190 268.50 1295.50Q340 1401 441 1455.50Q542 1510 669 1510Q794 1510 893 1460Q992 1410 1055 1321Q1118 1232 1136 1115L950 1115Q925 1212 855 1277Q785 1342 669 1342Q555 1342 472.50 1275Q390 1208 346 1081.50Q302 955 302 776L314 776Q354 838 410 882.50Q466 927 535 950.50Q604 974 681 974Q809 974 915 911Q1021 848 1084.50 736.50Q1148 625 1148 481Q1148 342 1086 228.50Q1024 115 911 47.50Q798-20 646-20ZM646 147Q736 147 808 192Q880 237 922 312.50Q964 388 964 481Q964 572 923.50 646.50Q883 721 812 765Q741 809 651 809Q583 809 524.50 782.50Q466 756 422 709.50Q378 663 353.50 603.50Q329 544 329 479Q329 391 370 315.50Q411 240 483 193.50Q555 147 646 147Z", aw: 1270, x1: 122, y1: -20, x2: 1148, y2: 1510 }, "7": { d: "M400 0L200 0L862 1311L862 1323L98 1323L98 1490L1061 1490L1061 1313Z", aw: 1159, x1: 98, y1: 0, x2: 1061, y2: 1490 }, "8": { d: "M633-20Q482-20 366.50 33.50Q251 87 186.50 181Q122 275 122 396Q122 490 160 570.50Q198 651 264 705Q330 759 413 774L413 782Q304 810 240 903Q176 996 176 1114Q176 1228 235 1317.50Q294 1407 397 1458.50Q500 1510 633 1510Q764 1510 867 1458.50Q970 1407 1029.50 1317.50Q1089 1228 1089 1114Q1089 996 1024.50 903Q960 810 854 782L854 774Q935 759 1001 705Q1067 651 1106 570.50Q1145 490 1145 396Q1145 275 1079.50 181Q1014 87 898.50 33.50Q783-20 633-20ZM633 145Q732 145 804 177.50Q876 210 915.50 268.50Q955 327 955 406Q955 489 913 552.50Q871 616 798 652.50Q725 689 633 689Q539 689 466 652.50Q393 616 351 552.50Q309 489 309 406Q309 327 348 268.50Q387 210 460 177.50Q533 145 633 145ZM633 848Q712 848 773 879.50Q834 911 869.50 968Q905 1025 905 1100Q905 1175 871 1230Q837 1285 775.50 1315.50Q714 1346 633 1346Q551 1346 489.50 1315.50Q428 1285 394 1230Q360 1175 360 1100Q360 1025 394.50 968Q429 911 491 879.50Q553 848 633 848Z", aw: 1267, x1: 122, y1: -20, x2: 1145, y2: 1510 }, "9": { d: "M603-20Q476-20 377 30Q278 80 215 170Q152 260 134 379L322 379Q345 280 415 214Q485 148 603 148Q717 148 799 215Q881 282 925.50 409Q970 536 970 716L958 716Q918 655 862 610.50Q806 566 737.50 541.50Q669 517 591 517Q463 517 356 580.50Q249 644 185.50 755.50Q122 867 122 1010Q122 1149 185 1263.50Q248 1378 361.50 1445.50Q475 1513 628 1510Q720 1509 812 1474.50Q904 1440 980 1361Q1056 1282 1102 1146Q1148 1010 1148 804Q1148 606 1110.50 453Q1073 300 1002 194.50Q931 89 830 34.50Q729-20 603-20ZM619 683Q687 683 746 710Q805 737 849 783.50Q893 830 918 889.50Q943 949 943 1015Q943 1101 901.50 1175.50Q860 1250 788.50 1296.50Q717 1343 625 1343Q535 1343 463.50 1298.50Q392 1254 350 1178.50Q308 1103 308 1011Q308 920 348.50 845.50Q389 771 459 727Q529 683 619 683Z", aw: 1270, x1: 122, y1: -20, x2: 1148, y2: 1510.127659574468 }, A: { d: "M254 0L52 0L593 1490L813 1490L1361 0L1161 0L1012 416L398 416ZM456 582L953 582L845 884Q816 966 778 1089Q746 1190 702 1338Q659 1188 627 1085Q587 960 561 884Z", aw: 1413, x1: 52, y1: 0, x2: 1361, y2: 1490 }, B: { d: "M725 0L180 0L180 1490L708 1490Q864 1490 965.50 1436.50Q1067 1383 1116.50 1293.50Q1166 1204 1166 1095Q1166 999 1132 936.50Q1098 874 1042.50 837Q987 800 922 782L922 768Q992 764 1061.50 720Q1131 676 1177.50 595Q1224 514 1224 397Q1224 285 1172.50 195Q1121 105 1011 52.50Q901 0 725 0ZM370 676L370 168L720 168Q894 168 967.50 235Q1041 302 1041 399Q1041 474 1003 537Q965 600 895.50 638Q826 676 730 676ZM370 1322L370 836L698 836Q778 836 843 867.50Q908 899 946 956.50Q984 1014 984 1091Q984 1188 916.50 1255Q849 1322 704 1322Z", aw: 1340, x1: 180, y1: 0, x2: 1224, y2: 1490 }, C: { d: "M783-20Q592-20 442.50 72.50Q293 165 207.50 336.50Q122 508 122 744Q122 981 207.50 1152.50Q293 1324 442.50 1417Q592 1510 783 1510Q896 1510 996.50 1477Q1097 1444 1177 1380.50Q1257 1317 1310.50 1226.50Q1364 1136 1384 1021L1194 1021Q1178 1098 1139.50 1156Q1101 1214 1045.50 1254Q990 1294 923 1314Q856 1334 783 1334Q649 1334 541 1266Q433 1198 370 1066.50Q307 935 307 744Q307 554 370.50 422.50Q434 291 542 223.50Q650 156 783 156Q856 156 923 176.50Q990 197 1045.50 236.50Q1101 276 1139.50 334.50Q1178 393 1194 469L1384 469Q1365 355 1311.50 265Q1258 175 1178 111Q1098 47 997.50 13.50Q897-20 783-20Z", aw: 1496, x1: 122, y1: -20, x2: 1384, y2: 1510 }, D: { d: "M645 0L180 0L180 1490L664 1490Q882 1490 1036.50 1401Q1191 1312 1273.50 1145.50Q1356 979 1356 748Q1356 515 1273 347.50Q1190 180 1031 90Q872 0 645 0ZM370 1322L370 168L633 168Q815 168 934.50 237.50Q1054 307 1113 437Q1172 567 1172 748Q1172 927 1113.50 1055.50Q1055 1184 939.50 1253Q824 1322 651 1322Z", aw: 1478, x1: 180, y1: 0, x2: 1356, y2: 1490 }, E: { d: "M1097 0L180 0L180 1490L1088 1490L1088 1322L370 1322L370 836L1039 836L1039 668L370 668L370 168L1097 168Z", aw: 1231, x1: 180, y1: 0, x2: 1097, y2: 1490 }, F: { d: "M370 0L180 0L180 1490L1081 1490L1081 1322L370 1322L370 812L1013 812L1013 644L370 644Z", aw: 1209, x1: 180, y1: 0, x2: 1081, y2: 1490 }, G: { d: "M789-20Q590-20 440 73Q290 166 206 337.50Q122 509 122 744Q122 981 206 1152.50Q290 1324 438 1417Q586 1510 777 1510Q895 1510 997.50 1475Q1100 1440 1181 1375Q1262 1310 1315.50 1220.50Q1369 1131 1389 1023L1193 1023Q1170 1095 1132 1152Q1094 1209 1041.50 1250Q989 1291 923 1312.50Q857 1334 778 1334Q647 1334 540 1266.50Q433 1199 370 1067.50Q307 936 307 744Q307 554 370.50 423Q434 292 543 224Q652 156 789 156Q915 156 1011 209.50Q1107 263 1161 362Q1212 456 1214 583L828 583L828 749L1400 749L1400 586Q1400 401 1321 265Q1242 129 1104.50 54.50Q967-20 789-20Z", aw: 1528, x1: 122, y1: -20, x2: 1400, y2: 1510 }, H: { d: "M370 0L180 0L180 1490L370 1490L370 846L1152 846L1152 1490L1342 1490L1342 0L1152 0L1152 678L370 678Z", aw: 1522, x1: 180, y1: 0, x2: 1342, y2: 1490 }, I: { d: "M180 1490L370 1490L370 0L180 0Z", aw: 550, x1: 180, y1: 0, x2: 370, y2: 1490 }, J: { d: "M545-20Q348-20 224 96Q100 212 100 426L100 506L290 506L290 426Q290 290 360 218.50Q430 147 545 147Q659 147 729 218.50Q799 290 799 426L799 1490L989 1490L989 426Q989 212 865.50 96Q742-20 545-20Z", aw: 1169, x1: 100, y1: -20, x2: 989, y2: 1490 }, K: { d: "M370 0L180 0L180 1490L370 1490L370 980L367 706Q390 735 412 763Q462 827 515 888Q568 949 624 1009L1069 1490L1318 1490L716 845L1319 0L1094 0L585 716L370 489Z", aw: 1376, x1: 180, y1: 0, x2: 1319, y2: 1490 }, L: { d: "M1060 0L180 0L180 1490L370 1490L370 168L1060 168Z", aw: 1158, x1: 180, y1: 0, x2: 1060, y2: 1490 }, M: { d: "M361 0L180 0L180 1490L450 1490L817 550Q830 517 846.50 467.50Q863 418 881.50 360Q900 302 917 245Q922 227 927 210Q931 225 936 241Q953 297 971.50 355.50Q990 414 1007 465Q1024 516 1037 550L1399 1490L1670 1490L1670 0L1483 0L1483 851Q1483 897 1483.50 956Q1484 1015 1485.50 1080Q1487 1145 1489 1212Q1489 1250 1490 1287Q1477 1245 1463 1202Q1439 1130 1416.50 1063.50Q1394 997 1374 942Q1354 887 1340 851L1007 0L842 0L504 851Q490 886 471 939.50Q452 993 429.50 1058.50Q407 1124 383 1197Q369 1240 354 1284Q355 1253 356 1221Q357 1156 358 1089.50Q359 1023 360 961.50Q361 900 361 851Z", aw: 1850, x1: 180, y1: 0, x2: 1670, y2: 1490 }, N: { d: "M371 0L180 0L180 1490L404 1490L1010 537Q1034 500 1068 442Q1102 384 1142 311Q1164 270 1185 226Q1181 274 1179 320Q1175 398 1174 464Q1173 530 1173 576L1173 1490L1363 1490L1363 0L1137 0L597 848Q560 907 522.50 969.50Q485 1032 437 1118Q402 1179 356 1262Q359 1189 362 1124Q366 1030 368.50 960Q371 890 371 850Z", aw: 1543, x1: 180, y1: 0, x2: 1363, y2: 1490 }, O: { d: "M784-20Q593-20 443.50 72.50Q294 165 208 336.50Q122 508 122 744Q122 981 208 1152.50Q294 1324 443.50 1417Q593 1510 784 1510Q975 1510 1124 1417Q1273 1324 1358.50 1152.50Q1444 981 1444 744Q1444 508 1358.50 336.50Q1273 165 1124 72.50Q975-20 784-20ZM784 156Q917 156 1024.50 223.50Q1132 291 1195.50 422.50Q1259 554 1259 744Q1259 936 1195.50 1067.50Q1132 1199 1024.50 1266.50Q917 1334 784 1334Q650 1334 542 1266Q434 1198 370.50 1066.50Q307 935 307 744Q307 554 370.50 423Q434 292 542 224Q650 156 784 156Z", aw: 1566, x1: 122, y1: -20, x2: 1444, y2: 1510 }, P: { d: "M370 0L180 0L180 1490L690 1490Q864 1490 976.50 1426.50Q1089 1363 1143.50 1256Q1198 1149 1198 1016Q1198 883 1143.50 775Q1089 667 977 603Q865 539 691 539L370 539ZM370 1323L370 706L682 706Q800 706 872 746.50Q944 787 976.50 857.50Q1009 928 1009 1016Q1009 1104 976.50 1173.50Q944 1243 871.50 1283Q799 1323 680 1323Z", aw: 1308, x1: 180, y1: 0, x2: 1198, y2: 1490 }, Q: { d: "M784-20Q593-20 443.50 72.50Q294 165 208 336.50Q122 508 122 744Q122 981 208 1152.50Q294 1324 443.50 1417Q593 1510 784 1510Q975 1510 1124 1417Q1273 1324 1358.50 1152.50Q1444 981 1444 744Q1444 508 1359 337Q1291 201 1184 115L1376-140L1178-140L1049 33Q929-20 784-20ZM938 182L722 466L920 466L1076 261Q1148 324 1196 423Q1259 554 1259 744Q1259 936 1195.50 1067.50Q1132 1199 1024.50 1266.50Q917 1334 784 1334Q650 1334 542 1266Q434 1198 370.50 1066.50Q307 935 307 744Q307 554 370.50 423Q434 292 542 224Q650 156 784 156Q866 156 938 182Z", aw: 1566, x1: 122, y1: -140, x2: 1444, y2: 1510 }, R: { d: "M370 0L180 0L180 1490L690 1490Q864 1490 976.50 1430.50Q1089 1371 1143.50 1267Q1198 1163 1198 1030Q1198 897 1143.50 795Q1089 693 977 636Q951 622 922 612L1256 0L1036 0L726 579Q709 578 691 578L370 578ZM370 1323L370 747L682 747Q800 747 871.50 781.50Q943 816 976 879.50Q1009 943 1009 1030Q1009 1119 976 1184.50Q943 1250 871 1286.50Q799 1323 680 1323Z", aw: 1318, x1: 180, y1: 0, x2: 1256, y2: 1490 }, S: { d: "M657-26Q496-26 377.50 26Q259 78 192 171.50Q125 265 116 390L311 390Q319 306 368 251.50Q417 197 493.50 170.50Q570 144 657 144Q758 144 838.50 177Q919 210 966 270Q1013 330 1013 409Q1013 481 972.50 526Q932 571 865 600Q798 629 718 651L538 702Q358 753 258 848Q158 943 158 1091Q158 1217 226 1311.50Q294 1406 410 1458Q526 1510 670 1510Q817 1510 930 1458Q1043 1406 1108.50 1316.50Q1174 1227 1178 1114L992 1114Q979 1223 888 1282.50Q797 1342 664 1342Q568 1342 495.50 1310.50Q423 1279 383 1224.50Q343 1170 343 1100Q343 1022 391.50 974.50Q440 927 506.50 900.50Q573 874 627 859L776 818Q836 802 908.50 774Q981 746 1047 699.50Q1113 653 1155.50 581.50Q1198 510 1198 406Q1198 284 1134.50 186Q1071 88 950 31Q829-26 657-26Z", aw: 1314, x1: 116, y1: -26, x2: 1198, y2: 1510 }, T: { d: "M567 1322L98 1322L98 1490L1224 1490L1224 1322L757 1322L757 0L567 0Z", aw: 1322, x1: 98, y1: 0, x2: 1224, y2: 1490 }, U: { d: "M763-24Q587-24 455.50 45Q324 114 252 234Q180 354 180 507L180 1490L370 1490L370 522Q370 415 417.50 331.50Q465 248 553 200Q641 152 763 152Q885 152 972.50 200Q1060 248 1107 331.50Q1154 415 1154 522L1154 1490L1344 1490L1344 507Q1344 354 1272 234Q1200 114 1069.50 45Q939-24 763-24Z", aw: 1524, x1: 180, y1: -24, x2: 1344, y2: 1490 }, V: { d: "M819 0L600 0L52 1490L252 1490L567 606Q594 530 635 403Q668 299 710 154Q753 303 786 406Q826 530 852 606L1159 1490L1361 1490Z", aw: 1413, x1: 52, y1: 0, x2: 1361, y2: 1490 }, W: { d: "M680 0L458 0L52 1490L246 1490L482 576Q501 503 518 427.50Q535 352 551 275Q561 227 570 178Q579 227 589 275Q605 352 623 427.50Q641 503 660 576L901 1490L1117 1490L1356 576Q1376 503 1393.50 427.50Q1411 352 1428 275Q1438 230 1447 184Q1456 230 1465 275Q1481 352 1499 427.50Q1517 503 1535 576L1770 1490L1966 1490L1558 0L1337 0L1081 944Q1056 1036 1033 1145Q1020 1205 1008 1276Q996 1212 985 1156Q964 1050 935 944Z", aw: 2018, x1: 52, y1: 0, x2: 1966, y2: 1490 }, X: { d: "M273 0L57 0L591 763L90 1490L310 1490L525 1174Q573 1104 603.50 1056Q634 1008 660 962Q678 928 701 884Q723 927 742 961Q767 1007 798.50 1055.50Q830 1104 878 1174L1097 1490L1312 1490L811 770L1340 0L1121 0L860 378Q818 440 789 484.50Q760 529 735 574Q718 603 699 640Q681 605 665 577Q639 532 609.50 486.50Q580 441 536 378Z", aw: 1397, x1: 57, y1: 0, x2: 1340, y2: 1490 }, Y: { d: "M790 0L600 0L600 610L52 1490L272 1490L567 1009Q617 928 656 855Q676 816 697 766Q718 818 739 858Q778 932 825 1009L1119 1490L1338 1490L790 610Z", aw: 1390, x1: 52, y1: 0, x2: 1338, y2: 1490 }, Z: { d: "M1166 0L130 0L130 134L796 1125Q841 1192 892 1260Q918 1293 943 1327Q887 1324 830 1324Q737 1322 645 1322L122 1322L122 1490L1158 1490L1158 1354L502 379Q454 308 401 237Q372 200 344 163Q401 166 457 167Q548 168 640 168L1166 168Z", aw: 1288, x1: 122, y1: 0, x2: 1166, y2: 1490 }, a: { d: "M471-26Q365-26 278.50 14Q192 54 141 131Q90 208 90 318Q90 414 128 474Q166 534 229.50 568.50Q293 603 370 620Q447 637 525 647Q625 660 688 667Q751 674 781.50 691Q812 708 812 749L812 755Q812 825 786 873.50Q760 922 708 948Q656 974 578 974Q498 974 441 949Q384 924 348.50 886.50Q313 849 295 810L122 867Q165 969 238 1026.50Q311 1084 399 1108Q487 1132 573 1132Q629 1132 700.50 1118.50Q772 1105 838.50 1065Q905 1025 948.50 946.50Q992 868 992 737L992 0L815 0L815 152L803 152Q784 113 742 71.50Q700 30 633 2Q566-26 471-26ZM502 133Q602 133 671 172Q740 211 776 273.50Q812 336 812 404L812 559Q801 546 764 535.50Q727 525 679.50 517Q632 509 587.50 503.50Q543 498 517 495Q452 487 395.50 467.50Q339 448 305 410.50Q271 373 271 309Q271 251 301 212Q331 173 383 153Q435 133 502 133Z", aw: 1150, x1: 90, y1: -26, x2: 992, y2: 1132 }, b: { d: "M677-24Q571-24 506 12.50Q441 49 406 95.50Q371 142 352 173L332 173L332 0L158 0L158 1490L338 1490L338 939L352 939Q371 969 405 1014.50Q439 1060 503 1096Q567 1132 676 1132Q816 1132 922.50 1062Q1029 992 1089.50 862.50Q1150 733 1150 556Q1150 378 1090 248Q1030 118 923.50 47Q817-24 677-24ZM650 137Q755 137 825.50 193.50Q896 250 931.50 345.50Q967 441 967 558Q967 674 932 767.50Q897 861 826.50 916Q756 971 650 971Q547 971 477 919Q407 867 371.50 774.50Q336 682 336 558Q336 434 372 339Q408 244 478.50 190.50Q549 137 650 137Z", aw: 1254, x1: 158, y1: -24, x2: 1150, y2: 1490 }, c: { d: "M613-24Q461-24 346.50 48Q232 120 168 250Q104 380 104 552Q104 727 168 857.50Q232 988 346.50 1060Q461 1132 613 1132Q694 1132 766 1111Q838 1090 897.50 1050.50Q957 1011 1000 953.50Q1043 896 1066 823L893 774Q881 817 856 853Q831 889 795.50 915.50Q760 942 714 956.50Q668 971 613 971Q501 971 429 912.50Q357 854 322 759Q287 664 287 552Q287 442 322 347.50Q357 253 429 195Q501 137 613 137Q669 137 716 152Q763 167 799.50 194.50Q836 222 861 260Q886 298 898 343L1070 294Q1048 219 1004.50 160.50Q961 102 901 60.50Q841 19 768-2.50Q695-24 613-24Z", aw: 1170, x1: 104, y1: -24, x2: 1070, y2: 1132 }, d: { d: "M577-24Q438-24 331 47Q224 118 164 248Q104 378 104 556Q104 733 164.50 862.50Q225 992 332 1062Q439 1132 578 1132Q687 1132 751 1096Q815 1060 849.50 1014.50Q884 969 902 939L916 939L916 1490L1096 1490L1096 0L922 0L922 173L902 173Q884 142 848.50 95.50Q813 49 748.50 12.50Q684-24 577-24ZM604 137Q706 137 776 190.50Q846 244 882 339Q918 434 918 558Q918 682 882.50 774.50Q847 867 777 919Q707 971 604 971Q498 971 427.50 916Q357 861 322 767.50Q287 674 287 558Q287 441 322.50 345.50Q358 250 429 193.50Q500 137 604 137Z", aw: 1254, x1: 104, y1: -24, x2: 1096, y2: 1490 }, e: { d: "M628-24Q466-24 348.50 48Q231 120 167.50 249Q104 378 104 550Q104 722 166 853Q228 984 341.50 1058Q455 1132 607 1132Q696 1132 782.50 1102.50Q869 1073 939.50 1007.50Q1010 942 1052 835Q1094 728 1094 573L1094 498L286 498Q290 390 329 312Q372 225 449.50 180.50Q527 136 629 136Q695 136 749 155Q803 174 842 212.50Q881 251 902 308L1076 260Q1050 176 988 112Q926 48 834.50 12Q743-24 628-24ZM287 650L911 650Q904 726 879 790Q844 875 776 923.50Q708 972 607 972Q506 972 434 922.50Q362 873 324 794Q292 726 287 650Z", aw: 1194, x1: 104, y1: -24, x2: 1094, y2: 1132 }, f: { d: "M420 1118L678 1118L678 964L420 964L420 0L240 0L240 964L20 964L20 1118L240 1118L240 1267Q240 1364 285.50 1429Q331 1494 404 1527Q477 1560 558 1560Q622 1560 664 1549.50Q706 1539 726 1530L676 1376Q662 1381 639.50 1387Q617 1393 579 1393Q496 1393 458 1350.50Q420 1308 420 1227Z", aw: 758, x1: 20, y1: 0, x2: 726, y2: 1560 }, g: { d: "M611-442Q487-442 396.50-410.50Q306-379 246-327Q186-275 151-214L297-120Q321-152 356.50-191Q392-230 452.50-257.50Q513-285 611-285Q745-285 831.50-221Q918-157 918-19L918 205L901 205Q882 173 847.50 129Q813 85 748.50 51.50Q684 18 576 18Q442 18 335 81.50Q228 145 166 267Q104 389 104 564Q104 737 165 864.50Q226 992 333.50 1062Q441 1132 580 1132Q688 1132 752.50 1096.50Q817 1061 852 1015Q887 969 906 939L923 939L923 1118L1098 1118L1098-29Q1098-173 1033-264.50Q968-356 857.50-399Q747-442 611-442ZM606 178Q708 178 778 224.50Q848 271 884 358.50Q920 446 920 568Q920 687 884.50 777.50Q849 868 779 919.50Q709 971 606 971Q500 971 429 916.50Q358 862 322.50 771Q287 680 287 568Q287 453 323 365Q359 277 430 227.50Q501 178 606 178Z", aw: 1256, x1: 104, y1: -442, x2: 1098, y2: 1132 }, h: { d: "M338 670L338 0L158 0L158 1490L338 1490L338 925Q384 1020 453 1067Q547 1132 674 1132Q787 1132 872.50 1085.50Q958 1039 1005.50 945.50Q1053 852 1053 710L1053 0L872 0L872 695Q872 824 804.50 897Q737 970 620 970Q540 970 476 935Q412 900 375 833Q338 766 338 670Z", aw: 1211, x1: 158, y1: 0, x2: 1053, y2: 1490 }, i: { d: "M338 0L158 0L158 1118L338 1118ZM249 1301Q198 1301 161 1336Q124 1371 124 1420Q124 1470 161 1504.50Q198 1539 249 1539Q301 1539 338 1504.50Q375 1470 375 1420Q375 1371 338 1336Q301 1301 249 1301Z", aw: 496, x1: 124, y1: 0, x2: 375, y2: 1539 }, j: { d: "M157-80L157 1118L338 1118L338-80Q339-186 302-262Q265-338 192-378Q119-418 10-418L-26-418L-26-252L7-252Q85-252 121-207.50Q157-163 157-80ZM248 1301Q197 1301 160 1336Q123 1371 123 1420Q123 1470 160 1504.50Q197 1539 248 1539Q300 1539 337 1504.50Q374 1470 374 1420Q374 1371 337 1336Q300 1301 248 1301Z", aw: 496, x1: -26, y1: -418, x2: 374, y2: 1539 }, k: { d: "M338 0L158 0L158 1490L338 1490L338 625L360 625L838 1118L1061 1118L593 638L1096 0L865 0L456 523L338 412Z", aw: 1124, x1: 158, y1: 0, x2: 1096, y2: 1490 }, l: { d: "M158 1490L338 1490L338 0L158 0Z", aw: 496, x1: 158, y1: 0, x2: 338, y2: 1490 }, m: { d: "M338 0L158 0L158 1118L333 1118L334 913Q356 975 393 1019Q442 1078 508.50 1108Q575 1138 647 1138Q769 1138 845 1063Q906 1002 932 911Q953 967 991 1011Q1044 1072 1119.50 1105Q1195 1138 1284 1138Q1381 1138 1461 1096Q1541 1054 1588.50 969Q1636 884 1636 754L1636 0L1456 0L1456 749Q1456 870 1388 922Q1320 974 1230 974Q1155 974 1100.50 942.50Q1046 911 1016.50 856Q987 801 987 730L987 0L807 0L807 767Q807 860 745 917Q683 974 588 974Q523 974 465.50 943.50Q408 913 373 853Q338 793 338 704Z", aw: 1794, x1: 158, y1: 0, x2: 1636, y2: 1138 }, n: { d: "M338 670L338 0L158 0L158 1118L331 1118L332 911Q379 1016 453 1067Q547 1132 674 1132Q787 1132 872 1085.50Q957 1039 1004.50 945.50Q1052 852 1052 710L1052 0L872 0L872 695Q872 824 804.50 897Q737 970 620 970Q540 970 476 935Q412 900 375 833Q338 766 338 670Z", aw: 1210, x1: 158, y1: 0, x2: 1052, y2: 1132 }, o: { d: "M613-24Q461-24 346.50 48Q232 120 168 250Q104 380 104 552Q104 727 168 857.50Q232 988 346.50 1060Q461 1132 613 1132Q766 1132 881 1060Q996 988 1060 857.50Q1124 727 1124 552Q1124 380 1060 250Q996 120 881 48Q766-24 613-24ZM613 137Q726 137 799 195Q872 253 907 347.50Q942 442 942 552Q942 663 907 758.50Q872 854 799 912.50Q726 971 613 971Q501 971 429 912.50Q357 854 322 759Q287 664 287 552Q287 442 322 347.50Q357 253 429 195Q501 137 613 137Z", aw: 1228, x1: 104, y1: -24, x2: 1124, y2: 1132 }, p: { d: "M338-418L158-418L158 1118L332 1118L332 939L352 939Q371 969 405 1014.50Q439 1060 503 1096Q567 1132 676 1132Q816 1132 922.50 1062Q1029 992 1089.50 862.50Q1150 733 1150 556Q1150 378 1090 248Q1030 118 923.50 47Q817-24 677-24Q571-24 506 12.50Q441 49 406 95.50Q371 142 352 173L338 173ZM650 137Q755 137 825.50 193.50Q896 250 931.50 345.50Q967 441 967 558Q967 674 932 767.50Q897 861 826.50 916Q756 971 650 971Q547 971 477 919Q407 867 371.50 774.50Q336 682 336 558Q336 434 372 339Q408 244 478.50 190.50Q549 137 650 137Z", aw: 1254, x1: 158, y1: -418, x2: 1150, y2: 1132 }, q: { d: "M1096 1118L1096-418L916-418L916 173L902 173Q884 142 848.50 95.50Q813 49 748.50 12.50Q684-24 577-24Q438-24 331 47Q224 118 164 248Q104 378 104 556Q104 733 164.50 862.50Q225 992 332 1062Q439 1132 578 1132Q687 1132 751 1096Q815 1060 849.50 1014.50Q884 969 902 939L922 939L922 1118ZM604 137Q706 137 776 190.50Q846 244 882 339Q918 434 918 558Q918 682 882.50 774.50Q847 867 777 919Q707 971 604 971Q498 971 427.50 916Q357 861 322 767.50Q287 674 287 558Q287 441 322.50 345.50Q358 250 429 193.50Q500 137 604 137Z", aw: 1254, x1: 104, y1: -418, x2: 1096, y2: 1132 }, r: { d: "M338 0L158 0L158 1118L332 1118L332 946L344 946Q375 1031 454.50 1082.50Q534 1134 634 1134Q654 1134 681.50 1133Q709 1132 725 1131L725 950Q717 952 685 956Q653 960 617 960Q537 960 473.50 926.50Q410 893 374 834.50Q338 776 338 700Z", aw: 771, x1: 158, y1: 0, x2: 725, y2: 1134 }, s: { d: "M538-24Q423-24 333.50 9.50Q244 43 186 109Q128 175 108 271L279 312Q303 220 369.50 177Q436 134 536 134Q653 134 722.50 184Q792 234 792 303Q792 361 751.50 399.50Q711 438 628 457L442 501Q290 537 216 612.50Q142 688 142 806Q142 902 196 975.50Q250 1049 343.50 1090.50Q437 1132 556 1132Q671 1132 751.50 1097.50Q832 1063 882.50 1002.50Q933 942 958 863L795 821Q772 881 718.50 930Q665 979 557 979Q457 979 390.50 933Q324 887 324 817Q324 755 369 717.50Q414 680 512 657L681 617Q833 581 906 505.50Q979 430 979 315Q979 217 923.50 140.50Q868 64 768.50 20Q669-24 538-24Z", aw: 1081, x1: 108, y1: -24, x2: 979, y2: 1132 }, t: { d: "M368 1118L598 1118L598 964L368 964L368 290Q368 215 398.50 180.50Q429 146 500 146Q517 146 543.50 150Q570 154 592 158L629 6Q601-4 565.50-9Q530-14 495-14Q350-14 269 62.50Q188 139 188 276L188 964L20 964L20 1118L188 1118L188 1384L368 1384Z", aw: 670, x1: 20, y1: -14, x2: 629, y2: 1384 }, u: { d: "M537-14Q424-14 338.50 32.50Q253 79 205.50 173Q158 267 158 408L158 1118L338 1118L338 423Q338 294 406 221Q474 148 591 148Q671 148 734.50 183Q798 218 835 285.50Q872 353 872 448L872 1118L1053 1118L1053 0L879 0L879 209Q831 100 756 50Q660-14 537-14Z", aw: 1211, x1: 158, y1: -14, x2: 1053, y2: 1118 }, v: { d: "M670 0L481 0L54 1118L251 1118L489 455Q527 352 554 250Q565 207 576 165Q587 207 599 250Q625 352 662 455L900 1118L1097 1118Z", aw: 1151, x1: 54, y1: 0, x2: 1097, y2: 1118 }, w: { d: "M588 0L409 0L70 1118L261 1118L397 630Q425 530 457 404Q481 308 505 194Q527 303 550 397Q581 524 610 630L744 1118L936 1118L1068 630Q1096 527 1127 401Q1149 306 1172 196Q1195 305 1219 399Q1250 525 1279 630L1415 1118L1606 1118L1267 0L1088 0L943 506Q921 583 900 663Q879 743 859 827Q849 870 838 914Q828 871 818 828Q797 743 776 662Q755 581 733 506Z", aw: 1676, x1: 70, y1: 0, x2: 1606, y2: 1118 }, x: { d: "M273 0L65 0L458 574L88 1118L298 1118L437 901Q491 817 531 744Q547 713 565 682Q581 713 597 744Q632 817 687 901L829 1118L1035 1118L661 564L1053 0L844 0L680 251Q627 333 589 404Q573 432 557 459Q542 432 528 404Q493 333 439 251Z", aw: 1118, x1: 65, y1: 0, x2: 1053, y2: 1118 }, y: { d: "M140-405L186-249L205-254Q260-268 305-261.50Q350-255 386-217Q422-179 449-99L481-6L54 1118L251 1118L489 455Q527 351 553 249Q564 207 575 165Q586 207 598 250Q624 352 661 455L901 1118L1097 1118L606-167Q572-256 524.50-313.50Q477-371 414-398.50Q351-426 272-426Q224-426 189-419Q154-412 140-405Z", aw: 1151, x1: 54, y1: -426, x2: 1097, y2: 1118 }, z: { d: "M1005 0L126 0L126 134L753 940L753 951L146 951L146 1118L985 1118L985 975L376 178L376 167L1005 167Z", aw: 1131, x1: 126, y1: 0, x2: 1005, y2: 1118 }, ":": { d: "M295-13Q239-13 199.50 26.50Q160 66 160 122Q160 178 199.50 217.50Q239 257 295 257Q351 257 390.50 217.50Q430 178 430 122Q430 66 390.50 26.50Q351-13 295-13ZM295 796Q239 796 199.50 835.50Q160 875 160 931Q160 987 199.50 1026.50Q239 1066 295 1066Q351 1066 390.50 1026.50Q430 987 430 931Q430 875 390.50 835.50Q351 796 295 796Z", aw: 590, x1: 160, y1: -13, x2: 430, y2: 1066 }, "/": { d: "M526 1560L692 1560L212-224L46-224Z", aw: 738, x1: 46, y1: -224, x2: 692, y2: 1560 }, ".": { d: "M295-13Q239-13 199.50 26.50Q160 66 160 122Q160 178 199.50 217.50Q239 257 295 257Q351 257 390.50 217.50Q430 178 430 122Q430 66 390.50 26.50Q351-13 295-13Z", aw: 590, x1: 160, y1: -13, x2: 430, y2: 257 }, "-": { d: "M144 719L798 719L798 553L144 553Z", aw: 942, x1: 144, y1: 553, x2: 798, y2: 719 }, "(": { d: "M218 607Q218 770 251.50 948.50Q285 1127 343 1292.50Q401 1458 476 1581L651 1581Q574 1424 517.50 1254Q461 1084 431 918.50Q401 753 401 607Q401 474 427.50 338Q454 202 509.50 50.50Q565-101 651-279L476-279Q349-62 283.50 163Q218 388 218 607Z", aw: 747, x1: 218, y1: -279, x2: 651, y2: 1581 }, ")": { d: "M271-279L96-279Q185-96 240 56.50Q295 209 320.50 344Q346 479 346 607Q346 753 316 918.50Q286 1084 230 1254Q174 1424 96 1581L271 1581Q346 1458 404.50 1292.50Q463 1127 496 948Q529 769 529 607Q529 384 462.50 159Q396-66 271-279Z", aw: 747, x1: 96, y1: -279, x2: 529, y2: 1581 }, "'": { d: "M382 923L232 923L210 1490L404 1490Z", aw: 614, x1: 210, y1: 923, x2: 404, y2: 1490 }, " ": null, _meta: { unitsPerEm: 2048, ascender: 1984, descender: -494 } }, bold: { "0": { d: "M690-20Q502-20 369 70.50Q236 161 165 331.50Q94 502 94 744Q94 985 165 1156.50Q236 1328 369 1419Q502 1510 690 1510Q878 1510 1011.50 1418.50Q1145 1327 1216 1156Q1287 985 1287 744Q1287 502 1216.50 331.50Q1146 161 1012.50 70.50Q879-20 690-20ZM690 233Q782 233 845.50 293Q909 353 942.50 467Q976 581 976 744Q976 908 942.50 1023Q909 1138 845.50 1198Q782 1258 690 1258Q599 1258 535 1197.50Q471 1137 438 1022.50Q405 908 405 744Q405 581 438 467Q471 353 535 293Q599 233 690 233Z", aw: 1381, x1: 94, y1: -20, x2: 1287, y2: 1510 }, "1": { d: "M422 1490L749 1490L749 0L444 0L444 1221L434 1221L93 980L93 1259Z", aw: 883, x1: 93, y1: 0, x2: 749, y2: 1490 }, "2": { d: "M1178 0L124 0L124 220L652 715Q720 781 766.50 834.50Q813 888 837.50 939.50Q862 991 862 1051Q862 1118 832 1166Q802 1214 750 1240Q698 1266 631 1266Q562 1266 510 1238Q458 1210 430 1158Q402 1106 402 1033L110 1033Q110 1178 176.50 1285.50Q243 1393 361 1451.50Q479 1510 633 1510Q791 1510 909 1453.50Q1027 1397 1092.50 1298Q1158 1199 1158 1070Q1158 987 1125.50 906Q1093 825 1009.50 724.50Q926 624 773 484L548 262L548 251L1178 251Z", aw: 1289, x1: 110, y1: 0, x2: 1178, y2: 1510 }, "3": { d: "M659-20Q497-20 371.50 35.50Q246 91 173.50 190Q101 289 99 418L406 418Q409 362 442.50 320.50Q476 279 533 256Q590 233 660 233Q734 233 790 258.50Q846 284 878 330Q910 376 910 437Q910 499 876.50 546Q843 593 781 619.50Q719 646 632 646L494 646L494 873L632 873Q705 873 760.50 898.50Q816 924 847 968.50Q878 1013 878 1073Q878 1131 851 1174Q824 1217 775.50 1241.50Q727 1266 662 1266Q597 1266 543 1242.50Q489 1219 456 1177Q423 1135 422 1077L128 1077Q130 1204 200.50 1302Q271 1400 392 1455Q513 1510 664 1510Q817 1510 932 1454Q1047 1398 1110.50 1303Q1174 1208 1174 1092Q1174 967 1096.50 883Q1019 799 895 775L895 764Q1003 750 1077.50 703Q1152 656 1190 583Q1228 510 1228 417Q1228 291 1155 192Q1082 93 953.50 36.50Q825-20 659-20Z", aw: 1322, x1: 99, y1: -20, x2: 1228, y2: 1510 }, "4": { d: "M814 265L101 265L101 506L724 1490L1107 1490L1107 511L1293 511L1293 265L1107 265L1107 0L814 0ZM409 511L820 511L820 1154L808 1154L409 523Z", aw: 1385, x1: 101, y1: 0, x2: 1293, y2: 1490 }, "5": { d: "M628-20Q475-20 355.50 36.50Q236 93 166.50 192Q97 291 93 418L391 418Q394 360 426.50 315.50Q459 271 512 246.50Q565 222 628 222Q703 222 760.50 255.50Q818 289 851 349Q884 409 884 488Q884 567 850.50 628.50Q817 690 758.50 724Q700 758 623 758Q556 758 494.50 731.50Q433 705 399 660L125 708L196 1490L1098 1490L1098 1238L449 1238L411 861L419 861Q459 915 537.50 950Q616 985 712 985Q813 985 898.50 949Q984 913 1047 847.50Q1110 782 1145 692Q1180 602 1180 495Q1180 345 1110.50 229Q1041 113 916.50 46.50Q792-20 628-20Z", aw: 1274, x1: 93, y1: -20, x2: 1180, y2: 1490 }, "6": { d: "M684-20Q571-20 465 18Q359 56 275.50 140.50Q192 225 143 365Q94 505 94 710Q94 898 136 1046Q178 1194 257 1298Q336 1402 447 1456Q558 1510 695 1510Q842 1510 955 1452.50Q1068 1395 1137.50 1297.50Q1207 1200 1221 1077L921 1077Q902 1156 842.50 1201.50Q783 1247 695 1247Q597 1247 529.50 1189Q462 1131 428 1024.50Q394 918 394 771L404 771Q438 836 494.50 883Q551 930 624 954.50Q697 979 778 979Q910 979 1013.50 917.50Q1117 856 1177 747Q1237 638 1237 498Q1237 347 1167 230Q1097 113 973 46.50Q849-20 684-20ZM682 222Q756 222 814 257.50Q872 293 906 353.50Q940 414 940 490Q940 565 907 625Q874 685 816 720.50Q758 756 684 756Q629 756 582 735Q535 714 499.50 677Q464 640 444.50 592Q425 544 425 489Q425 416 458 355.50Q491 295 549.50 258.50Q608 222 682 222Z", aw: 1330, x1: 94, y1: -20, x2: 1237, y2: 1510 }, "7": { d: "M494 0L177 0L797 1228L797 1238L75 1238L75 1490L1116 1490L1116 1234Z", aw: 1191, x1: 75, y1: 0, x2: 1116, y2: 1490 }, "8": { d: "M666-20Q499-20 370 35Q241 90 167.50 185Q94 280 94 400Q94 493 136.50 571.50Q179 650 251.50 702.50Q324 755 415 770L415 779Q296 804 222 896Q148 988 148 1110Q148 1225 215 1315.50Q282 1406 399 1458Q516 1510 666 1510Q815 1510 932.50 1458Q1050 1406 1117.50 1315.50Q1185 1225 1185 1110Q1185 988 1110 896Q1035 804 919 779L919 770Q1008 755 1080.50 702.50Q1153 650 1196 571.50Q1239 493 1239 400Q1239 280 1165.50 185Q1092 90 962.50 35Q833-20 666-20ZM666 206Q743 206 800 233.50Q857 261 889 310.50Q921 360 921 424Q921 490 888 540.50Q855 591 797.50 620.50Q740 650 666 650Q592 650 534.50 621Q477 592 444 541.50Q411 491 411 424Q411 360 442.50 311Q474 262 532 234Q590 206 666 206ZM666 874Q730 874 779.50 900Q829 926 857.50 972Q886 1018 886 1077Q886 1137 858 1182Q830 1227 780.50 1252Q731 1277 666 1277Q601 1277 551.50 1252Q502 1227 474 1182Q446 1137 446 1077Q446 1018 474 972Q502 926 552 900Q602 874 666 874Z", aw: 1333, x1: 94, y1: -20, x2: 1239, y2: 1510 }, "9": { d: "M636-22Q489-22 375.50 35.50Q262 93 193 192.50Q124 292 109 415L411 415Q429 335 488 288Q547 241 636 241Q734 241 801.50 299.50Q869 358 903.50 465.50Q938 573 938 720L928 720Q894 656 837.50 609Q781 562 708.50 536.50Q636 511 554 511Q422 511 317.50 573Q213 635 153.50 744.50Q94 854 94 993Q94 1144 164 1261.50Q234 1379 359 1446.50Q484 1514 649 1512Q762 1512 867 1473.50Q972 1435 1055.50 1350.50Q1139 1266 1188 1126Q1237 986 1237 781Q1237 593 1194.50 444Q1152 295 1073.50 191Q995 87 884 32.50Q773-22 636-22ZM647 735Q702 735 749.50 756Q797 777 832 814Q867 851 887 899Q907 947 907 1003Q907 1075 873.50 1135Q840 1195 782 1231.50Q724 1268 649 1268Q576 1268 517.50 1232.50Q459 1197 425 1136.50Q391 1076 391 1001Q391 926 424.50 866Q458 806 515.50 770.50Q573 735 647 735Z", aw: 1330, x1: 94, y1: -22, x2: 1237, y2: 1512.0575539568345 }, A: { d: "M386 0L49 0L558 1490L958 1490L1480 0L1141 0L1026 346L497 346ZM573 585L947 585L902 719Q859 858 815 1024Q786 1131 755 1251Q726 1130 699 1022Q657 855 616 719Z", aw: 1529, x1: 49, y1: 0, x2: 1480, y2: 1490 }, B: { d: "M764 0L135 0L135 1490L726 1490Q890 1490 999.50 1440.50Q1109 1391 1163.50 1305Q1218 1219 1218 1107Q1218 1019 1183 953.50Q1148 888 1087.50 846.50Q1027 805 950 787L950 772Q1034 769 1108.50 724.50Q1183 680 1229.50 600.50Q1276 521 1276 410Q1276 293 1218 200Q1160 107 1046.50 53.50Q933 0 764 0ZM440 655L440 251L704 251Q838 251 900 303Q962 355 962 439Q962 503 931.50 551.50Q901 600 845 627.50Q789 655 712 655ZM440 1241L440 864L681 864Q746 864 798 887.50Q850 911 879.50 954.50Q909 998 909 1058Q909 1139 851.50 1190Q794 1241 687 1241Z", aw: 1355, x1: 135, y1: 0, x2: 1276, y2: 1490 }, C: { d: "M786-20Q588-20 431.50 70Q275 160 184.50 331Q94 502 94 744Q94 987 185 1158.50Q276 1330 433 1420Q590 1510 786 1510Q913 1510 1022.50 1474.50Q1132 1439 1217 1371Q1302 1303 1356 1204.50Q1410 1106 1427 981L1118 981Q1108 1042 1079.50 1089.50Q1051 1137 1008.50 1170.50Q966 1204 911 1221.50Q856 1239 792 1239Q676 1239 588 1181Q500 1123 452 1012.50Q404 902 404 744Q404 583 453 473Q502 363 589 307Q676 251 791 251Q855 251 909.50 268.50Q964 286 1007.50 319.50Q1051 353 1079.50 401Q1108 449 1119 509L1428 509Q1416 406 1366.50 311Q1317 216 1235 141Q1153 66 1040 23Q927-20 786-20Z", aw: 1515, x1: 94, y1: -20, x2: 1428, y2: 1510 }, D: { d: "M658 0L135 0L135 1490L664 1490Q888 1490 1049.50 1400.50Q1211 1311 1298 1144.50Q1385 978 1385 746Q1385 513 1298 346Q1211 179 1048 89.50Q885 0 658 0ZM440 1227L440 263L644 263Q788 263 885.50 314Q983 365 1032 472Q1081 579 1081 746Q1081 912 1031.50 1018.50Q982 1125 885.50 1176Q789 1227 646 1227Z", aw: 1479, x1: 135, y1: 0, x2: 1385, y2: 1490 }, E: { d: "M1134 0L135 0L135 1490L1132 1490L1132 1237L440 1237L440 877L1079 877L1079 628L440 628L440 253L1134 253Z", aw: 1244, x1: 135, y1: 0, x2: 1134, y2: 1490 }, F: { d: "M440 0L135 0L135 1490L1115 1490L1115 1237L440 1237L440 821L1049 821L1049 572L440 572Z", aw: 1202, x1: 135, y1: 0, x2: 1115, y2: 1490 }, G: { d: "M795-20Q586-20 428.50 72.50Q271 165 182.50 336.50Q94 508 94 743Q94 985 186 1156.50Q278 1328 435 1419Q592 1510 788 1510Q914 1510 1022.50 1473.50Q1131 1437 1215.50 1370Q1300 1303 1353.50 1211.50Q1407 1120 1423 1010L1113 1010Q1097 1063 1068.50 1105.50Q1040 1148 999.50 1178Q959 1208 907 1223.50Q855 1239 793 1239Q678 1239 590 1181.50Q502 1124 453 1014Q404 904 404 746Q404 588 452.50 477.50Q501 367 589 309Q677 251 797 251Q905 251 982 290Q1059 329 1101 401Q1140 470 1142 562L818 562L818 794L1438 794L1438 608Q1438 412 1355 271.50Q1272 131 1127 55.50Q982-20 795-20Z", aw: 1537, x1: 94, y1: -20, x2: 1438, y2: 1510 }, H: { d: "M440 0L135 0L135 1490L440 1490L440 888L1089 888L1089 1490L1395 1490L1395 0L1089 0L1089 635L440 635Z", aw: 1530, x1: 135, y1: 0, x2: 1395, y2: 1490 }, I: { d: "M135 1490L440 1490L440 0L135 0Z", aw: 575, x1: 135, y1: 0, x2: 440, y2: 1490 }, J: { d: "M567-20Q335-20 201.50 101.50Q68 223 68 448L68 535L373 535L373 443Q373 336 425.50 281Q478 226 567 226Q656 226 708 281Q760 336 760 444L760 1490L1062 1490L1062 449Q1062 223 930 101.50Q798-20 567-20Z", aw: 1197, x1: 68, y1: -20, x2: 1062, y2: 1490 }, K: { d: "M440 0L135 0L135 1490L440 1490L440 1083L435 743Q442 756 450 768Q494 838 547 908.50Q600 979 668 1062L1033 1490L1406 1490L849 845L1422 0L1061 0L637 644L440 426Z", aw: 1473, x1: 135, y1: 0, x2: 1422, y2: 1490 }, L: { d: "M1083 0L135 0L135 1490L440 1490L440 253L1083 253Z", aw: 1158, x1: 135, y1: 0, x2: 1083, y2: 1490 }, M: { d: "M438 0L135 0L135 1490L603 1490L845 806Q860 758 879.50 682Q899 606 919 518Q939 432 956 351Q973 431 992 516Q1012 604 1031.50 681Q1051 758 1066 806L1304 1490L1774 1490L1774 0L1467 0L1467 703Q1467 751 1469 824Q1471 897 1473 981.50Q1475 1066 1477 1152Q1478 1190 1479 1227Q1468 1185 1457 1142Q1434 1053 1410.50 970Q1387 887 1366 817.50Q1345 748 1330 703L1083 0L826 0L575 703Q560 748 539 816.50Q518 885 494.50 968Q471 1051 447 1140Q437 1178 427 1215Q427 1186 428 1156Q430 1071 432.50 985.50Q435 900 436.50 826.50Q438 753 438 703Z", aw: 1908, x1: 135, y1: 0, x2: 1774, y2: 1490 }, N: { d: "M447 0L135 0L135 1490L475 1490L946 736Q982 678 1019 610Q1056 542 1095 459Q1114 418 1132 372Q1130 410 1128 449Q1122 543 1118 629Q1114 715 1114 775L1114 1490L1426 1490L1426 0L1085 0L657 684Q610 761 570 833.50Q530 906 487 994Q460 1048 427 1114Q431 1054 434 996Q440 897 443.50 816.50Q447 736 447 685Z", aw: 1561, x1: 135, y1: 0, x2: 1426, y2: 1490 }, O: { d: "M789-20Q592-20 434.50 70Q277 160 185.50 331Q94 502 94 744Q94 987 185.50 1158.50Q277 1330 434.50 1420Q592 1510 789 1510Q987 1510 1144 1420Q1301 1330 1392.50 1158.50Q1484 987 1484 744Q1484 502 1392.50 331Q1301 160 1144 70Q987-20 789-20ZM789 251Q905 251 991.50 307.50Q1078 364 1126 474.50Q1174 585 1174 744Q1174 905 1126 1015.50Q1078 1126 991.50 1182.50Q905 1239 789 1239Q674 1239 587 1182Q500 1125 452 1014.50Q404 904 404 744Q404 585 452 475Q500 365 587 308Q674 251 789 251Z", aw: 1578, x1: 94, y1: -20, x2: 1484, y2: 1510 }, P: { d: "M440 0L135 0L135 1490L716 1490Q886 1490 1005 1425.50Q1124 1361 1186.50 1247.50Q1249 1134 1249 987Q1249 839 1185.50 726.50Q1122 614 1001.50 550.50Q881 487 709 487L440 487ZM440 1238L440 733L660 733Q754 733 814.50 765.50Q875 798 904.50 855Q934 912 934 987Q934 1062 904.50 1119Q875 1176 814 1207Q753 1238 659 1238Z", aw: 1327, x1: 135, y1: 0, x2: 1249, y2: 1490 }, Q: { d: "M789-20Q592-20 434.50 70Q277 160 185.50 331Q94 502 94 744Q94 987 185.50 1158.50Q277 1330 434.50 1420Q592 1510 789 1510Q987 1510 1144 1420Q1301 1330 1392.50 1158.50Q1484 987 1484 744Q1484 502 1393 331Q1335 223 1251 148L1466-124L1181-124L1058 29Q935-20 789-20ZM885 262L695 512L956 512L1065 373Q1101 416 1126 475Q1174 585 1174 744Q1174 905 1126 1015.50Q1078 1126 991.50 1182.50Q905 1239 789 1239Q674 1239 587 1182Q500 1125 452 1014.50Q404 904 404 744Q404 585 452 475Q500 365 587 308Q674 251 789 251Q840 251 885 262Z", aw: 1591, x1: 94, y1: -124, x2: 1484, y2: 1510 }, R: { d: "M440 0L135 0L135 1490L716 1490Q886 1490 1005 1430Q1124 1370 1186.50 1261Q1249 1152 1249 1005Q1249 858 1185.50 751.50Q1122 645 1002 589Q993 585 985 581L1302 0L964 0L679 532L440 532ZM440 1238L440 779L660 779Q754 779 814 804.50Q874 830 904 880.50Q934 931 934 1005Q934 1081 904 1132.50Q874 1184 813.50 1211Q753 1238 659 1238Z", aw: 1345, x1: 135, y1: 0, x2: 1302, y2: 1490 }, S: { d: "M681-22Q502-22 369.50 33Q237 88 163 196Q89 304 85 462L382 462Q388 387 427 336.50Q466 286 531 261Q596 236 678 236Q760 236 820.50 259.50Q881 283 915 326Q949 369 949 426Q949 477 918.50 511.50Q888 546 831 571Q774 596 692 615L528 656Q339 702 232 800.50Q125 899 125 1061Q125 1196 197.50 1297Q270 1398 396.50 1454Q523 1510 685 1510Q850 1510 973 1453.50Q1096 1397 1165 1296.50Q1234 1196 1236 1065L941 1065Q933 1155 864.50 1204Q796 1253 682 1253Q605 1253 550 1231Q495 1209 466 1170Q437 1131 437 1081Q437 1026 470.50 989.50Q504 953 558.50 930.50Q613 908 676 893L811 860Q905 839 986 803Q1067 767 1128 714.50Q1189 662 1222.50 590Q1256 518 1256 424Q1256 289 1188 188.50Q1120 88 991 33Q862-22 681-22Z", aw: 1341, x1: 85, y1: -22, x2: 1256, y2: 1510 }, T: { d: "M531 1237L75 1237L75 1490L1292 1490L1292 1237L837 1237L837 0L531 0Z", aw: 1367, x1: 75, y1: 0, x2: 1292, y2: 1490 }, U: { d: "M750-21Q565-21 426.50 47.50Q288 116 211.50 238Q135 360 135 523L135 1490L440 1490L440 548Q440 461 478.50 393.50Q517 326 586.50 287.50Q656 249 750 249Q843 249 912.50 287.50Q982 326 1020.50 393.50Q1059 461 1059 548L1059 1490L1365 1490L1365 523Q1365 360 1288 238Q1211 116 1072.50 47.50Q934-21 750-21Z", aw: 1499, x1: 135, y1: -21, x2: 1365, y2: 1490 }, V: { d: "M970 0L571 0L49 1490L388 1490L626 771Q669 635 713 472Q742 365 772 245Q803 366 830 473Q872 635 913 771L1143 1490L1480 1490Z", aw: 1529, x1: 49, y1: 0, x2: 1480, y2: 1490 }, W: { d: "M798 0L449 0L49 1490L382 1490L555 757Q576 665 593.50 560.50Q611 456 628 351Q632 328 635 306Q639 328 643 351Q661 456 680 560.50Q699 665 722 757L904 1490L1221 1490L1402 757Q1425 665 1444 560.50Q1463 456 1482 351Q1485 329 1489 309Q1492 329 1496 351Q1512 456 1530.50 560.50Q1549 665 1569 757L1742 1490L2076 1490L1675 0L1327 0L1129 762Q1097 889 1075 1038Q1068 1080 1061 1124Q1055 1083 1050 1043Q1030 897 995 762Z", aw: 2125, x1: 49, y1: 0, x2: 2076, y2: 1490 }, X: { d: "M404 0L51 0L586 762L99 1490L453 1490L616 1240Q662 1169 691.50 1112.50Q721 1056 746 1004Q752 989 760 974Q767 989 774 1003Q799 1055 829 1112Q859 1169 905 1240L1071 1490L1417 1490L934 771L1461 0L1099 0L892 312Q851 375 825.50 419Q800 463 780 503Q769 523 756 547Q744 524 733 504Q712 464 686 419.50Q660 375 618 312Z", aw: 1512, x1: 51, y1: 0, x2: 1461, y2: 1490 }, Y: { d: "M905 0L601 0L601 560L49 1490L406 1490L658 1026Q697 956 727 887Q741 855 755 818Q769 856 782 888Q811 957 848 1026L1092 1490L1448 1490L905 560Z", aw: 1497, x1: 49, y1: 0, x2: 1448, y2: 1490 }, Z: { d: "M1248 0L115 0L115 183L719 1036Q775 1114 842 1193Q863 1217 884 1241Q842 1239 800 1239Q699 1237 599 1237L112 1237L112 1490L1245 1490L1245 1306L652 468Q593 386 524 305Q500 277 476 249Q523 251 570 252Q674 253 778 253L1248 253Z", aw: 1360, x1: 112, y1: 0, x2: 1248, y2: 1490 }, a: { d: "M440-22Q334-22 249.50 15.50Q165 53 116.50 127.50Q68 202 68 313Q68 406 102.50 469Q137 532 196.50 570Q256 608 331.50 628Q407 648 490 656Q587 666 646.50 674.50Q706 683 733.50 701.50Q761 720 761 756L761 761Q761 809 741 842Q721 875 682 892.50Q643 910 586 910Q528 910 485 892.50Q442 875 415 846Q388 817 375 781L100 827Q129 924 196 992Q263 1060 362.50 1096Q462 1132 586 1132Q677 1132 762 1110.50Q847 1089 914.50 1044Q982 999 1021.50 927Q1061 855 1061 753L1061 0L777 0L777 155L767 155Q740 103 695 63.50Q650 24 586.50 1Q523-22 440-22ZM525 189Q596 189 649.50 217Q703 245 733 293Q763 341 763 400L763 521Q750 511 723 503Q696 495 663 489Q630 483 598 478Q566 473 541 470Q486 462 444 444Q402 426 379 396.50Q356 367 356 321Q356 278 378 248.50Q400 219 437.50 204Q475 189 525 189Z", aw: 1189, x1: 68, y1: -22, x2: 1061, y2: 1132 }, b: { d: "M754-19Q663-19 600 12Q537 43 497.50 88.50Q458 134 437 179L423 179L423 0L128 0L128 1490L428 1490L428 930L437 930Q458 974 496.50 1021Q535 1068 598 1100Q661 1132 756 1132Q880 1132 983 1068Q1086 1004 1147.50 876Q1209 748 1209 557Q1209 371 1149 242.50Q1089 114 986 47.50Q883-19 754-19ZM662 222Q740 222 793.50 265Q847 308 874.50 384Q902 460 902 558Q902 656 874.50 731Q847 806 794 849Q741 892 662 892Q585 892 531 850.50Q477 809 449 734.50Q421 660 421 558Q421 457 449.50 381.50Q478 306 532 264Q586 222 662 222Z", aw: 1291, x1: 128, y1: -19, x2: 1209, y2: 1490 }, c: { d: "M628-22Q459-22 336.50 50.50Q214 123 147.50 252.50Q81 382 81 554Q81 728 147.50 857.50Q214 987 336.50 1059.50Q459 1132 628 1132Q727 1132 811 1106Q895 1080 960 1032Q1025 984 1067 915Q1109 846 1125 760L846 708Q837 752 818 786.50Q799 821 772 845.50Q745 870 709.50 883Q674 896 631 896Q551 896 496.50 853Q442 810 414.50 733Q387 656 387 555Q387 455 414.50 378.50Q442 302 496.50 258Q551 214 631 214Q674 214 710 227.50Q746 241 774 266.50Q802 292 821 328Q840 364 848 409L1127 358Q1111 269 1069 199.50Q1027 130 962 80Q897 30 812.50 4Q728-22 628-22Z", aw: 1205, x1: 81, y1: -22, x2: 1127, y2: 1132 }, d: { d: "M537-19Q408-19 304.50 47.50Q201 114 141 242.50Q81 371 81 557Q81 748 143 876Q205 1004 308 1068Q411 1132 535 1132Q630 1132 693 1100Q756 1068 795 1021Q834 974 853 930L863 930L863 1490L1163 1490L1163 0L868 0L868 179L853 179Q833 134 793.50 88.50Q754 43 691 12Q628-19 537-19ZM629 222Q705 222 759 264Q813 306 841 381.50Q869 457 869 558Q869 660 841.50 734.50Q814 809 760 850.50Q706 892 629 892Q550 892 496.50 849Q443 806 416 731Q389 656 389 558Q389 460 416.50 384Q444 308 497.50 265Q551 222 629 222Z", aw: 1291, x1: 81, y1: -19, x2: 1163, y2: 1490 }, e: { d: "M633-22Q462-22 338 48Q214 118 147.50 247Q81 376 81 553Q81 726 147 856Q213 986 334 1059Q455 1132 618 1132Q728 1132 823 1097Q918 1062 990 991.50Q1062 921 1102.50 815Q1143 709 1143 565L1143 481L378 481Q381 396 411 336Q443 270 501.50 237Q560 204 638 204Q691 204 734 219Q777 234 807.50 263.50Q838 293 854 336L1126 285Q1099 193 1032 123.50Q965 54 864.50 16Q764-22 633-22ZM380 669L854 669Q848 725 830 771Q803 835 750.50 870.50Q698 906 620 906Q543 906 488.50 870Q434 834 406 773Q385 726 380 669Z", aw: 1220, x1: 81, y1: -22, x2: 1143, y2: 1132 }, f: { d: "M516 1118L750 1118L750 889L516 889L516 0L217 0L217 889L20 889L20 1118L217 1118L217 1204Q217 1323 264.50 1402Q312 1481 394 1520.50Q476 1560 580 1560Q651 1560 709.50 1548.50Q768 1537 795 1529L741 1303Q722 1308 696.50 1313Q671 1318 641 1318Q573 1318 544.50 1285.50Q516 1253 516 1194Z", aw: 815, x1: 20, y1: 0, x2: 795, y2: 1560 }, g: { d: "M624-442Q485-442 381-406.50Q277-371 212-309Q147-247 122-168L380-96Q394-127 423.50-156.50Q453-186 502-205Q551-224 623-224Q738-224 803.50-171.50Q869-119 869-8L869 198L846 198Q826 153 788 111Q750 69 688.50 42.50Q627 16 536 16Q410 16 307 75Q204 134 142.50 255Q81 376 81 561Q81 750 143.50 877Q206 1004 309.50 1068Q413 1132 537 1132Q631 1132 695 1100.50Q759 1069 798.50 1021.50Q838 974 858 930L871 930L871 1118L1166 1118L1166 9Q1166-142 1096.50-242.50Q1027-343 905-392.50Q783-442 624-442ZM630 244Q707 244 760.50 282Q814 320 842 391.50Q870 463 870 563Q870 662 842 736Q814 810 760.50 851Q707 892 630 892Q551 892 497.50 849.50Q444 807 416.50 733Q389 659 389 563Q389 465 416.50 393.50Q444 322 498 283Q552 244 630 244Z", aw: 1294, x1: 81, y1: -442, x2: 1166, y2: 1132 }, h: { d: "M428 647L428 0L128 0L128 1490L422 1490L422 903Q464 998 532 1056Q621 1132 763 1132Q879 1132 965.50 1081.50Q1052 1031 1099.50 936.50Q1147 842 1147 711L1147 0L847 0L847 659Q847 763 793.50 822Q740 881 645 881Q582 881 532.50 853.50Q483 826 455.50 774Q428 722 428 647Z", aw: 1275, x1: 128, y1: 0, x2: 1147, y2: 1490 }, i: { d: "M428 0L128 0L128 1118L428 1118ZM278 1264Q210 1264 162 1309Q114 1354 114 1418Q114 1482 162 1527Q210 1572 278 1572Q346 1572 394.50 1527.50Q443 1483 443 1418Q443 1354 394.50 1309Q346 1264 278 1264Z", aw: 555, x1: 114, y1: 0, x2: 443, y2: 1572 }, j: { d: "M127-53L127 1118L428 1118L428-57Q428-185 378-264.50Q328-344 234.50-381Q141-418 11-418L-50-418L-50-182L-10-182Q66-182 96.50-149.50Q127-117 127-53ZM278 1264Q210 1264 162 1309Q114 1354 114 1418Q114 1482 162 1527Q210 1572 278 1572Q346 1572 394.50 1527.50Q443 1483 443 1418Q443 1354 394.50 1309Q346 1264 278 1264Z", aw: 555, x1: -50, y1: -418, x2: 443, y2: 1572 }, k: { d: "M428 0L128 0L128 1490L428 1490L428 688L445 688L811 1118L1158 1118L740 632L1179 0L826 0L514 455L428 359Z", aw: 1188, x1: 128, y1: 0, x2: 1179, y2: 1490 }, l: { d: "M128 1490L428 1490L428 0L128 0Z", aw: 555, x1: 128, y1: 0, x2: 428, y2: 1490 }, m: { d: "M428 0L128 0L128 1118L406 1118L418 901Q441 963 476 1008Q526 1073 594 1104Q662 1135 737 1135Q858 1135 932 1059Q991 998 1025 885Q1049 951 1088 999Q1144 1068 1221.50 1101.50Q1299 1135 1384 1135Q1487 1135 1567.50 1090Q1648 1045 1694.50 960.50Q1741 876 1741 754L1741 0L1441 0L1441 697Q1441 792 1389.50 838Q1338 884 1263 884Q1207 884 1165.50 859.50Q1124 835 1101.50 791Q1079 747 1079 688L1079 0L789 0L789 705Q789 787 740.50 835.50Q692 884 615 884Q562 884 519.50 860Q477 836 452.50 789.50Q428 743 428 676Z", aw: 1869, x1: 128, y1: 0, x2: 1741, y2: 1135 }, n: { d: "M428 647L428 0L128 0L128 1118L411 1118L415 887Q458 993 532 1056Q621 1132 763 1132Q879 1132 965 1081.50Q1051 1031 1099 936.50Q1147 842 1147 711L1147 0L847 0L847 659Q847 763 793.50 822Q740 881 645 881Q582 881 532.50 853.50Q483 826 455.50 774Q428 722 428 647Z", aw: 1275, x1: 128, y1: 0, x2: 1147, y2: 1132 }, o: { d: "M628-22Q460-22 337 50.50Q214 123 147.50 252.50Q81 382 81 554Q81 728 147.50 857.50Q214 987 337 1059.50Q460 1132 628 1132Q797 1132 919.50 1059.50Q1042 987 1108.50 857.50Q1175 728 1175 554Q1175 382 1108.50 252.50Q1042 123 919.50 50.50Q797-22 628-22ZM628 214Q708 214 762 258.50Q816 303 843 380.50Q870 458 870 555Q870 654 843 731Q816 808 762 852Q708 896 628 896Q548 896 494.50 852Q441 808 414 731Q387 654 387 555Q387 458 414 380.50Q441 303 494.50 258.50Q548 214 628 214Z", aw: 1256, x1: 81, y1: -22, x2: 1175, y2: 1132 }, p: { d: "M428-418L128-418L128 1118L423 1118L423 930L437 930Q458 974 496.50 1021Q535 1068 598 1100Q661 1132 756 1132Q880 1132 983 1068Q1086 1004 1147.50 876Q1209 748 1209 557Q1209 371 1149 242.50Q1089 114 986 47.50Q883-19 754-19Q663-19 600 12Q537 43 497.50 88.50Q458 134 437 179L428 179ZM662 222Q740 222 793.50 265Q847 308 874.50 384Q902 460 902 558Q902 656 874.50 731Q847 806 794 849Q741 892 662 892Q585 892 531 850.50Q477 809 449 734.50Q421 660 421 558Q421 457 449.50 381.50Q478 306 532 264Q586 222 662 222Z", aw: 1291, x1: 128, y1: -418, x2: 1209, y2: 1132 }, q: { d: "M1163 1118L1163-418L863-418L863 179L853 179Q833 134 793.50 88.50Q754 43 691 12Q628-19 537-19Q408-19 304.50 47.50Q201 114 141 242.50Q81 371 81 557Q81 748 143 876Q205 1004 308 1068Q411 1132 535 1132Q630 1132 693 1100Q756 1068 795 1021Q834 974 853 930L868 930L868 1118ZM629 222Q705 222 759 264Q813 306 841 381.50Q869 457 869 558Q869 660 841.50 734.50Q814 809 760 850.50Q706 892 629 892Q550 892 496.50 849Q443 806 416 731Q389 656 389 558Q389 460 416.50 384Q444 308 497.50 265Q551 222 629 222Z", aw: 1291, x1: 81, y1: -418, x2: 1163, y2: 1132 }, r: { d: "M428 0L128 0L128 1118L418 1118L418 923L430 923Q461 1027 533.50 1080Q606 1133 700 1133Q723 1133 749.50 1130.50Q776 1128 797 1123L797 855Q777 862 739 866Q701 870 667 870Q599 870 544 840.50Q489 811 458.50 758.50Q428 706 428 636Z", aw: 834, x1: 128, y1: 0, x2: 797, y2: 1133 }, s: { d: "M572-22Q437-22 333 16.50Q229 55 163 128.50Q97 202 78 306L357 354Q379 276 434 237Q489 198 581 198Q666 198 716 230.50Q766 263 766 313Q766 357 730.50 385Q695 413 622 428L429 468Q267 501 187 580.50Q107 660 107 785Q107 893 166 970.50Q225 1048 330 1090Q435 1132 577 1132Q709 1132 806 1095.50Q903 1059 963 992Q1023 925 1043 834L777 787Q760 844 711.50 880.50Q663 917 581 917Q507 917 457 886Q407 855 407 804Q407 761 439.50 732Q472 703 551 687L752 647Q914 614 993 539.50Q1072 465 1072 345Q1072 235 1008 152.50Q944 70 831.50 24Q719-22 572-22Z", aw: 1147, x1: 78, y1: -22, x2: 1072, y2: 1132 }, t: { d: "M474 1118L683 1118L683 889L474 889L474 327Q474 274 497.50 248.50Q521 223 576 223Q593 223 624 227.50Q655 232 671 236L714 11Q664-4 614.50-10Q565-16 520-16Q352-16 263 66Q174 148 174 301L174 889L20 889L20 1118L174 1118L174 1384L474 1384Z", aw: 750, x1: 20, y1: -16, x2: 714, y2: 1384 }, u: { d: "M513-14Q397-14 310 36.50Q223 87 175.50 181.50Q128 276 128 407L128 1118L428 1118L428 459Q428 355 482 296Q536 237 630 237Q694 237 743 264.50Q792 292 819.50 344.50Q847 397 847 471L847 1118L1147 1118L1147 0L864 0L861 233Q818 125 743 62Q652-14 513-14Z", aw: 1275, x1: 128, y1: -14, x2: 1147, y2: 1118 }, v: { d: "M784 0L443 0L31 1118L350 1118L538 538Q572 429 598 318Q607 275 617 231Q627 275 637 318Q662 429 696 538L882 1118L1197 1118Z", aw: 1228, x1: 31, y1: 0, x2: 1197, y2: 1118 }, w: { d: "M666 0L361 0L31 1118L346 1118L443 705Q468 594 497 464Q517 375 534 275Q552 373 573 460Q604 591 631 705L733 1118L1009 1118L1108 705Q1134 592 1165 462Q1186 373 1205 274Q1222 373 1241 461Q1268 591 1294 705L1391 1118L1710 1118L1378 0L1073 0L949 431Q931 496 913 574.50Q895 653 878 735Q874 754 870 773Q866 754 862 735Q844 653 826 574Q808 495 790 431Z", aw: 1741, x1: 31, y1: 0, x2: 1710, y2: 1118 }, x: { d: "M360 0L42 0L402 574L64 1118L388 1118L489 941Q537 855 576 771Q586 747 597 723Q608 746 619 770Q657 855 707 941L812 1118L1130 1118L785 570L1146 0L824 0L700 211Q651 296 612 381Q601 404 590 427Q580 404 570 381Q532 296 484 211Z", aw: 1188, x1: 42, y1: 0, x2: 1146, y2: 1118 }, y: { d: "M120-396L189-170L226-179Q286-195 333-188Q380-181 408.50-150Q437-119 443-63L451-3L31 1118L350 1118L538 538Q572 428 594 318Q601 281 609 243Q618 281 627 319Q654 429 690 538L886 1118L1201 1118L726-132Q692-222 639-288Q586-354 507-390Q428-426 316-426Q256-426 204-417.50Q152-409 120-396Z", aw: 1233, x1: 31, y1: -426, x2: 1201, y2: 1118 }, z: { d: "M1053 0L120 0L120 182L671 868L671 876L137 876L137 1118L1034 1118L1034 919L514 250L514 242L1053 242Z", aw: 1173, x1: 120, y1: 0, x2: 1053, y2: 1118 }, ":": { d: "M342-19Q269-19 219 30.50Q169 80 169 153Q169 226 219 275Q269 324 342 324Q415 324 465 275Q515 226 515 153Q515 80 465 30.50Q415-19 342-19ZM342 723Q269 723 219 772.50Q169 822 169 895Q169 968 219 1017Q269 1066 342 1066Q415 1066 465 1017Q515 968 515 895Q515 822 465 772.50Q415 723 342 723Z", aw: 684, x1: 169, y1: -19, x2: 515, y2: 1066 }, "/": { d: "M508 1560L768 1560L288-224L28-224Z", aw: 795, x1: 28, y1: -224, x2: 768, y2: 1560 }, ".": { d: "M342-19Q269-19 219 30.50Q169 80 169 153Q169 226 219 275Q269 324 342 324Q415 324 465 275Q515 226 515 153Q515 80 465 30.50Q415-19 342-19Z", aw: 684, x1: 169, y1: -19, x2: 515, y2: 324 }, "-": { d: "M140 732L818 732L818 493L140 493Z", aw: 958, x1: 140, y1: 493, x2: 818, y2: 732 }, "(": { d: "M169 607Q169 773 202.50 952Q236 1131 294 1296Q352 1461 427 1581L706 1581Q634 1426 582 1257.50Q530 1089 502.50 923Q475 757 475 607Q475 476 498.50 343.50Q522 211 573 60Q624-91 706-279L427-279Q300-68 234.50 157.50Q169 383 169 607Z", aw: 772, x1: 169, y1: -279, x2: 706, y2: 1581 }, ")": { d: "M345-279L67-279Q150-89 200.50 62.50Q251 214 274 346Q297 478 297 607Q297 757 269.50 923Q242 1089 190.50 1257.50Q139 1426 67 1581L345 1581Q421 1461 479 1296Q537 1131 570 951.50Q603 772 603 607Q603 381 537 155.50Q471-70 345-279Z", aw: 772, x1: 67, y1: -279, x2: 603, y2: 1581 }, "'": { d: "M461 870L233 870L202 1490L491 1490Z", aw: 694, x1: 202, y1: 870, x2: 491, y2: 1490 }, " ": null, _meta: { unitsPerEm: 2048, ascender: 1984, descender: -494 } } }, playfair: { regular: { "0": { d: "M305 529Q376 529 430.50 496.50Q485 464 516 405Q547 346 547 266Q547 186 515 122.50Q483 59 426.50 22.50Q370-14 294-14Q225-14 170 18.50Q115 51 83.50 110.50Q52 170 52 250Q52 329 83.50 392Q115 455 172 492Q229 529 305 529ZM296 511Q232 511 190.50 443Q149 375 149 253Q149 163 170 108.50Q191 54 226.50 29Q262 4 303 4Q368 4 409 72.50Q450 141 450 263Q450 353 429 407.50Q408 462 373 486.50Q338 511 296 511Z", aw: 600, x1: 52, y1: -14, x2: 547, y2: 529 }, "1": { d: "M253 526L253 103Q253 55 275 38Q297 21 349 21L349 0Q329 1 290.50 2.50Q252 4 211 4Q165 4 122.50 2.50Q80 1 57 0L57 21Q107 21 135 37.50Q163 54 163 103L163 345Q163 393 153 416Q143 439 117.50 446Q92 453 47 453L47 475Q119 477 167 488Q215 499 253 526Z", aw: 370, x1: 47, y1: 0, x2: 349, y2: 526 }, "2": { d: "M244 529Q313 529 353.50 496.50Q394 464 394 403Q394 363 375.50 327.50Q357 292 327 259.50Q297 227 263 196.50Q229 166 197 136.50Q165 107 143 77L346 77Q387 77 398 88.50Q409 100 413 128L430 128Q430 75 431 46.50Q432 18 434-5Q425-3 401-2Q377-1 346-0.50Q315 0 285 0L51 0L51 17Q81 50 123 87.50Q165 125 204.50 169.50Q244 214 270.50 266.50Q297 319 297 381Q297 438 270.50 463.50Q244 489 197 489Q157 489 123 465.50Q89 442 63 395L47 404Q62 436 87.50 464.50Q113 493 151.50 511Q190 529 244 529Z", aw: 479, x1: 47, y1: -5, x2: 434, y2: 529 }, "3": { d: "M227 529Q269 529 301.50 515.50Q334 502 352.50 476.50Q371 451 371 415Q371 376 349.50 343.50Q328 311 294 287.50Q260 264 222 250Q269 249 311 232.50Q353 216 380 183Q407 150 407 98Q407 52 385.50 13.50Q364-25 326.50-55.50Q289-86 241-107.50Q193-129 140.50-140Q88-151 37-151L37-133Q88-132 137-116.50Q186-101 225.50-72Q265-43 288.50 0Q312 43 312 98Q312 157 283.50 195.50Q255 234 206 238Q191 232 179.50 227.50Q168 223 159 223Q151 223 147 226.50Q143 230 143 236Q143 245 151 250Q159 255 169 255Q177 255 185.50 253.50Q194 252 204 251Q245 282 263 319.50Q281 357 281 395Q281 442 257.50 463.50Q234 485 194 485Q153 485 118.50 463Q84 441 61 396L44 404Q59 437 83 465.50Q107 494 142.50 511.50Q178 529 227 529Z", aw: 451, x1: 37, y1: -151, x2: 407, y2: 529 }, "4": { d: "M17 75L342 529L358 529L358 121L370 121Q411 121 422 132.50Q433 144 437 172L454 172Q454 123 455 97Q456 71 458 49Q451 51 435.50 51.50Q420 52 399 53Q379 54 358 54L358-141L278-141L278 54L17 54ZM76 121L278 121L278 407Z", aw: 494, x1: 17, y1: -141, x2: 458, y2: 529 }, "5": { d: "M315 565L334 565Q334 508 335 476Q336 444 338 419Q330 421 307.50 422Q285 423 256 423.50Q227 424 199 424L93 424L81 231Q103 242 130 251.50Q157 261 198 261Q259 261 298 241Q337 221 356 186Q375 151 375 107Q375 49 346 2Q317-45 268.50-78.50Q220-112 162-130Q104-148 45-148L45-130Q89-130 131-115.50Q173-101 206.50-72.50Q240-44 260-2Q280 40 280 97Q280 160 247.50 195.50Q215 231 154 231Q128 231 110.50 226.50Q93 222 72 214L62 220L81 518Q92 516 106.50 515Q121 514 135 514L248 514Q289 514 300 525.50Q311 537 315 565Z", aw: 415, x1: 45, y1: -148, x2: 375, y2: 565 }, "6": { d: "M394 723L398 703Q365 692 330.50 675Q296 658 264 628Q232 598 207 551.50Q182 505 167 437Q159 401 155 358Q162 371 171 381Q199 412 234.50 425Q270 438 299 438Q346 438 387 412.50Q428 387 453.50 338.50Q479 290 479 220Q479 145 449 92.50Q419 40 369 13Q319-14 259-14Q164-14 109.50 60.50Q55 135 55 270Q55 361 77 431Q99 501 135.50 552.50Q172 604 216.50 639Q261 674 307.50 694.50Q354 715 394 723ZM153 323Q152 299 152 272Q152 167 170 109Q188 51 215 28.50Q242 6 269 6Q299 6 324.50 26.50Q350 47 366 93Q382 139 382 213Q382 285 367.50 328Q353 371 328.50 390Q304 409 274 409Q252 409 226 399Q200 389 178 366Q163 349 153 323Z", aw: 517, x1: 55, y1: -14, x2: 479, y2: 723 }, "7": { d: "M27 519Q36 517 60 516Q84 515 115 514.50Q146 514 176 514L398 514L398 493Q377 442 347.50 388Q318 334 289.50 272.50Q261 211 242.50 139.50Q224 68 225-18Q225-34 226-48Q227-62 228-74Q229-86 229-97Q229-119 216-133.50Q203-148 182-148Q159-148 148-131Q137-114 137-92Q137-24 154.50 39Q172 102 200 161.50Q228 221 261.50 277.50Q295 334 328 388Q340 409 352 430L115 430Q74 430 63 419Q52 408 48 379L31 379Q31 432 30 464Q29 496 27 519Z", aw: 406, x1: 27, y1: -148, x2: 398, y2: 519 }, "8": { d: "M268 722Q313 722 350.50 706.50Q388 691 410.50 660.50Q433 630 433 585Q433 524 393 477Q358 436 306 401Q311 397 316 394Q355 366 390 335.50Q425 305 447 266.50Q469 228 469 177Q469 120 441 77Q413 34 364.50 10Q316-14 253-14Q200-14 154 4.50Q108 23 80 60.50Q52 98 52 154Q52 206 75.50 247.50Q99 289 139 321Q172 347 212 367Q186 388 162 410Q128 441 106.50 479Q85 517 85 566Q85 613 109.50 648Q134 683 175.50 702.50Q217 722 268 722ZM227 355Q181 322 161 276Q140 226 140 169Q140 126 151.50 88.50Q163 51 189.50 27.50Q216 4 259 4Q309 4 346.50 37.50Q384 71 384 135Q384 184 362.50 221Q341 258 307 289.50Q273 321 235 350Q231 353 227 355ZM291 412Q311 431 324 452Q339 478 346 508.50Q353 539 353 572Q353 631 328.50 667.50Q304 704 257 704Q217 704 190 675.50Q163 647 163 597Q163 550 185 514.50Q207 479 242 450Q265 431 291 412Z", aw: 520, x1: 52, y1: -14, x2: 469, y2: 722 }, "9": { d: "M257 529Q352 529 406.50 460Q461 391 461 265Q461 183 439 119Q417 55 380.50 7.50Q344-40 299.50-72Q255-104 209-122.50Q163-141 122-148L118-128Q159-116 202.50-94Q246-72 282.50-30Q319 12 342 83Q351 113 357 150Q351 142 345 135Q317 103 282 90Q247 77 217 77Q171 77 129.50 102.50Q88 128 62.50 176.50Q37 225 37 295Q37 370 67 422.50Q97 475 147 502Q197 529 257 529ZM361 186Q364 222 364 263Q364 361 346 414Q328 467 301.50 488Q275 509 247 509Q218 509 192 488.50Q166 468 150 422.50Q134 377 134 302Q134 230 148.50 187Q163 144 188 125Q213 106 242 106Q264 106 290 116Q316 126 339 150Q352 164 361 186Z", aw: 509, x1: 37, y1: -148, x2: 461, y2: 529 }, A: { d: "M307 713L323 713L567 84Q582 46 601 33.50Q620 21 636 20L636 0Q616 2 587 2.50Q558 3 529 3Q490 3 456 2.50Q422 2 401 0L401 20Q452 22 466 37.50Q480 53 460 104L399 268L157 268L116 162Q100 122 97 94.50Q94 67 102.50 51Q111 35 131.50 28Q152 21 183 20L183 0Q155 2 124.50 2.50Q94 3 68 3Q43 3 25.50 2.50Q8 2-7 0L-7 20Q13 25 34 43.50Q55 62 72 107ZM165 288L391 288L279 587Z", aw: 630, x1: -7, y1: 0, x2: 636, y2: 713 }, B: { d: "M42 688L42 708Q63 707 97 706Q131 705 164 705Q211 705 254 706Q297 707 315 707Q420 707 473 663Q526 619 526 550Q526 515 511.50 481.50Q497 448 463.50 420.50Q430 393 374 376L374 374Q453 364 497.50 336.50Q542 309 560 272Q578 235 578 194Q578 137 549.50 93.50Q521 50 467 25Q413 0 338 0Q316 0 272 1.50Q228 3 166 3Q131 3 97 2.50Q63 2 42 0L42 20Q76 22 93.50 28Q111 34 117 52Q123 70 123 106L123 602Q123 639 117 656.50Q111 674 93.50 680.50Q76 687 42 688ZM300 359L216 359L216 106Q216 71 222 53Q228 35 244 29Q260 23 291 23Q389 23 433.50 68.50Q478 114 478 198Q478 275 436.50 317Q395 359 300 359ZM290 688Q244 688 230 671Q216 654 216 602L216 376L283 376Q342 376 374 398.50Q406 421 418 458.50Q430 496 430 539Q430 613 397.50 650.50Q365 688 290 688Z", aw: 623, x1: 42, y1: 0, x2: 578, y2: 708 }, C: { d: "M371 722Q437 722 479.50 702.50Q522 683 555 657Q575 642 585.50 653.50Q596 665 600 708L623 708Q621 671 620 618Q619 565 619 478L596 478Q589 521 583 546.50Q577 572 568.50 590Q560 608 546 626Q515 667 468 685.50Q421 704 369 704Q320 704 280.50 679.50Q241 655 212.50 609Q184 563 168.50 498Q153 433 153 352Q153 268 170 203.50Q187 139 217.50 95Q248 51 289.50 28.50Q331 6 379 6Q424 6 473 24Q522 42 550 82Q572 111 580.50 145Q589 179 596 240L619 240Q619 149 620 93.50Q621 38 623 0L600 0Q596 43 586.50 54Q577 65 555 51Q518 25 476.50 5.50Q435-14 370-14Q275-14 203.50 29Q132 72 92.50 153Q53 234 53 348Q53 460 94 544Q135 628 206.50 675Q278 722 371 722Z", aw: 688, x1: 53, y1: -14, x2: 623, y2: 722 }, D: { d: "M315 708Q494 708 581 618.50Q668 529 668 362Q668 253 625.50 171.50Q583 90 502 45Q421 0 306 0Q291 0 266 1Q241 2 214.50 2.50Q188 3 166 3Q131 3 97 2.50Q63 2 42 0L42 20Q76 22 93.50 28Q111 34 117 52Q123 70 123 106L123 602Q123 639 117 656.50Q111 674 93.50 680.50Q76 687 42 688L42 708Q63 707 97 705.50Q131 704 164 705Q199 706 243 707Q287 708 315 708ZM290 690Q244 690 230 673Q216 656 216 604L216 104Q216 52 230.50 35Q245 18 291 18Q400 18 460 57.50Q520 97 544 173Q568 249 568 358Q568 470 541.50 543.50Q515 617 454.50 653.50Q394 690 290 690Z", aw: 723, x1: 42, y1: 0, x2: 668, y2: 708 }, E: { d: "M541 708Q537 673 535.50 640Q534 607 534 590Q534 572 535 555.50Q536 539 537 528L514 528Q508 587 497 621.50Q486 656 459.50 670.50Q433 685 380 685L297 685Q263 685 245.50 679.50Q228 674 222 656.50Q216 639 216 602L216 366L282 366Q315 366 332.50 379.50Q350 393 358 414Q366 435 369 457.50Q372 480 375 498L398 498Q394 441 394.50 411Q395 381 395 356Q395 331 396 301Q397 271 401 214L378 214Q374 246 368.50 276.50Q363 307 344.50 326.50Q326 346 282 346L216 346L216 106Q216 70 222 52Q228 34 245.50 28.50Q263 23 297 23L370 23Q433 23 465.50 40Q498 57 512.50 95.50Q527 134 534 200L557 200Q554 173 554 128Q554 109 555.50 73.50Q557 38 561 0Q510 2 446 2.50Q382 3 332 3L276 3Q241 3 201 2.50Q161 2 120 1.50Q79 1 42 0L42 20Q76 22 93.50 28Q111 34 117 52Q123 70 123 106L123 602Q123 639 117 656.50Q111 674 93.50 680.50Q76 687 42 688L42 708Q79 707 120 706.50Q161 706 201 705.50Q241 705 276 705L332 705Q378 705 436.50 705.50Q495 706 541 708Z", aw: 609, x1: 42, y1: 0, x2: 561, y2: 708 }, F: { d: "M541 708Q537 670 535.50 634.50Q534 599 534 580Q534 556 535 535Q536 514 537 498L514 498Q507 568 495 608.50Q483 649 453 667Q423 685 360 685L297 685Q263 685 245.50 679.50Q228 674 222 656.50Q216 639 216 602L216 356L289 356Q322 356 339.50 369.50Q357 383 365 404Q373 425 376 447.50Q379 470 382 488L405 488Q401 431 401.50 401Q402 371 402 346Q402 321 403 291Q404 261 408 204L385 204Q381 236 375.50 266.50Q370 297 351.50 316.50Q333 336 289 336L216 336L216 106Q216 70 223.50 52Q231 34 253 28Q275 22 317 20L317 0Q291 2 251 2.50Q211 3 170 3Q131 3 97 2.50Q63 2 42 0L42 20Q76 22 93.50 28Q111 34 117 52Q123 70 123 106L123 602Q123 639 117 656.50Q111 674 93.50 680.50Q76 687 42 688L42 708Q79 707 120 706.50Q161 706 201 705.50Q241 705 276 705L332 705Q378 705 436.50 705.50Q495 706 541 708Z", aw: 569, x1: 42, y1: 0, x2: 541, y2: 708 }, G: { d: "M376 722Q441 722 481 702.50Q521 683 556 657Q569 647 576 647Q595 647 601 708L624 708Q622 671 621 618Q620 565 620 478L597 478Q590 520 580 559Q570 598 547 626Q518 663 471 683.50Q424 704 374 704Q324 704 283.50 679.50Q243 655 214 609Q185 563 169.50 498.50Q154 434 154 353Q154 173 212 89.50Q270 6 392 6Q428 6 454.50 16.50Q481 27 496 37Q515 50 520 61.50Q525 73 525 92L525 188Q525 229 517 249Q509 269 487.50 276Q466 283 424 284L424 304Q442 303 466 302.50Q490 302 516.50 301.50Q543 301 565 301Q598 301 624.50 302Q651 303 669 304L669 284Q647 283 636 277Q625 271 621.50 253Q618 235 618 198L618 0L598 0Q597 17 590.50 37Q584 57 571 57Q565 57 559 54Q553 51 538 40Q505 15 468 0.50Q431-14 382-14Q279-14 205.50 28.50Q132 71 93 151Q54 231 54 342Q54 459 96 544Q138 629 210.50 675.50Q283 722 376 722Z", aw: 703, x1: 54, y1: -14, x2: 669, y2: 722 }, H: { d: "M460 0L460 20Q494 22 511.50 28Q529 34 535 52Q541 70 541 106L541 346L216 346L216 106Q216 70 222 52Q228 34 245.50 28Q263 22 297 20L297 0Q274 2 239.50 2.50Q205 3 170 3Q131 3 97 2.50Q63 2 42 0L42 20Q76 22 93.50 28Q111 34 117 52Q123 70 123 106L123 602Q123 639 117 656.50Q111 674 93.50 680.50Q76 687 42 688L42 708Q63 707 97 706Q131 705 170 705Q205 705 239.50 706Q274 707 297 708L297 688Q263 687 245.50 680.50Q228 674 222 656.50Q216 639 216 602L216 366L541 366L541 602Q541 639 535 656.50Q529 674 511.50 680.50Q494 687 460 688L460 708Q483 707 518 706Q553 705 587 705Q626 705 660 706Q694 707 715 708L715 688Q681 687 663.50 680.50Q646 674 640 656.50Q634 639 634 602L634 106Q634 70 640 52Q646 34 663.50 28Q681 22 715 20L715 0Q694 2 660 2.50Q626 3 587 3Q553 3 518 2.50Q483 2 460 0Z", aw: 757, x1: 42, y1: 0, x2: 715, y2: 708 }, I: { d: "M297 708L297 688Q263 687 245.50 680.50Q228 674 222 656.50Q216 639 216 602L216 106Q216 70 222 52Q228 34 245.50 28Q263 22 297 20L297 0Q274 2 239.50 2.50Q205 3 170 3Q131 3 97 2.50Q63 2 42 0L42 20Q76 22 93.50 28Q111 34 117 52Q123 70 123 106L123 602Q123 639 117 656.50Q111 674 93.50 680.50Q76 687 42 688L42 708Q63 707 97 706Q131 705 170 705Q205 705 239.50 706Q274 707 297 708Z", aw: 339, x1: 42, y1: 0, x2: 297, y2: 708 }, J: { d: "M-20-188L-20-169Q25-168 55.50-147Q86-126 101.50-77.50Q117-29 117 52L117 602Q117 639 111 656.50Q105 674 87.50 680.50Q70 687 36 688L36 708Q57 707 91 706Q125 705 162 705Q199 705 233.50 706Q268 707 291 708L291 688Q257 687 239.50 680.50Q222 674 216 656.50Q210 639 210 602L210 236Q210 195 209 147Q208 99 204.50 54Q201 9 193-25Q176-95 121.50-141.50Q67-188-20-188Z", aw: 326, x1: -20, y1: -188, x2: 291, y2: 708 }, K: { d: "M615 708L615 688Q584 684 555 668Q526 652 497 615L334 406L566 81Q583 56 603 42Q623 28 654 20L654 0Q630 2 594.50 2.50Q559 3 534 3Q517 3 492.50 2.50Q468 2 431 0L431 20Q465 22 474 32Q483 42 467 65L321 285Q301 316 285.50 331.50Q270 347 254 352Q238 357 216 358L216 106Q216 70 222 52Q228 34 245.50 28Q263 22 297 20L297 0Q274 2 239.50 2.50Q205 3 170 3Q131 3 97 2.50Q63 2 42 0L42 20Q76 22 93.50 28Q111 34 117 52Q123 70 123 106L123 602Q123 639 117 656.50Q111 674 93.50 680.50Q76 687 42 688L42 708Q63 707 97 706Q131 705 170 705Q205 705 239.50 706Q274 707 297 708L297 688Q263 687 245.50 680.50Q228 674 222 656.50Q216 639 216 602L216 378Q255 380 283 395Q311 410 330 434L426 556Q459 598 471 627Q483 656 470 671.50Q457 687 415 688L415 708Q434 707 454 706.50Q474 706 493.50 705.50Q513 705 530 705Q556 705 578 706Q600 707 615 708Z", aw: 655, x1: 42, y1: 0, x2: 654, y2: 708 }, L: { d: "M297 708L297 688Q263 687 245.50 680.50Q228 674 222 656.50Q216 639 216 602L216 106Q216 70 222 52Q228 34 245.50 28.50Q263 23 297 23L370 23Q417 23 446.50 33Q476 43 493.50 64.50Q511 86 520 122Q529 158 534 210L557 210Q554 179 554 128Q554 109 555.50 73.50Q557 38 561 0Q510 2 446 2.50Q382 3 332 3L276 3Q241 3 201 2.50Q161 2 120 1.50Q79 1 42 0L42 20Q76 22 93.50 28Q111 34 117 52Q123 70 123 106L123 602Q123 639 117 656.50Q111 674 93.50 680.50Q76 687 42 688L42 708Q63 707 97 706Q131 705 170 705Q205 705 239.50 706Q274 707 297 708Z", aw: 588, x1: 42, y1: 0, x2: 561, y2: 708 }, M: { d: "M829 708L829 688Q795 687 777.50 680.50Q760 674 754 656.50Q748 639 748 602L748 106Q748 70 754 52Q760 34 777.50 28Q795 22 829 20L829 0Q806 2 771.50 2.50Q737 3 702 3Q663 3 629 2.50Q595 2 574 0L574 20Q608 22 625.50 28Q643 34 649 52Q655 70 655 106L655 642L414-5L398-5L146 644L146 116Q146 80 152.50 59.50Q159 39 178.50 30.50Q198 22 237 20L237 0Q219 2 190 2.50Q161 3 135 3Q110 3 84.50 2.50Q59 2 42 0L42 20Q76 22 93.50 30.50Q111 39 117 59.50Q123 80 123 116L123 602Q123 639 117 656.50Q111 674 93.50 680.50Q76 687 42 688L42 708Q59 707 84.50 706Q110 705 135 705Q157 705 180.50 706Q204 707 220 708L440 129L655 705L702 705Q737 705 771.50 706Q806 707 829 708Z", aw: 871, x1: 42, y1: -5, x2: 829, y2: 708 }, N: { d: "M670 708L670 688Q636 687 618.50 678Q601 669 595 649Q589 629 589 592L589-5L566-5L146 644L146 116Q146 80 152.50 59.50Q159 39 178.50 30.50Q198 22 237 20L237 0Q219 2 190 2.50Q161 3 135 3Q110 3 84.50 2.50Q59 2 42 0L42 20Q76 22 93.50 30.50Q111 39 117 59.50Q123 80 123 116L123 602Q123 639 117 656.50Q111 674 93.50 680.50Q76 687 42 688L42 708Q59 707 84.50 706Q110 705 135 705Q157 705 177 706Q197 707 213 708L566 164L566 592Q566 629 559.50 649Q553 669 533.50 678Q514 687 475 688L475 708Q493 707 522.50 706Q552 705 577 705Q603 705 628.50 706Q654 707 670 708Z", aw: 706, x1: 42, y1: -5, x2: 670, y2: 708 }, O: { d: "M371 722Q466 722 537.50 679Q609 636 648.50 555.50Q688 475 688 360Q688 248 647.50 164Q607 80 535 33Q463-14 370-14Q275-14 203.50 29Q132 72 92.50 153Q53 234 53 348Q53 460 94 544Q135 628 206.50 675Q278 722 371 722ZM367 704Q302 704 254 659Q206 614 179.50 535Q153 456 153 352Q153 246 182.50 167.50Q212 89 262.50 46.50Q313 4 374 4Q439 4 487 49Q535 94 561.50 173.50Q588 253 588 356Q588 463 558.50 541Q529 619 479 661.50Q429 704 367 704Z", aw: 741, x1: 53, y1: -14, x2: 688, y2: 722 }, P: { d: "M42 688L42 708Q63 707 97 706Q131 705 164 705Q211 705 254 706Q297 707 315 707Q436 707 496 652Q556 597 556 510Q556 474 544 434.50Q532 395 502.50 361.50Q473 328 422 307Q371 286 293 286L216 286L216 106Q216 70 223.50 52Q231 34 253 28Q275 22 317 20L317 0Q291 2 251 2.50Q211 3 170 3Q131 3 97 2.50Q63 2 42 0L42 20Q76 22 93.50 28Q111 34 117 52Q123 70 123 106L123 602Q123 639 117 656.50Q111 674 93.50 680.50Q76 687 42 688ZM216 602L216 306L283 306Q354 306 391.50 333Q429 360 442.50 404Q456 448 456 499Q456 594 418.50 641Q381 688 290 688Q244 688 230 671Q216 654 216 602Z", aw: 585, x1: 42, y1: 0, x2: 556, y2: 708 }, Q: { d: "M748-23L763-29Q751-70 735.50-97.50Q720-125 700-143Q681-160 648.50-174Q616-188 565-188Q512-188 462.50-170.50Q413-153 360-128Q307-103 243-82Q236-80 230-78Q224-76 219-75Q200-82 178-86Q156-90 136-90Q116-90 103-85Q90-80 90-70Q90-49 144-49Q179-49 219-57Q255-47 281-34Q306-23 332-12Q260-5 204 29Q132 72 92.50 153Q53 234 53 348Q53 460 94 544Q135 628 206.50 675Q278 722 371 722Q466 722 537.50 679Q609 636 648.50 555.50Q688 475 688 360Q688 248 647.50 164Q607 80 535 33Q476-6 402-13Q372-16 350-24.50Q328-33 306-43Q284-53 254-62Q304-72 363-83Q422-94 477-102Q532-110 571-110Q643-110 684.50-89Q726-68 748-23ZM367 704Q302 704 254 659Q206 614 179.50 535Q153 456 153 352Q153 246 182.50 167.50Q212 89 262.50 46.50Q313 4 374 4Q439 4 487 49Q535 94 561.50 173.50Q588 253 588 356Q588 463 558.50 541Q529 619 479 661.50Q429 704 367 704Z", aw: 741, x1: 53, y1: -188, x2: 763, y2: 722 }, R: { d: "M42 688L42 708Q63 707 97 706Q131 705 164 705Q211 705 254 706Q297 707 315 707Q396 707 449.50 684Q503 661 529.50 621.50Q556 582 556 533Q556 503 544 469Q532 435 502.50 405Q473 375 422 356Q396 346 363 341Q369 340 374 339Q441 328 470.50 298.50Q500 269 514 207L539 105Q549 61 559.50 41.50Q570 22 592 23Q609 24 620.50 34Q632 44 645 61L660 50Q639 19 616.50 2.50Q594-14 553-14Q516-14 488 8Q460 30 446 94L424 194Q415 237 403.50 268.50Q392 300 371.50 318Q351 336 311 336L216 336L216 106Q216 70 222 52Q228 34 245.50 28Q263 22 297 20L297 0Q274 2 239.50 2.50Q205 3 170 3Q131 3 97 2.50Q63 2 42 0L42 20Q76 22 93.50 28Q111 34 117 52Q123 70 123 106L123 602Q123 639 117 656.50Q111 674 93.50 680.50Q76 687 42 688ZM216 602L216 356L283 356Q354 356 391.50 378.50Q429 401 442.50 438.50Q456 476 456 522Q456 601 418.50 644.50Q381 688 290 688Q244 688 230 671Q216 654 216 602Z", aw: 648, x1: 42, y1: -14, x2: 660, y2: 708 }, S: { d: "M256 719Q306 719 332 707.50Q358 696 378 682Q390 675 397.50 671.50Q405 668 412 668Q422 668 426.50 679Q431 690 434 712L457 712Q456 695 454.50 671.50Q453 648 452.50 609.50Q452 571 452 508L429 508Q426 556 408 600Q390 644 355.50 672Q321 700 265 700Q212 700 177.50 668Q143 636 143 584Q143 539 166 508.50Q189 478 227.50 453.50Q266 429 311 401Q363 369 403.50 337.50Q444 306 467.50 268Q491 230 491 176Q491 112 462 70Q433 28 385 7Q337-14 279-14Q226-14 195-2Q164 10 142 23Q120 37 108 37Q98 37 93.50 26Q89 15 86-7L63-7Q65 14 65.50 42.50Q66 71 66.50 117Q67 163 67 233L90 233Q94 173 112.50 121Q131 69 169.50 37.50Q208 6 272 6Q305 6 334.50 19.50Q364 33 383 62.50Q402 92 402 139Q402 180 382.50 210.50Q363 241 328 267.50Q293 294 246 322Q199 351 158 381Q117 411 92.50 450.50Q68 490 68 546Q68 605 94.50 643.50Q121 682 164 700.50Q207 719 256 719Z", aw: 540, x1: 63, y1: -14, x2: 491, y2: 719 }, T: { d: "M592 708Q588 670 586.50 634.50Q585 599 585 580Q585 556 586 535Q587 514 588 498L565 498Q558 568 546 608.50Q534 649 504 667Q474 685 411 685L357 685L357 116Q357 76 364.50 56Q372 36 394 29Q416 22 458 20L458 0Q432 2 392 2.50Q352 3 311 3Q266 3 226.50 2.50Q187 2 163 0L163 20Q205 22 227 29Q249 36 256.50 56Q264 76 264 116L264 685L210 685Q148 685 117.50 667Q87 649 75 608.50Q63 568 56 498L33 498Q35 514 35.50 535Q36 556 36 580Q36 599 34.50 634.50Q33 670 29 708Q71 707 120.50 706Q170 705 220 705L402 705Q451 705 501 706Q551 707 592 708Z", aw: 621, x1: 29, y1: 0, x2: 592, y2: 708 }, U: { d: "M655 708L655 688Q621 687 603.50 678Q586 669 580 649Q574 629 574 592L574 291Q574 221 565 169Q556 117 533 79Q508 37 460 11.50Q412-14 350-14Q302-14 258.50-2.50Q215 9 182 40Q153 68 136.50 99Q120 130 114 175Q108 220 108 288L108 602Q108 639 102 656.50Q96 674 78.50 680.50Q61 687 27 688L27 708Q48 707 82 706Q116 705 155 705Q190 705 224.50 706Q259 707 282 708L282 688Q248 687 230.50 680.50Q213 674 207 656.50Q201 639 201 602L201 271Q201 220 206 174.50Q211 129 226.50 94.50Q242 60 274 40.50Q306 21 359 21Q435 21 476.50 54.50Q518 88 534.50 147Q551 206 551 280L551 592Q551 629 542.50 649Q534 669 514 678Q494 687 460 688L460 708Q478 707 507.50 706Q537 705 562 705Q588 705 613.50 706Q639 707 655 708Z", aw: 682, x1: 27, y1: -14, x2: 655, y2: 708 }, V: { d: "M637 708L637 688Q618 684 596.50 665Q575 646 558 601L323-5L307-5L63 624Q48 662 29 674.50Q10 687-6 688L-6 708Q14 707 43.50 706Q73 705 101 705Q140 705 174 706Q208 707 229 708L229 688Q195 687 177.50 680Q160 673 158.50 655.50Q157 638 170 604L351 123L514 546Q535 600 534 630.50Q533 661 511 674Q489 687 447 688L447 708Q476 707 506 706Q536 705 562 705Q588 705 605 706Q622 707 637 708Z", aw: 630, x1: -6, y1: -5, x2: 637, y2: 708 }, W: { d: "M907 708L907 688Q888 684 865 665.50Q842 647 828 601L639-5L623-5L449 510L290-5L274-5L62 624Q49 663 29 675Q9 687-7 688L-7 708Q13 707 42.50 706Q72 705 100 705Q133 705 161.50 706Q190 707 208 708L208 688Q182 686 170.50 678Q159 670 159.50 652.50Q160 635 170 604L316 158L438 545L411 624Q398 663 382 675Q366 687 352 688L352 708Q370 707 397 706Q424 705 449 705Q488 705 522 706Q556 707 577 708L577 688Q547 687 529.50 682Q512 677 509.50 660Q507 643 519 604L663 159L786 546Q804 601 802.50 631.50Q801 662 780 674.50Q759 687 717 688L717 708Q746 707 776 706Q806 705 832 705Q858 705 875 706Q892 707 907 708Z", aw: 905, x1: -7, y1: -5, x2: 907, y2: 708 }, X: { d: "M244 708L244 687Q194 687 183 676.50Q172 666 186 643L342 405L440 552Q476 606 482 635Q488 664 468 675.50Q448 687 406 688L406 708Q425 707 445 706.50Q465 706 484.50 705.50Q504 705 521 705Q547 705 569 706Q591 707 606 708L606 688Q575 684 548 660.50Q521 637 493 596L353 387L560 71Q579 42 592 32.50Q605 23 627 21L627 0Q614 1 590.50 2.50Q567 4 541 4Q501 4 460.50 2.50Q420 1 400 0L400 21Q450 21 464 27Q468 29 470 32Q474 39 464 55L293 317L185 156Q149 102 147.50 73Q146 44 170 32.50Q194 21 236 20L236 0Q222 1 204 1.50Q186 2 167.50 2.50Q149 3 132 3L101 3Q76 3 53.50 2.50Q31 2 16 0L16 20Q47 25 74 48Q101 71 129 112L280 337L84 637Q65 666 52.50 676Q40 686 17 687L17 708Q30 707 54 705.50Q78 704 103 704Q144 704 180 705.50Q216 707 244 708Z", aw: 634, x1: 16, y1: 0, x2: 627, y2: 708 }, Y: { d: "M588 708L588 688Q569 684 550 663.50Q531 643 508 599L351 288L351 106Q351 70 357 52Q363 34 380.50 28Q398 22 432 20L432 0Q409 2 374.50 2.50Q340 3 305 3Q266 3 232 2.50Q198 2 177 0L177 20Q211 22 228.50 28Q246 34 252 52Q258 70 258 106L258 256L55 631Q35 668 21.50 677.50Q8 687-3 687L-3 708Q17 707 38.50 706Q60 705 85 705Q118 705 155.50 705.50Q193 706 225 708L225 687Q200 687 181 681Q162 675 156 659Q150 643 165 614L331 295L459 549Q487 604 486.50 634Q486 664 463 675.50Q440 687 398 688L398 708Q427 707 457 706Q487 705 513 705Q539 705 556 706Q573 707 588 708Z", aw: 591, x1: -3, y1: 0, x2: 588, y2: 708 }, Z: { d: "M550 708L550 688L151 23L347 23Q394 23 423.50 33Q453 43 470.50 64.50Q488 86 497 122Q506 158 511 210L534 210Q531 179 531 128Q531 109 532.50 73.50Q534 38 538 0Q501 2 457 2.50Q413 3 370 3L289 3Q230 3 164.50 2.50Q99 2 42 0L42 20L444 685L249 685Q202 685 172.50 675Q143 665 125.50 643.50Q108 622 99 586Q90 550 85 498L62 498Q64 514 64.50 535Q65 556 65 580Q65 599 63.50 634.50Q62 670 58 708Q95 707 139 706Q183 705 227 705L307 705Q364 705 429.50 705.50Q495 706 550 708Z", aw: 594, x1: 42, y1: 0, x2: 550, y2: 708 }, a: { d: "M171-7Q130-7 100 8.50Q70 24 54.50 52Q39 80 39 117Q39 161 59.50 189Q80 217 112 234Q144 251 179.50 262.50Q215 274 247 284.50Q279 295 299.50 309Q320 323 320 346L320 408Q320 450 307.50 472Q295 494 274 501.50Q253 509 227 509Q202 509 173.50 502Q145 495 128 473Q147 469 161 453Q175 437 175 412Q175 387 159 372.50Q143 358 118 358Q89 358 75.50 376.50Q62 395 62 418Q62 444 75 460Q88 476 108 490Q131 506 167.50 517.50Q204 529 250 529Q291 529 320 519.50Q349 510 368 492Q394 468 402 433.50Q410 399 410 351L410 73Q410 48 417.50 37Q425 26 441 26Q452 26 462 31Q472 36 486 47L497 30Q476 14 457 3.50Q438-7 406-7Q377-7 358 3Q339 13 329.50 32.50Q320 52 320 82Q293 37 255.50 15Q218-7 171-7ZM207 33Q240 33 268.50 52Q297 71 320 109L320 305Q308 288 285 276.50Q262 265 235 253.50Q208 242 183.50 226.50Q159 211 143 186Q127 161 127 121Q127 81 148.50 57Q170 33 207 33Z", aw: 498, x1: 39, y1: -7, x2: 497, y2: 529 }, b: { d: "M326 529Q408 529 462 461.50Q516 394 516 257Q516 167 485.50 106.50Q455 46 404 16Q353-14 293-14Q243-14 197 15Q176 27 161 44Q152 37 144 30Q130 18 117 7Q104-4 90-16L73-9Q77 5 78.50 19.50Q80 34 80 49L80 663Q80 708 64 729.50Q48 751 4 751L4 772Q36 769 66 769Q95 769 121.50 772.50Q148 776 170 783L170 422Q185 457 211 482Q259 529 326 529ZM170 376L170 58Q187 40 209 29Q246 9 285 9Q352 9 385.50 69.50Q419 130 419 257Q419 338 406 392Q393 446 366 472.50Q339 499 297 499Q251 499 212 458Q183 427 170 376Z", aw: 563, x1: 4, y1: -16, x2: 516, y2: 783 }, c: { d: "M279 529Q311 529 341 521Q371 513 395 497Q418 482 430 462.50Q442 443 442 420Q442 393 427 378.50Q412 364 389 364Q367 364 350.50 377Q334 390 334 414Q334 437 346.50 451Q359 465 376 469Q366 487 340.50 499Q315 511 286 511Q261 511 236 499Q211 487 190 459.50Q169 432 156 384.50Q143 337 143 266Q143 178 163 126Q183 74 215.50 51.50Q248 29 287 29Q313 29 340 39Q367 49 391 71.50Q415 94 432 132L451 125Q441 93 418 60.50Q395 28 358 7Q321-14 267-14Q205-14 155 18Q105 50 75.50 109.50Q46 169 46 251Q46 333 75.50 395.50Q105 458 158 493.50Q211 529 279 529Z", aw: 486, x1: 46, y1: -14, x2: 451, y2: 529 }, d: { d: "M484 784L484 109Q484 64 500.50 42.50Q517 21 560 21L560 0Q529 3 498 3Q469 3 442.50 0Q416-3 394-11L394 77Q382 48 362 27Q321-14 252-14Q190-14 143.50 16Q97 46 72.50 106Q48 166 48 257Q48 348 79.50 408.50Q111 469 162.50 499Q214 529 274 529Q318 529 357 508Q380 495 394 471L394 664Q394 709 378 730.50Q362 752 318 752L318 773Q350 770 380 770Q409 770 435.50 773.50Q462 777 484 784ZM394 131L394 429Q380 469 352 487Q322 506 282 506Q223 506 183.50 445Q144 384 145 257Q145 176 160.50 122.50Q176 69 206.50 42.50Q237 16 281 16Q323 16 357 52Q384 81 394 131Z", aw: 581, x1: 48, y1: -14, x2: 560, y2: 784 }, e: { d: "M272 529Q360 529 409.50 475.50Q459 422 459 309L146 309Q145 296 144 281Q143 263 143 245Q143 177 165 128Q187 79 222.50 53.50Q258 28 296 28Q326 28 353 37.50Q380 47 403 69Q426 91 443 128L463 120Q452 87 427 56Q402 25 364 5.50Q326-14 276-14Q204-14 152.50 19Q101 52 73.50 110.50Q46 169 46 245Q46 333 74 396.50Q102 460 153 494.50Q204 529 272 529ZM145 328L363 328Q365 377 355 418.50Q345 460 323.50 485Q302 510 268 510Q222 510 187 464Q153 420 145 328Z", aw: 506, x1: 46, y1: -14, x2: 463, y2: 529 }, f: { d: "M276 782Q304 782 325.50 774.50Q347 767 363 755Q378 743 386 727Q394 711 394 693Q394 670 379 655Q364 640 341 640Q319 640 302.50 654.50Q286 669 286 694Q286 715 297.50 728Q309 741 328 745Q325 754 312.50 760.50Q300 767 279 767Q256 767 239.50 757Q223 747 214 730Q202 709 199 667.50Q196 626 196 540L196 514L303 514L303 494L196 494L196 103Q196 54 224.50 37.50Q253 21 302 21L302 0Q279 1 237 2.50Q195 4 148 4Q114 4 80.50 2.50Q47 1 30 0L30 21Q71 21 88.50 36Q106 51 106 93L106 494L26 494L26 514L106 514Q106 573 111 613Q116 653 127 681.50Q138 710 157 732Q177 755 208 768.50Q239 782 276 782Z", aw: 332, x1: 26, y1: 0, x2: 394, y2: 782 }, g: { d: "M213-188Q160-188 113-177Q66-166 37.50-142.50Q9-119 9-83Q9-48 37-23Q65 2 113 15L119-1Q97-8 84-29Q71-50 71-76Q71-122 113.50-146.50Q156-171 224-171Q269-171 312-159.50Q355-148 383-121Q411-94 411-50Q411-17 387.50 4.50Q364 26 295 26L221 26Q189 26 159 31Q129 36 110 52Q91 68 91 101Q91 135 119 167Q140 190 188 215Q156 218 129 230Q89 246 66 281Q43 316 43 371Q43 426 66 461Q89 496 129 512.50Q169 529 218 529Q268 529 308 513Q337 500 357 477Q371 497 392 513Q426 539 463 539Q489 539 505 524.50Q521 510 521 481Q521 450 504.50 437.50Q488 425 471 425Q456 425 443 435.50Q430 446 428 469Q426 489 438 518Q409 505 395 492Q382 479 370 460Q393 426 393 371Q393 316 370 281Q347 246 307.50 229.50Q268 213 218 213Q218 213 218 213Q194 199 175 186Q150 167 150 142Q150 110 198 110L323 110Q365 110 400.50 98Q436 86 458 60Q480 34 480-8Q480-55 450-96Q420-137 360.50-162.50Q301-188 213-188ZM218 231Q256 231 277.50 261Q299 291 299 371Q299 451 277.50 481Q256 511 218 511Q181 511 159 481Q137 451 137 371Q137 291 159 261Q181 231 218 231Z", aw: 528, x1: 9, y1: -188, x2: 521, y2: 539 }, h: { d: "M186 783L186 409Q212 477 258.50 503Q305 529 356 529Q394 529 419.50 519Q445 509 462 491Q481 471 489 441Q497 411 497 360L497 93Q497 51 514.50 36Q532 21 573 21L573 0Q556 1 521 2.50Q486 4 453 4Q420 4 388.50 2.50Q357 1 341 0L341 21Q377 21 392 36Q407 51 407 93L407 382Q407 413 402 439Q397 465 379.50 481Q362 497 326 497Q285 497 253.50 474Q222 451 204 410Q186 369 186 316L186 93Q186 51 201 36Q216 21 252 21L252 0Q236 1 204.50 2.50Q173 4 140 4Q107 4 72 2.50Q37 1 20 0L20 21Q61 21 78.50 36Q96 51 96 93L96 663Q96 708 80 729.50Q64 751 20 751L20 772Q52 769 82 769Q111 769 137.50 772.50Q164 776 186 783Z", aw: 588, x1: 20, y1: 0, x2: 573, y2: 783 }, i: { d: "M143 765Q169 765 188 746Q207 727 207 701Q207 675 188 656Q169 637 143 637Q117 637 98 656Q79 675 79 701Q79 727 98 746Q117 765 143 765ZM195 526L195 93Q195 51 212.50 36Q230 21 271 21L271 0Q254 1 219.50 2.50Q185 4 150 4Q116 4 81 2.50Q46 1 29 0L29 21Q70 21 87.50 36Q105 51 105 93L105 406Q105 451 89 472.50Q73 494 29 494L29 515Q61 512 91 512Q120 512 146.50 515.50Q173 519 195 526Z", aw: 293, x1: 29, y1: 0, x2: 271, y2: 765 }, j: { d: "M-26-188L-26-173Q36-170 67-119.50Q98-69 98 19L98 406Q98 451 82 472.50Q66 494 22 494L22 515Q54 512 84 512Q113 512 139.50 515.50Q166 519 188 526L188 115Q188 65 181 20Q174-25 158-62Q142-99 116-127Q91-154 54.50-171Q18-188-26-188ZM134 765Q160 765 179 746Q198 727 198 701Q198 675 179 656Q160 637 134 637Q108 637 89 656Q70 675 70 701Q70 727 89 746Q108 765 134 765Z", aw: 267, x1: -26, y1: -188, x2: 198, y2: 765 }, k: { d: "M186 784L186 288Q215 292 234 301Q254 310 272 329L346 406Q378 439 378 458.50Q378 478 357.50 486.50Q337 495 304 495L304 515Q330 514 362.50 512.50Q395 511 417 511Q434 511 450 511.50Q466 512 480 513Q494 514 504 515L504 495Q479 493 457 481.50Q435 470 414 448L292 320L473 73Q490 50 505.50 37Q521 24 543 21L543 0Q532 1 508.50 2.50Q485 4 462 4Q431 4 399 2.50Q367 1 351 0L351 21Q371 21 379 31Q387 41 376 55L261 223Q242 250 227 258Q212 265 186 267L186 93Q186 51 201 36Q216 21 252 21L252 0Q236 1 204.50 2.50Q173 4 141 4Q107 4 72 2.50Q37 1 20 0L20 21Q61 21 78.50 36Q96 51 96 93L96 664Q96 709 80 730.50Q64 752 20 752L20 773Q52 770 82 770Q111 770 137.50 773.50Q164 777 186 784Z", aw: 550, x1: 20, y1: 0, x2: 543, y2: 784 }, l: { d: "M188 784L188 93Q188 51 205.50 36Q223 21 264 21L264 0Q247 1 212.50 2.50Q178 4 143 4Q109 4 74 2.50Q39 1 22 0L22 21Q63 21 80.50 36Q98 51 98 93L98 664Q98 709 82 730.50Q66 752 22 752L22 773Q54 770 84 770Q113 770 139.50 773.50Q166 777 188 784Z", aw: 286, x1: 22, y1: 0, x2: 264, y2: 784 }, m: { d: "M359 529Q394 529 420 519Q446 509 463 491Q482 471 489 439Q492 426 494 410Q520 478 566 504Q612 529 660 529Q695 529 721 519Q747 509 764 491Q783 471 790 439Q797 407 797 360L797 93Q797 51 814.50 36Q832 21 873 21L873 0Q856 1 821 2.50Q786 4 753 4Q720 4 688.50 2.50Q657 1 641 0L641 21Q677 21 692 36Q707 51 707 93L707 382Q707 413 703 439Q699 465 683 481Q667 497 631 497Q592 497 561.50 473Q531 449 513.50 408Q496 367 496 316L496 93Q496 51 513.50 36Q531 21 572 21L572 0Q555 1 520 2.50Q485 4 452 4Q419 4 387.50 2.50Q356 1 340 0L340 21Q376 21 391 36Q406 51 406 93L406 382Q406 413 402 439Q398 465 382 481Q366 497 330 497Q291 497 260.50 473Q230 449 212.50 407.50Q195 366 195 315L195 93Q195 51 210 36Q225 21 261 21L261 0Q245 1 213.50 2.50Q182 4 149 4Q116 4 81 2.50Q46 1 29 0L29 21Q70 21 87.50 36Q105 51 105 93L105 406Q105 451 89 472.50Q73 494 29 494L29 515Q61 512 91 512Q120 512 146.50 515.50Q173 519 195 526L195 408Q221 473 266 501Q311 529 359 529Z", aw: 888, x1: 29, y1: 0, x2: 873, y2: 529 }, n: { d: "M365 529Q403 529 428.50 519Q454 509 471 491Q490 471 498 441Q506 411 506 360L506 93Q506 51 523.50 36Q541 21 582 21L582 0Q565 1 530 2.50Q495 4 462 4Q429 4 397.50 2.50Q366 1 350 0L350 21Q386 21 401 36Q416 51 416 93L416 382Q416 413 411 439Q406 465 388.50 481Q371 497 335 497Q293 497 261.50 473Q230 449 212.50 407.50Q195 366 195 315L195 93Q195 51 210 36Q225 21 261 21L261 0Q245 1 213.50 2.50Q182 4 149 4Q116 4 81 2.50Q46 1 29 0L29 21Q70 21 87.50 36Q105 51 105 93L105 406Q105 451 89 472.50Q73 494 29 494L29 515Q61 512 91 512Q120 512 146.50 515.50Q173 519 195 526L195 408Q221 476 267.50 502.50Q314 529 365 529Z", aw: 597, x1: 29, y1: 0, x2: 582, y2: 529 }, o: { d: "M274 529Q338 529 389 501Q440 473 470.50 413Q501 353 501 257Q501 161 470.50 101.50Q440 42 389 14Q338-14 274-14Q211-14 159.50 14Q108 42 77.50 101.50Q47 161 47 257Q47 353 77.50 413Q108 473 159.50 501Q211 529 274 529ZM274 509Q217 509 180.50 450Q144 391 144 257Q144 123 180.50 64.50Q217 6 274 6Q331 6 367.50 64.50Q404 123 404 257Q404 391 367.50 450Q331 509 274 509Z", aw: 548, x1: 47, y1: -14, x2: 501, y2: 529 }, p: { d: "M188 526L188 422Q203 457 230 482Q279 529 348 529Q401 529 443 500.50Q485 472 509.50 417Q534 362 534 281Q534 227 521 174.50Q508 122 480.50 79.50Q453 37 409.50 11.50Q366-14 305-14Q258-14 224 8Q201 22 188 41L188-88Q188-131 213.50-145.50Q239-160 284-160L284-181Q262-180 223-178.50Q184-177 140-177Q109-177 78.50-178.50Q48-180 32-181L32-160Q68-160 83-147Q98-134 98-98L98 406Q98 451 82 472.50Q66 494 22 494L22 515Q54 512 84 512Q113 512 139.50 515.50Q166 519 188 526ZM188 373L188 73Q202 46 228 28Q254 9 294 9Q350 9 381 44Q412 79 424.50 137.50Q437 196 437 267Q437 347 424 398Q411 449 385 474Q359 499 321 499Q272 499 232 459Q202 428 188 373Z", aw: 581, x1: 22, y1: -181, x2: 534, y2: 529 }, q: { d: "M261 529Q323 529 361 503Q385 486 402 456Q411 465 420 475Q433 489 446.50 503Q460 517 473 531L490 524Q486 511 484.50 496Q483 481 483 466L483-98Q483-134 498-147Q513-160 549-160L549-181Q533-180 503-178.50Q473-177 441-177Q398-177 358.50-178.50Q319-180 297-181L297-160Q342-160 367.50-145.50Q393-131 393-88L393 82Q381 53 361 33Q316-14 253-14Q196-14 149 15.50Q102 45 74.50 105.50Q47 166 47 257Q47 348 75.50 408.50Q104 469 152.50 499Q201 529 261 529ZM393 130L393 440Q375 470 347 487Q313 506 269 506Q210 506 177 445Q144 384 144 257Q144 177 160 123Q176 69 207 42.50Q238 16 282 16Q324 16 359 57Q383 85 393 130Z", aw: 563, x1: 47, y1: -181, x2: 549, y2: 531 }, r: { d: "M340 529Q367 529 387.50 518Q408 507 419.50 489.50Q431 472 431 450Q431 425 415.50 406Q400 387 374 387Q353 387 337 400.50Q321 414 321 439Q321 458 331.50 471.50Q342 485 355 493Q348 503 334 503Q303 503 277 484.50Q251 466 233 437Q215 408 205 375.50Q195 343 195 315L195 103Q195 54 223.50 37.50Q252 21 301 21L301 0Q278 1 236 2.50Q194 4 147 4Q113 4 79.50 2.50Q46 1 29 0L29 21Q70 21 87.50 36Q105 51 105 93L105 406Q105 451 89 472.50Q73 494 29 494L29 515Q61 512 91 512Q120 512 146.50 515.50Q173 519 195 526L195 401Q206 430 226.50 459.50Q247 489 276 509Q305 529 340 529Z", aw: 445, x1: 29, y1: 0, x2: 431, y2: 529 }, s: { d: "M208 529Q248 529 276 516Q304 503 317 492Q329 482 338 484Q353 489 357 528L380 528Q378 500 377 461.50Q376 423 376 358L353 358Q347 395 332.50 430Q318 465 290 487.50Q262 510 217 510Q182 510 158.50 490.50Q135 471 135 433Q135 403 153 381.50Q171 360 200 341.50Q229 323 263 301Q301 277 332 252Q363 227 381.50 197Q400 167 400 126Q400 80 376 49Q352 18 313.50 2Q275-14 229-14Q207-14 187.50-10.50Q168-7 150 0Q140 5 129.50 12Q119 19 109 27Q99 35 91 26.50Q83 18 79-7L56-7Q58 25 59 71Q60 117 60 193L83 193Q90 137 103 95Q116 53 144 29.50Q172 6 222 6Q242 6 262.50 15Q283 24 297 45Q311 66 311 101Q311 145 279 173Q247 201 198 232Q162 255 130.50 278Q99 301 79.50 330Q60 359 60 400Q60 445 80.50 473.50Q101 502 135 515.50Q169 529 208 529Z", aw: 447, x1: 56, y1: -14, x2: 400, y2: 529 }, t: { d: "M190 681L190 514L338 514L338 494L190 494L190 107Q190 60 207 41Q224 22 254 22Q284 22 306 46.50Q328 71 344 129L364 124Q354 66 324.50 26Q295-14 234-14Q200-14 178-5.50Q156 3 139 19Q117 42 108.50 74Q100 106 100 159L100 494L4 494L4 514L100 514L100 667Q125 668 148 671Q171 674 190 681Z", aw: 354, x1: 4, y1: -14, x2: 364, y2: 681 }, u: { d: "M483 526L483 108Q483 63 499.50 41.50Q516 20 559 20L559-1Q528 2 497 2Q468 2 441.50-1Q415-4 393-12L393 106Q368 41 322.50 13.50Q277-14 229-14Q194-14 168-4Q142 6 125 24Q106 44 99 76Q92 108 92 155L92 406Q92 451 76 472.50Q60 494 16 494L16 515Q48 512 78 512Q107 512 133.50 515.50Q160 519 182 526L182 133Q182 102 186 76Q190 50 206 34Q222 18 258 18Q297 18 327.50 42Q358 66 375.50 107Q393 148 393 199L393 406Q393 451 377 472.50Q361 494 317 494L317 515Q349 512 379 512Q408 512 434.50 515.50Q461 519 483 526Z", aw: 581, x1: 16, y1: -14, x2: 559, y2: 526 }, v: { d: "M486 515L486 495Q467 493 451 478Q435 463 421 425L257-5L240-5L56 438Q40 477 24.50 485.50Q9 494-2 494L-2 515Q18 514 39.50 512.50Q61 511 86 511Q117 511 151.50 512Q186 513 216 515L216 494Q191 494 171.50 490.50Q152 487 146.50 471Q141 455 156 416L279 112L389 401Q402 434 399.50 453.50Q397 473 379.50 483Q362 493 326 495L326 515Q344 514 357 513.50Q370 513 382.50 512.50Q395 512 410 512Q433 512 451.50 513Q470 514 486 515Z", aw: 489, x1: -2, y1: -5, x2: 486, y2: 515 }, w: { d: "M218 515L218 494Q193 494 174 490.50Q155 487 149 470Q143 453 158 410L258 122L402 519L425 519L578 115L672 401Q683 435 680.50 454.50Q678 474 660.50 483.50Q643 493 607 495L607 515Q625 514 638 513.50Q651 513 663.50 512.50Q676 512 691 512Q714 512 732.50 513Q751 514 767 515L767 495Q748 493 731.50 478.50Q715 464 702 425L557-5L540-5L382 397L239-5L222-5L58 438Q42 478 26.50 486Q11 494 0 494L0 515Q20 512 41.50 510.50Q63 509 88 509Q119 509 153.50 511Q188 513 218 515Z", aw: 770, x1: 0, y1: -5, x2: 767, y2: 519 }, x: { d: "M212 515L212 494Q193 494 180 485Q167 476 177 460L284 304L353 401Q375 432 381 452Q387 472 374.50 482.50Q362 493 326 495L326 515Q352 514 369.50 513Q387 512 410 512Q433 512 451.50 513Q470 514 486 515L486 495Q467 493 444.50 475.50Q422 458 398 425L297 285L444 71Q461 46 474 35.50Q487 25 506 21L506 0Q496 1 475.50 2.50Q455 4 435 4Q404 4 368.50 2.50Q333 1 317 0L317 21Q337 21 350 31Q356 35 357 40Q358 46 352 55L238 221L165 126Q139 92 137.50 69Q136 46 156 34.50Q176 23 211 20L211 0Q194 1 173 1.50Q152 2 132.50 2.50Q113 3 97 3Q74 3 55.50 2.50Q37 2 21 0L21 20Q40 22 60.50 37.50Q81 53 109 90L224 241L85 444Q65 473 53 482.50Q41 492 23 494L23 515Q33 514 54 512.50Q75 511 94 511Q126 511 161 512.50Q196 514 212 515Z", aw: 519, x1: 21, y1: 0, x2: 506, y2: 515 }, y: { d: "M494 515L494 495Q475 493 459 478Q443 463 429 425L265-5L231-92Q221-117 210.50-134Q200-151 188-162Q172-177 150-182.50Q128-188 110-188Q91-188 75.50-181Q60-174 51-160.50Q42-147 42-128Q42-104 56-89.50Q70-75 95-75Q116-75 131-87Q146-99 146-122Q146-139 138-150Q130-161 119-167Q121-168 123-168L125-168Q152-168 173-149.50Q194-131 210-90L245 1L64 438Q45 477 26.50 485.50Q8 494-4 494L-4 515Q18 512 42 510.50Q66 509 94 509Q125 509 159.50 511Q194 513 224 515L224 494Q199 494 179.50 490.50Q160 487 155 469.50Q150 452 167 410L287 112L398 401Q411 434 408.50 453.50Q406 473 388 483Q370 493 334 495L334 515Q352 514 365 513.50Q378 513 390.50 512.50Q403 512 418 512Q441 512 459.50 513Q478 514 494 515Z", aw: 504, x1: -4, y1: -188, x2: 494, y2: 515 }, z: { d: "M439 520L150 15L260 15Q300 15 329.50 31Q359 47 377 82.50Q395 118 399 176L422 176Q422 112 423 68Q424 24 426-4Q382-2 334.50-1Q287 0 240 0Q190 0 138-1.50Q86-3 38-5L327 500L217 500Q173 500 143.50 484Q114 468 98.50 432.50Q83 397 78 339L55 339Q55 404 54 447.50Q53 491 51 519Q95 517 142.50 516Q190 515 237 515Q287 515 339 516.50Q391 518 439 520Z", aw: 476, x1: 38, y1: -5, x2: 439, y2: 520 }, ":": { d: "M133 528Q159 528 178 509Q197 490 197 464Q197 438 178 419Q159 400 133 400Q107 400 88 419Q69 438 69 464Q69 490 88 509Q107 528 133 528ZM133 114Q159 114 178 95Q197 76 197 50Q197 24 178 5Q159-14 133-14Q107-14 88 5Q69 24 69 50Q69 76 88 95Q107 114 133 114Z", aw: 266, x1: 69, y1: -14, x2: 197, y2: 528 }, "/": { d: "M306 722L339 722L67-14L34-14Z", aw: 372, x1: 34, y1: -14, x2: 339, y2: 722 }, ".": { d: "M126 114Q152 114 171 95Q190 76 190 50Q190 24 171 5Q152-14 126-14Q100-14 81 5Q62 24 62 50Q62 76 81 95Q100 114 126 114Z", aw: 252, x1: 62, y1: -14, x2: 190, y2: 114 }, "-": { d: "M69 298L430 298L430 240L69 240Z", aw: 499, x1: 69, y1: 240, x2: 430, y2: 298 }, "(": { d: "M264 806L278 793Q194 695 161 578.50Q128 462 128 312Q128 162 161 45.50Q194-71 278-169L264-182Q163-90 103.50 33.50Q44 157 44 312Q44 467 103.50 590.50Q163 714 264 806Z", aw: 294, x1: 44, y1: -182, x2: 278, y2: 806 }, ")": { d: "M16 793L30 806Q131 714 190.50 590.50Q250 467 250 312Q250 157 190.50 33.50Q131-90 30-182L16-169Q100-71 133 45.50Q166 162 166 312Q166 462 133 578.50Q100 695 16 793Z", aw: 294, x1: 16, y1: -182, x2: 250, y2: 806 }, "'": { d: "M95 730Q110 730 120.50 718Q131 706 131 684Q131 651 127 622.50Q123 594 116.50 558.50Q110 523 102 468L88 468Q81 520 74 555.50Q67 591 63 620.50Q59 650 59 683Q59 705 69.50 717Q80 729 95 730Z", aw: 189, x1: 59, y1: 468, x2: 131, y2: 730 }, " ": null, _meta: { unitsPerEm: 1e3, ascender: 1082, descender: -251 } }, bold: { "0": { d: "M328 531Q408 531 469 498.50Q530 466 565 406.50Q600 347 600 267Q600 187 564.50 123.50Q529 60 465.50 23Q402-14 317-14Q239-14 177.50 19Q116 52 80.50 111.50Q45 171 45 251Q45 330 80 393.50Q115 457 179 494Q243 531 328 531ZM319 513Q265 513 230.50 444.50Q196 376 196 254Q196 164 214 109Q232 54 261.50 29Q291 4 326 4Q380 4 414.50 73Q449 142 449 264Q449 354 431 409Q413 464 383.50 488.50Q354 513 319 513Z", aw: 645, x1: 45, y1: -14, x2: 600, y2: 531 }, "1": { d: "M282 528L282 97Q282 53 298.50 37Q315 21 354 21L354 0Q334 1 295.50 2.50Q257 4 216 4Q165 4 117.50 2.50Q70 1 44 0L44 21Q89 21 113.50 37.50Q138 54 138 103L138 347Q138 395 130 418Q122 441 100 448Q78 455 40 455L40 477Q126 479 182.50 490Q239 501 282 528Z", aw: 383, x1: 40, y1: 0, x2: 354, y2: 528 }, "2": { d: "M275 531Q352 531 397 498Q442 465 442 404Q442 365 422.50 333Q403 301 371 272.50Q339 244 302.50 219Q266 194 232 169.50Q198 145 174 119L390 119Q431 119 442 129Q453 139 457 164L478 164Q478 97 479 60Q480 23 482-5Q473-3 449-2Q425-1 394-0.50Q363 0 333 0L42 0L42 19Q70 49 111 85Q152 121 191.50 165Q231 209 258 260.50Q285 312 285 371Q285 425 261 449Q237 473 192 473Q149 473 116.50 453.50Q84 434 58 396L41 406Q61 440 91.50 468.50Q122 497 167 514Q212 531 275 531Z", aw: 523, x1: 41, y1: -5, x2: 482, y2: 531 }, "3": { d: "M246 531Q295 531 334 517.50Q373 504 395 478.50Q417 453 417 416Q417 378 392.50 345Q368 312 322.50 287.50Q277 263 214 251Q282 254 336 237Q390 220 421.50 185.50Q453 151 453 99Q453 53 428.50 14Q404-25 361-55.50Q318-86 263.50-107.50Q209-129 149-140Q89-151 29-151L29-131Q76-130 124.50-114.50Q173-99 213.50-70.50Q254-42 279 0.50Q304 43 304 98Q304 157 276 195Q248 233 199 237Q184 230 172 225.50Q160 221 148 221Q139 221 134 224Q129 227 129 235Q129 247 139 252Q149 257 161 257Q169 257 177.50 255.50Q186 254 196 253Q239 283 256 317.50Q273 352 273 387Q273 432 249.50 453.50Q226 475 184 475Q145 475 111 455.50Q77 436 54 397L36 406Q54 439 81 467.50Q108 496 148 513.50Q188 531 246 531Z", aw: 488, x1: 29, y1: -151, x2: 453, y2: 531 }, "4": { d: "M8 57L381 531L397 531L397 139L405 139Q446 139 457 149Q468 159 472 184L493 184Q493 124 494 90.50Q495 57 497 31Q490 33 471 33.50Q452 34 426 35Q412 36 397 36L397-141L281-141L281 36L8 36ZM100 139L281 139L281 372Z", aw: 528, x1: 8, y1: -141, x2: 497, y2: 531 }, "5": { d: "M364 555L385 555Q385 489 386 452.50Q387 416 389 387Q381 389 358.50 390Q336 391 307 391.50Q278 392 250 392L96 392L80 221Q104 238 141.50 249.50Q179 261 231 261Q298 261 341 240Q384 219 405 183Q426 147 426 103Q426 45 391.50-1Q357-47 299-80Q241-113 171-130.50Q101-148 30-148L30-130Q76-130 120.50-115Q165-100 200-71Q235-42 256 0Q277 42 277 97Q277 159 248 193Q219 227 162 227Q133 227 112.50 219.50Q92 212 72 198L58 207L90 520Q101 518 115.50 517Q130 516 144 516L309 516Q338 516 349.50 525Q361 534 364 555Z", aw: 459, x1: 30, y1: -148, x2: 426, y2: 555 }, "6": { d: "M446 723L450 703Q414 691 378 674Q342 657 309.50 627Q277 597 252 550.50Q227 504 213 434Q207 407 203 375Q208 381 213 388Q236 416 269 428Q302 440 335 440Q389 440 433 414Q477 388 504 340Q531 292 531 224Q531 147 497 94Q463 41 406 13.50Q349-14 282-14Q172-14 109.50 60.50Q47 135 47 271Q47 361 73 431Q99 501 142 552.50Q185 604 237.50 639Q290 674 344.50 694.50Q399 715 446 723ZM200 336Q198 303 198 265Q198 166 212.50 109.50Q227 53 249 29.50Q271 6 292 6Q315 6 335 27Q355 48 367.50 94Q380 140 380 215Q380 287 368.50 330Q357 373 338 392Q319 411 295 411Q278 411 257 401Q236 391 218 369Q207 356 200 336Z", aw: 561, x1: 47, y1: -14, x2: 531, y2: 723 }, "7": { d: "M23 521Q32 519 56 518Q80 517 111 516.50Q142 516 172 516L454 516L454 495Q435 450 405.50 398.50Q376 347 346.50 286.50Q317 226 297.50 156.50Q278 87 278 6Q278 0 279.50-16Q281-32 282-48.50Q283-65 283-75Q283-103 265-125.50Q247-148 210-148Q173-148 155-123Q137-98 137-60Q137-5 157 49Q177 103 209 155.50Q241 208 278 258Q315 308 351 354Q367 375 381 395L115 395Q74 395 63 385Q52 375 48 350L27 350Q27 416 26 454.50Q25 493 23 521Z", aw: 455, x1: 23, y1: -148, x2: 454, y2: 521 }, "8": { d: "M288 722Q345 722 389.50 704.50Q434 687 459 656Q484 625 484 582Q484 528 445 489Q408 452 346 420Q355 412 364 405Q404 372 439.50 337Q475 302 497.50 262.50Q520 223 520 175Q520 119 488 77Q456 35 401 10.50Q346-14 275-14Q213-14 160 5Q107 24 75 62.50Q43 101 43 157Q43 205 66 242.50Q89 280 129 308Q163 333 205 351Q179 374 155 398Q120 431 98 470.50Q76 510 76 559Q76 614 105.50 650Q135 686 183.50 704Q232 722 288 722ZM221 338Q191 306 180 265Q167 221 167 175Q167 129 177.50 90Q188 51 213 27.50Q238 4 280 4Q328 4 354.50 34Q381 64 381 112Q381 158 359 195.50Q337 233 302.50 266.50Q268 300 229 332Q225 335 221 338ZM352 473Q361 498 364.50 525Q368 552 368 574Q368 635 344.50 669.50Q321 704 280 704Q246 704 227 681Q208 658 208 621Q208 578 230.50 541Q253 504 289 471Q309 452 331 433Q344 451 352 473Z", aw: 561, x1: 43, y1: -14, x2: 520, y2: 722 }, "9": { d: "M278 531Q387 531 450 459Q513 387 513 255Q513 175 487.50 111.50Q462 48 419.50 1.50Q377-45 325.50-76.50Q274-108 220.50-126.50Q167-145 120-152L116-132Q160-119 203.50-97Q247-75 282.50-33.50Q318 8 340 79Q348 106 353 138Q351 134 348 130Q324 102 291 89.50Q258 77 225 77Q172 77 127.50 103Q83 129 56 177.50Q29 226 29 294Q29 371 63.50 424Q98 477 154.50 504Q211 531 278 531ZM358 178Q362 216 362 260Q362 357 347.50 411.50Q333 466 311.50 488.50Q290 511 267 511Q245 511 225 490.50Q205 470 192.50 424Q180 378 180 302Q180 231 191.50 187.50Q203 144 222.50 125Q242 106 265 106Q282 106 303 116Q324 126 342 149Q352 161 358 178Z", aw: 553, x1: 29, y1: -152, x2: 513, y2: 531 }, A: { d: "M368 710L611 84Q625 48 642.50 34.50Q660 21 674 20L674 0Q644 2 603.50 2.50Q563 3 522 3Q476 3 435 2.50Q394 2 370 0L370 20Q421 22 434.50 37.50Q448 53 428 104L368 268L150 268L124 199Q102 144 97.50 109Q93 74 102.50 55Q112 36 133.50 28.50Q155 21 185 20L185 0Q152 2 122 2.50Q92 3 61 3Q39 3 19.50 2.50Q0 2-15 0L-15 20Q6 24 28 47Q50 70 71 125L299 710Q315 709 333.50 709Q352 709 368 710ZM158 288L361 288L262 558Z", aw: 667, x1: -15, y1: 0, x2: 674, y2: 710 }, B: { d: "M34 688L34 708Q60 707 102 706Q144 705 186 705Q234 705 279 706Q324 707 343 707Q467 707 528.50 663Q590 619 590 550Q590 515 569 479Q548 443 504 415Q460 387 390 374L390 372Q484 365 539 338Q594 311 618 273Q642 235 642 194Q642 131 609 88Q576 45 514 22.50Q452 0 366 0Q342 0 297 1.50Q252 3 188 3Q144 3 102 2.50Q60 2 34 0L34 20Q66 22 82 28Q98 34 103.50 52Q109 70 109 106L109 602Q109 639 103.50 656.50Q98 674 81.50 680.50Q65 687 34 688ZM310 359L268 359L268 106Q268 71 273.50 53Q279 35 293.50 29Q308 23 337 23Q409 23 442.50 68.50Q476 114 476 198Q476 275 437.50 317Q399 359 310 359ZM330 688Q291 688 279.50 671Q268 654 268 602L268 376L311 376Q358 376 383 398.50Q408 421 418 458.50Q428 496 428 539Q428 613 405 650.50Q382 688 330 688Z", aw: 672, x1: 34, y1: 0, x2: 642, y2: 708 }, C: { d: "M397 722Q463 722 505.50 702.50Q548 683 581 657Q601 642 611.50 653.50Q622 665 626 708L649 708Q647 669 646 613.50Q645 558 645 466L622 466Q617 512 609 544.50Q601 577 587 602Q573 627 547 647Q522 672 489 684Q456 696 420 696Q366 696 328 667.50Q290 639 266.50 590Q243 541 232 479.50Q221 418 221 352Q221 285 232.50 223.50Q244 162 268.50 114Q293 66 332 38Q371 10 424 10Q457 10 490.50 22.50Q524 35 548 59Q587 89 601 133.50Q615 178 622 252L645 252Q645 157 646 98.50Q647 40 649 0L626 0Q622 43 612.50 54Q603 65 581 51Q544 25 502.50 5.50Q461-14 396-14Q290-14 210.50 29Q131 72 87 153Q43 234 43 348Q43 460 88.50 544Q134 628 213.50 675Q293 722 397 722Z", aw: 705, x1: 43, y1: -14, x2: 649, y2: 722 }, D: { d: "M343 708Q540 708 636 618.50Q732 529 732 362Q732 253 685 171.50Q638 90 548.50 45Q459 0 334 0Q318 0 292 1Q266 2 238 2.50Q210 3 188 3Q144 3 101.50 2.50Q59 2 34 0L34 20Q66 22 82 28Q98 34 103.50 52Q109 70 109 106L109 602Q109 639 103.50 656.50Q98 674 81.50 680.50Q65 687 34 688L34 708Q59 707 101.50 705.50Q144 704 186 705Q222 706 267.50 707Q313 708 343 708ZM342 690Q296 690 282 673Q268 656 268 604L268 104Q268 52 282.50 35Q297 18 343 18Q427 18 475.50 57.50Q524 97 545 173Q566 249 566 358Q566 470 543.50 543.50Q521 617 472 653.50Q423 690 342 690Z", aw: 776, x1: 34, y1: 0, x2: 732, y2: 708 }, E: { d: "M569 708Q565 664 563.50 623Q562 582 562 560Q562 540 563 522Q564 504 565 492L542 492Q532 565 511 607.50Q490 650 456.50 667.50Q423 685 378 685L337 685Q308 685 293 680Q278 675 273 660Q268 645 268 614L268 366L300 366Q330 366 351 378.50Q372 391 385.50 411.50Q399 432 407 455Q415 478 419 498L442 498Q438 441 438.50 411Q439 381 439 356Q439 331 440 301Q441 271 445 214L422 214Q417 249 403.50 279Q390 309 365 327.50Q340 346 300 346L268 346L268 94Q268 63 273 48Q278 33 293 28Q308 23 337 23L386 23Q431 23 465.50 42.50Q500 62 524.50 109Q549 156 562 236L585 236Q582 204 582 152Q582 129 583 87Q584 45 589 0Q538 2 474 2.50Q410 3 360 3L296 3Q257 3 212 2.50Q167 2 121 1.50Q75 1 34 0L34 20Q66 22 82 28Q98 34 103.50 52Q109 70 109 106L109 602Q109 639 103.50 656.50Q98 674 81.50 680.50Q65 687 34 688L34 708Q75 707 121 706.50Q167 706 212 705.50Q257 705 296 705L360 705Q406 705 464.50 705.50Q523 706 569 708Z", aw: 634, x1: 34, y1: 0, x2: 589, y2: 708 }, F: { d: "M569 708Q565 663 563.50 621Q562 579 562 556Q562 534 563 514Q564 494 565 480L542 480Q529 558 506 602.50Q483 647 449.50 666Q416 685 370 685L337 685Q308 685 293 680Q278 675 273 660Q268 645 268 614L268 362L303 362Q333 362 353.50 374.50Q374 387 388 407.50Q402 428 410 451Q418 474 422 494L445 494Q441 437 441.50 407Q442 377 442 352Q442 327 443 297Q444 267 448 210L425 210Q419 245 406 275Q393 305 368 323.50Q343 342 303 342L268 342L268 112Q268 73 276 54Q284 35 307 29Q330 23 375 22L375 0Q344 1 295 2Q246 3 192 3Q149 3 108 2Q67 1 34 0L34 20Q66 22 82 28Q98 34 103.50 52Q109 70 109 106L109 602Q109 639 103.50 656.50Q98 674 81.50 680.50Q65 687 34 688L34 708Q75 707 121 706.50Q167 706 212 705.50Q257 705 296 705L360 705Q406 705 464.50 705.50Q523 706 569 708Z", aw: 592, x1: 34, y1: 0, x2: 569, y2: 708 }, G: { d: "M405 722Q473 722 516 703Q559 684 593 657Q605 648 613 648Q632 648 638 708L661 708Q659 669 658 613.50Q657 558 657 466L634 466Q627 526 612.50 570.50Q598 615 559 647Q535 670 499.50 683Q464 696 428 696Q373 696 334 667.50Q295 639 270 590Q245 541 233 479.50Q221 418 221 352Q221 172 270.50 89Q320 6 413 6Q437 6 455 12Q473 18 484 26Q498 36 503 47.50Q508 59 508 78L508 176Q508 222 500.50 244.50Q493 267 471 275Q449 283 407 284L407 304Q428 303 457.50 302.50Q487 302 519 301.50Q551 301 578 301Q620 301 655 302Q690 303 712 304L712 284Q693 283 683.50 277Q674 271 670.50 253Q667 235 667 198L667 0L647 0Q646 17 639.50 37Q633 57 618 57Q611 57 599.50 53.50Q588 50 564 36Q527 15 486 0.50Q445-14 400-14Q284-14 204 29Q124 72 83.50 152.50Q43 233 43 346Q43 460 89.50 544Q136 628 217.50 675Q299 722 405 722Z", aw: 735, x1: 43, y1: -14, x2: 712, y2: 722 }, H: { d: "M458 0L458 20Q490 22 506 28Q522 34 527.50 52Q533 70 533 106L533 346L268 346L268 106Q268 70 273.50 52Q279 34 295 28Q311 22 343 20L343 0Q316 2 275 2.50Q234 3 192 3Q143 3 101.50 2.50Q60 2 34 0L34 20Q66 22 82 28Q98 34 103.50 52Q109 70 109 106L109 602Q109 639 103.50 656.50Q98 674 81.50 680.50Q65 687 34 688L34 708Q60 707 101.50 706Q143 705 192 705Q234 705 275 706Q316 707 343 708L343 688Q311 687 294.50 680.50Q278 674 273 656.50Q268 639 268 602L268 366L533 366L533 602Q533 639 527.50 656.50Q522 674 505.50 680.50Q489 687 458 688L458 708Q485 707 528.50 706Q572 705 615 705Q661 705 701.50 706Q742 707 767 708L767 688Q735 687 718.50 680.50Q702 674 697 656.50Q692 639 692 602L692 106Q692 70 697.50 52Q703 34 719 28Q735 22 767 20L767 0Q742 2 701.50 2.50Q661 3 615 3Q572 3 528.50 2.50Q485 2 458 0Z", aw: 800, x1: 34, y1: 0, x2: 767, y2: 708 }, I: { d: "M343 708L343 688Q311 687 294.50 680.50Q278 674 273 656.50Q268 639 268 602L268 106Q268 70 273.50 52Q279 34 295 28Q311 22 343 20L343 0Q316 2 275 2.50Q234 3 192 3Q143 3 101.50 2.50Q60 2 34 0L34 20Q66 22 82 28Q98 34 103.50 52Q109 70 109 106L109 602Q109 639 103.50 656.50Q98 674 81.50 680.50Q65 687 34 688L34 708Q60 707 101.50 706Q143 705 192 705Q234 705 275 706Q316 707 343 708Z", aw: 376, x1: 34, y1: 0, x2: 343, y2: 708 }, J: { d: "M-23-188L-23-168Q17-164 45-144.50Q73-125 88-78Q103-31 103 54L103 602Q103 639 97.50 656.50Q92 674 76 680.50Q60 687 28 688L28 708Q53 707 93.50 706Q134 705 179 705Q224 705 266.50 706Q309 707 337 708L337 688Q306 687 289.50 680.50Q273 674 267.50 656.50Q262 639 262 602L262 148Q262 100 258.50 55Q255 10 245-25Q225-94 158.50-141Q92-188-23-188Z", aw: 364, x1: -23, y1: -188, x2: 337, y2: 708 }, K: { d: "M689 708L689 689Q657 682 620.50 661Q584 640 544 593L419 444L652 81Q666 58 682 44Q698 30 724 20L724 0Q689 2 646 2.50Q603 3 568 3Q547 3 517 2.50Q487 2 441 0L441 20Q482 22 490.50 31.50Q499 41 483 65L338 300Q324 323 313 334.50Q302 346 291 351Q282 354 268 356L268 106Q268 70 273.50 52Q279 34 295 28Q311 22 343 20L343 0Q316 2 275 2.50Q234 3 192 3Q144 3 101.50 2.50Q59 2 34 0L34 20Q66 22 82 28Q98 34 103.50 52Q109 70 109 106L109 602Q109 639 103.50 656.50Q98 674 81.50 680.50Q65 687 34 688L34 708Q59 707 101.50 706Q144 705 192 705Q234 705 275 706Q316 707 343 708L343 688Q311 687 294.50 680.50Q278 674 273 656.50Q268 639 268 602L268 377Q308 380 341 401Q375 424 416 471L475 542Q513 587 519.50 619.50Q526 652 506.50 670Q487 688 447 689L447 708Q472 707 494.50 706.50Q517 706 541.50 705.50Q566 705 595 705Q624 705 647.50 706Q671 707 689 708Z", aw: 714, x1: 34, y1: 0, x2: 724, y2: 708 }, L: { d: "M349 708L349 688Q315 687 297.50 680.50Q280 674 274 656.50Q268 639 268 602L268 94Q268 63 272.50 48Q277 33 290.50 28Q304 23 331 23L380 23Q414 23 444 39Q474 55 498 84.50Q522 114 538 155Q554 196 562 246L585 246Q582 212 582 158Q582 135 583 91Q584 47 589 0Q538 2 474 2.50Q410 3 360 3L296 3Q257 3 212 2.50Q167 2 121 1.50Q75 1 34 0L34 20Q66 22 82 28Q98 34 103.50 52Q109 70 109 106L109 602Q109 639 103.50 656.50Q98 674 81.50 680.50Q65 687 34 688L34 708Q59 707 101.50 706Q144 705 192 705Q236 705 278.50 706Q321 707 349 708Z", aw: 611, x1: 34, y1: 0, x2: 589, y2: 708 }, M: { d: "M894 708L894 688Q862 687 846 680.50Q830 674 824.50 656.50Q819 639 819 602L819 106Q819 70 824.50 52Q830 34 846 28Q862 22 894 20L894 0Q866 2 823.50 2.50Q781 3 737 3Q689 3 647 2.50Q605 2 579 0L579 20Q613 22 630.50 28Q648 34 654 52Q660 70 660 106L660 629L419-1L403-1L133 643L133 164Q133 109 139 79.50Q145 50 165.50 37.50Q186 25 230 20L230 0Q211 2 180 2.50Q149 3 122 3Q99 3 75 2.50Q51 2 35 0L35 20Q67 25 83 37Q99 49 104.50 76.50Q110 104 110 152L110 602Q110 639 104.50 656.50Q99 674 82.50 680.50Q66 687 35 688L35 708Q51 707 75 706Q99 705 122 705Q165 705 206.50 706Q248 707 280 708L482 221L666 705L737 705Q781 705 823.50 706Q866 707 894 708Z", aw: 927, x1: 35, y1: -1, x2: 894, y2: 708 }, N: { d: "M693 708L693 688Q661 684 645 671.50Q629 659 623.50 632Q618 605 618 556L618-2Q606-1 593.50-1Q581-1 567-2L133 548L133 164Q133 109 139 79.50Q145 50 165.50 37.50Q186 25 230 20L230 0Q211 2 180 2.50Q149 3 122 3Q99 3 75 2.50Q51 2 35 0L35 20Q67 25 83 37Q99 49 104.50 76.50Q110 104 110 152L110 602Q110 639 104.50 656.50Q99 674 82.50 680.50Q66 687 35 688L35 708Q51 707 75 706Q99 705 122 705Q146 705 168 706Q190 707 208 708L595 231L595 544Q595 599 589 628.50Q583 658 562.50 671Q542 684 498 688L498 708Q517 707 548 706Q579 705 606 705Q630 705 653.50 706Q677 707 693 708Z", aw: 722, x1: 35, y1: -2, x2: 693, y2: 708 }, O: { d: "M397 722Q503 722 582.50 679Q662 636 706 555.50Q750 475 750 360Q750 248 705 164Q660 80 579.50 33Q499-14 396-14Q290-14 210.50 29Q131 72 87 153Q43 234 43 348Q43 460 88.50 544Q134 628 213.50 675Q293 722 397 722ZM393 704Q337 704 295.50 659Q254 614 231.50 535Q209 456 209 352Q209 246 234.50 167.50Q260 89 303.50 46.50Q347 4 400 4Q456 4 497.50 49Q539 94 561.50 173.50Q584 253 584 356Q584 463 558.50 541Q533 619 489.50 661.50Q446 704 393 704Z", aw: 793, x1: 43, y1: -14, x2: 750, y2: 722 }, P: { d: "M34 688L34 708Q59 707 101.50 706Q144 705 186 705Q234 705 279 706Q324 707 343 707Q482 707 551 652Q620 597 620 510Q620 474 606 434.50Q592 395 558.50 361.50Q525 328 467 307Q409 286 321 286L268 286L268 112Q268 73 276 54Q284 35 307 29Q330 23 375 22L375 0Q344 1 295 2Q246 3 192 3Q149 3 108 2Q67 1 34 0L34 20Q66 22 82 28Q98 34 103.50 52Q109 70 109 106L109 602Q109 639 103.50 656.50Q98 674 81.50 680.50Q65 687 34 688ZM268 602L268 306L311 306Q370 306 400.50 333Q431 360 442.50 404Q454 448 454 499Q454 594 426 641Q398 688 330 688Q291 688 279.50 671Q268 654 268 602Z", aw: 641, x1: 34, y1: 0, x2: 620, y2: 708 }, Q: { d: "M764 12L782 7Q774-48 757-87.50Q740-127 713-149Q692-166 658.50-177Q625-188 584-188Q529-188 476.50-171Q424-154 370-129.50Q316-105 256-82Q249-80 242.50-77.50Q236-75 232-75Q213-84 190.50-90Q168-96 148-96Q128-96 114.50-90Q101-84 101-70Q101-43 156-43Q191-43 232-57Q269-47 296-34Q321-22 349-12Q272-4 211 29Q131 72 87 153Q43 234 43 348Q43 460 88.50 544Q134 628 213.50 675Q293 722 397 722Q503 722 582.50 679Q662 636 706 555.50Q750 475 750 360Q750 248 705 164Q660 80 580 33Q507-10 415-14Q387-17 367-24Q344-33 321-43Q298-53 267-62Q338-67 399-72.50Q460-78 512-79.50Q564-81 606-75Q668-68 704-48Q740-28 764 12ZM393 704Q337 704 295.50 659Q254 614 231.50 535Q209 456 209 352Q209 246 234.50 167.50Q260 89 303.50 46.50Q347 4 400 4Q456 4 497.50 49Q539 94 561.50 173.50Q584 253 584 356Q584 463 558.50 541Q533 619 489.50 661.50Q446 704 393 704Z", aw: 793, x1: 43, y1: -188, x2: 782, y2: 722 }, R: { d: "M34 688L34 708Q59 707 101.50 706Q144 705 186 705Q234 705 279 706Q324 707 343 707Q436 707 497.50 686.50Q559 666 589.50 627Q620 588 620 533Q620 499 606 464.50Q592 430 558.50 400.50Q525 371 467 354Q436 344 397 340Q487 332 531 301Q574 270 587 208L610 105Q619 65 629 49Q639 33 658 33Q671 34 679.50 39.50Q688 45 698 56L712 44Q685 13 654-0.50Q623-14 579-14Q525-14 490 9Q455 32 444 94L426 194Q419 236 409 267.50Q399 299 381.50 317.50Q364 336 333 336L268 336L268 106Q268 70 273.50 52Q279 34 295 28Q311 22 343 20L343 0Q316 2 275 2.50Q234 3 192 3Q144 3 101.50 2.50Q59 2 34 0L34 20Q66 22 82 28Q98 34 103.50 52Q109 70 109 106L109 602Q109 639 103.50 656.50Q98 674 81.50 680.50Q65 687 34 688ZM268 602L268 356L311 356Q370 356 400.50 378.50Q431 401 442.50 438.50Q454 476 454 522Q454 601 426 644.50Q398 688 330 688Q291 688 279.50 671Q268 654 268 602Z", aw: 692, x1: 34, y1: -14, x2: 712, y2: 708 }, S: { d: "M284 721Q343 721 375 708.50Q407 696 430 682Q442 675 449.50 671.50Q457 668 464 668Q474 668 478.50 679Q483 690 486 712L509 712Q508 693 506.50 666.50Q505 640 504.50 597Q504 554 504 484L481 484Q477 536 457 585Q437 634 400.50 665.50Q364 697 311 697Q263 697 232 670Q201 643 201 595Q201 555 221 526.50Q241 498 279.50 471Q318 444 373 406Q421 375 459 344Q497 313 520 274Q543 235 543 181Q543 115 508.50 72Q474 29 418 7.50Q362-14 295-14Q233-14 196-2Q159 10 134 23Q112 37 100 37Q90 37 85.50 26Q81 15 78-7L55-7Q57 17 57.50 49Q58 81 58.50 132.50Q59 184 59 263L82 263Q86 197 104.50 139.50Q123 82 161.50 47Q200 12 264 12Q299 12 326.50 24.50Q354 37 371 62Q388 87 388 124Q388 166 368.50 197Q349 228 315.50 255Q282 282 238 310Q191 341 150 372Q109 403 84.50 443Q60 483 60 538Q60 601 91.50 641.50Q123 682 174.50 701.50Q226 721 284 721Z", aw: 584, x1: 55, y1: -14, x2: 543, y2: 721 }, T: { d: "M642 708Q638 657 636.50 610Q635 563 635 538Q635 516 636 496Q637 476 638 462L615 462Q599 546 574.50 595Q550 644 516 664.50Q482 685 436 685L413 685L413 114Q413 74 421.50 54Q430 34 453 27.50Q476 21 520 20L520 0Q489 1 437.50 2Q386 3 330 3Q275 3 226 2Q177 1 147 0L147 20Q192 21 215 27.50Q238 34 246 54Q254 74 254 114L254 685L232 685Q186 685 152 664.50Q118 644 94 595.50Q70 547 52 462L29 462Q31 476 31.50 496Q32 516 32 538Q32 563 30.50 610Q29 657 25 708Q71 707 125.50 706Q180 705 235 705L434 705Q488 705 543 706Q598 707 642 708Z", aw: 668, x1: 25, y1: 0, x2: 642, y2: 708 }, U: { d: "M671 708L671 688Q639 684 622.50 671.50Q606 659 601 632Q596 605 596 556L596 291Q596 226 587 172Q578 118 555 79Q529 36 479 11Q429-14 352-14Q306-14 258-3.50Q210 7 172 36Q140 63 123 97Q106 131 100 177.50Q94 224 94 288L94 602Q94 639 88.50 656.50Q83 674 67 680.50Q51 687 19 688L19 708Q44 707 86.50 706Q129 705 175 705Q221 705 263.50 706Q306 707 334 708L334 688Q300 687 282.50 680.50Q265 674 259 656.50Q253 639 253 602L253 225Q253 175 259.50 136.50Q266 98 281.50 72.50Q297 47 324 34Q351 21 391 21Q461 21 500.50 54Q540 87 556.50 145.50Q573 204 573 280L573 544Q573 599 566 628.50Q559 658 538.50 671Q518 684 476 688L476 708Q495 707 526 706Q557 705 584 705Q608 705 631.50 706Q655 707 671 708Z", aw: 689, x1: 19, y1: -14, x2: 671, y2: 708 }, V: { d: "M678 708L678 688Q656 680 631.50 653Q607 626 586 569L375-2Q367-1 358-1L323-1Q314-1 306-2L51 624Q37 660 20 673.50Q3 687-12 688L-12 708Q18 707 58.50 706Q99 705 140 705Q186 705 226.50 706Q267 707 292 708L292 688Q260 687 242 680.50Q224 674 222 656.50Q220 639 234 604L410 156L533 488Q560 563 561 606Q562 649 540 668Q518 687 477 688L477 708Q511 707 541 706Q571 705 602 705Q624 705 643.50 706Q663 707 678 708Z", aw: 668, x1: -12, y1: -2, x2: 678, y2: 708 }, W: { d: "M974 708L974 688Q952 680 928 653.50Q904 627 886 569L710-2Q702-1 693-1L657-1Q648-1 640-2L493 444L345-2Q337-1 328-1L292-1Q283-1 275-2L51 624Q38 661 20.50 674Q3 687-12 688L-12 708Q18 707 59 706Q100 705 137 705Q177 705 208.50 706Q240 707 260 708L260 688Q240 685 232 673.50Q224 662 225.50 643.50Q227 625 234 604L380 181L481 479L430 634Q420 665 405.50 676Q391 687 375 688L375 708Q403 707 441.50 706Q480 705 518 705Q562 705 600.50 706Q639 707 662 708L662 688Q632 687 614.50 681Q597 675 594.50 658Q592 641 604 604L741 186L836 488Q860 564 859 607Q858 650 836 668.50Q814 687 773 688L773 708Q807 707 837 706Q867 705 897 705Q920 705 939.50 706Q959 707 974 708Z", aw: 968, x1: -12, y1: -2, x2: 974, y2: 708 }, X: { d: "M299 709L299 688Q254 688 241.50 679.50Q229 671 243 650L392 432L466 532Q504 580 511.50 614Q519 648 500 667Q481 686 440 688L440 708Q459 707 482 706.50Q505 706 527.50 705.50Q550 705 566 705Q595 705 619 706Q643 707 658 708L658 688Q625 679 592.50 650Q560 621 532 583L405 413L639 71Q659 43 671 33Q683 23 703 21L703 0Q683 1 645 2.50Q607 4 566 4Q521 4 474.50 2.50Q428 1 405 0L405 21Q451 21 465 28Q468 29 470 32Q474 40 464 55L296 302L216 193Q176 139 171 101.50Q166 64 188.50 43.50Q211 23 255 20L255 0Q241 1 219.50 1.50Q198 2 174.50 2.50Q151 3 131 3L97 3Q69 3 45 2.50Q21 2 5 0L5 20Q40 32 76 62.50Q112 93 150 142L283 321L67 638Q48 667 36 677Q24 687 3 688L3 709Q24 708 64.50 706.50Q105 705 146 705Q191 705 232.50 706.50Q274 708 299 709Z", aw: 691, x1: 3, y1: 0, x2: 703, y2: 709 }, Y: { d: "M617 709L617 689Q595 680 572 653.50Q549 627 521 573L403 339L403 106Q403 70 408.50 52Q414 34 430 28Q446 22 478 20L478 0Q451 2 408.50 2.50Q366 3 324 3Q277 3 235 2.50Q193 2 169 0L169 20Q201 22 217 28Q233 34 238.50 52Q244 70 244 106L244 275L51 632Q33 666 18.50 677Q4 688-7 688L-7 709Q20 706 48.50 705Q77 704 111 704Q155 704 206 705.50Q257 707 299 709L299 688Q274 688 254 684Q234 680 226 669.50Q218 659 230 636L382 343L460 499Q497 571 499.50 612Q502 653 479.50 670.50Q457 688 416 689L416 709Q450 708 480 707Q510 706 541 706Q563 706 582.50 707Q602 708 617 709Z", aw: 623, x1: -7, y1: 0, x2: 617, y2: 709 }, Z: { d: "M557 708L557 688L215 23L319 23Q353 23 387.50 34Q422 45 451.50 70Q481 95 502 136.50Q523 178 530 240L553 240Q550 206 550 152Q550 129 551 87Q552 45 557 0Q520 2 476 2.50Q432 3 389 3L308 3Q243 3 172 2.50Q101 2 39 0L39 20L382 685L274 685Q236 685 203.50 675Q171 665 144 641.50Q117 618 99 578.50Q81 539 74 480L51 480Q53 494 53.50 514Q54 534 54 556Q54 579 52.50 621Q51 663 47 708Q80 707 120 706Q160 705 200 705L272 705Q339 705 415 705.50Q491 706 557 708Z", aw: 602, x1: 39, y1: 0, x2: 557, y2: 708 }, a: { d: "M162-7Q117-7 87 10Q57 27 43 55.50Q29 84 29 118Q29 161 48.50 188Q68 215 99 232Q130 249 164.50 260Q199 271 230.50 281.50Q262 292 281.50 306.50Q301 321 301 344L301 422Q301 448 292.50 468.50Q284 489 266.50 500Q249 511 221 511Q201 511 181 505.50Q161 500 148 487Q176 477 191.50 456.50Q207 436 207 410Q207 376 183.50 356Q160 336 128 336Q92 336 73.50 358.50Q55 381 55 413Q55 442 69.50 461Q84 480 110 497Q138 513 177.50 522Q217 531 263 531Q309 531 346 521.50Q383 512 408 487Q431 464 438 430.50Q445 397 445 346L445 74Q445 49 450 39.50Q455 30 467 30Q476 30 484.50 35Q493 40 503 47L513 30Q492 12 464.50 2.50Q437-7 403-7Q366-7 344 3.50Q322 14 312.50 32Q303 50 303 74Q279 36 245 14.50Q211-7 162-7ZM233 57Q253 57 269.50 66.50Q286 76 301 98L301 303Q292 288 276 276Q260 264 242 251.50Q224 239 207.50 224Q191 209 181 187Q171 165 171 134Q171 95 188 76Q205 57 233 57Z", aw: 518, x1: 29, y1: -7, x2: 513, y2: 531 }, b: { d: "M367 531Q445 531 496.50 467.50Q548 404 548 272Q548 168 516.50 105Q485 42 433 14Q381-14 319-14Q278-14 243 0Q224 8 207 21Q186 23 163 20Q137 16 115 6.50Q93-3 78-16L63-7Q67 7 68.50 21Q70 35 70 49L70 662Q70 707 56.50 728.50Q43 750 6 750L6 771Q38 768 68 768Q109 768 146 771.50Q183 775 214 782L214 436Q232 478 267 502Q310 531 367 531ZM214 401L214 34Q226 24 240 18Q264 7 288 7Q343 7 370 69Q397 131 397 258Q397 344 386.50 394.50Q376 445 356 466.50Q336 488 308 488Q273 488 244 460Q221 437 214 401Z", aw: 586, x1: 6, y1: -16, x2: 548, y2: 782 }, c: { d: "M284 531Q323 531 355.50 522.50Q388 514 409 501Q435 485 449.50 461.50Q464 438 464 407Q464 372 442 349.50Q420 327 385 327Q350 327 329 347Q308 367 308 401Q308 433 328 454.50Q348 476 374 483Q366 493 350 500Q334 507 314 507Q283 507 259.50 489Q236 471 220 439Q204 407 195.50 364Q187 321 187 270Q187 193 206.50 149Q226 105 256.50 87Q287 69 320 69Q339 69 361.50 75Q384 81 407.50 99Q431 117 451 150L468 144Q457 107 432 70Q407 33 367 9.50Q327-14 269-14Q204-14 151.50 14.50Q99 43 67.50 102.50Q36 162 36 256Q36 346 68.50 407.50Q101 469 157 500Q213 531 284 531Z", aw: 496, x1: 36, y1: -14, x2: 468, y2: 531 }, d: { d: "M516 783L516 110Q516 65 530 43.50Q544 22 580 22L580 1Q549 4 518 4Q476 4 439.50 1Q403-2 372-10L372 76Q357 36 330 14Q296-14 242-14Q183-14 136.50 15Q90 44 64 104.50Q38 165 38 261Q38 352 67 411.50Q96 471 146.50 501Q197 531 261 531Q305 531 339 517Q358 508 372 494L372 663Q372 708 358.50 729.50Q345 751 308 751L308 772Q340 769 370 769Q411 769 448 772.50Q485 776 516 783ZM372 117L372 468Q361 484 345 492Q323 502 299 502Q248 502 218 442.50Q188 383 189 259Q189 174 200.50 123.50Q212 73 233.50 51Q255 29 283 29Q317 29 344 56Q367 79 372 117Z", aw: 598, x1: 38, y1: -14, x2: 580, y2: 783 }, e: { d: "M282 531Q370 531 420 479Q470 427 470 309L190 309Q189 299 189 289Q188 276 188 262Q188 193 207.50 150Q227 107 257 87.50Q287 68 318 68Q339 68 361.50 74.50Q384 81 407 98.50Q430 116 450 148L468 142Q456 104 430 68Q404 32 364 9Q324-14 268-14Q200-14 148 15Q96 44 66.50 103Q37 162 37 253Q37 346 68.50 408Q100 470 155.50 500.50Q211 531 282 531ZM187 328L344 328Q345 377 338 418.50Q331 460 316 485Q301 510 276 510Q241 510 217 466Q193 424 187 328Z", aw: 504, x1: 37, y1: -14, x2: 470, y2: 531 }, f: { d: "M288 782Q323 782 349 773Q375 764 395 749Q409 738 419 718.50Q429 699 429 674Q429 647 409.50 626Q390 605 358 605Q325 605 303.50 624Q282 643 282 676Q282 702 297 722Q312 742 341 750Q338 756 329 760Q320 764 305 764Q285 764 272 757Q259 750 251 738Q240 723 236 694.50Q232 666 232 607L232 516L339 516L339 496L232 496L232 103Q232 54 257 37.50Q282 21 326 21L326 0Q300 1 253 2.50Q206 4 154 4Q116 4 79.50 2.50Q43 1 24 0L24 21Q59 21 73.50 36Q88 51 88 93L88 496L20 496L20 516L88 516Q88 575 94 614.50Q100 654 114 682Q128 710 151 732Q173 753 209.50 767.50Q246 782 288 782Z", aw: 352, x1: 20, y1: 0, x2: 429, y2: 782 }, g: { d: "M218-188Q156-188 107.50-177.50Q59-167 31.50-145.50Q4-124 4-93Q4-62 32-37.50Q60-13 115 1L124-15Q105-30 96.50-47.50Q88-65 88-84Q88-126 126.50-148.50Q165-171 231-171Q276-171 311.50-159Q347-147 367.50-123Q388-99 388-64Q388-34 366-13.50Q344 7 278 7L216 7Q175 7 144.50 16Q114 25 97 44.50Q80 64 80 94Q80 136 113 168Q139 193 184 216Q153 220 126 230Q81 247 55 282Q29 317 29 372Q29 427 55 462.50Q81 498 126 514.50Q171 531 228 531Q285 531 330 515Q360 504 381 484Q394 503 413 517Q446 543 485 543Q517 543 533.50 525.50Q550 508 550 480Q550 450 534 435.50Q518 421 498 421Q481 421 466.50 433Q452 445 450 470Q448 491 462 522Q433 510 417 495Q406 484 396 468Q399 466 401 463Q427 427 427 372Q427 317 401 282Q375 247 330 230Q285 213 228 213Q219 213 211 213Q198 204 186 195Q169 181 169 160Q169 128 209 128L318 128Q373 128 416.50 115Q460 102 485.50 72.50Q511 43 511-4Q511-53 479.50-95Q448-137 383-162.50Q318-188 218-188ZM228 231Q255 231 270 261.50Q285 292 285 372Q285 452 270 482.50Q255 513 228 513Q202 513 186.50 482.50Q171 452 171 372Q171 292 186.50 261.50Q202 231 228 231Z", aw: 553, x1: 4, y1: -188, x2: 550, y2: 543 }, h: { d: "M227 782L227 438Q252 490 294.50 510.50Q337 531 390 531Q433 531 459 520.50Q485 510 500 492Q517 473 524.50 443Q532 413 532 362L532 93Q532 51 546.50 36Q561 21 596 21L596 0Q577 1 538.50 2.50Q500 4 464 4Q425 4 388.50 2.50Q352 1 334 0L334 21Q364 21 376 36Q388 51 388 93L388 404Q388 429 383 447.50Q378 466 364.50 476.50Q351 487 326 487Q299 487 276.50 472.50Q254 458 240.50 432Q227 406 227 372L227 93Q227 51 239 36Q251 21 281 21L281 0Q263 1 228 2.50Q193 4 157 4Q118 4 78.50 2.50Q39 1 19 0L19 21Q54 21 68.50 36Q83 51 83 93L83 662Q83 707 69.50 728.50Q56 750 19 750L19 771Q51 768 81 768Q122 768 159 771.50Q196 775 227 782Z", aw: 608, x1: 19, y1: 0, x2: 596, y2: 782 }, i: { d: "M154 775Q196 775 220.50 754.50Q245 734 245 698Q245 662 220.50 641.50Q196 621 154 621Q112 621 87.50 641.50Q63 662 63 698Q63 734 87.50 754.50Q112 775 154 775ZM232 528L232 93Q232 51 246.50 36Q261 21 296 21L296 0Q278 1 240 2.50Q202 4 163 4Q124 4 84 2.50Q44 1 24 0L24 21Q59 21 73.50 36Q88 51 88 93L88 408Q88 453 74.50 474.50Q61 496 24 496L24 517Q56 514 86 514Q128 514 164.50 517.50Q201 521 232 528Z", aw: 315, x1: 24, y1: 0, x2: 296, y2: 775 }, j: { d: "M-23-188L-23-170Q26-169 55-131.50Q84-94 84-18L84 408Q84 453 70 474.50Q56 496 20 496L20 517Q52 514 82 514Q123 514 160 517.50Q197 521 228 528L228 94Q228 39 221-3Q214-45 198-77Q182-109 156-134Q131-158 87.50-173Q44-188-23-188ZM145 775Q187 775 211.50 754.50Q236 734 236 698Q236 662 211.50 641.50Q187 621 145 621Q103 621 78.50 641.50Q54 662 54 698Q54 734 78.50 754.50Q103 775 145 775Z", aw: 297, x1: -23, y1: -188, x2: 236, y2: 775 }, k: { d: "M227 783L227 285Q245 287 259 291Q274 296 287 310L363 384Q397 416 397 441Q397 466 375.50 481Q354 496 319 497L319 517Q347 516 380 515Q413 514 436 514Q456 514 478.50 514.50Q501 515 521 515.50Q541 516 553 517L553 497Q522 491 491 471Q460 451 428 420L364 354L532 73Q543 55 555 41Q567 27 584 21L584 0Q569 1 539 2.50Q509 4 479 4Q442 4 405 2.50Q368 1 350 0L350 21Q370 21 377 30.50Q384 40 375 55L276 234Q264 253 253 259Q243 263 227 265L227 93Q227 51 240.50 36Q254 21 287 21L287 0Q268 1 231.50 2.50Q195 4 157 4Q118 4 78.50 2.50Q39 1 19 0L19 21Q54 21 68.50 36Q83 51 83 93L83 663Q83 708 69.50 729.50Q56 751 19 751L19 772Q51 769 81 769Q122 769 159 772.50Q196 776 227 783Z", aw: 585, x1: 19, y1: 0, x2: 584, y2: 783 }, l: { d: "M228 783L228 93Q228 51 242.50 36Q257 21 292 21L292 0Q273 1 235 2.50Q197 4 158 4Q119 4 79.50 2.50Q40 1 20 0L20 21Q55 21 69.50 36Q84 51 84 93L84 663Q84 708 70.50 729.50Q57 751 20 751L20 772Q52 769 82 769Q123 769 160 772.50Q197 776 228 783Z", aw: 311, x1: 20, y1: 0, x2: 292, y2: 783 }, m: { d: "M387 531Q429 531 455 520.50Q481 510 497 492Q513 473 520 443Q521 437 522 432Q549 489 593 510Q637 531 688 531Q730 531 756 520.50Q782 510 798 492Q814 473 821 442.50Q828 412 828 362L828 93Q828 51 842.50 36Q857 21 892 21L892 0Q873 1 835 2.50Q797 4 760 4Q724 4 689 2.50Q654 1 636 0L636 21Q663 21 673.50 36Q684 51 684 93L684 404Q684 429 679.50 447.50Q675 466 662.50 476.50Q650 487 624 487Q598 487 576 471Q554 455 541 428Q529 406 527 380Q527 371 527 362L527 93Q527 51 540 36Q553 21 585 21L585 0Q567 1 530.50 2.50Q494 4 459 4Q423 4 388 2.50Q353 1 335 0L335 21Q362 21 372.50 36Q383 51 383 93L383 404Q383 429 379 447.50Q375 466 363.50 476.50Q352 487 329 487Q303 487 281 472Q259 457 245.50 430.50Q232 404 232 371L232 93Q232 51 243 36Q254 21 280 21L280 0Q264 1 230.50 2.50Q197 4 162 4Q124 4 84 2.50Q44 1 24 0L24 21Q59 21 73.50 36Q88 51 88 93L88 408Q88 453 74.50 474.50Q61 496 24 496L24 517Q56 514 86 514Q128 514 164.50 517.50Q201 521 232 528L232 438Q256 488 297 509.50Q338 531 387 531Z", aw: 905, x1: 24, y1: 0, x2: 892, y2: 531 }, n: { d: "M396 531Q438 531 464.50 520.50Q491 510 506 492Q522 473 529.50 443Q537 413 537 362L537 93Q537 51 551.50 36Q566 21 601 21L601 0Q582 1 544 2.50Q506 4 469 4Q431 4 394.50 2.50Q358 1 339 0L339 21Q369 21 381 36Q393 51 393 93L393 404Q393 429 388 447.50Q383 466 370 476.50Q357 487 331 487Q304 487 281.50 472Q259 457 245.50 430.50Q232 404 232 371L232 93Q232 51 244.50 36Q257 21 286 21L286 0Q268 1 233.50 2.50Q199 4 162 4Q124 4 84 2.50Q44 1 24 0L24 21Q59 21 73.50 36Q88 51 88 93L88 408Q88 453 74.50 474.50Q61 496 24 496L24 517Q56 514 86 514Q128 514 164.50 517.50Q201 521 232 528L232 438Q257 489 300 510Q343 531 396 531Z", aw: 614, x1: 24, y1: 0, x2: 601, y2: 531 }, o: { d: "M282 531Q355 531 410 504Q465 477 496 417Q527 357 527 258Q527 159 496 99.50Q465 40 410 13Q355-14 282-14Q211-14 155.50 13Q100 40 68.50 99.50Q37 159 37 258Q37 357 68.50 417Q100 477 155.50 504Q211 531 282 531ZM282 511Q242 511 215 451.50Q188 392 188 258Q188 124 215 65Q242 6 282 6Q323 6 349.50 65Q376 124 376 258Q376 392 349.50 451.50Q323 511 282 511Z", aw: 565, x1: 37, y1: -14, x2: 527, y2: 531 }, p: { d: "M228 528L228 436Q246 478 282 502Q325 531 383 531Q434 531 474 503.50Q514 476 538 420.50Q562 365 562 282Q562 209 545.50 154Q529 99 498.50 61.50Q468 24 425.50 5Q383-14 330-14Q291-14 259 0Q241 7 228 18L228-82Q228-129 252-144.50Q276-160 318-160L318-181Q292-180 246.50-178.50Q201-177 150-177Q113-177 77.50-178.50Q42-180 24-181L24-160Q57-160 70.50-146Q84-132 84-92L84 408Q84 453 70 474.50Q56 496 20 496L20 517Q52 514 82 514Q123 514 160 517.50Q197 521 228 528ZM228 402L228 39Q236 30 249 23Q267 13 291 13Q336 13 362 43.50Q388 74 399.50 129.50Q411 185 411 262Q411 348 400 397Q389 446 370 467Q351 488 324 488Q288 488 259 460Q235 438 228 402Z", aw: 600, x1: 20, y1: -181, x2: 562, y2: 531 }, q: { d: "M256 531Q303 531 337 519Q361 510 380 491Q402 490 423 494Q449 499 471.50 509.50Q494 520 507 533L522 525Q518 512 516.50 497.50Q515 483 515 468L515-92Q515-132 528.50-146Q542-160 575-160L575-181Q557-180 522-178.50Q487-177 449-177Q399-177 353-178.50Q307-180 281-181L281-160Q324-160 347.50-144.50Q371-129 371-82L371 77Q356 38 329 16Q294-14 242-14Q185-14 138.50 15Q92 44 64.50 104.50Q37 165 37 261Q37 352 65 411.50Q93 471 142.50 501Q192 531 256 531ZM371 111L371 480Q359 493 343 500Q320 510 294 510Q242 510 215 448Q188 386 188 259Q188 174 200 123.50Q212 73 233.50 51Q255 29 284 29Q317 29 345 58Q364 79 371 111Z", aw: 585, x1: 37, y1: -181, x2: 575, y2: 533 }, r: { d: "M368 531Q400 531 420 517.50Q440 504 449.50 483Q459 462 459 439Q459 402 437.50 378.50Q416 355 381 355Q346 355 326.50 372.50Q307 390 307 419Q307 447 319.50 465.50Q332 484 351 497Q337 501 323 496Q304 493 287 480.50Q270 468 258 449.50Q246 431 239 409.50Q232 388 232 368L232 103Q232 55 255.50 38Q279 21 326 21L326 0Q303 1 259 2.50Q215 4 167 4Q127 4 86 2.50Q45 1 24 0L24 21Q59 21 73.50 36Q88 51 88 93L88 408Q88 453 74.50 474.50Q61 496 24 496L24 517Q56 514 86 514Q128 514 164.50 517.50Q201 521 232 528L232 435Q244 462 264 484Q284 506 310 518.50Q336 531 368 531Z", aw: 467, x1: 24, y1: 0, x2: 459, y2: 531 }, s: { d: "M222 531Q264 531 295.50 520.50Q327 510 341 500Q355 491 364 494Q378 499 383 530L404 530Q402 502 401 461.50Q400 421 400 354L379 354Q374 391 360 427Q346 463 319.50 486Q293 509 251 509Q222 509 202 492.50Q182 476 182 445Q182 415 200 392.50Q218 370 246.50 349.50Q275 329 306 306Q339 281 366 256.50Q393 232 409 203Q425 174 425 134Q425 89 399 55.50Q373 22 330.50 4Q288-14 236-14Q206-14 182.50-8Q159-2 142 7Q129 13 117.50 18.50Q106 24 96 28Q86 31 78.50 21Q71 11 67-7L46-7Q48 25 49 71Q50 117 50 193L71 193Q77 139 93 97.50Q109 56 136.50 32.50Q164 9 206 9Q223 9 239 16Q255 23 265.50 39Q276 55 276 80Q276 124 247.50 153Q219 182 175 216Q143 242 114.50 267.50Q86 293 68 323.50Q50 354 50 393Q50 438 74 469Q98 500 137.50 515.50Q177 531 222 531Z", aw: 462, x1: 46, y1: -14, x2: 425, y2: 531 }, t: { d: "M227 681L227 517L345 517L345 497L227 497L227 93Q227 63 238 50.50Q249 38 271 38Q289 38 307 51.50Q325 65 339 98L356 89Q340 44 307.50 15Q275-14 219-14Q186-14 161-5.50Q136 3 119 20Q97 42 90 74.50Q83 107 83 159L83 497L-1 497L-1 517L83 517L83 649Q125 649 160.50 656.50Q196 664 227 681Z", aw: 352, x1: -1, y1: -14, x2: 356, y2: 681 }, u: { d: "M522 528L522 109Q522 64 536 42.50Q550 21 586 21L586 0Q555 3 524 3Q482 3 446 0Q410-3 378-11L378 79Q354 29 311.50 7.50Q269-14 217-14Q175-14 149-3Q123 8 108 25Q91 44 84 75Q77 106 77 155L77 408Q77 453 63.50 474.50Q50 496 13 496L13 517Q45 514 75 514Q117 514 153.50 517.50Q190 521 221 528L221 114Q221 89 225.50 70Q230 51 243 40.50Q256 30 281 30Q308 30 329.50 45Q351 60 364.50 86.50Q378 113 378 146L378 408Q378 453 364.50 474.50Q351 496 314 496L314 517Q346 514 376 514Q418 514 454.50 517.50Q491 521 522 528Z", aw: 606, x1: 13, y1: -14, x2: 586, y2: 528 }, v: { d: "M507 517L507 497Q488 492 471 473.50Q454 455 438 411L292-2Q276-1 259.50-1Q243-1 227-2L49 440Q33 479 17.50 487.50Q2 496-9 496L-9 517Q23 515 57.50 513.50Q92 512 133 512Q164 512 198.50 513.50Q233 515 263 517L263 496Q242 496 225.50 494Q209 492 203 481Q197 470 205 442L319 139L391 337Q410 391 407 425.50Q404 460 385 477.50Q366 495 334 497L334 517Q349 516 366.50 515.50Q384 515 400.50 514.50Q417 514 430 514Q450 514 472 515Q494 516 507 517Z", aw: 508, x1: -9, y1: -2, x2: 507, y2: 517 }, w: { d: "M265 517L265 496Q243 496 226.50 493.50Q210 491 204.50 479Q199 467 208 440L298 157L407 518Q425 517 443.50 517.50Q462 518 480 518L610 136L673 337Q690 392 686 426Q682 460 662 477Q642 494 608 497L608 517Q624 516 643 516L680 515Q698 514 711 514Q731 514 752.50 515Q774 516 787 517L787 497Q768 492 751 474Q734 456 719 411L586-2Q570-1 553.50-1Q537-1 521-2L385 369L274-2Q258-1 242-1Q226-1 209-2L51 440Q37 480 20.50 488Q4 496-7 496L-7 517Q25 514 59.50 512.50Q94 511 135 511Q166 511 200.50 513Q235 515 265 517Z", aw: 787, x1: -7, y1: -2, x2: 787, y2: 518 }, x: { d: "M246 517L246 496Q226 496 216.50 487Q207 478 217 462L311 322L349 372Q376 407 382 434Q388 461 373.50 478Q359 495 323 497L323 517Q352 516 382 515Q412 514 436 514Q459 514 476 515Q493 516 507 517L507 497Q486 491 463 471Q440 451 415 420L323 305L480 71Q492 53 505.50 38.50Q519 24 536 21L536 0Q521 1 490.50 2.50Q460 4 429 4Q393 4 355 2.50Q317 1 299 0L299 21Q319 21 328.50 30Q338 39 328 55L224 210L189 166Q159 127 156 94.50Q153 62 173 42.50Q193 23 228 20L228 0Q209 1 181.50 1.50Q154 2 128 2.50Q102 3 84 3Q62 3 45.50 2.50Q29 2 14 0L14 20Q37 29 58 46.50Q79 64 105 97L212 228L65 446Q48 471 36.50 482.50Q25 494 9 496L9 517Q26 516 60 514.50Q94 513 128 513Q161 513 195 514.50Q229 516 246 517Z", aw: 536, x1: 9, y1: 0, x2: 536, y2: 517 }, y: { d: "M513 517L513 497Q494 492 477 473.50Q460 455 444 411L303 15L265-92Q255-117 244.50-134.50Q234-152 221-163Q207-175 185-181.50Q163-188 134-188Q110-188 84.50-180Q59-172 42-154Q25-136 25-108Q25-77 47-58.50Q69-40 105-40Q138-40 159-56Q180-72 180-103Q180-123 167.50-141Q155-159 130-168Q135-169 142-169L153-169Q183-169 206-150Q229-131 244-90L260-42L48 440Q31 479 14.50 487.50Q-2 496-14 496L-14 517Q19 514 54.50 512.50Q90 511 123 511Q164 511 198 513Q232 515 262 517L262 496Q242 496 224.50 493.50Q207 491 200.50 479.50Q194 468 206 440L328 145L397 337Q416 391 413 425.50Q410 460 391 477.50Q372 495 339 497L339 517Q355 516 372 516L406 515Q423 514 436 514Q456 514 478 515Q500 516 513 517Z", aw: 519, x1: -14, y1: -188, x2: 513, y2: 517 }, z: { d: "M444 522L194 15L246 15Q285 15 319.50 31.50Q354 48 377.50 87Q401 126 406 194L427 194Q427 121 428 74.50Q429 28 431-4Q386-2 337-1Q288 0 239 0Q188 0 134-1.50Q80-3 31-5L281 502L225 502Q185 502 151.50 485.50Q118 469 96.50 429.50Q75 390 69 323L48 323Q48 397 47 443Q46 489 44 521Q90 519 139 518Q188 517 236 517Q288 517 341.50 518.50Q395 520 444 522Z", aw: 474, x1: 31, y1: -5, x2: 444, y2: 522 }, ":": { d: "M145 531Q184 531 207 510.50Q230 490 230 454Q230 418 207 397.50Q184 377 145 377Q106 377 83 397.50Q60 418 60 454Q60 490 83 510.50Q106 531 145 531ZM145 140Q184 140 207 119.50Q230 99 230 63Q230 27 207 6.50Q184-14 145-14Q106-14 83 6.50Q60 27 60 63Q60 99 83 119.50Q106 140 145 140Z", aw: 290, x1: 60, y1: -14, x2: 230, y2: 531 }, "/": { d: "M304 722L337 722L65-14L32-14Z", aw: 368, x1: 32, y1: -14, x2: 337, y2: 722 }, ".": { d: "M135 140Q174 140 197 119.50Q220 99 220 63Q220 27 197 6.50Q174-14 135-14Q96-14 73 6.50Q50 27 50 63Q50 99 73 119.50Q96 140 135 140Z", aw: 270, x1: 50, y1: -14, x2: 220, y2: 140 }, "-": { d: "M60 312L421 312L421 229L60 229Z", aw: 481, x1: 60, y1: 229, x2: 421, y2: 312 }, "(": { d: "M285 806L300 794Q233 690 203 574Q173 458 173 312Q173 167 203 52Q233-63 300-170L285-182Q166-94 100.50 27Q35 148 35 312Q35 476 100.50 597Q166 718 285 806Z", aw: 318, x1: 35, y1: -182, x2: 300, y2: 806 }, ")": { d: "M18 794L33 806Q152 718 217.50 597Q283 476 283 312Q283 148 217.50 27Q152-94 33-182L18-170Q86-63 115.50 52Q145 167 145 312Q145 458 115 574Q85 690 18 794Z", aw: 318, x1: 18, y1: -182, x2: 283, y2: 806 }, "'": { d: "M105 730Q132 730 150 712.50Q168 695 168 664Q168 634 159.50 608Q151 582 138.50 550Q126 518 112 468L98 468Q85 516 71.50 548Q58 580 50 606.50Q42 633 42 663Q42 694 60 712Q78 730 105 730Z", aw: 209, x1: 42, y1: 468, x2: 168, y2: 730 }, " ": null, _meta: { unitsPerEm: 1e3, ascender: 1082, descender: -251 } } } };

// src/poster.ts
var wasmInitialized = false;
async function initResvg() {
  if (wasmInitialized) return;
  const wasmInput = await resvgWasm;
  await initWasm(wasmInput);
  wasmInitialized = true;
}
__name(initResvg, "initResvg");
function toBytes(input) {
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (typeof input === "string") {
    const base64 = input.startsWith("data:") ? input.split(",")[1] : input;
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }
  return new Uint8Array(0);
}
__name(toBytes, "toBytes");
var C = {
  maroon: "#2d0a1f",
  maroonLight: "#3d0f2f",
  gold: "#c9a227",
  goldDark: "#b8860b",
  cream: "#faf8f3",
  creamAlt: "#f0ebe0",
  text: "#1a1a2e",
  white: "#ffffff",
  border: "#e0d5c0"
};
var COL = {
  date: { x: 0, w: 44 },
  day: { x: 44, w: 36 },
  fajrS: { x: 80, w: 50 },
  fajrJ: { x: 130, w: 50 },
  sunrise: { x: 180, w: 54 },
  dhuhrS: { x: 234, w: 50 },
  dhuhrJ: { x: 284, w: 50 },
  asrS: { x: 334, w: 50 },
  asrJ: { x: 384, w: 50 },
  maghrib: { x: 434, w: 64 },
  ishaS: { x: 498, w: 50 },
  ishaJ: { x: 548, w: 50 }
};
var TABLE_W = 598;
var H1 = 20;
var H2 = 14;
var HEADER_H = H1 + H2;
var ROW_H = 16;
var PRAYER_GROUPS = [
  { name: "FAJR", x: COL.fajrS.x, w: COL.fajrS.w + COL.fajrJ.w, subs: [{ label: "START", x: COL.fajrS.x, w: COL.fajrS.w }, { label: "JAMAT", x: COL.fajrJ.x, w: COL.fajrJ.w }], headerSub: "(SUHOOR)" },
  { name: "SUNRISE", x: COL.sunrise.x, w: COL.sunrise.w, subs: [{ label: "", x: COL.sunrise.x, w: COL.sunrise.w }] },
  { name: "DHUHR", x: COL.dhuhrS.x, w: COL.dhuhrS.w + COL.dhuhrJ.w, subs: [{ label: "START", x: COL.dhuhrS.x, w: COL.dhuhrS.w }, { label: "JAMAT", x: COL.dhuhrJ.x, w: COL.dhuhrJ.w }] },
  { name: "ASR", x: COL.asrS.x, w: COL.asrS.w + COL.asrJ.w, subs: [{ label: "START", x: COL.asrS.x, w: COL.asrS.w }, { label: "JAMAT", x: COL.asrJ.x, w: COL.asrJ.w }] },
  { name: "MAGHRIB", x: COL.maghrib.x, w: COL.maghrib.w, subs: [{ label: "JAMAT", x: COL.maghrib.x, w: COL.maghrib.w }], headerSub: "(IFTAAR)" },
  { name: "ISHA", x: COL.ishaS.x, w: COL.ishaS.w + COL.ishaJ.w, subs: [{ label: "START", x: COL.ishaS.x, w: COL.ishaS.w }, { label: "JAMAT", x: COL.ishaJ.x, w: COL.ishaJ.w }] }
];
var DATA_CELLS = [
  { col: COL.fajrS, key: "fajrStart" },
  { col: COL.fajrJ, key: "fajrJamat", bold: true },
  { col: COL.sunrise, key: "sunrise" },
  { col: COL.dhuhrS, key: "dhuhrStart" },
  { col: COL.dhuhrJ, key: "dhuhrJamat", bold: true },
  { col: COL.asrS, key: "asrStart" },
  { col: COL.asrJ, key: "asrJamat", bold: true },
  { col: COL.maghrib, key: "maghribJamat", bold: true },
  { col: COL.ishaS, key: "ishaStart" },
  { col: COL.ishaJ, key: "ishaJamat", bold: true }
];
var FONTS = font_paths_default;
function getGlyphPaths(char, font) {
  if (char === " ") return null;
  const glyph = font[char];
  if (!glyph || glyph === null) {
    const upper = char.toUpperCase();
    if (font[upper] && font[upper] !== null) return font[upper];
    return null;
  }
  return glyph;
}
__name(getGlyphPaths, "getGlyphPaths");
function svgText(text, x, y, fontSize, fill, font, anchor = "left") {
  const meta = font._meta;
  if (!meta) return "";
  const scale = fontSize / meta.unitsPerEm;
  const advances = [];
  let totalWidth = 0;
  for (const char of text) {
    const glyph = getGlyphPaths(char, font);
    let adv;
    if (glyph && glyph.aw) {
      adv = glyph.aw * scale;
    } else if (char === " ") {
      adv = fontSize * 0.25;
    } else if (glyph) {
      adv = (glyph.x2 - glyph.x1) * scale;
    } else {
      adv = fontSize * 0.3;
    }
    advances.push(adv);
    totalWidth += adv;
  }
  let offsetX = 0;
  if (anchor === "middle") offsetX = -totalWidth / 2;
  else if (anchor === "right") offsetX = -totalWidth;
  const baselineOffset = (meta.ascender - Math.abs(meta.descender)) / 2 * scale;
  const paths = [];
  let cursorX = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const glyph = getGlyphPaths(char, font);
    if (glyph && glyph.d) {
      const tx = (x + offsetX + cursorX).toFixed(2);
      const ty = (y + baselineOffset).toFixed(2);
      paths.push(`<path d="${glyph.d}" transform="translate(${tx},${ty}) scale(${scale.toFixed(6)},${(-scale).toFixed(6)})" fill="${fill}"/>`);
    }
    cursorX += advances[i];
  }
  return paths.join("\n");
}
__name(svgText, "svgText");
function el(tag, attrs, children) {
  const attrStr = Object.entries(attrs).filter(([, v]) => v !== void 0).map(([k, v]) => `${k}="${v}"`).join(" ");
  if (children) return `<${tag} ${attrStr}>${children}</${tag}>`;
  return `<${tag} ${attrStr}/>`;
}
__name(el, "el");
function buildTable(times, monthName) {
  const f = FONTS.inter;
  const p = [];
  const tableH = HEADER_H + times.length * ROW_H;
  p.push(el("rect", { x: 0, y: 0, width: TABLE_W, height: tableH, fill: C.cream, stroke: C.maroon, "stroke-width": 2, rx: 4 }));
  p.push(`<clipPath id="tc"><rect x="1" y="1" width="${TABLE_W - 2}" height="${tableH - 2}" rx="3"/></clipPath>`);
  p.push('<g clip-path="url(#tc)">');
  p.push(el("rect", { x: 0, y: 0, width: TABLE_W, height: HEADER_H, fill: C.maroon }));
  const prayerX = COL.fajrS.x;
  const prayerW = COL.ishaJ.x + COL.ishaJ.w - prayerX;
  p.push(el("rect", { x: prayerX, y: H1, width: prayerW, height: H2, fill: C.maroonLight }));
  p.push(svgText(monthName, COL.date.x + 8, HEADER_H / 2, 8, C.white, f.regular, "left"));
  p.push(svgText("DAY", COL.day.x + COL.day.w / 2, HEADER_H / 2, 8, C.white, f.regular, "middle"));
  for (const g of PRAYER_GROUPS) {
    const cx = g.x + g.w / 2;
    if (g.headerSub) {
      p.push(svgText(g.name, cx, H1 * 0.36, 8, C.white, f.regular, "middle"));
      p.push(svgText(g.headerSub, cx, H1 * 0.76, 5.5, C.white, f.regular, "middle"));
    } else {
      p.push(svgText(g.name, cx, H1 / 2, 8, C.white, f.bold, "middle"));
    }
  }
  for (const g of PRAYER_GROUPS) {
    for (const sc of g.subs) {
      if (sc.label) {
        p.push(svgText(sc.label, sc.x + sc.w / 2, H1 + H2 / 2, 6, C.gold, f.bold, "middle"));
      }
    }
  }
  for (let i = 0; i < times.length; i++) {
    const t = times[i];
    const isFri = t.dayName === "FRI";
    const bg = isFri ? C.maroon : i % 2 === 0 ? C.cream : C.creamAlt;
    const dateC = isFri ? C.gold : C.text;
    const dayC = isFri ? C.gold : C.text;
    const timeC = isFri ? C.white : C.text;
    const maghribC = isFri ? C.gold : C.goldDark;
    const font = isFri ? f.bold : f.regular;
    const ry = HEADER_H + i * ROW_H;
    p.push(el("rect", { x: 0, y: ry, width: TABLE_W, height: ROW_H, fill: bg }));
    p.push(el("line", { x1: 0, y1: ry + ROW_H, x2: TABLE_W, y2: ry + ROW_H, stroke: C.border, "stroke-width": 0.5 }));
    p.push(svgText(String(t.dayNumber), COL.date.x + 8, ry + ROW_H / 2, 7, dateC, f.bold, "left"));
    p.push(svgText(t.dayName, COL.day.x + COL.day.w / 2, ry + ROW_H / 2, 7, dayC, font, "middle"));
    for (const dc of DATA_CELLS) {
      const val = String(t[dc.key] || "");
      if (!val) continue;
      const colFill = dc.key === "maghribJamat" ? maghribC : timeC;
      p.push(svgText(val, dc.col.x + dc.col.w / 2, ry + ROW_H / 2, 7, colFill, dc.bold ? f.bold : font, "middle"));
    }
  }
  p.push("</g>");
  return p.join("\n");
}
__name(buildTable, "buildTable");
function compositeRgba(dst, dstW, dstH, src, srcW, srcH, ox, oy) {
  for (let sy = 0; sy < srcH; sy++) {
    const dy = oy + sy;
    if (dy < 0 || dy >= dstH) continue;
    const dstRowStart = dy * dstW * 4;
    const srcRowStart = sy * srcW * 4;
    for (let sx = 0; sx < srcW; sx++) {
      const dx = ox + sx;
      if (dx < 0 || dx >= dstW) continue;
      const si = srcRowStart + sx * 4;
      const di = dstRowStart + dx * 4;
      const sa = src[si + 3];
      if (sa === 0) continue;
      const sr = src[si], sg = src[si + 1], sb = src[si + 2];
      const da = dst[di + 3];
      const dr = dst[di], dg = dst[di + 1], db = dst[di + 2];
      const saF = sa / 255;
      const daF = da / 255;
      const outA = saF + daF * (1 - saF);
      if (outA === 0) continue;
      dst[di] = Math.round((sr * saF + dr * daF * (1 - saF)) / outA);
      dst[di + 1] = Math.round((sg * saF + dg * daF * (1 - saF)) / outA);
      dst[di + 2] = Math.round((sb * saF + db * daF * (1 - saF)) / outA);
      dst[di + 3] = Math.round(outA * 255);
    }
  }
}
__name(compositeRgba, "compositeRgba");
function drawRect(buf, bufW, bufH, rx, ry, rw, rh, r, g, b, a) {
  for (let y = ry; y < ry + rh && y < bufH; y++) {
    for (let x = rx; x < rx + rw && x < bufW; x++) {
      const i = (y * bufW + x) * 4;
      const srcA = a / 255;
      const dstA = buf[i + 3] / 255;
      const outA = srcA + dstA * (1 - srcA);
      if (outA === 0) continue;
      buf[i] = Math.round((r * srcA + buf[i] * dstA * (1 - srcA)) / outA);
      buf[i + 1] = Math.round((g * srcA + buf[i + 1] * dstA * (1 - srcA)) / outA);
      buf[i + 2] = Math.round((b * srcA + buf[i + 2] * dstA * (1 - srcA)) / outA);
      buf[i + 3] = Math.round(outA * 255);
    }
  }
}
__name(drawRect, "drawRect");
async function buildTableSvg(times, monthLabel) {
  const tableH = HEADER_H + times.length * ROW_H;
  const content = buildTable(times, monthLabel);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${TABLE_W}" height="${tableH}" viewBox="0 0 ${TABLE_W} ${tableH}">${content}</svg>`;
}
__name(buildTableSvg, "buildTableSvg");
async function renderTablePng() {
  await initResvg();
  const f = FONTS.inter;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="200" viewBox="0 0 600 200"><rect x="0" y="0" width="600" height="200" fill="#2d0a1f"/>${svgText("INTER BOLD 24", 300, 50, 24, "#ffffff", f.bold, "middle")}${svgText("inter regular 16", 300, 100, 16, "#c9a227", f.regular, "middle")}${svgText("5:30 12:45", 300, 150, 12, "#ffffff", f.regular, "middle")}</svg>`;
  const resvg = new Resvg2(svg, { fitTo: { mode: "width", value: 600 } });
  const pixmap = resvg.render();
  const rgba = new Uint8Array(pixmap.pixels);
  return import_upng_js.default.encode([rgba.buffer], pixmap.width, pixmap.height, 0);
}
__name(renderTablePng, "renderTablePng");
async function generatePoster(times, year, monthLabel, _preferSvg = false) {
  await initResvg();
  const posterBytes = toBytes(posterPng);
  const posterImg = import_upng_js.default.decode(posterBytes);
  const posterRgba = new Uint8Array(import_upng_js.default.toRGBA8(posterImg)[0]);
  const { tableArea } = TEMPLATE_CONFIG;
  const tableH = HEADER_H + times.length * ROW_H;
  const tableContent = buildTable(times, monthLabel);
  const scaledW = Math.ceil(tableArea.width);
  const tableSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TABLE_W}" height="${tableH}" viewBox="0 0 ${TABLE_W} ${tableH}">${tableContent}</svg>`;
  const resvg = new Resvg2(tableSvg, { fitTo: { mode: "width", value: scaledW } });
  const pixmap = resvg.render();
  const tableRgba = new Uint8Array(pixmap.pixels);
  const outRgba = new Uint8Array(posterRgba);
  compositeRgba(outRgba, posterImg.width, posterImg.height, tableRgba, pixmap.width, pixmap.height, tableArea.x, tableArea.y);
  const resultPng = import_upng_js.default.encode([outRgba.buffer], posterImg.width, posterImg.height, 0);
  return { format: "png", data: resultPng };
}
__name(generatePoster, "generatePoster");
async function generateTemplatePreview() {
  const posterBytes = toBytes(posterPng);
  const posterImg = import_upng_js.default.decode(posterBytes);
  const posterRgba = new Uint8Array(import_upng_js.default.toRGBA8(posterImg)[0]);
  const { tableArea } = TEMPLATE_CONFIG;
  const outRgba = new Uint8Array(posterRgba);
  drawRect(
    outRgba,
    posterImg.width,
    posterImg.height,
    tableArea.x,
    tableArea.y,
    tableArea.width,
    480,
    255,
    255,
    255,
    200
  );
  const resultPng = import_upng_js.default.encode([outRgba.buffer], posterImg.width, posterImg.height, 0);
  return { format: "png", data: resultPng };
}
__name(generateTemplatePreview, "generateTemplatePreview");

// src/index.ts
var src_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.searchParams.has("template")) {
      try {
        const result = await generateTemplatePreview();
        return new Response(result.data, {
          headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=3600",
            "Content-Disposition": 'inline; filename="prayer-template-preview.png"'
          }
        });
      } catch (error) {
        console.error("Error generating template preview:", error);
        return new Response(`Error: ${error instanceof Error ? error.message : "Unknown error"}`, {
          status: 500,
          headers: { "Content-Type": "text/plain" }
        });
      }
    }
    if (url.searchParams.has("debug")) {
      try {
        const today = /* @__PURE__ */ new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 21);
        const { times: prayerTimes, monthLabel } = await fetchPrayerTimesForRange(startDate, endDate);
        const timesWithJamaat = calculateJamaatTimes(prayerTimes);
        const svg = await buildTableSvg(timesWithJamaat, monthLabel);
        return new Response(svg, {
          headers: { "Content-Type": "image/svg+xml" }
        });
      } catch (error) {
        return new Response(`Error: ${error instanceof Error ? error.message : "Unknown error"}`, {
          status: 500,
          headers: { "Content-Type": "text/plain" }
        });
      }
    }
    if (url.searchParams.has("tablepng")) {
      try {
        const result = await renderTablePng();
        return new Response(result, {
          headers: { "Content-Type": "image/png" }
        });
      } catch (error) {
        return new Response(`Error: ${error instanceof Error ? error.message : "Unknown error"}`, {
          status: 500,
          headers: { "Content-Type": "text/plain" }
        });
      }
    }
    try {
      const today = /* @__PURE__ */ new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 21);
      const { times: prayerTimes, monthLabel } = await fetchPrayerTimesForRange(startDate, endDate);
      const timesWithJamaat = calculateJamaatTimes(prayerTimes);
      const result = await generatePoster(timesWithJamaat, today.getFullYear(), monthLabel);
      return new Response(result.data, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=3600",
          "Content-Disposition": 'inline; filename="prayer-times-rolling.png"'
        }
      });
    } catch (error) {
      console.error("Error generating poster:", error);
      return new Response(`Error: ${error instanceof Error ? error.message : "Unknown error"}`, {
        status: 500,
        headers: { "Content-Type": "text/plain" }
      });
    }
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_checked_fetch();
init_modules_watch_stub();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_checked_fetch();
init_modules_watch_stub();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-2fOxmH/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
init_checked_fetch();
init_modules_watch_stub();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-2fOxmH/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
