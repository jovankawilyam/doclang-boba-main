#!/bin/bash

# ========================================
# NGROK MULTI-TUNNEL SETUP SCRIPT
# untuk Doclang Boba (Laravel + Vite + WhatsApp)
# ========================================

set -e

echo "🚀 Starting Ngrok Multi-Tunnel Setup..."
echo "======================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Start ngrok with all tunnels in background
echo -e "${BLUE}[1/3] Starting ngrok tunnels...${NC}"
ngrok start --all > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!
echo "Ngrok PID: $NGROK_PID"

# Wait for ngrok to start
sleep 3

# Fetch ngrok tunnel URLs from API
echo -e "${BLUE}[2/3] Fetching ngrok URLs from API...${NC}"

# Retry logic for API fetch
RETRY=0
MAX_RETRY=5
while [ $RETRY -lt $MAX_RETRY ]; do
    NGROK_API=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null || echo "")
    if [ -n "$NGROK_API" ]; then
        break
    fi
    RETRY=$((RETRY + 1))
    echo "Waiting for ngrok API... (attempt $RETRY/$MAX_RETRY)"
    sleep 2
done

if [ -z "$NGROK_API" ]; then
    echo -e "${YELLOW}⚠️  Could not fetch ngrok API. Using default localhost URLs.${NC}"
    LARAVEL_URL="http://localhost:8000"
    VITE_URL="http://localhost:5173"
    WHATSAPP_URL="http://localhost:3001"
else
    # Parse ngrok URLs
    LARAVEL_URL=$(echo "$NGROK_API" | grep -o '"public_url":"[^"]*"' | grep -m1 'laravel' | cut -d'"' -f4)
    VITE_URL=$(echo "$NGROK_API" | grep -o '"public_url":"[^"]*"' | grep -m1 'vite' | cut -d'"' -f4)
    WHATSAPP_URL=$(echo "$NGROK_API" | grep -o '"public_url":"[^"]*"' | grep -m1 'whatsapp' | cut -d'"' -f4)
    
    # Fallback if parsing fails
    LARAVEL_URL=${LARAVEL_URL:-"http://localhost:8000"}
    VITE_URL=${VITE_URL:-"http://localhost:5173"}
    WHATSAPP_URL=${WHATSAPP_URL:-"http://localhost:3001"}
fi

echo -e "${GREEN}✓ Got ngrok URLs${NC}"
echo "  Laravel:  $LARAVEL_URL"
echo "  Vite:     $VITE_URL"
echo "  WhatsApp: $WHATSAPP_URL"

# Update .env file
echo -e "${BLUE}[3/3] Updating .env file...${NC}"

ENV_FILE=".env"

# Create backup
cp "$ENV_FILE" "${ENV_FILE}.backup"
echo -e "${GREEN}✓ Backed up to .env.backup${NC}"

# Update or add environment variables
update_env() {
    local key=$1
    local value=$2
    if grep -q "^${key}=" "$ENV_FILE"; then
        sed -i '' "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
    else
        echo "${key}=${value}" >> "$ENV_FILE"
    fi
}

update_env "APP_URL" "$LARAVEL_URL"
update_env "NGROK_LARAVEL_URL" "$LARAVEL_URL"
update_env "NGROK_VITE_URL" "$VITE_URL"
update_env "NGROK_WHATSAPP_URL" "$WHATSAPP_URL"
update_env "WA_GATEWAY_URL" "${WHATSAPP_URL}/api/send-message"
update_env "WA_GATEWAY_STATUS_URL" "${WHATSAPP_URL}/api/admin/status"
update_env "WA_GATEWAY_QR_URL" "${WHATSAPP_URL}/api/admin/qr"
update_env "WA_GATEWAY_PAIRING_CODE_URL" "${WHATSAPP_URL}/api/admin/pairing-code"
update_env "WA_GATEWAY_RECONNECT_URL" "${WHATSAPP_URL}/api/admin/reconnect"

echo -e "${GREEN}✓ Updated .env${NC}"

# Clear Laravel config cache
echo -e "${BLUE}Clearing Laravel cache...${NC}"
php artisan config:clear 2>/dev/null || echo "Note: Run 'php artisan config:clear' manually"

# Display summary
echo ""
echo "======================================="
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo "======================================="
echo ""
echo -e "${YELLOW}📋 Public URLs (share with others):${NC}"
echo "  🌐 Application: $LARAVEL_URL"
echo "  📦 Frontend Dev: $VITE_URL"
echo "  💬 WhatsApp API: $WHATSAPP_URL"
echo ""
echo -e "${YELLOW}🔗 Ngrok Web Interface:${NC}"
echo "  http://127.0.0.1:4040"
echo ""
echo -e "${YELLOW}✅ Ensure these services are running:${NC}"
echo "  ✓ Laravel:  php artisan serve (port 8000)"
echo "  ✓ Vite:     npm run dev (port 5173)"
echo "  ✓ WhatsApp: npm run wa:start (port 3001)"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "  1. Check .env file is updated correctly"
echo "  2. Start your services if not already running"
echo "  3. Access application from public URL above"
echo ""

# Keep ngrok running
wait $NGROK_PID
