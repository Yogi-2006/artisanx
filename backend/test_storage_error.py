from database import get_authenticated_client
import sys

# use any dummy token since we just want to see where it crashes
try:
    auth_client = get_authenticated_client("dummy_token")
    auth_client.storage.from_("product-images").upload("test.jpg", b"fake", {"content-type": "image/jpeg"})
except Exception as e:
    import traceback
    traceback.print_exc()
