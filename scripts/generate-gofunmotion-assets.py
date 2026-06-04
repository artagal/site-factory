from __future__ import annotations

import math
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "apps" / "website" / "public"
BRAND_DIR = PUBLIC / "brand"
ICON_DIR = PUBLIC / "icons"
OG_DIR = PUBLIC / "og"
FF_BRAND_DIR = ROOT / "gofunmotion-ffai" / "assets" / "brand"

DARK = (7, 8, 22)
NAVY = (11, 16, 36)
CYAN = (34, 211, 238)
LIME = (190, 242, 100)
FUCHSIA = (217, 70, 239)
WHITE = (255, 255, 255)


def ensure_dirs() -> None:
    for directory in (BRAND_DIR, ICON_DIR, OG_DIR, FF_BRAND_DIR):
        directory.mkdir(parents=True, exist_ok=True)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        Path("C:/Windows/Fonts/seguisb.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"),
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default(size=size)


def lerp(a: int, b: int, t: float) -> int:
    return round(a + (b - a) * t)


def blend(c1: tuple[int, int, int], c2: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(lerp(a, b, t) for a, b in zip(c1, c2))


def vertical_gradient(size: tuple[int, int], stops: list[tuple[float, tuple[int, int, int]]]) -> Image.Image:
    width, height = size
    img = Image.new("RGB", size)
    draw = ImageDraw.Draw(img)
    for y in range(height):
        t = y / max(1, height - 1)
        left = stops[0]
        right = stops[-1]
        for idx in range(len(stops) - 1):
            if stops[idx][0] <= t <= stops[idx + 1][0]:
                left = stops[idx]
                right = stops[idx + 1]
                break
        span = max(0.001, right[0] - left[0])
        local = (t - left[0]) / span
        draw.line([(0, y), (width, y)], fill=blend(left[1], right[1], local))
    return img


def radial_glow(
    base: Image.Image,
    center: tuple[float, float],
    color: tuple[int, int, int],
    radius: float,
    strength: float,
) -> None:
    width, height = base.size
    glow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    pixels = glow.load()
    cx, cy = center
    for y in range(max(0, int(cy - radius)), min(height, int(cy + radius))):
        for x in range(max(0, int(cx - radius)), min(width, int(cx + radius))):
            dist = math.hypot(x - cx, y - cy) / radius
            if dist <= 1:
                alpha = int(255 * strength * (1 - dist) ** 2)
                pixels[x, y] = (*color, alpha)
    base.alpha_composite(glow)


def rounded_mask(size: tuple[int, int], radius: int) -> Image.Image:
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0], size[1]), radius=radius, fill=255)
    return mask


def draw_centered_text(
    draw: ImageDraw.ImageDraw,
    text: str,
    box: tuple[int, int, int, int],
    text_font: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int] | tuple[int, int, int, int],
    spacing: int = 0,
) -> None:
    bbox = draw.multiline_textbbox((0, 0), text, font=text_font, spacing=spacing, align="center")
    x = box[0] + (box[2] - box[0] - (bbox[2] - bbox[0])) / 2
    y = box[1] + (box[3] - box[1] - (bbox[3] - bbox[1])) / 2
    draw.multiline_text((x, y), text, font=text_font, fill=fill, spacing=spacing, align="center")


def overlay_draw(base: Image.Image) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    return overlay, ImageDraw.Draw(overlay)


def make_icon(size: int, maskable: bool = False) -> Image.Image:
    scale = size / 1024
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    background = vertical_gradient((size, size), [(0, (13, 17, 43)), (0.5, (10, 29, 50)), (1, (8, 10, 25))]).convert("RGBA")
    radial_glow(background, (size * 0.26, size * 0.24), FUCHSIA, size * 0.72, 0.52)
    radial_glow(background, (size * 0.82, size * 0.24), CYAN, size * 0.66, 0.48)
    radial_glow(background, (size * 0.58, size * 0.82), LIME, size * 0.74, 0.44)

    radius = round((170 if maskable else 220) * scale)
    if maskable:
        canvas.alpha_composite(background)
    else:
        canvas.alpha_composite(background, (0, 0))
        canvas.putalpha(rounded_mask((size, size), radius))

    d = ImageDraw.Draw(canvas)
    pad = round(144 * scale)
    d.rounded_rectangle((pad, pad, size - pad, size - pad), radius=round(180 * scale), outline=(255, 255, 255, 58), width=max(2, round(4 * scale)))
    d.arc((round(198 * scale), round(210 * scale), round(826 * scale), round(826 * scale)), 206, 536, fill=(*CYAN, 225), width=max(6, round(30 * scale)))
    d.arc((round(258 * scale), round(262 * scale), round(766 * scale), round(770 * scale)), 38, 242, fill=(*LIME, 235), width=max(6, round(42 * scale)))

    ticket = [
        (round(354 * scale), round(378 * scale)),
        (round(695 * scale), round(316 * scale)),
        (round(742 * scale), round(576 * scale)),
        (round(398 * scale), round(640 * scale)),
    ]
    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.polygon([(x + round(18 * scale), y + round(24 * scale)) for x, y in ticket], fill=(0, 0, 0, 85))
    shadow = shadow.filter(ImageFilter.GaussianBlur(round(16 * scale)))
    canvas.alpha_composite(shadow)
    d = ImageDraw.Draw(canvas)
    d.polygon(ticket, fill=(255, 255, 255, 242))
    d.line((round(457 * scale), round(360 * scale), round(516 * scale), round(623 * scale)), fill=(7, 8, 22, 54), width=max(1, round(6 * scale)))
    d.ellipse((round(380 * scale), round(478 * scale), round(438 * scale), round(536 * scale)), fill=(*NAVY, 255))
    d.ellipse((round(672 * scale), round(424 * scale), round(730 * scale), round(482 * scale)), fill=(*NAVY, 255))

    text_font = font(round(188 * scale), bold=True)
    d.text((round(420 * scale), round(392 * scale)), "G", font=text_font, fill=NAVY)
    d.ellipse((round(691 * scale), round(276 * scale), round(764 * scale), round(349 * scale)), fill=(*LIME, 255))
    d.ellipse((round(705 * scale), round(290 * scale), round(750 * scale), round(335 * scale)), fill=(*WHITE, 195))
    return canvas


def make_splash_frame(width: int, height: int, phase: float, static: bool = False) -> Image.Image:
    img = vertical_gradient((width, height), [(0, (7, 8, 22)), (0.42, (8, 19, 42)), (1, (4, 8, 18))]).convert("RGBA")
    radial_glow(img, (width * (0.2 + 0.05 * math.sin(phase)), height * 0.2), FUCHSIA, width * 0.55, 0.4)
    radial_glow(img, (width * (0.82 + 0.04 * math.cos(phase * 0.8)), height * 0.26), CYAN, width * 0.52, 0.45)
    radial_glow(img, (width * 0.5, height * (0.76 + 0.04 * math.sin(phase * 1.4))), LIME, width * 0.58, 0.28)

    d = ImageDraw.Draw(img)
    overlay, od = overlay_draw(img)
    for i in range(0, height, 46):
        alpha = 16 if i % 92 else 28
        od.line((0, i, width, i), fill=(255, 255, 255, alpha), width=1)
    for i in range(0, width, 46):
        alpha = 14 if i % 92 else 25
        od.line((i, 0, i, height), fill=(255, 255, 255, alpha), width=1)
    img.alpha_composite(overlay)
    d = ImageDraw.Draw(img)

    cards = [
        ("Tonight", "$39", (0.13, 0.68), CYAN),
        ("Date", "$22", (0.57, 0.7), FUCHSIA),
        ("Family", "$20", (0.28, 0.79), LIME),
    ]
    for idx, (label, price, pos, accent) in enumerate(cards):
        slide = 0 if static else math.sin(phase + idx * 1.35) * width * 0.035
        x = int(width * pos[0] + slide)
        y = int(height * pos[1] + math.cos(phase * 0.8 + idx) * height * 0.012)
        card_w = int(width * 0.31)
        card_h = int(height * 0.07)
        overlay, od = overlay_draw(img)
        od.rounded_rectangle((x, y, x + card_w, y + card_h), radius=18, fill=(255, 255, 255, 30), outline=(255, 255, 255, 58), width=1)
        od.rounded_rectangle((x + 10, y + 10, x + 44, y + 44), radius=10, fill=(*accent, 230))
        img.alpha_composite(overlay)
        d = ImageDraw.Draw(img)
        d.text((x + 56, y + 12), label, font=font(max(16, width // 34), True), fill=(245, 248, 252))
        d.text((x + 56, y + 40), price, font=font(max(14, width // 42), True), fill=LIME)

    icon_size = int(width * 0.38)
    icon = make_icon(icon_size).resize((icon_size, icon_size), Image.Resampling.LANCZOS)
    angle = 0 if static else math.sin(phase) * 5
    icon = icon.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    icon_x = (width - icon.width) // 2
    icon_y = int(height * 0.21)
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.ellipse((icon_x + icon.width * 0.12, icon_y + icon.height * 0.68, icon_x + icon.width * 0.88, icon_y + icon.height * 0.9), fill=(0, 0, 0, 90))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    img.alpha_composite(shadow)
    img.alpha_composite(icon, (icon_x, icon_y))

    ring_pad = int(width * 0.07)
    ring_box = (
        icon_x - ring_pad,
        icon_y - ring_pad,
        icon_x + icon.width + ring_pad,
        icon_y + icon.height + ring_pad,
    )
    start = int((phase * 58) % 360)
    overlay, od = overlay_draw(img)
    od.arc(ring_box, start, start + 120, fill=(*LIME, 215), width=max(3, width // 95))
    od.arc(ring_box, start + 180, start + 268, fill=(*CYAN, 205), width=max(3, width // 115))
    img.alpha_composite(overlay)
    d = ImageDraw.Draw(img)

    title_font = font(width // 11, True)
    body_font = font(width // 27, True)
    small_font = font(width // 38, True)
    draw_centered_text(d, "GoFunMotion", (0, int(height * 0.44), width, int(height * 0.51)), title_font, WHITE)
    draw_centered_text(
        d,
        "Find something fun\nto do today.",
        (int(width * 0.09), int(height * 0.515), int(width * 0.91), int(height * 0.63)),
        body_font,
        (226, 232, 240),
        spacing=8,
    )
    pill_w = int(width * 0.48)
    pill_h = int(height * 0.058)
    pill_x = (width - pill_w) // 2
    pill_y = int(height * 0.635)
    d.rounded_rectangle((pill_x, pill_y, pill_x + pill_w, pill_y + pill_h), radius=pill_h // 2, fill=LIME)
    draw_centered_text(d, "Find My Plan", (pill_x, pill_y, pill_x + pill_w, pill_y + pill_h - 2), small_font, DARK)
    d.text((width // 2 - width // 5, int(height * 0.9)), "Deals. Plans. Local fun.", font=font(width // 38, True), fill=(176, 186, 201))
    return img.convert("RGB")


def make_og() -> Image.Image:
    width, height = 1200, 630
    img = vertical_gradient((width, height), [(0, (7, 8, 22)), (0.45, (9, 21, 48)), (1, (5, 9, 20))]).convert("RGBA")
    radial_glow(img, (230, 120), FUCHSIA, 520, 0.36)
    radial_glow(img, (930, 110), CYAN, 480, 0.42)
    radial_glow(img, (700, 560), LIME, 520, 0.3)
    d = ImageDraw.Draw(img)

    icon = make_icon(166)
    img.alpha_composite(icon, (78, 78))
    d.text((276, 96), "GoFunMotion Deals", font=font(48, True), fill=WHITE)
    d.text((276, 160), "Find something fun to do today.", font=font(62, True), fill=(236, 252, 203))
    d.multiline_text(
        (82, 280),
        "Local activity deals, last-minute plans, date night ideas,\nfamily fun, and booking requests in one place.",
        font=font(30, True),
        fill=(203, 213, 225),
        spacing=10,
    )

    deals = [("Tonight", "Pottery Date Night", "$39"), ("Friends", "Escape Room Slot", "$22"), ("Family", "Indoor Play Pass", "$20")]
    x = 82
    for tag, title, price in deals:
        overlay, od = overlay_draw(img)
        od.rounded_rectangle((x, 430, x + 310, 548), radius=24, fill=(255, 255, 255, 30), outline=(255, 255, 255, 62), width=1)
        od.rounded_rectangle((x + 22, 452, x + 112, 486), radius=17, fill=(*LIME, 238))
        img.alpha_composite(overlay)
        d = ImageDraw.Draw(img)
        draw_centered_text(d, tag, (x + 22, 452, x + 112, 486), font(18, True), DARK)
        d.text((x + 22, 502), title, font=font(23, True), fill=WHITE)
        d.text((x + 242, 450), price, font=font(31, True), fill=CYAN)
        x += 344

    return img.convert("RGB")


def write_svg_assets() -> None:
    mark = """<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" role="img" aria-label="GoFunMotion app mark">
  <defs>
    <linearGradient id="bg" x1="90" y1="40" x2="930" y2="980" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#33145f"/>
      <stop offset=".42" stop-color="#0b7892"/>
      <stop offset="1" stop-color="#070816"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="26" stdDeviation="28" flood-color="#000" flood-opacity=".35"/>
    </filter>
  </defs>
  <rect width="1024" height="1024" rx="220" fill="url(#bg)"/>
  <circle cx="740" cy="312" r="42" fill="#bef264"/>
  <path d="M229 519c54-221 311-340 503-216" fill="none" stroke="#22d3ee" stroke-width="34" stroke-linecap="round"/>
  <path d="M265 604c72 139 239 199 380 138" fill="none" stroke="#bef264" stroke-width="44" stroke-linecap="round"/>
  <g filter="url(#shadow)">
    <path d="M354 378 695 316l47 260-344 64z" fill="#fff"/>
    <circle cx="409" cy="507" r="31" fill="#070816"/>
    <circle cx="701" cy="453" r="31" fill="#070816"/>
    <path d="M457 360 516 623" stroke="#070816" stroke-opacity=".18" stroke-width="10"/>
    <text x="420" y="570" font-family="Arial, sans-serif" font-weight="900" font-size="190" fill="#070816">G</text>
  </g>
</svg>
"""
    wordmark = """<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="320" viewBox="0 0 1280 320" role="img" aria-label="GoFunMotion">
  <defs>
    <linearGradient id="fun" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#d946ef"/>
      <stop offset=".5" stop-color="#22d3ee"/>
      <stop offset="1" stop-color="#bef264"/>
    </linearGradient>
  </defs>
  <rect width="320" height="320" rx="72" fill="#070816"/>
  <path d="M75 164c18-75 105-116 170-73" fill="none" stroke="#22d3ee" stroke-width="13" stroke-linecap="round"/>
  <path d="M87 192c25 48 83 69 132 48" fill="none" stroke="#bef264" stroke-width="17" stroke-linecap="round"/>
  <path d="m116 118 111-20 15 85-112 21z" fill="#fff"/>
  <circle cx="134" cy="160" r="10" fill="#070816"/>
  <circle cx="229" cy="143" r="10" fill="#070816"/>
  <text x="139" y="183" font-family="Arial, sans-serif" font-size="63" font-weight="900" fill="#070816">G</text>
  <text x="372" y="198" font-family="Arial, sans-serif" font-size="116" font-weight="900" fill="#fff">Go</text>
  <text x="520" y="198" font-family="Arial, sans-serif" font-size="116" font-weight="900" fill="url(#fun)">Fun</text>
  <text x="738" y="198" font-family="Arial, sans-serif" font-size="116" font-weight="900" fill="#fff">Motion</text>
  <path d="M1132 164h96" stroke="#bef264" stroke-width="10" stroke-linecap="round"/>
</svg>
"""
    (BRAND_DIR / "gofunmotion-mark.svg").write_text(mark, encoding="utf-8")
    (BRAND_DIR / "gofunmotion-wordmark.svg").write_text(wordmark, encoding="utf-8")


def save_icons() -> None:
    sizes = [32, 48, 96, 180, 192, 512, 1024]
    for size in sizes:
        make_icon(size).save(ICON_DIR / f"gofunmotion-icon-{size}.png")
    make_icon(512, maskable=True).save(ICON_DIR / "gofunmotion-maskable-icon-512.png")
    make_icon(180).save(PUBLIC / "apple-touch-icon.png")
    make_icon(192).save(PUBLIC / "icon-192.png")
    make_icon(512).save(PUBLIC / "icon-512.png")
    make_icon(512, maskable=True).save(PUBLIC / "maskable-icon-512.png")
    ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    make_icon(256).save(PUBLIC / "favicon.ico", sizes=ico_sizes)


def save_splash_assets() -> None:
    static = make_splash_frame(1080, 1920, 0.6, static=True)
    static.save(BRAND_DIR / "gofunmotion-splash.png", optimize=True)

    frames = []
    frame_count = 36
    for i in range(frame_count):
        phase = (i / frame_count) * math.tau
        frame = make_splash_frame(540, 960, phase)
        frames.append(frame)
    frames[0].save(
        BRAND_DIR / "gofunmotion-splash-motion.gif",
        save_all=True,
        append_images=frames[1:],
        duration=62,
        loop=0,
        optimize=True,
    )
    frames[0].save(BRAND_DIR / "gofunmotion-splash-motion-preview.png", optimize=True)


def save_og() -> None:
    og = make_og()
    og.save(OG_DIR / "gofunmotion-og.png", optimize=True)


def mirror_flutterflow_assets() -> None:
    copies = {
        ICON_DIR / "gofunmotion-icon-1024.png": FF_BRAND_DIR / "gofunmotion-app-icon-1024.png",
        ICON_DIR / "gofunmotion-maskable-icon-512.png": FF_BRAND_DIR / "gofunmotion-maskable-icon-512.png",
        BRAND_DIR / "gofunmotion-splash.png": FF_BRAND_DIR / "gofunmotion-splash.png",
        BRAND_DIR / "gofunmotion-splash-motion.gif": FF_BRAND_DIR / "gofunmotion-splash-motion.gif",
        BRAND_DIR / "gofunmotion-mark.svg": FF_BRAND_DIR / "gofunmotion-mark.svg",
        OG_DIR / "gofunmotion-og.png": FF_BRAND_DIR / "gofunmotion-og.png",
    }
    for src, dst in copies.items():
        shutil.copyfile(src, dst)


def main() -> None:
    ensure_dirs()
    write_svg_assets()
    save_icons()
    save_splash_assets()
    save_og()
    mirror_flutterflow_assets()
    print("Generated GoFunMotion assets:")
    for path in [
        BRAND_DIR / "gofunmotion-mark.svg",
        ICON_DIR / "gofunmotion-icon-1024.png",
        PUBLIC / "favicon.ico",
        PUBLIC / "apple-touch-icon.png",
        BRAND_DIR / "gofunmotion-splash.png",
        BRAND_DIR / "gofunmotion-splash-motion.gif",
        OG_DIR / "gofunmotion-og.png",
        FF_BRAND_DIR / "gofunmotion-splash-motion.gif",
    ]:
        print(f"- {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
