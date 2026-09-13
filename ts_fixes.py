import os
import re

def replace_in_file(filepath, old, new):
    if not os.path.exists(filepath): return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace(old, new)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

base = r"c:\Users\YOGI\OneDrive\Desktop\artisanx\frontend\src"

# Remove React
for f in ["AnimatedHand.tsx", "GuideControls.tsx", "GuideHandOverlay.tsx", "GuideProgress.tsx", "InstructionCard.tsx", "ShowMeFab.tsx", "SpotlightHighlight.tsx"]:
    replace_in_file(os.path.join(base, "components", "guide-hand", f), "import React", "import ")
    replace_in_file(os.path.join(base, "components", "guide-hand", f), "import  {", "import {")

replace_in_file(os.path.join(base, "pages", "artisan", "ProductList.tsx"), "import React, {", "import {")

# Remove unused imports
replace_in_file(os.path.join(base, "pages", "artisan", "ArtisanHome.tsx"), " GuidanceWorkflow,", "")
replace_in_file(os.path.join(base, "pages", "artisan", "EnquiryDetail.tsx"), " Clock,", "")
replace_in_file(os.path.join(base, "pages", "artisan", "EnquiryList.tsx"), " Clock,", "")
replace_in_file(os.path.join(base, "pages", "facilitator", "FacilitatorHome.tsx"), "import BottomNav from '../../components/BottomNav';\n", "")
replace_in_file(os.path.join(base, "stores", "guidanceStore.ts"), " GuidanceStep,", "")

# ProductEdit variables
replace_in_file(os.path.join(base, "pages", "artisan", "ProductEdit.tsx"), "const { user, language } = useAuthStore();", "const { language } = useAuthStore();")
replace_in_file(os.path.join(base, "pages", "artisan", "ProductEdit.tsx"), "const { currentStep, loadProduct, reset, draftId } = useProductStore();", "const { currentStep, loadProduct, reset } = useProductStore();")

# Remove role prop from BottomNav
replace_in_file(os.path.join(base, "pages", "artisan", "EnquiryList.tsx"), '<BottomNav role="artisan" />', '<BottomNav />')
replace_in_file(os.path.join(base, "pages", "artisan", "ProductList.tsx"), '<BottomNav role="artisan" />', '<BottomNav />')

# Fix AnimatedHand type error
replace_in_file(os.path.join(base, "components", "guide-hand", "AnimatedHand.tsx"), "ease: 'easeInOut'", "ease: 'easeInOut' as const")

print("Fixes applied.")
