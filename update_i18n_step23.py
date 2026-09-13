import json
import os

locales_dir = r"c:\Users\YOGI\OneDrive\Desktop\artisanx\frontend\src\i18n"
languages = ['en', 'ta', 'hi', 'te', 'kn', 'ml', 'bn', 'mr', 'ur']

new_keys = {
    'products': {
        'all': 'All',
        'published': 'Published',
        'drafts': 'Drafts',
        'no_price_set': 'No price set',
        'unpublish': 'Unpublish',
        'delete_product': 'Delete Product',
        'are_you_sure_delete': 'Are you sure you want to delete this product?',
        'delete_confirm': 'Yes, Delete',
        'update': 'Update',
        'no_products': 'No products found',
        'add_first_product': 'Add your first product'
    }
}

for lang in languages:
    filepath = os.path.join(locales_dir, f"{lang}.json")
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    else:
        continue
        
    for section, keys in new_keys.items():
        if section not in data:
            data[section] = {}
        for k, v in keys.items():
            if k not in data[section] or data[section][k].startswith('['):
                if lang == 'en':
                    data[section][k] = v
                else:
                    data[section][k] = f"[{lang}] {v}"
                
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

print("Updated i18n files for Step 23.")
