#!/usr/bin/env python3
"""Masthead design gate — forbidden-list linter for a self-contained HTML page.

Usage: python3 tools/gate.py <file.html> [more.html ...] [--json]
Exit code 1 if any file has a FAIL. Standard library only.

Checks implement engine/skills/00-house-rules.md §9. Rules a sector may grant are
allowed per line with a marker comment on the same CSS line:  /* allow: gradient */
/* allow: glass */  /* allow: pill */  /* allow: shadow */  /* allow: radius */
"""
import sys, re, json, os, html as htmlmod, colorsys
from html.parser import HTMLParser

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = json.load(open(os.path.join(HERE, "fonts.json")))
PHRASES = json.load(open(os.path.join(HERE, "phrases.json")))

def norm(s): return re.sub(r"\s+", " ", s.strip().strip("'\"")).lower()
ALLOWED = {norm(f) for k in ("curated_free","curated_commercial","serif_granted_only","mono_data_only","generic_allowed") for f in FONTS[k]}
SERIF_ONLY = {norm(f) for f in FONTS["serif_granted_only"]}
BANNED_FONTS = {norm(f) for f in FONTS["banned_as_default"]}

EMOJI_RE = re.compile("[\U0001F300-\U0001FAFF\U00002600-\U000027BF\U0001F1E6-\U0001F1FF\U0001F900-\U0001F9FF]")

class TextGrab(HTMLParser):
    def __init__(self):
        super().__init__(); self.parts=[]; self.skip=0; self.h1=[]; self.in_h1=False
        self.media=0; self.first_section_media=None; self.section_depth=0; self.seen_sections=0
        self.icon_card_hits=0; self.stack=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag in ("style","script"): self.skip+=1
        if tag=="h1": self.in_h1=True
        if tag in ("img","video","picture","svg"):
            self.media+=1
        if "ph" in (a.get("class") or "").split() or a.get("data-slot"):
            self.media+=1
        if tag in ("section","header","main") and self.first_section_media is None:
            self.first_section_media=self.media; self.first_open=tag
        self.stack.append(tag)
    def handle_endtag(self, tag):
        if tag in ("style","script") and self.skip: self.skip-=1
        if tag=="h1": self.in_h1=False
        if getattr(self,"first_open",None)==tag and self.first_section_media is not None and self.first_section_media!=-1:
            # end of the first section/header: did it contain media?
            self.first_section_media = -1 if self.media>self.first_section_media else -2
            self.first_open=None
        if self.stack and self.stack[-1]==tag: self.stack.pop()
    def handle_data(self, data):
        if self.skip: return
        t=data.strip()
        if t:
            self.parts.append(t)
            if self.in_h1: self.h1.append(t)

def px(val):
    """Convert a CSS length token to px where possible."""
    m=re.match(r"(-?[\d.]+)(px|rem|em|%|vw|vh)?", val.strip())
    if not m: return None
    n=float(m.group(1)); u=m.group(2) or "px"
    if u=="px": return n
    if u in ("rem","em"): return n*16
    return None  # percentages etc handled by caller

def hex_to_hsl(h):
    h=h.lstrip("#")
    if len(h)==3: h="".join(c*2 for c in h)
    if len(h)!=6: return None
    r,g,b=(int(h[i:i+2],16)/255 for i in (0,2,4))
    hh,l,s=colorsys.rgb_to_hls(r,g,b)
    return hh*360,s,l

def check(path):
    src=open(path, encoding="utf-8", errors="replace").read()
    fails=[]; warns=[]
    def fail(rule,msg): fails.append({"rule":rule,"msg":msg})
    def warn(rule,msg): warns.append({"rule":rule,"msg":msg})

    css="\n".join(re.findall(r"<style[^>]*>(.*?)</style>", src, re.S|re.I))
    css+="\n"+"\n".join(re.findall(r'style="([^"]*)"', src, re.I))
    # linked local stylesheets
    for href in re.findall(r'<link[^>]+rel=["\']stylesheet["\'][^>]+href=["\']([^"\']+)["\']', src, re.I):
        p=os.path.join(os.path.dirname(path), href)
        if os.path.exists(p) and not href.startswith("http"): css+="\n"+open(p,encoding="utf-8",errors="replace").read()

    lines=css.splitlines()

    # --- shape: border-radius
    for ln in lines:
        if "allow: radius" in ln or "allow: pill" in ln: continue
        for m in re.finditer(r"border(?:-[a-z]+)*-radius\s*:\s*([^;}]+)", ln):
            vals=m.group(1).split()
            for v in vals:
                if v in ("50%","100%") or "9999" in v or "999px" in v or v.endswith("vmax") or v=="100vmax":
                    fail("pill","pill/circle radius '%s' — pills are not granted (00 §3)" % v); break
                p=px(v)
                if p is not None and p>6:
                    fail("radius","border-radius %s > 6px (00 §3)" % v); break
                if p is not None and 4<p<=6:
                    warn("radius","border-radius %s: only inputs/buttons may use 2–6px (00 §3)" % v)
    # --- gradients / glass / shadows
    for ln in lines:
        if re.search(r"(linear|radial|conic)-gradient", ln) and "allow: gradient" not in ln:
            fail("gradient","CSS gradient without a sector grant: %s" % ln.strip()[:80])
        if "backdrop-filter" in ln and "allow: glass" not in ln:
            fail("glass","backdrop-filter (glassmorphism) without a sector grant: %s" % ln.strip()[:80])
        if "allow: shadow" in ln: continue
        for m in re.finditer(r"box-shadow\s*:\s*([^;}]+)", ln):
            for shadow in m.group(1).split(","):
                toks=[t for t in shadow.split() if re.match(r"-?[\d.]+(px|rem|em)?$", t)]
                if len(toks)>=3:
                    blur=px(toks[2])
                    if blur is not None and blur>8: fail("shadow","box-shadow blur %s > 8px (00 §3)" % toks[2])
        if re.search(r"filter\s*:\s*[^;}]*blur\(", ln) and "drop-shadow" not in ln:
            warn("glow","filter: blur() — check it is not a glow/orb (00 §3)")
    # --- fonts
    fams=set()
    for m in re.finditer(r"font-family\s*:\s*([^;}]+)", css):
        for f in m.group(1).split(","):
            f=norm(f.replace("!important",""))
            if f and not f.startswith("var("): fams.add(f)
    for m in re.finditer(r"family=([^&\"']+)", src):
        for f in m.group(1).split("|"):
            fams.add(norm(f.split(":")[0].replace("+"," ")))
    for f in sorted(fams):
        if f in BANNED_FONTS: fail("font","'%s' is on the banned-as-default list (00 §2)" % f)
        elif f in SERIF_ONLY: warn("font","'%s' is a serif: allowed only where the sector grants it, weight ≥ 500 (00 §2)" % f)
        elif f not in ALLOWED: warn("font","'%s' is not on the curated list (tools/fonts.json)" % f)
    real=[f for f in fams if f not in {norm(g) for g in FONTS["generic_allowed"]}]
    if len(real)>2: warn("font","%d font families in use; maximum is two (00 §2)" % len(real))
    # --- type sizes
    for m in re.finditer(r"h1[^{]*\{([^}]*)\}", css):
        fs=re.search(r"font-size\s*:\s*([^;]+)", m.group(1))
        if fs:
            p=px(fs.group(1).split()[0])
            if p and p>72: fail("h1-size","h1 font-size %s > 72px (00 §2)" % fs.group(1).strip())
            if p and p<36: warn("h1-size","h1 font-size %s < 36px; brief range is 40–64px" % fs.group(1).strip())
        clamp=re.search(r"font-size\s*:\s*clamp\([^,]+,[^,]+,\s*([^)]+)\)", m.group(1))
        if clamp:
            p=px(clamp.group(1))
            if p and p>72: fail("h1-size","h1 clamp max %s > 72px (00 §2)" % clamp.group(1).strip())
    if re.search(r"text-transform\s*:\s*uppercase", css):
        for m in re.finditer(r"(h1|h2)[^{]*\{[^}]*text-transform\s*:\s*uppercase", css):
            fail("caps","uppercase %s heading — sentence case only (00 §2)" % m.group(1))
    # --- centred body text
    for m in re.finditer(r"(p|body|\.lead|\.sub)[^{]*\{[^}]*text-align\s*:\s*center", css):
        warn("centred","centred paragraph rule on '%s' — no centred body text over two lines (00 §4)" % m.group(0)[:40].replace("\n"," "))
    # --- colour: AI purple / purple-blue
    hexes=set(re.findall(r"#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b", css))
    purple=[h for h in hexes if (lambda t: t and 250<=t[0]<=290 and t[1]>0.35 and 0.25<t[2]<0.8)(hex_to_hsl(h))]
    if purple: fail("purple","purple-blue hues in palette (%s) — 'AI purple' is banned (00 §5)" % ", ".join(sorted(purple)[:4]))
    if "#000000" in hexes or re.search(r"color\s*:\s*#000\b", css) or re.search(r"background(?:-color)?\s*:\s*#000\b", css):
        warn("ink","pure black #000 used — ink should be a near-black (00 §5)")
    # --- text content
    tg=TextGrab(); tg.feed(src)
    text=" ".join(tg.parts); low=text.lower()
    for ph in PHRASES["banned"]:
        if re.search(r"\b"+re.escape(ph)+r"\b", low): fail("phrase","banned phrase '%s' in copy (00 §7)" % ph)
    for ph in PHRASES["warn"]:
        if re.search(r"\b"+re.escape(ph)+r"\b", low): warn("phrase","'%s' in copy — adjective, replace with a specific claim (00 §7)" % ph)
    if "!" in text: warn("exclaim","exclamation mark in copy (00 §7)")
    if EMOJI_RE.search(text) or EMOJI_RE.search(src): fail("emoji","emoji in page (00 §7)")
    if re.search(r"lorem ipsum|product name|your company|\[placeholder text\]", low): fail("content","lorem/placeholder copy — real content only (CLAUDE.md)")
    if not tg.h1: fail("h1","no h1 found")
    elif len(tg.h1)>1 and len(re.findall(r"<h1\b", src, re.I))>1: fail("h1","more than one h1 (06)")
    # --- hero media
    if tg.media==0:
        fail("hero","no media (img/video/placeholder) anywhere on the page — the hero must carry an image or product (00 §4)")
    elif tg.first_section_media==-2:
        # first block was probably a header; check whether any media appears in the first 40% of the markup instead
        bi=src.lower().find("<body"); body=src[bi:] if bi>=0 else src
        head=body[:int(len(body)*0.45)]
        if not re.search(r"<(img|video|picture|svg)\b|class=\"[^\"]*\bph\b|data-slot=", head):
            warn("hero","no media in the first half of the body — check the hero carries an image or product (00 §4)")
    # --- three icon cards heuristic
    for m in re.finditer(r"<(section|div)[^>]*>(?:(?!</\1>).)*?</\1>", src, re.S|re.I):
        block=m.group(0)
        if block.count("<svg")==3 and block.count("<h3")==3 and len(block)<6000:
            warn("icon-cards","a block with exactly three svg+h3 items — the three-icon-card pattern is banned (00 §4)"); break
    # --- viewport
    if "viewport" not in src: fail("viewport","missing meta viewport")
    return {"file":path,"fails":fails,"warns":warns}

def main():
    args=[a for a in sys.argv[1:] if not a.startswith("--")]
    as_json="--json" in sys.argv
    if not args:
        print(__doc__); sys.exit(2)
    results=[check(a) for a in args]
    if as_json:
        print(json.dumps(results, indent=2)); sys.exit(1 if any(r["fails"] for r in results) else 0)
    bad=False
    for r in results:
        status="FAIL" if r["fails"] else "PASS"
        bad|=bool(r["fails"])
        print(f"\n{status}  {r['file']}  ({len(r['fails'])} fail, {len(r['warns'])} warn)")
        for f in r["fails"]: print(f"  FAIL [{f['rule']}] {f['msg']}")
        for w in r["warns"]: print(f"  warn [{w['rule']}] {w['msg']}")
    print()
    sys.exit(1 if bad else 0)

if __name__=="__main__": main()
