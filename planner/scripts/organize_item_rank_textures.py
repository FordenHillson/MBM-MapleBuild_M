"""Generate missing rank frames and organize into planner/public/textures/item-rank."""
from __future__ import annotations

import shutil
from pathlib import Path

import numpy as np
from PIL import Image

SRC = Path(r"C:\Users\saetanpee\Desktop\MSM_Textures\_use\Texture2D")
OUT = Path(r"d:\backup\perso\MSMTest\test\planner\public\textures\item-rank")
GEN = SRC / "_generated"

# Void crimson → near-black (distinct from Mythic coral/magenta)
NEON_RED_TOP = np.array([72.0, 2.0, 4.0], dtype=np.float32)
NEON_RED_BOT = np.array([4.0, 0.0, 0.0], dtype=np.float32)
NEON_RED_SOLID = np.array([72.0, 2.0, 4.0], dtype=np.float32)
NEON_RED_RIM = np.array([220.0, 18.0, 12.0], dtype=np.float32)


def load_rgba(path: Path) -> np.ndarray:
    return np.array(Image.open(path).convert("RGBA"), dtype=np.float32)


def save_rgba(arr: np.ndarray, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGBA").save(path)


def frame_mask(rgba: np.ndarray, lum_min: float = 15.0) -> np.ndarray:
    rgb = rgba[..., :3]
    a = rgba[..., 3]
    lum = rgb.mean(axis=2)
    return (a > 10) & (lum > lum_min)


def sample_top_bot(rgba: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    m = frame_mask(rgba)
    ys, xs = np.where(m)
    h = rgba.shape[0]
    rgb = rgba[..., :3]
    top = rgb[ys[ys < h * 0.35], xs[ys < h * 0.35]]
    bot = rgb[ys[ys > h * 0.65], xs[ys > h * 0.65]]
    if len(top) == 0 or len(bot) == 0:
        mid = np.median(rgb[m], axis=0)
        return mid, mid
    return np.median(top, axis=0), np.median(bot, axis=0)


def recolor_frame_to_palette(
    src: np.ndarray,
    top: np.ndarray,
    bot: np.ndarray,
    *,
    solid: bool = False,
) -> np.ndarray:
    """Recolor non-black frame pixels; preserve relative luminance / bevel."""
    out = src.copy()
    m = frame_mask(src)
    rgb = src[..., :3]
    lum = rgb.mean(axis=2)
    vals = lum[m]
    vmin, vmax = float(vals.min()), float(vals.max())
    span = vmax - vmin

    h, w = src.shape[:2]
    yy = np.linspace(0.0, 1.0, h, dtype=np.float32)[:, None]
    yy = np.broadcast_to(yy, (h, w))

    if solid:
        base = np.broadcast_to(top[None, None, :], (h, w, 3)).copy()
    else:
        base = top[None, None, :] * (1.0 - yy[..., None]) + bot[None, None, :] * yy[..., None]

    if span < 2.0:
        # Flat source (e.g. gray86 solid) — use palette as-is
        colored = base
    else:
        t = np.clip((lum - vmin) / span, 0.0, 1.0)
        # Map original brightness onto palette (keep bevel highlights)
        shade = 0.55 + 0.55 * t
        colored = base * shade[..., None]
    out[m, :3] = colored[m]
    return out


def recolor_leaf_to_palette(src_rgb: np.ndarray, top: np.ndarray, bot: np.ndarray) -> np.ndarray:
    img = src_rgb.astype(np.float32)
    h, w, _ = img.shape
    r, g, b = img[..., 0], img[..., 1], img[..., 2]
    # Magenta/red family (and general colored pixels)
    colored = (np.maximum(r, np.maximum(g, b)) > 20) & ~(
        (np.abs(r - g) < 8) & (np.abs(g - b) < 8) & (r < 30)
    )
    # Prefer dominant channel pixels (not near-black)
    vmax_c = np.maximum(r, np.maximum(g, b))
    mask = colored & (vmax_c > 15)

    vals = vmax_c[mask]
    vmin, vmax = float(vals.min()), float(vals.max())
    t = np.clip((vmax_c - vmin) / max(vmax - vmin, 1e-6), 0.0, 1.0)

    yy = np.linspace(0.0, 1.0, h, dtype=np.float32)[:, None]
    yy = np.broadcast_to(yy, (h, w))
    base = top[None, None, :] * (1.0 - yy[..., None]) + bot[None, None, :] * yy[..., None]
    shade = 0.35 + 0.65 * t
    out = base * shade[..., None]
    local = t - 0.5
    out = out * (1.0 + 0.25 * local[..., None])

    result = img.copy()
    result[mask] = out[mask]
    return np.clip(result, 0, 255)


def main() -> None:
    GEN.mkdir(parents=True, exist_ok=True)
    for sub in ("summary", "table", "emblem"):
        (OUT / sub).mkdir(parents=True, exist_ok=True)

    # --- Sources ---
    gray_summary = load_rgba(SRC / "inven_item_lv_gray86.png")
    gray_table = load_rgba(SRC / "inven_item_lv_gray86 #175587.png")
    darkblue_summary = load_rgba(SRC / "inven_item_lv_darkblue86.png")
    pink_summary = load_rgba(SRC / "inven_item_lv_pink86.png")
    magenta_leaf = np.array(
        Image.open(SRC / "inven_item_lv_magenta_leaf.png").convert("RGB"),
        dtype=np.float32,
    )

    db_top, db_bot = sample_top_bot(darkblue_summary)
    pk_top, pk_bot = sample_top_bot(pink_summary)

    # Ancient/Necro table from gray table → darkblue palette
    ancient_table = recolor_frame_to_palette(gray_table, db_top, db_bot)
    save_rgba(ancient_table, GEN / "inven_item_lv_darkblue86_table.png")

    # Chaos/Absolab/Arcane table from gray table → pink palette
    chaos_table = recolor_frame_to_palette(gray_table, pk_top, pk_bot)
    save_rgba(chaos_table, GEN / "inven_item_lv_pink86_table.png")

    # Genesis summary: neon red → black vertical
    genesis_summary = recolor_frame_to_palette(
        gray_summary, NEON_RED_TOP, NEON_RED_BOT
    )
    save_rgba(genesis_summary, GEN / "inven_item_lv_genesis86.png")

    # Genesis table: neon red (keep bevel via luminance)
    genesis_table = recolor_frame_to_palette(
        gray_table, NEON_RED_SOLID, NEON_RED_SOLID, solid=True
    )
    save_rgba(genesis_table, GEN / "inven_item_lv_genesis86_table.png")

    # Genesis emblem leaf: neon red → black
    genesis_leaf = recolor_leaf_to_palette(magenta_leaf, NEON_RED_TOP, NEON_RED_BOT)
    leaf_path = GEN / "inven_item_lv_genesis_leaf.png"
    leaf_path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(genesis_leaf.astype(np.uint8), "RGB").save(leaf_path)

    # --- Organize into project (approach A) ---
    # summary (96 solid / gradient frames for สรุป+แก้ไข)
    summary_map = {
        "normal": SRC / "inven_item_lv_gray86.png",
        "rare": SRC / "inven_item_lv_blue86.png",
        "epic": SRC / "inven_item_lv_purple86.png",  # Magic
        "unique": SRC / "inven_item_lv_yellow86.png",
        "legendary": SRC / "inven_item_lv_green86.png",
        "mythic": SRC / "inven_item_lv_magenta86.png",  # Mystic
        "ancient": SRC / "inven_item_lv_darkblue86.png",
        "necro": SRC / "inven_item_lv_darkblue86.png",
        "root-abyss": SRC / "inven_item_lv_darkblue86.png",
        "chaos": SRC / "inven_item_lv_pink86.png",
        "absolab": SRC / "inven_item_lv_pink86.png",
        "arcane": SRC / "inven_item_lv_pink86.png",
        "dreamy-belt": SRC / "inven_item_lv_pink86.png",
        "genesis": GEN / "inven_item_lv_genesis86.png",
    }

    # table (86 frames for ตารางก่อนเข้าแก้ไข)
    table_map = {
        "normal": SRC / "inven_item_lv_gray86 #175587.png",
        "rare": SRC / "inven_item_lv_blue86 #175591.png",
        "epic": SRC / "inven_item_lv_purple86 #175582.png",
        "unique": SRC / "inven_item_lv_yellow86 #175586.png",
        "legendary": SRC / "inven_item_lv_green86 #175590.png",
        "mythic": SRC / "inven_item_lv_magenta86 #175581.png",
        "ancient": GEN / "inven_item_lv_darkblue86_table.png",
        "necro": GEN / "inven_item_lv_darkblue86_table.png",
        "root-abyss": GEN / "inven_item_lv_darkblue86_table.png",
        "chaos": GEN / "inven_item_lv_pink86_table.png",
        "absolab": GEN / "inven_item_lv_pink86_table.png",
        "arcane": GEN / "inven_item_lv_pink86_table.png",
        "dreamy-belt": GEN / "inven_item_lv_pink86_table.png",
        "genesis": GEN / "inven_item_lv_genesis86_table.png",
    }

    # emblem (leaf — ไอเทมที่มี Emblem)
    emblem_map = {
        "unique": SRC / "inven_item_lv_yellow_leaf.png",
        "legendary": SRC / "inven_item_lv_green_leaf.png",
        "mythic": SRC / "inven_item_lv_magenta_leaf.png",
        "ancient": SRC / "inven_item_lv_darkblue_leaf.png",
        "necro": SRC / "inven_item_lv_darkblue_leaf.png",
        "root-abyss": SRC / "inven_item_lv_darkblue_leaf.png",
        "chaos": SRC / "inven_item_lv_pink_leaf.png",
        "absolab": SRC / "inven_item_lv_pink_leaf.png",
        "arcane": SRC / "inven_item_lv_pink_leaf.png",
        "dreamy-belt": SRC / "inven_item_lv_pink_leaf.png",
        "genesis": GEN / "inven_item_lv_genesis_leaf.png",
    }

    def copy_map(mapping: dict[str, Path], folder: str) -> None:
        for name, src in mapping.items():
            dest = OUT / folder / f"{name}.png"
            shutil.copy2(src, dest)
            print(f"{folder}/{name}.png <- {src.name}")

    copy_map(summary_map, "summary")
    copy_map(table_map, "table")
    copy_map(emblem_map, "emblem")
    print("done ->", OUT)


if __name__ == "__main__":
    main()
