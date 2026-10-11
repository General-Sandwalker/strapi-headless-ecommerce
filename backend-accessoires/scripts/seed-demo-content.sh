#!/usr/bin/env bash
###############################################################################
# seed-demo-content.sh
#
# Seeds the Strapi backend with demo content (2 categories + 5 products with
# images). This is the scripted equivalent of clicking through the Strapi
# admin panel (Content Manager) described in the assignment.
#
# It uses the Strapi ADMIN API (content-manager endpoints), which requires a
# super-admin JWT. Use it right after `strapi admin:create-user`.
#
# Usage:
#   cd backend-accessoires
#   bash scripts/seed-demo-content.sh
#
# NOTE: the admin account must already exist (see README.md).
###############################################################################
set -euo pipefail

API="${STRAPI_URL:-http://127.0.0.1:1337}"
EMAIL="${STRAPI_ADMIN_EMAIL:-admin@accessories-store.dev}"
PASSWORD="${STRAPI_ADMIN_PASSWORD:-Admin1234!}"
IMG_DIR="$(cd "$(dirname "$0")/../../docs/images" && pwd)"   # repo/docs/images

echo "==> Logging in as $EMAIL"
TOKEN=$(curl -sS -X POST "$API/admin/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['data']['token'])")

AUTH="Authorization: Bearer $TOKEN"

# --- 0. Clean previous demo content ------------------------------------------
echo "==> Cleaning previous content (keeps the demo seed re-runnable)"
python3 - "$API" "$TOKEN" <<'PYEOF'
import json, sys, urllib.request

api, token = sys.argv[1], sys.argv[2]

def req(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(api + path, data=data, method=method)
    r.add_header("Authorization", f"Bearer {token}")
    r.add_header("Content-Type", "application/json")
    return json.load(urllib.request.urlopen(r))

def req_delete(path):
    r = urllib.request.Request(api + path, method="DELETE")
    r.add_header("Authorization", f"Bearer {token}")
    urllib.request.urlopen(r).read()

for entry in req("GET", "/content-manager/collection-types/api::product.product?pageSize=100").get("results", []):
    req_delete(f"/content-manager/collection-types/api::product.product/{entry['id']}")
for f in req("GET", "/upload/files?pageSize=100").get("results", []):
    req_delete(f"/upload/files/{f['id']}")
for entry in req("GET", "/content-manager/collection-types/api::category.category?pageSize=100").get("results", []):
    req_delete(f"/content-manager/collection-types/api::category.category/{entry['id']}")
print("    previous products, files and categories removed")
PYEOF

# --- 0b. Enable public API access --------------------------------------------
# Equivalent of Settings > Users & Permissions > Roles > Public > checking
# the "find" and "findOne" boxes for Category and Product.
echo "==> Enabling public find/findOne permissions"
curl -sS -X PUT "$API/users-permissions/roles/2" -H "$AUTH" -H "Content-Type: application/json" \
  -d '{
    "name": "Public",
    "description": "Default role given to unauthenticated user.",
    "permissions": {
      "api::category": {"controllers": {"category": {"find": {"enabled": true, "policy": ""}, "findOne": {"enabled": true, "policy": ""}}}},
      "api::product": {"controllers": {"product": {"find": {"enabled": true, "policy": ""}, "findOne": {"enabled": true, "policy": ""}}}}
    }
  }' | python3 -c "import json,sys; print('    ok' if json.load(sys.stdin).get('ok') else '    FAILED')"

# --- 1. Categories -----------------------------------------------------------
echo "==> Creating categories"
CAT_CASES=$(curl -sS -X POST "$API/content-manager/collection-types/api::category.category" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"name":"Cases"}' | python3 -c "import json,sys; print(json.load(sys.stdin)['id'])")
CAT_CHARGERS=$(curl -sS -X POST "$API/content-manager/collection-types/api::category.category" \
  -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"name":"Chargers"}' | python3 -c "import json,sys; print(json.load(sys.stdin)['id'])")
echo "    Cases=$CAT_CASES Chargers=$CAT_CHARGERS"

# --- 2. Upload product images ------------------------------------------------
echo "==> Uploading images"
upload() {
  curl -sS -X POST "$API/upload" -H "$AUTH" -F "files=@$1" \
    | python3 -c "import json,sys; print(json.load(sys.stdin)[0]['id'])"
}
IMG_CASE_SILICONE=$(upload "$IMG_DIR/case-silicone.png")
IMG_CASE_CLEAR=$(upload "$IMG_DIR/case-clear.png")
IMG_CHARGER_20W=$(upload "$IMG_DIR/charger-20w.png")
IMG_CABLE=$(upload "$IMG_DIR/cable-lightning.png")
IMG_MAGSAFE=$(upload "$IMG_DIR/charger-magsafe.png")

# --- 3. Create + publish products --------------------------------------------
create_product() {  # title, description, price, imageId, categoryId
  local id
  id=$(curl -sS -X POST "$API/content-manager/collection-types/api::product.product" \
    -H "$AUTH" -H "Content-Type: application/json" \
    -d "{
      \"title\": \"$1\",
      \"description\": [
        {\"type\": \"paragraph\", \"children\": [{\"type\": \"text\", \"text\": \"$2\"}]}
      ],
      \"price\": $3,
      \"image\": $4,
      \"category\": $5
    }" | python3 -c "import json,sys; print(json.load(sys.stdin)['id'])")

  # "Publish" each entry so it becomes visible through the public API
  curl -sS -X POST "$API/content-manager/collection-types/api::product.product/$id/actions/publish" \
    -H "$AUTH" > /dev/null
  echo "    product #$id: $1 (published)"
}

echo "==> Creating products"
create_product "Silicone iPhone 15 Case" \
  "Soft-touch silicone case with microfiber lining. Slim profile, precise cutouts and full camera protection for the iPhone 15." \
  19.99 "$IMG_CASE_SILICONE" "$CAT_CASES"
create_product "Anti-Shock Transparent Case" \
  "Crystal-clear polycarbonate shell with reinforced corners. Military-grade drop protection that stays transparent." \
  14.99 "$IMG_CASE_CLEAR" "$CAT_CASES"
create_product "20W USB-C Fast Charger" \
  "Compact 20W GaN wall charger. Reaches 50% battery in around 30 minutes on compatible devices." \
  24.99 "$IMG_CHARGER_20W" "$CAT_CHARGERS"
create_product "Braided USB-C to Lightning Cable" \
  "1 m nylon-braided cable with USB-C connector and Apple Lightning plug. Tangle-free and rated for 20,000+ bends." \
  12.99 "$IMG_CABLE" "$CAT_CHARGERS"
create_product "Wireless MagSafe Charger" \
  "15W magnetic wireless charger with strong alignment magnets. Charges through most cases at full speed." \
  39.99 "$IMG_MAGSAFE" "$CAT_CHARGERS"

# --- 4. Publish categories ----------------------------------------------------
echo "==> Publishing categories"
curl -sS -X POST "$API/content-manager/collection-types/api::category.category/$CAT_CASES/actions/publish" -H "$AUTH" > /dev/null
curl -sS -X POST "$API/content-manager/collection-types/api::category.category/$CAT_CHARGERS/actions/publish" -H "$AUTH" > /dev/null

echo "==> Done. Public API check:"
curl -sS "$API/api/products?populate=*" | python3 -c "
import json,sys
res = json.load(sys.stdin)
data = res.get('data') or []
if data is None:
    sys.exit('    FAILED: public API not accessible: ' + str(res.get('error')))
print(f'    {len(data)} published products returned by GET /api/products?populate=*')
for p in data:
    a = p['attributes']
    cat = a.get('category', {}) and a['category'].get('data', {})
    cat_name = cat['attributes']['name'] if cat else 'n/a'
    print(f\"    - {a['title']}: {a['price']} € (category: {cat_name})\")
"
