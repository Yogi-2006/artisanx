import json
import os

locales_dir = r"c:\Users\YOGI\OneDrive\Desktop\artisanx\frontend\src\i18n"
languages = ['en', 'ta', 'hi', 'te', 'kn', 'ml', 'bn', 'mr', 'ur']

translations = {
    'auth': {
        'login': 'Login',
        'send_otp': 'Send OTP',
        'verify': 'Verify OTP',
        'register': 'Register',
        'select_role': 'Select Role',
        'artisan': 'Artisan',
        'buyer': 'Buyer',
        'facilitator': 'Facilitator'
    },
    'profile': {
        'name': 'Name',
        'business_name': 'Business Name',
        'craft_type': 'Craft Type',
        'location': 'Location',
        'craft_story': 'Craft Story',
        'save_profile': 'Save Profile',
        'edit_profile': 'Edit Profile'
    },
    'products': {
        'add_product': 'Add Product',
        'take_photo': 'Take Photo',
        'choose_gallery': 'Choose from Gallery',
        'enhance_photo': 'Enhance Photo',
        'record_voice': 'Record Voice Description',
        'processing': 'Processing...',
        'review_details': 'Review Details',
        'title': 'Title',
        'description': 'Description',
        'category': 'Category',
        'tags': 'Tags',
        'materials': 'Materials',
        'pricing': 'Pricing',
        'labor': 'Labor',
        'packaging': 'Packaging',
        'margin': 'Margin',
        'publish': 'Publish',
        'save_draft': 'Save Draft',
        'readiness_score': 'Readiness Score'
    },
    'buyer': {
        'browse': 'Browse Artisans',
        'search': 'Search',
        'filter': 'Filter',
        'send_enquiry': 'Send Enquiry',
        'quantity': 'Quantity',
        'budget': 'Budget',
        'deadline': 'Delivery Deadline',
        'customisation': 'Customisation Request'
    },
    'enquiry': {
        'new_enquiry': 'New Enquiry',
        'interested': 'Interested',
        'need_details': 'Need More Details',
        'cannot_fulfil': 'Cannot Fulfil',
        'respond': 'Respond',
        'your_response_sent': 'Your response has been sent'
    },
    'common': {
        'loading': 'Loading...',
        'error': 'Error',
        'success': 'Success',
        'save': 'Save',
        'cancel': 'Cancel',
        'delete': 'Delete',
        'edit': 'Edit',
        'back': 'Back',
        'continue': 'Continue',
        'home': 'Home',
        'profile': 'Profile',
        'products': 'Products',
        'enquiries': 'Enquiries',
        'settings': 'Settings',
        'logout': 'Logout'
    }
}

# The previous script `update_i18n_guide.py` added `guide`, so we won't overwrite it, we will just update.

for lang in languages:
    filepath = os.path.join(locales_dir, f"{lang}.json")
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    else:
        data = {}
        
    for section, keys in translations.items():
        if section not in data:
            data[section] = {}
        for k, v in keys.items():
            # In a real app we'd call Google Translate API here, but we'll use placeholder or english as base for now, 
            # except we have real translations for guide from earlier.
            # We'll just put the english string for all to establish the structure, or use a prefix.
            if lang == 'en':
                data[section][k] = v
            else:
                data[section][k] = f"[{lang}] {v}" # placeholder translated
                
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

print("Updated all i18n files successfully.")
