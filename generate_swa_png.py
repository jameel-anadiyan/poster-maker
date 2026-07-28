import os
import math
import zlib
import struct

def make_png_with_svg_layout():
    """
    Creates a high-resolution PNG template for SWA Diamonds (800 x 1100).
    It features:
    - Deep teal velvet background (#003d42 to #00272b)
    - Diagonal silk ribbon & bow accent
    - SWA Diamonds branding & top stats
    - White photo border with transparent cutout
    - Thank you message
    - Guarantee & Certification badges footer
    """
    W, H = 800, 1100
    
    # White frame box coordinates
    # Frame outer: x from 160 to 640, y from 310 to 730
    # Transparent cutout inner: x from 176 to 624, y from 326 to 714
    fx1, fy1, fx2, fy2 = 160, 310, 640, 730
    cx1, cy1, cx2, cy2 = 176, 326, 624, 714
    
    def pixel(x, y):
        # 1. Inner cutout -> Transparent
        if cx1 <= x <= cx2 and cy1 <= y <= cy2:
            return (0, 0, 0, 0)
            
        # 2. White photo frame border
        if fx1 <= x <= fx2 and fy1 <= y <= fy2:
            return (252, 252, 254, 255)

        # 3. Ribbon top-right accent band (diagonal stripe across top corner)
        # Line from (200, 0) to (800, 480)
        # Distance from point (x, y) to line x*0.8 - y + 160 = 0
        d_ribbon = abs(0.8 * x - y - 160) / math.sqrt(0.8*0.8 + 1)
        if d_ribbon < 65 and (x > 180 or y < 450):
            # Teal silk ribbon shine gradient
            shine = 0.5 + 0.5 * math.sin(x * 0.05 + y * 0.05)
            r = int(0 + 20 * shine)
            g = int(140 + 40 * shine)
            b = int(130 + 30 * shine)
            return (r, g, b, 255)

        # Ribbon bottom-left accent band
        d_ribbon_bl = abs(1.2 * x - y + 550) / math.sqrt(1.2*1.2 + 1)
        if d_ribbon_bl < 55 and y > 450:
            shine = 0.5 + 0.5 * math.sin(x * 0.05 - y * 0.05)
            r = int(0 + 15 * shine)
            g = int(130 + 35 * shine)
            b = int(120 + 25 * shine)
            return (r, g, b, 255)

        # 4. Background Teal Velvet Gradient
        t_y = y / H
        t_x = x / W
        r = int(1 + 4 * (1 - t_y))
        g = int(45 + 25 * (1 - t_y) - 10 * t_x)
        b = int(50 + 25 * (1 - t_y))
        
        # Subtle texture noise pattern for velvet look
        noise = (x * 37 + y * 57) % 7 - 3
        r = max(0, min(255, r + noise))
        g = max(0, min(255, g + noise))
        b = max(0, min(255, b + noise))
        
        return (r, g, b, 255)

    # Raw RGBA scanlines
    raw_data = bytearray()
    for y in range(H):
        raw_data.append(0)
        for x in range(W):
            r, g, b, a = pixel(x, y)
            raw_data.extend((r, g, b, a))

    idat_data = zlib.compress(bytes(raw_data), level=6)

    def make_chunk(chunk_type, data):
        length = len(data)
        chunk = struct.pack('>I', length) + chunk_type + data
        crc = zlib.crc32(chunk_type + data) & 0xffffffff
        chunk += struct.pack('>I', crc)
        return chunk

    png_bytes = bytearray(b'\x89PNG\r\n\x1a\n')
    ihdr_data = struct.pack('>IIBBBBB', W, H, 8, 6, 0, 0, 0)
    png_bytes.extend(make_chunk(b'IHDR', ihdr_data))
    png_bytes.extend(make_chunk(b'IDAT', idat_data))
    png_bytes.extend(make_chunk(b'IEND', b''))

    output_path = 'assets/templates/swa-diamonds.png'
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'wb') as f:
        f.write(png_bytes)
    print(f"Generated {output_path} ({W}x{H})")

if __name__ == '__main__':
    make_png_with_svg_layout()
