# 📸 Template Photo Overlay Editor

A responsive, mobile-friendly web application built with HTML5, CSS3, and vanilla JavaScript (Canvas API). It lets users choose a template image frame (PNG with transparent cutout), upload or capture a photo from their device, freely position, scale, and rotate the photo to align into the frame, and export the composite at the template's full native resolution.

---

## 🚀 How to Run Locally

You can run this project locally using any static web server or directly in your browser.

### Option 1: Using Node.js / `npx` (Recommended)
Run one of the following commands in the project root directory:

```bash
npx serve .
```
or
```bash
npx http-server .
```
Then open the displayed local URL (e.g. `http://localhost:3000`).

### Option 2: Using Python
If you have Python installed:

```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

---

## 📁 Folder Structure

```text
TEMPLATE CARD/
├── index.html            # Main HTML layout & user interface
├── styles.css            # Responsive dark-theme design system & glassmorphism UI
├── main.js               # Canvas rendering engine, multi-touch gestures, & HD exporter
├── create_templates.py   # Helper script to generate sample PNG templates
├── assets/
│   └── templates/        # PNG template frames with transparent cutouts
│       ├── polaroid.png
│       ├── gold-luxury.png
│       ├── cyberpunk-vip.png
│       └── floral-badge.png
└── README.md             # Project documentation & custom template guide
```

---

## ✨ Features

1. **Built-in Template Gallery**: Switch between pre-loaded frames (`polaroid`, `gold-luxury`, `cyberpunk-vip`, `floral-badge`).
2. **Camera & Gallery Upload**: Uses `<input type="file" accept="image/*" capture="environment">` to trigger the smartphone camera directly or select from photo gallery.
3. **Free-Move Gesture Editing**:
   - Touch pan / Mouse drag photo anywhere (even off-canvas).
   - Pinch-to-zoom on touch screens & mouse wheel zoom.
   - Touch rotation & UI range sliders / step buttons.
   - 5px fine-nudge direction pad for precise desktop & mobile adjustments.
4. **Z-Layer Order Toggle**:
   - **Template ABOVE Photo** (default): Photo sits behind frame and shows through transparent cut-out regions.
   - **Photo ABOVE Template**: Photo sits on top of frame.
5. **Native HD Export**: Composites off-screen at full native template dimensions (e.g., 800x1000 or 1080x1920) preserving transparent PNG quality with timestamped filenames (`overlay-YYYY-MM-DD...png`).

---

## 🎨 How to Add Your Own Custom Templates

You can easily drop in custom template images! Follow these simple steps:

### Step 1: Prepare Your Template Image (PNG)
1. **Format**: Must be saved as a **PNG** (to support alpha transparency).
2. **Resolution**: Create your image at high resolution (e.g., `1080x1080`, `1080x1350`, `1920x1080`).
3. **Transparent Cutout**: Erase/cut out the area where the user's photo should appear.
   - In **Canva**: Design your frame, select the photo region, delete elements, and export as **PNG with Transparent Background**.
   - In **Photoshop / Photopea / GIMP / Figma**: Select the photo area, delete pixels to reveal the transparent checkerboard background, and export as **PNG-24**.

### Step 2: Add Image to Project
Save your custom PNG image into the `assets/templates/` folder (e.g., `assets/templates/my-custom-frame.png`).

### Step 3: Register in `index.html`
Open `index.html` and add a new card item inside the `<div class="template-grid" id="templateGrid">`:

```html
<div class="template-card" data-src="assets/templates/my-custom-frame.png" data-name="My Frame">
  <img src="assets/templates/my-custom-frame.png" alt="My Custom Frame">
  <span class="template-name">My Frame</span>
</div>
```

That's it! Refresh your browser and your new template will immediately appear in the selection carousel.
