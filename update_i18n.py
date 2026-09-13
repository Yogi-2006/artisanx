import os
import json

i18n_dir = r"c:\Users\YOGI\OneDrive\Desktop\artisanx\frontend\src\i18n"
files = [f for f in os.listdir(i18n_dir) if f.endswith(".json")]

new_keys_en = {
    "title": "Response to your enquiry",
    "product_section": "Product",
    "your_enquiry": "Your Enquiry",
    "artisan_response": "Artisan Response",
    "quantity": "Quantity",
    "customisation": "Customisation Request",
    "view_product": "View Product",
    "no_response": "No response available"
}

for file in files:
    path = os.path.join(i18n_dir, file)
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    # Add buyer_enquiry
    if "buyer_enquiry" not in data:
        data["buyer_enquiry"] = {}
    
    for k, v in new_keys_en.items():
        if k not in data["buyer_enquiry"]:
            data["buyer_enquiry"][k] = v  # English default for prototype unless translated

    # Add notifications.artisan_replied
    if "notifications" not in data:
        data["notifications"] = {}
    if "artisan_replied" not in data["notifications"]:
        data["notifications"]["artisan_replied"] = "Artisan replied to your enquiry"
        
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

print("Updated translation files.")
