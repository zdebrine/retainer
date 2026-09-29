/* @ds-bundle: {"format":4,"namespace":"RetainerDesignSystem_385d60","components":[{"name":"Cluster","sourcePath":"components/graph/Cluster.jsx"},{"name":"Node","sourcePath":"components/graph/Node.jsx"},{"name":"Rule","sourcePath":"components/graph/Rule.jsx"},{"name":"Button","sourcePath":"components/hud/Button.jsx"},{"name":"Status","sourcePath":"components/hud/Status.jsx"},{"name":"Decision","sourcePath":"components/panels/Decision.jsx"},{"name":"Ledger","sourcePath":"components/panels/Ledger.jsx"},{"name":"Panel","sourcePath":"components/panels/Panel.jsx"}],"sourceHashes":{"components/graph/Cluster.jsx":"998ca62ede20","components/graph/Node.jsx":"b7517533c8e3","components/graph/Rule.jsx":"83238637f9fe","components/hud/Button.jsx":"5681d38f5874","components/hud/Status.jsx":"426ffc8b4c7d","components/panels/Decision.jsx":"7fb737ca1076","components/panels/Ledger.jsx":"f92e945b8bf7","components/panels/Panel.jsx":"590fc88d79cc","ui_kits/space-desktop/App.jsx":"971221d8dd91","ui_kits/space-desktop/Hud.jsx":"d8fe4769cb62","ui_kits/space-desktop/Space.jsx":"2297d8b024aa","ui_kits/space-desktop/graph.js":"8446a554641e","ui_kits/space-phone/PhoneApp.jsx":"60ca6618f9c6"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.RetainerDesignSystem_385d60 = window.RetainerDesignSystem_385d60 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/graph/Cluster.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const HUE = {
  money: "var(--money)",
  people: "var(--people)",
  attention: "var(--attention)"
};
const PLANE = {
  far: {
    opacity: 0.4,
    blur: true
  },
  mid: {
    opacity: 0.65,
    blur: false
  },
  near: {
    opacity: 1,
    blur: false
  }
};
function Cluster({
  name,
  label,
  width = 520,
  height = 196,
  nodes = [],
  edges = [],
  className = "",
  style,
  children,
  ...rest
}) {
  const hue = HUE[name] || "var(--ink)";
  const byId = {};
  nodes.forEach(n => {
    byId[n.id] = n;
  });
  const fid = "rt-blur-" + name;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ["rt-cluster", className].filter(Boolean).join(" "),
    style: {
      position: "relative",
      width,
      height,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 " + width + " " + height,
    width: width,
    height: height,
    xmlns: "http://www.w3.org/2000/svg"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("filter", {
    id: fid,
    x: "-50%",
    y: "-50%",
    width: "200%",
    height: "200%"
  }, /*#__PURE__*/React.createElement("feGaussianBlur", {
    stdDeviation: "2"
  }))), /*#__PURE__*/React.createElement("g", null, edges.map((e, i) => {
    const a = byId[e.from],
      b = byId[e.to];
    if (!a || !b) return null;
    const cross = e.cross;
    return /*#__PURE__*/React.createElement("line", {
      key: i,
      x1: a.x,
      y1: a.y,
      x2: b.x,
      y2: b.y,
      stroke: cross ? "var(--dim)" : e.fault ? "var(--fault)" : hue,
      strokeWidth: cross ? 0.6 : 0.8,
      strokeDasharray: e.dashed ? "3 3" : undefined,
      opacity: e.opacity != null ? e.opacity : cross ? 0.3 : 0.4
    });
  })), nodes.map(n => {
    const p = PLANE[n.plane || "near"];
    const lit = n.lit;
    return /*#__PURE__*/React.createElement("g", {
      key: n.id
    }, lit ? /*#__PURE__*/React.createElement("circle", {
      cx: n.x,
      cy: n.y,
      r: (n.r || 6) + 9,
      fill: "none",
      stroke: "rgba(255,255,255,.5)",
      strokeWidth: "1"
    }) : null, /*#__PURE__*/React.createElement("circle", {
      cx: n.x,
      cy: n.y,
      r: n.r || 6,
      fill: lit ? "var(--lit)" : n.rule ? "none" : hue,
      stroke: n.rule ? "var(--ink)" : undefined,
      strokeWidth: n.rule ? 1 : undefined,
      opacity: lit ? 1 : p.opacity,
      filter: !lit && p.blur ? "url(#" + fid + ")" : undefined
    }), n.tag ? /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("line", {
      x1: n.x + (n.r || 6) + 4,
      y1: n.y,
      x2: n.x + (n.r || 6) + 28,
      y2: n.y,
      stroke: lit ? "var(--lit)" : hue,
      strokeWidth: "0.8",
      opacity: "0.6"
    }), /*#__PURE__*/React.createElement("text", {
      x: n.x + (n.r || 6) + 34,
      y: n.y + 4,
      fill: lit ? "var(--lit)" : "var(--ink)",
      fontFamily: "var(--font-mono)",
      fontSize: "11",
      fontWeight: "500",
      letterSpacing: ".14em"
    }, n.tag)) : null);
  })), label !== null ? /*#__PURE__*/React.createElement("span", {
    className: "rt-micro rt-micro--" + name,
    style: {
      position: "absolute",
      left: 0,
      top: 0
    }
  }, label || name) : null, children);
}
Object.assign(__ds_scope, { Cluster });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/graph/Cluster.jsx", error: String((e && e.message) || e) }); }

// components/graph/Node.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Node({
  cluster,
  plane = "near",
  size = 14,
  lit,
  breathe,
  rule,
  tag,
  tagTone,
  className = "",
  style,
  ...rest
}) {
  const cls = ["rt-node", lit ? "rt-node--lit" : rule ? "rt-node--rule" : cluster ? "rt-node--" + cluster : "", lit || rule ? "" : "rt-node--" + plane, breathe ? "rt-node--breathe" : "", className].filter(Boolean).join(" ");
  const dot = /*#__PURE__*/React.createElement("span", _extends({
    className: cls,
    style: {
      width: size,
      height: size,
      ...style
    }
  }, rest));
  if (!tag) return dot;
  const tone = tagTone || (lit ? "lit" : rule ? "ink" : cluster);
  return /*#__PURE__*/React.createElement("span", {
    className: "rt-node-tag"
  }, dot, /*#__PURE__*/React.createElement("span", {
    className: "rt-node-tag__leader",
    style: {
      color: "var(--" + (tone === "ink" ? "ink" : tone) + ")",
      marginLeft: 6
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "rt-micro rt-micro--" + tone,
    style: {
      marginLeft: 6
    }
  }, tag));
}
Object.assign(__ds_scope, { Node });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/graph/Node.jsx", error: String((e && e.message) || e) }); }

// components/graph/Rule.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Rule({
  text,
  source,
  loose,
  selected,
  onSelect,
  className = "",
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ["rt-rule", className].filter(Boolean).join(" "),
    style: {
      display: "flex",
      gap: "var(--space-3)",
      alignItems: "flex-start",
      cursor: onSelect ? "pointer" : undefined,
      opacity: selected === false ? 0.45 : 1,
      ...style
    },
    onClick: onSelect
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Node, {
    rule: true,
    size: 14,
    style: {
      marginTop: 5,
      flex: "none",
      borderStyle: loose ? "dashed" : "solid"
    }
  }), /*#__PURE__*/React.createElement("p", {
    className: "rt-rule__text" + (loose ? " rt-rule__text--loose" : "")
  }, text, source ? /*#__PURE__*/React.createElement("span", {
    className: "rt-rule__src"
  }, source) : null));
}
Object.assign(__ds_scope, { Rule });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/graph/Rule.jsx", error: String((e && e.message) || e) }); }

// components/hud/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const VARIANT = {
  fill: "rt-btn--fill",
  outline: "",
  quiet: "rt-btn--quiet"
};
function Button({
  variant = "outline",
  href,
  disabled,
  className = "",
  children,
  ...rest
}) {
  const cls = ["rt-btn", VARIANT[variant] || "", className].filter(Boolean).join(" ");
  if (href) return /*#__PURE__*/React.createElement("a", _extends({
    className: cls,
    href: href
  }, rest), children);
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls,
    type: "button",
    disabled: disabled
  }, rest), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/hud/Button.jsx", error: String((e && e.message) || e) }); }

// components/hud/Status.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Status({
  needsYou = 0,
  clusters,
  lastPass,
  className = "",
  ...rest
}) {
  const lit = needsYou > 0;
  const counts = clusters ? ["money", "people", "attention"].filter(k => clusters[k] != null).map(k => clusters[k] + " " + k).join(" · ") : null;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ["rt-status", className].filter(Boolean).join(" ")
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "rt-status__slot"
  }, /*#__PURE__*/React.createElement("span", {
    className: "rt-status__dot" + (lit ? " rt-status__dot--lit" : "")
  }), /*#__PURE__*/React.createElement("span", {
    style: lit ? {
      color: "var(--lit)"
    } : undefined
  }, lit ? needsYou + " needs you" : "nothing needs you")), counts ? /*#__PURE__*/React.createElement("span", null, counts) : null, lastPass ? /*#__PURE__*/React.createElement("span", null, "last pass " + lastPass) : null);
}
Object.assign(__ds_scope, { Status });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/hud/Status.jsx", error: String((e && e.message) || e) }); }

// components/panels/Ledger.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Ledger({
  from,
  at,
  to = "Now",
  ticks = [],
  selected,
  entries = [],
  width,
  onScrub,
  className = "",
  style,
  ...rest
}) {
  const sel = selected != null ? selected : ticks.length - 1;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ["rt-ledger", className].filter(Boolean).join(" "),
    style: {
      width,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "rt-ledger__head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "rt-micro"
  }, from), /*#__PURE__*/React.createElement("span", {
    className: "rt-micro rt-micro--lit"
  }, at), /*#__PURE__*/React.createElement("span", {
    className: "rt-micro"
  }, to)), /*#__PURE__*/React.createElement("div", {
    className: "rt-ledger__track"
  }, ticks.map((t, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "rt-ledger__tick" + (i === sel ? " rt-ledger__tick--lit" : ""),
    style: {
      left: (typeof t === "number" ? t : t.at) + "%",
      cursor: onScrub ? "pointer" : undefined
    },
    onClick: onScrub ? () => onScrub(i) : undefined
  })), ticks.length ? /*#__PURE__*/React.createElement("span", {
    className: "rt-ledger__handle",
    style: {
      left: "calc(" + (typeof ticks[sel] === "number" ? ticks[sel] : ticks[sel].at) + "% - 14px)"
    }
  }) : null), entries.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-5)"
    }
  }, entries.map((e, i) => /*#__PURE__*/React.createElement("div", {
    className: "rt-ledger__entry",
    key: i
  }, /*#__PURE__*/React.createElement("span", {
    className: "rt-ledger__time"
  }, e.time), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "rt-ledger__what"
  }, e.what), e.why ? /*#__PURE__*/React.createElement("p", {
    className: "rt-ledger__why"
  }, e.why) : null)))) : null);
}
Object.assign(__ds_scope, { Ledger });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/panels/Ledger.jsx", error: String((e && e.message) || e) }); }

// components/panels/Panel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Panel({
  name,
  tag,
  tagTone = "dim",
  body,
  figure,
  rows = [],
  actions,
  lit,
  width,
  className = "",
  style,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ["rt-panel", lit ? "rt-panel--lit" : "", className].filter(Boolean).join(" "),
    style: {
      width,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "rt-panel__head"
  }, /*#__PURE__*/React.createElement("p", {
    className: "rt-panel__title"
  }, name), tag ? /*#__PURE__*/React.createElement("span", {
    className: "rt-micro rt-micro--" + tagTone
  }, tag) : null), body ? /*#__PURE__*/React.createElement("p", {
    className: "rt-panel__body"
  }, body) : null, figure ? /*#__PURE__*/React.createElement("div", {
    className: "rt-panel__fig"
  }, figure) : null, children, rows.map((r, i) => /*#__PURE__*/React.createElement("div", {
    className: "rt-panel__row",
    key: i,
    style: i === 0 && !children ? {
      marginTop: "var(--space-3)"
    } : undefined
  }, /*#__PURE__*/React.createElement("span", null, r.label), /*#__PURE__*/React.createElement("span", null, r.value))), actions ? /*#__PURE__*/React.createElement("div", {
    className: "rt-panel__actions"
  }, actions) : null);
}
Object.assign(__ds_scope, { Panel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/panels/Panel.jsx", error: String((e && e.message) || e) }); }

// components/panels/Decision.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Decision({
  name,
  body,
  current,
  proposed,
  currentLabel = "Current",
  proposedLabel = "Proposed",
  rule,
  ruleSource,
  terms,
  termsLabel = "Term",
  acceptLabel = "Accept",
  declineLabel = "Decline",
  onAccept,
  onDecline,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement(__ds_scope.Panel, _extends({
    name: name,
    tag: "needs you",
    tagTone: "lit",
    body: body,
    lit: true,
    className: className,
    rows: terms ? [{
      label: termsLabel,
      value: terms
    }] : [],
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(__ds_scope.Button, {
      variant: "fill",
      onClick: onAccept
    }, acceptLabel), /*#__PURE__*/React.createElement(__ds_scope.Button, {
      onClick: onDecline
    }, declineLabel))
  }, rest), current != null || proposed != null ? /*#__PURE__*/React.createElement("div", {
    className: "rt-cmp"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "rt-cmp__label"
  }, currentLabel), /*#__PURE__*/React.createElement("b", {
    className: "rt-cmp__fig"
  }, current)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "rt-cmp__label"
  }, proposedLabel), /*#__PURE__*/React.createElement("b", {
    className: "rt-cmp__fig"
  }, proposed))) : null, rule ? /*#__PURE__*/React.createElement("blockquote", {
    className: "rt-quote"
  }, rule, ruleSource ? /*#__PURE__*/React.createElement("span", {
    className: "rt-quote__src"
  }, ruleSource) : null) : null);
}
Object.assign(__ds_scope, { Decision });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/panels/Decision.jsx", error: String((e && e.message) || e) }); }

// ui_kits/space-desktop/App.jsx
try { (() => {
// Retainer on desktop: the space you fly. Click any node to open it where it sits.
const {
  Panel,
  Decision,
  Ledger,
  Rule,
  Button
} = window.RetainerDesignSystem_385d60;
const W = 1440,
  H = 900;
function App() {
  const graph = window.RT_GRAPH;
  const [view, setView] = React.useState("space");
  const [open, setOpen] = React.useState(null);
  const [litPath, setLitPath] = React.useState(null);
  const [att, setAtt] = React.useState("pending"); // pending | accepted | declined
  const [selectedRule, setSelectedRule] = React.useState(null);
  const [tick, setTick] = React.useState(graph.ledger.ticks.length - 1);
  const needsYou = att === "pending" ? 1 : 0;
  const workingGraph = React.useMemo(() => {
    const g = JSON.parse(JSON.stringify(graph));
    g.detail = graph.detail;
    if (att !== "pending") {
      g.clusters[0].nodes = g.clusters[0].nodes.map(n => n.id === "att" ? {
        ...n,
        lit: false
      } : n);
    }
    return g;
  }, [att]);
  const detail = open ? graph.detail[open] : null;
  const pos = open ? window.absPos(workingGraph, open) : null;
  const followPath = ids => {
    setLitPath(ids);
    setOpen(null);
  };
  const ruleGoverned = selectedRule != null ? graph.rules[selectedRule].governs : null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: W,
      height: H,
      background: "var(--void)",
      overflow: "hidden",
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement(HudTop, {
    view: view,
    onChange: v => {
      setView(v);
      setOpen(null);
      setLitPath(null);
      setSelectedRule(null);
    }
  }), view === "space" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Space, {
    graph: workingGraph,
    width: W,
    height: H,
    selected: open,
    litPath: litPath,
    dimAll: !!litPath,
    onOpen: id => {
      setLitPath(null);
      setOpen(id === open ? null : id);
    }
  }), !open && !litPath && needsYou === 0 ? /*#__PURE__*/React.createElement("p", {
    style: {
      position: "absolute",
      left: "var(--space-7)",
      top: 190,
      margin: 0,
      maxWidth: 520,
      font: "var(--text-display)",
      letterSpacing: "-0.03em",
      color: "var(--ink)"
    }
  }, "Nothing needs you.") : null, litPath ? /*#__PURE__*/React.createElement("button", {
    onClick: () => setLitPath(null),
    style: {
      position: "absolute",
      left: "var(--space-7)",
      top: 190,
      background: "none",
      border: "none",
      padding: 0,
      cursor: "pointer",
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "rt-micro rt-micro--ink"
  }, "the path \xB7 click to clear")) : null, open && detail ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: Math.min(pos.x + 40, W - 420),
      top: Math.max(Math.min(pos.y - 60, H - 460), 120)
    }
  }, detail.lit ? /*#__PURE__*/React.createElement(Decision, {
    name: "AT&T",
    body: "Retainer negotiated a lower price for your internet. It will not accept on your behalf.",
    current: "$83",
    proposed: "$71",
    rule: "Negotiate internet and phone every 12 months if the price is under $75. Never accept a bundle.",
    ruleSource: "Rule 8 \xB7 in force since Mar 4",
    terms: "12 months \xB7 no bundle \xB7 no equipment fee",
    acceptLabel: "Accept $71",
    onAccept: () => {
      setAtt("accepted");
      setOpen(null);
    },
    onDecline: () => {
      setAtt("declined");
      setOpen(null);
    }
  }) : /*#__PURE__*/React.createElement(Panel, {
    name: detail.name,
    tag: detail.tag,
    tagTone: detail.cluster,
    body: detail.body,
    figure: detail.figure,
    rows: detail.rows || [],
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      onClick: () => setOpen(null)
    }, "Close"), detail.path ? /*#__PURE__*/React.createElement(Button, {
      variant: "quiet",
      onClick: () => followPath(detail.path)
    }, "Follow the path") : null)
  })) : null, /*#__PURE__*/React.createElement(HudBottom, {
    needsYou: needsYou,
    clusters: {
      money: 14,
      people: 31,
      attention: 9
    },
    lastPass: "4 min ago"
  })) : null, view === "rules" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Space, {
    graph: workingGraph,
    width: W,
    height: H,
    litPath: ruleGoverned,
    dimAll: !!ruleGoverned,
    onOpen: () => {}
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "var(--space-7)",
      top: 160,
      width: 420,
      background: "var(--panel)",
      border: "1px solid var(--hairline)",
      borderRadius: "var(--radius-panel)",
      padding: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "rt-micro"
  }, "standing instructions \xB7 5 lines"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-5)",
      marginTop: "var(--space-5)"
    }
  }, graph.rules.map((r, i) => /*#__PURE__*/React.createElement(Rule, {
    key: i,
    text: r.text,
    source: r.source,
    loose: r.loose,
    selected: selectedRule == null ? undefined : selectedRule === i,
    onSelect: () => setSelectedRule(selectedRule === i ? null : i)
  })))), /*#__PURE__*/React.createElement(HudBottom, {
    needsYou: needsYou,
    clusters: {
      money: 14,
      people: 31,
      attention: 9
    },
    lastPass: "4 min ago"
  })) : null, view === "ledger" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Space, {
    graph: workingGraph,
    width: W,
    height: H,
    onOpen: () => {},
    dimAll: true
  }), /*#__PURE__*/React.createElement(HudBottom, {
    needsYou: needsYou,
    clusters: {
      money: 14,
      people: 31,
      attention: 9
    },
    lastPass: "4 min ago"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--void)",
      paddingBottom: "var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement(Ledger, {
    from: graph.ledger.from,
    to: graph.ledger.to,
    at: graph.ledger.ticks[tick].label,
    ticks: graph.ledger.ticks.map(t => t.at),
    selected: tick,
    entries: graph.ledger.ticks[tick].entries,
    onScrub: setTick
  })))) : null);
}
const rootEl = document.getElementById("root");
ReactDOM.createRoot(rootEl).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/space-desktop/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/space-desktop/Hud.jsx
try { (() => {
// The HUD at the edges of the space: the wordmark, the view switch, the status strip.
const {
  Status
} = window.RetainerDesignSystem_385d60;
function Wordmark() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--text-title)",
      letterSpacing: "-0.02em",
      color: "var(--ink)"
    }
  }, "Retainer"), /*#__PURE__*/React.createElement("span", {
    className: "rt-micro"
  }, "sep 17 \xB7 4:36 pm"));
}
function ViewSwitch({
  view,
  onChange
}) {
  const items = [["space", "space"], ["rules", "rules"], ["ledger", "ledger"]];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-5)"
    }
  }, items.map(([k, label]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    onClick: () => onChange(k),
    style: {
      background: "none",
      border: "none",
      padding: 0,
      cursor: "pointer",
      font: "var(--text-micro)",
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: view === k ? "var(--ink)" : "var(--dim)"
    }
  }, label)));
}
function HudTop({
  view,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "var(--space-7)",
      right: "var(--space-7)",
      top: "var(--space-7)",
      display: "flex",
      alignItems: "baseline",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement(Wordmark, null), /*#__PURE__*/React.createElement(ViewSwitch, {
    view: view,
    onChange: onChange
  }));
}
function HudBottom({
  needsYou,
  clusters,
  lastPass,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "var(--space-7)",
      right: "var(--space-7)",
      bottom: "var(--space-7)"
    }
  }, children, /*#__PURE__*/React.createElement(Status, {
    needsYou: needsYou,
    clusters: clusters,
    lastPass: lastPass
  }));
}
Object.assign(window, {
  HudTop,
  HudBottom,
  Wordmark,
  ViewSwitch
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/space-desktop/Hud.jsx", error: String((e && e.message) || e) }); }

// ui_kits/space-desktop/Space.jsx
try { (() => {
// The graph canvas: three clusters in one space, with the cross-cluster edges drawn over them.
const {
  Cluster
} = window.RetainerDesignSystem_385d60;
function abs(graph, qid) {
  const [cname, nid] = qid.split(":");
  const c = graph.clusters.find(x => x.name === cname);
  if (!c) return null;
  const n = c.nodes.find(x => x.id === nid);
  if (!n) return null;
  return {
    x: c.origin.x + n.x,
    y: c.origin.y + n.y,
    r: n.r || 6
  };
}
function Space({
  graph,
  width,
  height,
  selected,
  litPath,
  onOpen,
  dimAll
}) {
  const pathSet = new Set(litPath || []);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: width,
    height: height,
    style: {
      position: "absolute",
      inset: 0,
      pointerEvents: "none"
    }
  }, graph.cross.map(([a, b], i) => {
    const p = abs(graph, a),
      q = abs(graph, b);
    if (!p || !q) return null;
    const on = pathSet.has(a) && pathSet.has(b);
    return /*#__PURE__*/React.createElement("line", {
      key: i,
      x1: p.x,
      y1: p.y,
      x2: q.x,
      y2: q.y,
      stroke: on ? "var(--ink)" : "var(--dim)",
      strokeWidth: on ? 0.9 : 0.6,
      opacity: dimAll && !on ? 0.08 : on ? 0.55 : 0.28,
      style: {
        transition: "opacity var(--duration-edge) var(--ease-edge)"
      }
    });
  })), graph.clusters.map(c => {
    const nodes = c.nodes.map(n => {
      const qid = c.name + ":" + n.id;
      const onPath = pathSet.has(qid);
      const isSel = selected === qid;
      return {
        ...n,
        tag: isSel || onPath || n.lit ? graph.detail[qid] ? graph.detail[qid].name : n.tag : null,
        r: (n.r || 6) * (isSel ? 1.15 : 1)
      };
    });
    const edges = c.edges.map(e => {
      const on = pathSet.has(c.name + ":" + e.from) && pathSet.has(c.name + ":" + e.to);
      return {
        ...e,
        opacity: dimAll ? on ? 0.7 : 0.06 : e.opacity
      };
    });
    return /*#__PURE__*/React.createElement("div", {
      key: c.name,
      style: {
        position: "absolute",
        left: c.origin.x,
        top: c.origin.y - 28,
        opacity: dimAll ? 0.85 : 1,
        transition: "opacity var(--duration-camera) var(--ease-camera)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        left: 0,
        top: 0
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        transform: "translateY(28px)"
      }
    }, /*#__PURE__*/React.createElement(Cluster, {
      name: c.name,
      label: c.label,
      width: c.width,
      height: c.height,
      nodes: nodes,
      edges: edges
    })));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0
    }
  }, graph.clusters.map(c => c.nodes.map(n => {
    const qid = c.name + ":" + n.id;
    const hit = (n.r || 6) + 14;
    return /*#__PURE__*/React.createElement("button", {
      key: qid,
      "aria-label": qid,
      onClick: () => onOpen(qid),
      style: {
        position: "absolute",
        left: c.origin.x + n.x - hit,
        top: c.origin.y + n.y - hit,
        width: hit * 2,
        height: hit * 2,
        borderRadius: "var(--radius-node)",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: 0
      }
    });
  }))));
}
Object.assign(window, {
  Space,
  absPos: abs
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/space-desktop/Space.jsx", error: String((e && e.message) || e) }); }

// ui_kits/space-desktop/graph.js
try { (() => {
// The graph the space shows. Consumers own layout; the components only style.
window.RT_GRAPH = {
  clusters: [{
    name: "money",
    label: "money",
    origin: {
      x: 140,
      y: 300
    },
    width: 520,
    height: 330,
    nodes: [{
      id: "att",
      x: 300,
      y: 140,
      r: 8,
      lit: true,
      tag: "AT&T"
    }, {
      id: "netflix",
      x: 120,
      y: 90,
      r: 7,
      tag: null
    }, {
      id: "adobe",
      x: 208,
      y: 220,
      r: 6
    }, {
      id: "chalkline",
      x: 386,
      y: 250,
      r: 5,
      plane: "mid"
    }, {
      id: "amex",
      x: 60,
      y: 200,
      r: 6
    }, {
      id: "rent",
      x: 430,
      y: 66,
      r: 7
    }, {
      id: "spotify",
      x: 240,
      y: 34,
      r: 4,
      plane: "mid"
    }, {
      id: "gym",
      x: 468,
      y: 176,
      r: 3,
      plane: "far"
    }, {
      id: "storage",
      x: 40,
      y: 300,
      r: 3,
      plane: "far"
    }, {
      id: "icloud",
      x: 150,
      y: 290,
      r: 4,
      plane: "mid"
    }],
    edges: [{
      from: "att",
      to: "netflix",
      opacity: .45
    }, {
      from: "att",
      to: "adobe",
      opacity: .45
    }, {
      from: "netflix",
      to: "spotify",
      opacity: .3
    }, {
      from: "adobe",
      to: "amex",
      opacity: .35
    }, {
      from: "amex",
      to: "netflix",
      opacity: .35
    }, {
      from: "adobe",
      to: "chalkline",
      opacity: .3
    }, {
      from: "att",
      to: "rent",
      opacity: .4
    }, {
      from: "chalkline",
      to: "gym",
      opacity: .25
    }, {
      from: "amex",
      to: "storage",
      opacity: .25
    }, {
      from: "adobe",
      to: "icloud",
      opacity: .3
    }, {
      from: "rent",
      to: "amex",
      opacity: .25
    }]
  }, {
    name: "people",
    label: "people",
    origin: {
      x: 780,
      y: 110
    },
    width: 470,
    height: 300,
    nodes: [{
      id: "martha",
      x: 180,
      y: 120,
      r: 7
    }, {
      id: "dev",
      x: 300,
      y: 60,
      r: 6
    }, {
      id: "sam",
      x: 90,
      y: 200,
      r: 6
    }, {
      id: "landlord",
      x: 380,
      y: 170,
      r: 6
    }, {
      id: "accountant",
      x: 250,
      y: 220,
      r: 5,
      plane: "mid"
    }, {
      id: "sister",
      x: 40,
      y: 90,
      r: 5,
      plane: "mid"
    }, {
      id: "old1",
      x: 420,
      y: 60,
      r: 3,
      plane: "far"
    }, {
      id: "old2",
      x: 150,
      y: 270,
      r: 3,
      plane: "far"
    }, {
      id: "old3",
      x: 340,
      y: 265,
      r: 3.5,
      plane: "far"
    }],
    edges: [{
      from: "martha",
      to: "dev",
      opacity: .4
    }, {
      from: "martha",
      to: "sam",
      opacity: .4
    }, {
      from: "dev",
      to: "landlord",
      opacity: .3
    }, {
      from: "sam",
      to: "accountant",
      opacity: .3
    }, {
      from: "martha",
      to: "sister",
      opacity: .35
    }, {
      from: "dev",
      to: "old1",
      opacity: .25
    }, {
      from: "accountant",
      to: "old3",
      opacity: .22
    }, {
      from: "sam",
      to: "old2",
      opacity: .22
    }, {
      from: "landlord",
      to: "accountant",
      opacity: .28
    }]
  }, {
    name: "attention",
    label: "attention",
    origin: {
      x: 830,
      y: 500
    },
    width: 420,
    height: 270,
    nodes: [{
      id: "inbox",
      x: 160,
      y: 110,
      r: 8
    }, {
      id: "feeds",
      x: 280,
      y: 60,
      r: 6
    }, {
      id: "slack",
      x: 70,
      y: 190,
      r: 6
    }, {
      id: "news",
      x: 320,
      y: 180,
      r: 5,
      plane: "mid"
    }, {
      id: "alerts",
      x: 210,
      y: 210,
      r: 4,
      plane: "mid"
    }, {
      id: "push",
      x: 370,
      y: 110,
      r: 3,
      plane: "far"
    }, {
      id: "rss",
      x: 40,
      y: 70,
      r: 3,
      plane: "far"
    }],
    edges: [{
      from: "inbox",
      to: "feeds",
      opacity: .4
    }, {
      from: "inbox",
      to: "slack",
      opacity: .4
    }, {
      from: "feeds",
      to: "news",
      opacity: .3
    }, {
      from: "inbox",
      to: "alerts",
      opacity: .32
    }, {
      from: "news",
      to: "push",
      opacity: .25
    }, {
      from: "slack",
      to: "rss",
      opacity: .22
    }, {
      from: "alerts",
      to: "news",
      opacity: .25
    }]
  }],
  // cross-cluster edges, in cluster-qualified ids
  cross: [["money:att", "people:landlord"], ["money:netflix", "attention:feeds"], ["money:amex", "people:accountant"], ["attention:inbox", "people:martha"], ["money:adobe", "attention:slack"]],
  detail: {
    "money:att": {
      name: "AT&T",
      cluster: "money",
      lit: true
    },
    "money:netflix": {
      name: "Netflix",
      cluster: "money",
      tag: "money · cancelled",
      body: "Cancelled by email on Sep 17. A three-month pause was offered instead and refused. Retainer watches for the Sep 21 charge; if it does not arrive this node goes dark.",
      figure: "$22.99",
      rows: [{
        label: "Last used",
        value: "74 days ago"
      }, {
        label: "Since",
        value: "Mar 2023"
      }, {
        label: "Ledger",
        value: "3 entries"
      }],
      path: ["money:netflix", "money:amex", "money:adobe"]
    },
    "money:adobe": {
      name: "Adobe CC",
      cluster: "money",
      tag: "money · watching",
      body: "Renews Oct 2 at the annual rate. Used 9 days in the last 60, which is above the cancel line.",
      figure: "$59.99",
      rows: [{
        label: "Renews",
        value: "Oct 2"
      }, {
        label: "Used",
        value: "9 of 60 days"
      }]
    },
    "money:amex": {
      name: "Amex Platinum",
      cluster: "money",
      tag: "money · account",
      body: "The card three of your subscriptions bill to. Retainer reads the statement; it does not hold the card.",
      figure: "$695/yr",
      rows: [{
        label: "Statement",
        value: "Sep 12"
      }, {
        label: "Billing here",
        value: "3 nodes"
      }]
    },
    "money:rent": {
      name: "Rent",
      cluster: "money",
      tag: "money · fixed",
      body: "Paid by transfer on the first. Retainer does not negotiate this and has no rule that touches it.",
      figure: "$2,400",
      rows: [{
        label: "Next",
        value: "Oct 1"
      }]
    },
    "people:martha": {
      name: "Martha R.",
      cluster: "people",
      tag: "people · close",
      body: "You have written 14 times this month, she has written 11. Nothing here needs you.",
      rows: [{
        label: "Last",
        value: "2 days ago"
      }, {
        label: "Channels",
        value: "mail · phone"
      }]
    },
    "people:landlord": {
      name: "Ridge Property",
      cluster: "people",
      tag: "people · counterparty",
      body: "Holds the lease and the rent node. Retainer sends the notices and keeps the replies.",
      rows: [{
        label: "Last",
        value: "Sep 1"
      }, {
        label: "Governs",
        value: "rent"
      }]
    },
    "people:accountant": {
      name: "K. Oyelaran",
      cluster: "people",
      tag: "people · counterparty",
      body: "Receives the statement export each quarter. The next one is queued for Oct 4.",
      rows: [{
        label: "Next send",
        value: "Oct 4"
      }]
    },
    "attention:inbox": {
      name: "Inbox",
      cluster: "attention",
      tag: "attention · filtered",
      body: "412 arrived this week, 19 reached you. The rest matched a rule and were filed without a notification.",
      figure: "19 of 412",
      rows: [{
        label: "Filed",
        value: "393"
      }, {
        label: "Rule",
        value: "Rule 2"
      }]
    },
    "attention:feeds": {
      name: "Feeds",
      cluster: "attention",
      tag: "attention · muted",
      body: "Muted between 9:00 and 18:00 on weekdays. Retainer does not read them for you.",
      rows: [{
        label: "Sources",
        value: "11"
      }]
    },
    "attention:slack": {
      name: "Slack",
      cluster: "attention",
      tag: "attention · app",
      body: "Notifications off except direct messages from the people cluster.",
      rows: [{
        label: "Exceptions",
        value: "6 people"
      }]
    }
  },
  rules: [{
    text: "Cancel anything I have not used in 60 days unless it is on the keep list.",
    source: "Rule 6",
    governs: ["money:netflix", "money:adobe", "money:chalkline"]
  }, {
    text: "Negotiate internet and phone every 12 months if the price is under $75. Never accept a bundle.",
    source: "Rule 8 · in force since Mar 4",
    governs: ["money:att"]
  }, {
    text: "File anything that is not from a person I have written to. Do not notify me.",
    source: "Rule 2",
    governs: ["attention:inbox", "attention:feeds"]
  }, {
    text: "Refuse retention offers that pause instead of cancel.",
    source: "Rule 9",
    governs: ["money:netflix"]
  }, {
    text: "Mute feeds between 9:00 and 18:00 on weekdays.",
    source: "Rule 4",
    loose: true,
    governs: ["attention:feeds", "attention:news"]
  }],
  ledger: {
    from: "Sep 1",
    to: "Now",
    ticks: [{
      at: 8,
      label: "Sep 3 · 9:10 am",
      entries: [{
        time: "9:10 am",
        what: "Storage plan downgraded",
        why: "Rule 6 · 61 days since last use"
      }]
    }, {
      at: 19,
      label: "Sep 6 · 2:04 pm",
      entries: [{
        time: "2:04 pm",
        what: "Gym membership cancelled",
        why: "Rule 6 · 88 days since last use"
      }]
    }, {
      at: 31,
      label: "Sep 9 · 11:22 am",
      entries: [{
        time: "11:22 am",
        what: "393 messages filed",
        why: "Rule 2 · no prior thread"
      }]
    }, {
      at: 44,
      label: "Sep 12 · 6:40 am",
      entries: [{
        time: "6:40 am",
        what: "Amex statement read",
        why: "3 subscriptions billing here"
      }]
    }, {
      at: 58,
      label: "Sep 14 · 3:15 pm",
      entries: [{
        time: "3:15 pm",
        what: "Feeds rule loosened",
        why: "By you · edges dashed until 6:00"
      }]
    }, {
      at: 71,
      label: "Sep 16 · 10:02 am",
      entries: [{
        time: "10:02 am",
        what: "AT&T renegotiation opened",
        why: "Rule 8 · 12 months since last"
      }]
    }, {
      at: 88,
      label: "Sep 17 · 4:32 pm",
      entries: [{
        time: "4:32 pm",
        what: "Netflix cancelled",
        why: "Rule 6 · 74 days since last use"
      }, {
        time: "4:31 pm",
        what: "Netflix retention offer refused",
        why: "Rule 9 · a three-month pause at $2"
      }, {
        time: "4:30 pm",
        what: "Netflix cancellation requested",
        why: "By email, from your alias"
      }]
    }]
  }
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/space-desktop/graph.js", error: String((e && e.message) || e) }); }

// ui_kits/space-phone/PhoneApp.jsx
try { (() => {
// Retainer on phone: the cluster you are holding. One cluster fills the screen; the other two
// are edges leading off it. Panels slide up from the bottom.
const {
  Cluster,
  Panel,
  Decision,
  Status,
  Button,
  Rule,
  Ledger
} = window.RetainerDesignSystem_385d60;
const PW = 390,
  PH = 844;
const CLUSTERS = ["money", "people", "attention"];
function ClusterSwitch({
  active,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "var(--space-4)",
      right: "var(--space-4)",
      top: 64,
      display: "flex",
      gap: "var(--space-5)"
    }
  }, CLUSTERS.map(c => /*#__PURE__*/React.createElement("button", {
    key: c,
    onClick: () => onChange(c),
    style: {
      background: "none",
      border: "none",
      padding: "8px 0",
      cursor: "pointer",
      font: "var(--text-micro)",
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: active === c ? "var(--" + c + ")" : "var(--dim)"
    }
  }, c)));
}
const PHONE_NODES = {
  money: {
    nodes: [{
      id: "att",
      x: 195,
      y: 420,
      r: 8,
      lit: true,
      tag: "AT&T"
    }, {
      id: "netflix",
      x: 92,
      y: 272,
      r: 7
    }, {
      id: "adobe",
      x: 276,
      y: 264,
      r: 6
    }, {
      id: "amex",
      x: 120,
      y: 570,
      r: 6
    }, {
      id: "rent",
      x: 280,
      y: 578,
      r: 7
    }, {
      id: "spotify",
      x: 58,
      y: 424,
      r: 4,
      plane: "mid"
    }, {
      id: "icloud",
      x: 334,
      y: 418,
      r: 4,
      plane: "mid"
    }, {
      id: "gym",
      x: 200,
      y: 688,
      r: 3,
      plane: "far"
    }, {
      id: "storage",
      x: 200,
      y: 168,
      r: 3,
      plane: "far"
    }],
    edges: [{
      from: "att",
      to: "netflix",
      opacity: .45
    }, {
      from: "att",
      to: "adobe",
      opacity: .45
    }, {
      from: "att",
      to: "amex",
      opacity: .4
    }, {
      from: "att",
      to: "rent",
      opacity: .35
    }, {
      from: "netflix",
      to: "spotify",
      opacity: .3
    }, {
      from: "adobe",
      to: "icloud",
      opacity: .3
    }, {
      from: "amex",
      to: "gym",
      opacity: .22
    }, {
      from: "netflix",
      to: "storage",
      opacity: .22
    }, {
      from: "amex",
      to: "rent",
      opacity: .28
    }]
  },
  people: {
    nodes: [{
      id: "martha",
      x: 195,
      y: 420,
      r: 8,
      tag: "Martha R."
    }, {
      id: "dev",
      x: 100,
      y: 272,
      r: 6
    }, {
      id: "sam",
      x: 290,
      y: 284,
      r: 6
    }, {
      id: "landlord",
      x: 300,
      y: 566,
      r: 6
    }, {
      id: "accountant",
      x: 100,
      y: 578,
      r: 5,
      plane: "mid"
    }, {
      id: "sister",
      x: 195,
      y: 190,
      r: 5,
      plane: "mid"
    }, {
      id: "old1",
      x: 58,
      y: 424,
      r: 3,
      plane: "far"
    }, {
      id: "old2",
      x: 334,
      y: 418,
      r: 3,
      plane: "far"
    }, {
      id: "old3",
      x: 195,
      y: 688,
      r: 3,
      plane: "far"
    }],
    edges: [{
      from: "martha",
      to: "dev",
      opacity: .4
    }, {
      from: "martha",
      to: "sam",
      opacity: .4
    }, {
      from: "martha",
      to: "sister",
      opacity: .35
    }, {
      from: "sam",
      to: "landlord",
      opacity: .3
    }, {
      from: "dev",
      to: "accountant",
      opacity: .3
    }, {
      from: "dev",
      to: "old1",
      opacity: .22
    }, {
      from: "sam",
      to: "old2",
      opacity: .22
    }, {
      from: "accountant",
      to: "old3",
      opacity: .22
    }]
  },
  attention: {
    nodes: [{
      id: "inbox",
      x: 195,
      y: 420,
      r: 8,
      tag: "Inbox"
    }, {
      id: "feeds",
      x: 100,
      y: 272,
      r: 6
    }, {
      id: "slack",
      x: 290,
      y: 272,
      r: 6
    }, {
      id: "news",
      x: 290,
      y: 570,
      r: 5,
      plane: "mid"
    }, {
      id: "alerts",
      x: 100,
      y: 570,
      r: 4,
      plane: "mid"
    }, {
      id: "push",
      x: 195,
      y: 688,
      r: 3,
      plane: "far"
    }, {
      id: "rss",
      x: 195,
      y: 190,
      r: 3,
      plane: "far"
    }],
    edges: [{
      from: "inbox",
      to: "feeds",
      opacity: .4
    }, {
      from: "inbox",
      to: "slack",
      opacity: .4
    }, {
      from: "inbox",
      to: "news",
      opacity: .32
    }, {
      from: "inbox",
      to: "alerts",
      opacity: .32
    }, {
      from: "news",
      to: "push",
      opacity: .25
    }, {
      from: "feeds",
      to: "rss",
      opacity: .22
    }]
  }
};

// The other two clusters exist as edges leading off the display.
function OffEdges({
  active
}) {
  const others = CLUSTERS.filter(c => c !== active);
  return /*#__PURE__*/React.createElement("svg", {
    width: PW,
    height: PH,
    style: {
      position: "absolute",
      inset: 0,
      pointerEvents: "none"
    }
  }, /*#__PURE__*/React.createElement("line", {
    x1: 92,
    y1: 272,
    x2: -20,
    y2: 480,
    stroke: "var(--dim)",
    strokeWidth: "0.6",
    opacity: "0.3"
  }), /*#__PURE__*/React.createElement("line", {
    x1: 120,
    y1: 570,
    x2: -20,
    y2: 520,
    stroke: "var(--dim)",
    strokeWidth: "0.6",
    opacity: "0.22"
  }), /*#__PURE__*/React.createElement("line", {
    x1: 276,
    y1: 264,
    x2: PW + 20,
    y2: 640,
    stroke: "var(--dim)",
    strokeWidth: "0.6",
    opacity: "0.3"
  }), /*#__PURE__*/React.createElement("line", {
    x1: 280,
    y1: 578,
    x2: PW + 20,
    y2: 672,
    stroke: "var(--dim)",
    strokeWidth: "0.6",
    opacity: "0.28"
  }), /*#__PURE__*/React.createElement("text", {
    x: 16,
    y: 512,
    fill: "var(--dim)",
    fontFamily: "var(--font-mono)",
    fontSize: "11",
    fontWeight: "500",
    letterSpacing: ".14em"
  }, others[0].toUpperCase()), /*#__PURE__*/React.createElement("text", {
    x: PW - 96,
    y: 694,
    fill: "var(--dim)",
    fontFamily: "var(--font-mono)",
    fontSize: "11",
    fontWeight: "500",
    letterSpacing: ".14em"
  }, others[1].toUpperCase()));
}
function Sheet({
  children,
  onClose
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      background: "var(--void)"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      display: "block",
      width: 36,
      height: 4,
      margin: "10px auto 6px",
      borderRadius: "var(--radius-node)",
      background: "var(--hairline)",
      border: "none",
      padding: 0,
      cursor: "pointer"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 var(--space-4) var(--space-5)"
    }
  }, children));
}
function PhoneApp() {
  const graph = window.RT_GRAPH;
  const [active, setActive] = React.useState("money");
  const [open, setOpen] = React.useState(null);
  const [att, setAtt] = React.useState("pending");
  const set = PHONE_NODES[active];
  const nodes = set.nodes.map(n => n.id === "att" && att !== "pending" ? {
    ...n,
    lit: false,
    tag: null
  } : n);
  const needsYou = att === "pending" && active === "money" ? 1 : 0;
  const detail = open ? graph.detail[active + ":" + open] : null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: PW,
      height: PH,
      background: "var(--void)",
      overflow: "hidden",
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "var(--space-4)",
      right: "var(--space-4)",
      top: 22,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: "var(--text-ui)",
      color: "var(--ink)"
    }
  }, "Retainer"), /*#__PURE__*/React.createElement("span", {
    className: "rt-micro"
  }, "4:36 pm")), /*#__PURE__*/React.createElement(ClusterSwitch, {
    active: active,
    onChange: c => {
      setActive(c);
      setOpen(null);
    }
  }), /*#__PURE__*/React.createElement(OffEdges, {
    active: active
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: 0,
      top: 0
    }
  }, /*#__PURE__*/React.createElement(Cluster, {
    name: active,
    label: null,
    width: PW,
    height: PH,
    nodes: nodes,
    edges: set.edges
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0
    }
  }, nodes.map(n => {
    const hit = (n.r || 6) + 18;
    return /*#__PURE__*/React.createElement("button", {
      key: n.id,
      "aria-label": n.id,
      onClick: () => setOpen(open === n.id ? null : n.id),
      style: {
        position: "absolute",
        left: n.x - hit,
        top: n.y - hit,
        width: Math.max(hit * 2, 44),
        height: Math.max(hit * 2, 44),
        borderRadius: "var(--radius-node)",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: 0
      }
    });
  })), !open ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      left: "var(--space-4)",
      right: "var(--space-4)",
      bottom: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement(Status, {
    needsYou: needsYou,
    lastPass: "4 min ago"
  })) : null, open && detail ? /*#__PURE__*/React.createElement(Sheet, {
    onClose: () => setOpen(null)
  }, detail.lit && att === "pending" ? /*#__PURE__*/React.createElement(Decision, {
    name: "AT&T",
    width: "100%",
    body: "Retainer negotiated a lower price for your internet. It will not accept on your behalf.",
    current: "$83",
    proposed: "$71",
    rule: "Negotiate internet and phone every 12 months if the price is under $75. Never accept a bundle.",
    ruleSource: "Rule 8 \xB7 in force since Mar 4",
    terms: "12 months \xB7 no bundle \xB7 no equipment fee",
    acceptLabel: "Accept $71",
    onAccept: () => {
      setAtt("accepted");
      setOpen(null);
    },
    onDecline: () => {
      setAtt("declined");
      setOpen(null);
    },
    style: {
      padding: "var(--space-4)"
    }
  }) : /*#__PURE__*/React.createElement(Panel, {
    name: detail.name,
    tag: detail.tag,
    tagTone: detail.cluster,
    width: "100%",
    style: {
      padding: "var(--space-4)"
    },
    body: detail.body,
    figure: detail.figure,
    rows: detail.rows || [],
    actions: /*#__PURE__*/React.createElement(Button, {
      variant: "quiet",
      onClick: () => setOpen(null)
    }, "Close")
  })) : null);
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(PhoneApp, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/space-phone/PhoneApp.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Cluster = __ds_scope.Cluster;

__ds_ns.Node = __ds_scope.Node;

__ds_ns.Rule = __ds_scope.Rule;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Status = __ds_scope.Status;

__ds_ns.Decision = __ds_scope.Decision;

__ds_ns.Ledger = __ds_scope.Ledger;

__ds_ns.Panel = __ds_scope.Panel;

})();
