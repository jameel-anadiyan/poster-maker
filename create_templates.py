import os
import math
import zlib
import struct

def make_png(width, height, get_pixel_rgba, output_path):
    """
    Creates a high-resolution PNG image with RGBA pixels.
    get_pixel_rgba(x, y) returns (r, g, b, a) where each is 0..255.
    """
    # Raw RGBA scanlines
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # Filter type 0 (None)
        for x in range(width):
            r, g, b, a = get_pixel_rgba(x, y)
            raw_data.extend((r, g, b, a))

    # Compress IDAT chunk
    idat_data = zlib.compress(bytes(raw_data), level=6)

    def make_chunk(chunk_type, data):
        length = len(data)
        chunk = struct.pack('>I', length) + chunk_type + data
        crc = zlib.crc32(chunk_type + data) & 0xffffffff
        chunk += struct.pack('>I', crc)
        return chunk

    png_bytes = bytearray(b'\x89PNG\r\n\x1a\n')
    
    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0) # 8-bit RGBA
    png_bytes.extend(make_chunk(b'IHDR', ihdr_data))
    
    # IDAT
    png_bytes.extend(make_chunk(b'IDAT', idat_data))
    
    # IEND
    png_bytes.extend(make_chunk(b'IEND', b''))

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'wb') as f:
        f.write(png_bytes)
    print(f"Generated {output_path} ({width}x{height})")

def generate_polaroid():
    W, H = 800, 1000
    # Cutout region: x in [60, 740], y in [60, 740]
    cut_x1, cut_y1, cut_x2, cut_y2 = 60, 60, 740, 740
    
    def pixel(x, y):
        # Check inside cutout
        if cut_x1 <= x <= cut_x2 and cut_y1 <= y <= cut_y2:
            return (0, 0, 0, 0) # Completely transparent
        
        # Border rounded corners (outer)
        r_outer = 24
        if x < r_outer and y < r_outer and (x - r_outer)**2 + (y - r_outer)**2 > r_outer**2:
            return (0, 0, 0, 0)
        if x > W - r_outer and y < r_outer and (x - (W - r_outer))**2 + (y - r_outer)**2 > r_outer**2:
            return (0, 0, 0, 0)
        if x < r_outer and y > H - r_outer and (x - r_outer)**2 + (y - (H - r_outer))**2 > r_outer**2:
            return (0, 0, 0, 0)
        if x > W - r_outer and y > H - r_outer and (x - (W - r_outer))**2 + (y - (H - r_outer))**2 > r_outer**2:
            return (0, 0, 0, 0)
        
        # Inner cutout border line (dark subtle inner shadow)
        if (abs(x - cut_x1) <= 2 or abs(x - cut_x2) <= 2) and (cut_y1 <= y <= cut_y2):
            return (180, 180, 190, 255)
        if (abs(y - cut_y1) <= 2 or abs(y - cut_y2) <= 2) and (cut_x1 <= x <= cut_x2):
            return (180, 180, 190, 255)
            
        # Paper texture / off-white gradient
        v = int(248 + 7 * (y / H))
        
        # Bottom caption bar area (accent stripe)
        if y > 820 and y < 826 and 100 <= x <= 700:
            return (99, 102, 241, 255) # Indigo accent
            
        return (v, v, v - 4, 255)

    make_png(W, H, pixel, 'assets/templates/polaroid.png')

def generate_gold_luxury():
    W, H = 800, 800
    cx, cy = W // 2, H // 2
    r_cutout = 310
    
    def pixel(x, y):
        dx = x - cx
        dy = y - cy
        dist = math.sqrt(dx*dx + dy*dy)
        
        if dist < r_cutout - 4:
            return (0, 0, 0, 0) # Transparent center
            
        if dist < r_cutout:
            # Gold rim transition
            t = (dist - (r_cutout - 4)) / 4
            gold_r = int(212 * t)
            gold_g = int(175 * t)
            gold_b = int(55 * t)
            return (gold_r, gold_g, gold_b, int(255 * t))
            
        if dist < r_cutout + 18:
            # Shiny Gold Inner Ring
            angle = math.atan2(dy, dx)
            shine = 0.5 + 0.5 * math.sin(angle * 4)
            r = int(212 + 40 * shine)
            g = int(175 + 40 * shine)
            b = int(55 + 30 * shine)
            return (min(255, r), min(255, g), min(255, b), 255)
            
        if dist < r_cutout + 26:
            # Dark groove
            return (40, 30, 10, 255)
            
        if dist < r_cutout + 36:
            # Outer Gold Accent Ring
            return (230, 190, 70, 255)

        # Background: Dark elegant luxury gradient (Obsidian & Deep Gold tint)
        diag = (x + y) / (W + H)
        base_r = int(18 + 15 * diag)
        base_g = int(20 + 12 * diag)
        base_b = int(28 + 15 * diag)
        
        # Corner geometric accents
        corner_dist = min(
            math.sqrt(x*x + y*y),
            math.sqrt((W-x)*(W-x) + y*y),
            math.sqrt(x*x + (H-y)*(H-y)),
            math.sqrt((W-x)*(W-x) + (H-y)*(H-y))
        )
        if corner_dist < 120:
            grid = (x // 12 + y // 12) % 2
            if grid == 0:
                base_r, base_g, base_b = 180, 145, 45
                
        return (base_r, base_g, base_b, 255)

    make_png(W, H, pixel, 'assets/templates/gold-luxury.png')

def generate_cyberpunk():
    W, H = 800, 1200
    cut_x1, cut_y1, cut_x2, cut_y2 = 80, 180, 720, 980
    
    def pixel(x, y):
        # Transparent cutout
        if cut_x1 <= x <= cut_x2 and cut_y1 <= y <= cut_y2:
            return (0, 0, 0, 0)
            
        # Cyberpunk neon frame border around cutout
        if (abs(x - cut_x1) <= 8 or abs(x - cut_x2) <= 8) and (cut_y1 - 8 <= y <= cut_y2 + 8):
            return (255, 0, 128, 255) # Neon Magenta
        if (abs(y - cut_y1) <= 8 or abs(y - cut_y2) <= 8) and (cut_x1 - 8 <= x <= cut_x2 + 8):
            return (0, 240, 255, 255) # Neon Cyan

        # Header banner
        if y < 150:
            if y < 10 or y > 140:
                return (0, 240, 255, 255)
            # Diagonal neon stripes
            if (x + y) % 40 < 6:
                return (255, 0, 128, 255)
            return (15, 15, 30, 255)

        # Footer area
        if y > 1010:
            if y > 1180:
                return (255, 0, 128, 255)
            if (x - y) % 30 < 4:
                return (0, 240, 255, 255)
            return (20, 20, 35, 255)

        # Dark cyberpunk body background
        bg_val = 18 + int(10 * (y / H))
        return (bg_val, bg_val + 4, bg_val + 14, 255)

    make_png(W, H, pixel, 'assets/templates/cyberpunk-vip.png')

def generate_floral_badge():
    W, H = 800, 800
    cx, cy = W // 2, H // 2
    cut_w, cut_h = 580, 580
    x1, y1 = cx - cut_w // 2, cy - cut_h // 2
    x2, y2 = cx + cut_w // 2, cy + cut_h // 2
    
    def pixel(x, y):
        # Cutout with rounded corners (r = 40)
        in_x = x1 <= x <= x2
        in_y = y1 <= y <= y2
        if in_x and in_y:
            r = 40
            # Corner distance check
            if x < x1 + r and y < y1 + r:
                if (x - (x1 + r))**2 + (y - (y1 + r))**2 < r**2:
                    return (0, 0, 0, 0)
            elif x > x2 - r and y < y1 + r:
                if (x - (x2 - r))**2 + (y - (y1 + r))**2 < r**2:
                    return (0, 0, 0, 0)
            elif x < x1 + r and y > y2 - r:
                if (x - (x1 + r))**2 + (y - (y2 - r))**2 < r**2:
                    return (0, 0, 0, 0)
            elif x > x2 - r and y > y2 - r:
                if (x - (x2 - r))**2 + (y - (y2 - r))**2 < r**2:
                    return (0, 0, 0, 0)
            else:
                return (0, 0, 0, 0)

        # Inner frame accent line
        dx = max(x1 - x, 0, x - x2)
        dy = max(y1 - y, 0, y - y2)
        dist_out = math.sqrt(dx*dx + dy*dy)
        if 2 <= dist_out <= 8:
            return (234, 179, 8, 255) # Emerald & Gold accent border

        # Emerald dark background with subtle circular pattern
        d_center = math.sqrt((x - cx)**2 + (y - cy)**2)
        ring = int(d_center // 20) % 2
        
        g = 60 + (10 if ring == 0 else 0)
        b = 50 + (10 if ring == 0 else 0)
        return (16, g, b, 255)

    make_png(W, H, pixel, 'assets/templates/floral-badge.png')

if __name__ == '__main__':
    print("Generating template PNGs...")
    generate_polaroid()
    generate_gold_luxury()
    generate_cyberpunk()
    generate_floral_badge()
    print("All templates generated successfully!")
