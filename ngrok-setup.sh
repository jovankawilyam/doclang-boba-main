#!/bin/bash

# ========================================
# NGROK SETUP SCRIPT
# untuk Doclang Boba (Laravel + Vite + WhatsApp)
# ========================================

set -e

echo "Starting Ngrok Setup..."
echo "======================================="

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROXY_PORT=9000

# Kill existing proxy & ngrok
kill $(lsof -t -i:$PROXY_PORT 2>/dev/null) 2>/dev/null || true
killall ngrok 2>/dev/null || true
sleep 1

# Start reverse proxy
echo -e "${BLUE}[1/4] Starting reverse proxy...${NC}"
node ngrok-proxy.mjs > /tmp/ngrok-proxy.log 2>&1 &
PROXY_PID=$!
echo "Proxy PID: $PROXY_PID"
sleep 2

# Start ngrok (single tunnel to proxy)
echo -e "${BLUE}[2/4] Starting ngrok tunnel...${NC}"
ngrok start doclang > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!
echo "Ngrok PID: $NGROK_PID"

sleep 3

# Fetch ngrok URL
echo -e "${BLUE}[3/4] Fetching ngrok URL...${NC}"

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
    echo -e "${YELLOW}Could not fetch ngrok API. Using local URLs.${NC}"
    PUBLIC_URL="http://localhost:$PROXY_PORT"
else
    PUBLIC_URL=$(echo "$NGROK_API" | grep -o '"public_url":"[^"]*"' | head -1 | cut -d'"' -f4)
    PUBLIC_URL=${PUBLIC_URL:-"http://localhost:$PROXY_PORT"}
fi

echo -e "${GREEN}Public URL: $PUBLIC_URL${NC}"

# Update .env
echo -e "${BLUE}[4/4] Updating .env file...${NC}"

ENV_FILE=".env"
cp "$ENV_FILE" "${ENV_FILE}.backup"
echo -e "${GREEN}Backed up to .env.backup${NC}"

update_env() {
    local key=$1
    local value=$2
    if grep -q "^${key}=" "$ENV_FILE"; then
        sed -i '' "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
    else
        echo "${key}=${value}" >> "$ENV_FILE"
    fi
}

update_env "APP_URL" "$PUBLIC_URL"
update_env "NGROK_LARAVEL_URL" "$PUBLIC_URL"
update_env "NGROK_VITE_URL" "$PUBLIC_URL"
update_env "NGROK_WHATSAPP_URL" "$PUBLIC_URL"
update_env "VITE_ORIGIN" "$PUBLIC_URL"
update_env "VITE_HMR_HOST" "$(echo "$PUBLIC_URL" | sed -E 's|https?://||')"
# Keep internal gateway URLs on localhost (Laravel proxies to gateway directly)
update_env "WA_GATEWAY_URL" "http://127.0.0.1:3001/api/send-message"
update_env "WA_GATEWAY_STATUS_URL" "http://127.0.0.1:3001/api/admin/status"
update_env "WA_GATEWAY_QR_URL" "http://127.0.0.1:3001/api/admin/qr"
update_env "WA_GATEWAY_PAIRING_CODE_URL" "http://127.0.0.1:3001/api/admin/pairing-code"
update_env "WA_GATEWAY_RECONNECT_URL" "http://127.0.0.1:3001/api/admin/reconnect"

echo -e "${GREEN}Updated .env${NC}"

# Clear Laravel cache
echo -e "${BLUE}Clearing Laravel cache...${NC}"
php artisan config:clear 2>/dev/null || echo "Run 'php artisan config:clear' manually"

echo ""
echo "======================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "======================================="
echo ""
echo -e "${YELLOW}Public URL:${NC}"
echo "  $PUBLIC_URL"
echo ""
echo -e "${YELLOW}Ngrok Web Interface:${NC}"
echo "  http://127.0.0.1:4040"
echo ""
echo -e "${YELLOW}Ensure services are running:${NC}"
echo "  Laravel:  php artisan serve (port 8000)"
echo "  Vite:     npm run dev (port 5173)"
echo "  WhatsApp: npm run wa:start (port 3001)"
echo ""

wait $NGROK_PID