#!/bin/bash
# start.sh - Single command to start everything for Doclang Boba

set -e

echo "Starting Doclang Boba with ngrok..."
echo "======================================="

# --- Colors for better output ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROXY_PORT=9000
ENV_FILE=".env"
ENV_BACKUP_FILE="${ENV_FILE}.backup_ngrok_temp"

# --- Cleanup function ---
cleanup() {
    echo -e "\n${YELLOW}Shutting down processes and restoring .env...${NC}"
    
    # Kill background processes
    kill $PROXY_PID 2>/dev/null || true
    kill $NGROK_PID 2>/dev/null || true

    # Restore .env if backup exists
    if [ -f "$ENV_BACKUP_FILE" ]; then
        mv "$ENV_BACKUP_FILE" "$ENV_FILE"
        echo -e "${GREEN}.env restored from backup.${NC}"
    fi

    echo -e "${GREEN}Cleanup complete. Exiting.${NC}"
    exit 0
}

# Trap Ctrl+C (SIGINT) and other termination signals
trap cleanup SIGINT SIGTERM SIGHUP

# --- 1. Start Reverse Proxy ---
echo -e "${BLUE}[1/5] Starting reverse proxy (port ${PROXY_PORT})...${NC}"
node ngrok-proxy.mjs > /tmp/ngrok-proxy.log 2>&1 &
PROXY_PID=$!
echo "Proxy PID: ${PROXY_PID}"
sleep 1 # Give it a moment to start

# --- 2. Start Ngrok Tunnel ---
echo -e "${BLUE}[2/5] Starting ngrok tunnel 'doclang' (forwarding to localhost:${PROXY_PORT})...${NC}"
# Use `ngrok start --none` and then `ngrok tunnel --label doclang` if `ngrok start doclang`
# is problematic with `concurrently` (it might be too verbose or interfere with signal handling)
# For now, let's assume `ngrok start doclang` works well in background
ngrok start doclang > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!
echo "Ngrok PID: ${NGROK_PID}"
sleep 3 # Give ngrok some time to establish the tunnel

# --- 3. Fetch Ngrok Public URL ---
echo -e "${BLUE}[3/5] Fetching ngrok public URL...${NC}"
PUBLIC_URL=""
HMR_HOST=""
RETRY_COUNT=0
MAX_RETRIES=10
NGROK_API_URL="http://127.0.0.1:4040/api/tunnels"

while [ -z "$PUBLIC_URL" ] && [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    NGROK_API_RESPONSE=$(curl -s $NGROK_API_URL)
    PUBLIC_URL=$(echo "$NGROK_API_RESPONSE" | grep -o '"public_url":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -z "$PUBLIC_URL" ]; then
        echo -e "${YELLOW}  Waiting for ngrok API (attempt $((RETRY_COUNT + 1))/${MAX_RETRIES})...${NC}"
        sleep 2
        RETRY_COUNT=$((RETRY_COUNT + 1))
    fi
done

if [ -z "$PUBLIC_URL" ]; then
    echo -e "${RED}Error: Failed to get ngrok public URL after multiple retries.${NC}"
    echo -e "${YELLOW}Please ensure ngrok is properly configured and running. Exiting.${NC}"
    cleanup
fi

HMR_HOST=$(echo "$PUBLIC_URL" | sed -E 's|https?://||')

echo -e "${GREEN}  Ngrok Public URL: ${PUBLIC_URL}${NC}"

# --- 4. Update .env and Clear Laravel Cache ---
echo -e "${BLUE}[4/5] Updating .env file and clearing Laravel config cache...${NC}"

# Backup current .env
cp "$ENV_FILE" "$ENV_BACKUP_FILE"
echo -e "${GREEN}  Backed up ${ENV_FILE} to ${ENV_BACKUP_FILE}${NC}"

# Function to update or add env variable
update_env() {
    local key=$1
    local value=$2
    if grep -q "^${key}=" "$ENV_FILE"; then
        # Use a temporary file for sed on macOS to avoid issues
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
update_env "VITE_HMR_HOST" "$HMR_HOST"
# Ensure WA_GATEWAY URLs point to localhost as the Laravel backend will proxy them
update_env "WA_GATEWAY_URL" "http://127.0.0.1:3001/api/send-message"
update_env "WA_GATEWAY_STATUS_URL" "http://127.0.0.1:3001/api/admin/status"
update_env "WA_GATEWAY_QR_URL" "http://127.0.0.1:3001/api/admin/qr"
update_env "WA_GATEWAY_PAIRING_CODE_URL" "http://127.0.0.1:3001/api/admin/pairing-code"
update_env "WA_GATEWAY_RECONNECT_URL" "http://127.0.0.1:3001/api/admin/reconnect"

echo -e "${GREEN}  ${ENV_FILE} updated with ngrok URLs.${NC}"

# Clear Laravel config cache
php artisan config:clear
echo -e "${GREEN}  Laravel config cache cleared.${NC}"

echo "======================================="
echo -e "${YELLOW}All background services are running. Public URL: ${PUBLIC_URL}${NC}"
echo "======================================="

# --- 5. Start Laravel, Vite, Queue Listener, Pail (Foreground) ---
echo -e "${BLUE}[5/5] Starting Laravel, Vite, Queue, and Logs (will block this terminal)...${NC}"
echo -e "${BLUE}Press Ctrl+C to stop all services.${NC}"
composer run dev

# --- Cleanup will be called by trap on exit ---
