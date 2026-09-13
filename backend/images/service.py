import uuid
import io
import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageOps
from fastapi import HTTPException, UploadFile
import traceback
from database import supabase_client, get_authenticated_client

try:
    from rembg import remove, new_session
    rembg_session = new_session("u2netp")
except ImportError:
    remove = None
    rembg_session = None

MAX_FILE_SIZE = 10 * 1024 * 1024
ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]

def verify_image_owner(image_id: str, artisan_id: str, token: str):
    auth_client = get_authenticated_client(token)
    res = auth_client.table("product_images").select("*").eq("id", image_id).execute()
    if not res.data or len(res.data) == 0:
        raise HTTPException(status_code=404, detail="Image not found")
    
    image_record = res.data[0]
    
    if image_record.get("product_id"):
        prod_res = auth_client.table("products").select("artisan_id").eq("id", image_record["product_id"]).execute()
        if prod_res.data and len(prod_res.data) > 0:
            if prod_res.data[0]["artisan_id"] != artisan_id:
                raise HTTPException(status_code=403, detail="Unauthorized access to this product's image")
    else:
        if image_record.get("artisan_id") != artisan_id:
             raise HTTPException(status_code=403, detail="Unauthorized access to this image")
             
    return image_record

def upload_image(file: UploadFile, artisan_id: str, token: str, product_id: str = None, is_main: bool = False):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, WEBP are allowed.")
    
    file_content = file.file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 10MB limit.")
        
    try:
        from database import get_authenticated_client
        auth_client = get_authenticated_client(token)

        file_ext = file.filename.split(".")[-1] if file.filename else "jpg"
        file_name = f"{uuid.uuid4().hex}.{file_ext}"
        
        auth_client.storage.from_("product-images").upload(
            file_name, 
            file_content,
            {"content-type": file.content_type}
        )
        
        public_url = auth_client.storage.from_("product-images").get_public_url(file_name)
        
        record = {
            "image_url": public_url,
            "original_url": public_url,
            "is_main": is_main,
        }
        if product_id:
            record["product_id"] = product_id
        else:
            raise HTTPException(status_code=400, detail="product_id is required")
            
        res = auth_client.table("product_images").insert(record).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
            
        raise HTTPException(status_code=500, detail="Failed to save image record")
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

def enhance_image(image_id: str, artisan_id: str, token: str, use_rembg: bool = True):
    image_record = verify_image_owner(image_id, artisan_id, token)
    auth_client = get_authenticated_client(token)
    original_url = image_record.get("original_url") or image_record.get("image_url")
    
    if not original_url:
        raise HTTPException(status_code=400, detail="Original image URL not found")
        
    import httpx
    try:
        response = httpx.get(original_url)
        response.raise_for_status()
        img_data = response.content
        
        img = Image.open(io.BytesIO(img_data)).convert("RGBA")
        
        if use_rembg and remove and rembg_session:
            img = remove(img, session=rembg_session)
            
        # Get bounding box of non-transparent pixels to remove empty space
        # Extract alpha channel to ensure we only crop based on opacity, 
        # as RGB channels might have residual non-zero values from rembg.
        alpha = img.split()[-1]
        bbox = alpha.getbbox()
        if bbox:
            img = img.crop(bbox)
            
        # Apply enhancements to the foreground BEFORE compositing
        r, g, b, a = img.split()
        rgb_img = Image.merge("RGB", (r, g, b))
        
        cv_rgb = np.array(rgb_img)
        gray = cv2.cvtColor(cv_rgb, cv2.COLOR_RGB2GRAY)
        mean_brightness = np.mean(gray)
        std_contrast = np.std(gray)
        
        if mean_brightness < 100:
            enhancer = ImageEnhance.Brightness(rgb_img)
            rgb_img = enhancer.enhance(1.15)
        elif mean_brightness < 130:
            enhancer = ImageEnhance.Brightness(rgb_img)
            rgb_img = enhancer.enhance(1.05)
            
        if std_contrast < 40:
            enhancer = ImageEnhance.Contrast(rgb_img)
            rgb_img = enhancer.enhance(1.1)
            
        enhancer = ImageEnhance.Sharpness(rgb_img)
        rgb_img = enhancer.enhance(1.15)
        
        img = Image.merge("RGBA", (*rgb_img.split(), a))

        # Scaling & Padding
        target_size = 1024
        # Target ~80% of canvas dimension to give product dominant scale 
        # while leaving safe padding for shadow and edges
        max_size = int(target_size * 0.80)
        
        # Calculate exact scaling to fit max_size (scaling up or down) while maintaining aspect ratio
        ratio = min(max_size / img.width, max_size / img.height)
        new_width = int(img.width * ratio)
        new_height = int(img.height * ratio)
        img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Shadow generation
        from PIL import ImageFilter
        shadow_blur = 15
        shadow_offset_y = 20
        shadow_opacity = 0.15 # 15% opacity
        
        # Create shadow from alpha
        shadow_mask = img.split()[3]
        shadow = Image.new("RGBA", img.size, (0, 0, 0, 255))
        shadow.putalpha(shadow_mask)
        
        # Put shadow on a full-size canvas to avoid clipping blur
        shadow_canvas = Image.new("RGBA", (target_size, target_size), (0, 0, 0, 0))
        
        # Calculate center position
        paste_x = (target_size - img.width) // 2
        # shift product up slightly to balance the shadow offset
        paste_y = (target_size - img.height) // 2 - (shadow_offset_y // 2)
        
        shadow_paste_y = paste_y + shadow_offset_y
        
        # Paste unblurred shadow onto shadow canvas
        shadow_canvas.paste(shadow, (paste_x, shadow_paste_y), shadow)
        # Blur the shadow canvas
        shadow_canvas = shadow_canvas.filter(ImageFilter.GaussianBlur(shadow_blur))
        
        # Adjust opacity of shadow
        shadow_r, shadow_g, shadow_b, shadow_a = shadow_canvas.split()
        shadow_a = shadow_a.point(lambda p: p * shadow_opacity)
        shadow_canvas = Image.merge("RGBA", (shadow_r, shadow_g, shadow_b, shadow_a))
        
        # Determine background color based on product brightness
        if mean_brightness > 180:
            bg_color = (230, 230, 230)
        elif mean_brightness < 90:
            bg_color = (245, 245, 245)
        else:
            bg_color = (240, 240, 240)
            
        # Final compositing
        final_img = Image.new("RGB", (target_size, target_size), bg_color)
        # Paste shadow
        final_img.paste(shadow_canvas, (0, 0), shadow_canvas)
        # Paste product
        final_img.paste(img, (paste_x, paste_y), img)
        
        out_buffer = io.BytesIO()
        final_img.save(out_buffer, format="JPEG", quality=90)
        out_bytes = out_buffer.getvalue()
        
        quality_res = calculate_image_quality(out_bytes)
        enhanced_score = quality_res["overall_score"]
        
        enhanced_name = f"enhanced_{uuid.uuid4().hex}.jpg"
        auth_client.storage.from_("product-images").upload(
            enhanced_name, 
            out_bytes,
            {"content-type": "image/jpeg"}
        )
        enhanced_url = auth_client.storage.from_("product-images").get_public_url(enhanced_name)
        
        res = auth_client.table("product_images").update({
            "enhanced_url": enhanced_url,
            "image_url": enhanced_url,
            "enhanced_quality_score": enhanced_score
        }).eq("id", image_id).execute()
        
        if res.data and len(res.data) > 0:
            return res.data[0]
            
        raise HTTPException(status_code=500, detail="Failed to update image record")
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Enhancement failed: {str(e)}")

def calculate_image_quality(img_data: bytes):
    nparr = np.frombuffer(img_data, np.uint8)
    if nparr.size == 0:
        raise ValueError("Empty image data")
        
    cv_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if cv_img is None:
        raise ValueError("Invalid image format for processing")
        
    gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
    
    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
    brightness_score = np.mean(gray)
    contrast_score = np.std(gray)
    
    norm_blur = float(min(100.0, max(0.0, (blur_score / 1000.0) * 100)))
    norm_brightness = float(min(100.0, max(0.0, (brightness_score / 255.0) * 100)))
    norm_contrast = float(min(100.0, max(0.0, (contrast_score / 128.0) * 100)))
    
    overall_score = (norm_blur + norm_brightness + norm_contrast) / 3.0
    overall_score_10 = int(round(overall_score / 10.0))
    overall_score_10 = max(0, min(10, overall_score_10))
    
    suggestions = []
    if norm_blur < 10.0:
        suggestions.append("suggBlurHigh")
    elif norm_blur < 40.0:
        suggestions.append("suggBlurMedium")
        
    if norm_brightness < 40.0:
        suggestions.append("suggDark")
    elif norm_brightness > 85.0:
        suggestions.append("suggBright")
        
    if norm_contrast < 30.0:
        suggestions.append("suggWashedOut")
        
    if not suggestions:
        suggestions.append("suggGood")
        
    return {
        "blur_score": norm_blur,
        "brightness_score": norm_brightness,
        "contrast_score": norm_contrast,
        "overall_score": overall_score_10,
        "suggestions": suggestions[:3]
    }

def check_quality(image_id: str, artisan_id: str, token: str):
    image_record = verify_image_owner(image_id, artisan_id, token)
    auth_client = get_authenticated_client(token)
    url = image_record.get("image_url")
    
    import httpx
    try:
        response = httpx.get(url)
        response.raise_for_status()
        
        if not response.content:
            raise HTTPException(status_code=400, detail="Empty image data")
            
        result = calculate_image_quality(response.content)
        
        auth_client.table("product_images").update({"quality_score": result["overall_score"]}).eq("id", image_id).execute()
        
        return result
        
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Quality check failed: {str(e)}")

def delete_image(image_id: str, artisan_id: str, token: str):
    image_record = verify_image_owner(image_id, artisan_id, token)
    auth_client = get_authenticated_client(token)
    
    try:
        def get_filename(url):
            if url:
                return url.split("/")[-1]
            return None
            
        files_to_remove = []
        orig = get_filename(image_record.get("original_url"))
        if orig: files_to_remove.append(orig)
        
        enh = get_filename(image_record.get("enhanced_url"))
        if enh: files_to_remove.append(enh)
        
        if files_to_remove:
            auth_client.storage.from_("product-images").remove(files_to_remove)
            
        auth_client.table("product_images").delete().eq("id", image_id).execute()
        return {"message": "Image deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")

def toggle_enhanced_quality(image_id: str, use_enhanced: bool, user_id: str, token: str):
    auth_client = get_authenticated_client(token)
    
    # Verify ownership
    res = auth_client.table("product_images").select("*, products!inner(*)").eq("id", image_id).execute()
    if not res.data or res.data[0]["products"]["artisan_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this image")
        
    image_data = res.data[0]
    
    update_data = {
        "enhanced_quality": use_enhanced
    }
    
    if use_enhanced and image_data.get("enhanced_url"):
        update_data["image_url"] = image_data["enhanced_url"]
    elif not use_enhanced and image_data.get("original_url"):
        update_data["image_url"] = image_data["original_url"]
        
    update_res = auth_client.table("product_images").update(update_data).eq("id", image_id).execute()
    
    if update_res.data and len(update_res.data) > 0:
        return update_res.data[0]
        
    raise HTTPException(status_code=500, detail="Failed to update image")
