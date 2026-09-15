import os
import io
import cv2
import numpy as np
import urllib.request
from PIL import Image, ImageEnhance, ImageFilter

try:
    from rembg import remove, new_session
    rembg_session = new_session("isnet-general-use")
except Exception as e:
    print("rembg not available", e)

# The exact logic from service.py
def calculate_image_quality(img_data: bytes):
    nparr = np.frombuffer(img_data, np.uint8)
    cv_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
    
    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
    brightness_score = np.mean(gray)
    contrast_score = np.std(gray)
    
    norm_blur = float(min(100.0, max(0.0, (blur_score / 1000.0) * 100)))
    norm_brightness = float(min(100.0, max(0.0, (brightness_score / 255.0) * 100)))
    norm_contrast = float(min(100.0, max(0.0, (contrast_score / 128.0) * 100)))
    return {"blur_score": norm_blur, "brightness_score": norm_brightness, "contrast_score": norm_contrast}

def generate_test_image(name, w, h, bg_color, fg_color, add_noise=False, dark=False):
    import os
    os.makedirs("/tmp/artisanx_test", exist_ok=True)
    img = Image.new("RGBA", (w, h), bg_color)
    from PIL import ImageDraw
    d = ImageDraw.Draw(img)
    d.ellipse([w//4, h//4, 3*w//4, 3*h//4], fill=fg_color)
    if add_noise:
        for _ in range(1000):
            d.point((np.random.randint(0, w), np.random.randint(0, h)), fill=(255,255,255,100))
    if dark:
        img = ImageEnhance.Brightness(img).enhance(0.3)
    path = f"/tmp/artisanx_test/{name}.png"
    img.save(path)
    return path

test_images = [
    ("testA_woven", generate_test_image("testA", 800, 800, (200,200,200,255), (100,50,20,255))), 
    ("testB_wood", generate_test_image("testB", 800, 800, (255,255,255,255), (139,69,19,255), dark=True)), 
    ("testC_color", generate_test_image("testC", 800, 800, (200,200,200,255), (0,100,255,255))), 
    ("testD_textile", generate_test_image("testD", 800, 1600, (255,255,255,255), (255,0,0,255))), 
    ("testE_thin", generate_test_image("testE", 800, 800, (200,200,200,255), (255,215,0,255), add_noise=True)), 
    ("testF_smooth", generate_test_image("testF", 1600, 800, (200,200,200,255), (200,200,200,255))), 
]

for name, path in test_images:
    print(f"\nProcessing {name}...")
    with open(path, "rb") as f:
        img_data = f.read()
        
    orig_quality = calculate_image_quality(img_data)
    is_blurry = orig_quality["blur_score"] < 40.0
    is_dark = orig_quality["brightness_score"] < 40.0
    is_washed_out = orig_quality["contrast_score"] < 30.0
    
    print(f"[{name}] Blurry: {is_blurry}, Dark: {is_dark}, Washed out: {is_washed_out}")
    print(f"[{name}] Scores -> Blur: {orig_quality['blur_score']:.1f}, Brightness: {orig_quality['brightness_score']:.1f}, Contrast: {orig_quality['contrast_score']:.1f}")

    img = Image.open(io.BytesIO(img_data)).convert("RGBA")
    
    img = remove(
        img, 
        session=rembg_session,
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=10
    )
    
    alpha = img.split()[-1]
    bbox = alpha.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    r, g, b, a = img.split()
    rgb_img = Image.merge("RGB", (r, g, b))
    
    if is_dark or is_washed_out:
        print(f"[{name}] Applying CLAHE Luminance Correction...")
        cv_rgb = np.array(rgb_img)
        lab = cv2.cvtColor(cv_rgb, cv2.COLOR_RGB2LAB)
        l_chan, a_chan, b_chan = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=1.5, tileGridSize=(8, 8))
        l_eq = clahe.apply(l_chan)
        lab_eq = cv2.merge((l_eq, a_chan, b_chan))
        cv_rgb_eq = cv2.cvtColor(lab_eq, cv2.COLOR_LAB2RGB)
        rgb_img = Image.fromarray(cv_rgb_eq)
        
    if not is_blurry:
        print(f"[{name}] Applying Conditional Sharpening...")
        enhancer = ImageEnhance.Sharpness(rgb_img)
        rgb_img = enhancer.enhance(1.10)
    
    img = Image.merge("RGBA", (*rgb_img.split(), a))
    
    ratio = img.width / img.height
    print(f"[{name}] Aspect Ratio: {ratio:.2f}")
    if ratio > 1.4:
        target_width = 1200
        target_height = max(int(1200 / ratio), 600)
    elif ratio < 0.71:
        target_height = 1200
        target_width = max(int(1200 * ratio), 600)
    else:
        target_width = 1024
        target_height = 1024
        
    max_width = int(target_width * 0.80)
    max_height = int(target_height * 0.80)
    scale_ratio = min(max_width / img.width, max_height / img.height)
    new_width = int(img.width * scale_ratio)
    new_height = int(img.height * scale_ratio)
    img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    shadow_blur = 15
    shadow_offset_y = 20
    shadow_opacity = 0.15
    
    shadow_mask = img.split()[3]
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 255))
    shadow.putalpha(shadow_mask)
    shadow_canvas = Image.new("RGBA", (target_width, target_height), (0, 0, 0, 0))
    paste_x = (target_width - img.width) // 2
    paste_y = (target_height - img.height) // 2 - (shadow_offset_y // 2)
    shadow_paste_y = paste_y + shadow_offset_y
    shadow_canvas.paste(shadow, (paste_x, shadow_paste_y), shadow)
    shadow_canvas = shadow_canvas.filter(ImageFilter.GaussianBlur(shadow_blur))
    shadow_r, shadow_g, shadow_b, shadow_a = shadow_canvas.split()
    shadow_a = shadow_a.point(lambda p: p * shadow_opacity)
    shadow_canvas = Image.merge("RGBA", (shadow_r, shadow_g, shadow_b, shadow_a))
    
    mean_brightness = orig_quality["brightness_score"] / 100.0 * 255.0
    if mean_brightness > 180: bg_color = (230, 230, 230)
    elif mean_brightness < 90: bg_color = (245, 245, 245)
    else: bg_color = (240, 240, 240)
        
    final_img = Image.new("RGB", (target_width, target_height), bg_color)
    final_img.paste(shadow_canvas, (0, 0), shadow_canvas)
    final_img.paste(img, (paste_x, paste_y), img)
    
    os.makedirs("/tmp/artisanx_test", exist_ok=True)
    final_img.save(f"/tmp/artisanx_test/enhanced_{name}.jpg", quality=95)
    print(f"[{name}] Saved successfully to /tmp/artisanx_test/enhanced_{name}.jpg")
