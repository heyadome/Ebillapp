#!/bin/bash
# ── Deploy Script สำหรับ VPS ──
# วิธีใช้: ssh เข้า VPS แล้วรัน: bash deploy.sh
# ──────────────────────────────

set -e

APP_DIR="/var/www/ebillapp"
REPO="https://github.com/heyadome/Ebillapp.git"

echo "══════════════════════════════════════"
echo "  EBillApp — VPS Deployment Script"
echo "══════════════════════════════════════"

# ── 1. ติดตั้ง dependencies (ครั้งแรก) ──
install_deps() {
  echo "📦 ติดตั้ง Node.js 20, Nginx, Certbot..."

  # Node.js 20
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs nginx certbot python3-certbot-nginx

  # PM2
  sudo npm install -g pm2

  # Create log directory
  sudo mkdir -p /var/log/ebillapp
  sudo chown $USER:$USER /var/log/ebillapp

  echo "✅ Dependencies ติดตั้งเรียบร้อย"
}

# ── 2. Clone / Pull repo ──
setup_app() {
  if [ -d "$APP_DIR" ]; then
    echo "📥 Pull latest code..."
    cd "$APP_DIR"
    git pull origin main
  else
    echo "📥 Clone repository..."
    sudo mkdir -p "$APP_DIR"
    sudo chown $USER:$USER "$APP_DIR"
    git clone "$REPO" "$APP_DIR"
    cd "$APP_DIR"
  fi

  echo "📦 Install npm packages..."
  npm ci --production=false

  echo "🔧 Generate Prisma client..."
  npx prisma generate
  npx prisma db push

  echo "🏗️ Build Next.js..."
  npm run build

  echo "🌱 Seed database..."
  npx tsx prisma/seed.ts || true

  echo "✅ App built successfully"
}

# ── 3. Setup Nginx ──
setup_nginx() {
  echo "🔧 Setting up Nginx..."
  sudo cp "$APP_DIR/nginx.conf" /etc/nginx/sites-available/ebillapp
  sudo ln -sf /etc/nginx/sites-available/ebillapp /etc/nginx/sites-enabled/
  sudo nginx -t && sudo systemctl reload nginx
  echo "✅ Nginx configured"
}

# ── 4. Start with PM2 ──
start_app() {
  echo "🚀 Starting app with PM2..."
  cd "$APP_DIR"
  pm2 delete ebillapp 2>/dev/null || true
  pm2 start ecosystem.config.js
  pm2 save
  pm2 startup systemd -u $USER --hp $HOME 2>/dev/null || true
  echo "✅ App is running!"
}

# ── 5. SSL Certificate ──
setup_ssl() {
  read -p "🔒 ใส่โดเมนของคุณ (เช่น ebill.company.com): " DOMAIN
  sudo certbot --nginx -d "$DOMAIN"
  echo "✅ SSL certificate installed"
}

# ── Main ──
echo ""
echo "เลือกสิ่งที่ต้องการทำ:"
echo "  1) ติดตั้งทั้งหมด (ครั้งแรก)"
echo "  2) อัพเดทโค้ดและ restart"
echo "  3) ตั้งค่า SSL"
echo ""
read -p "เลือก (1/2/3): " choice

case $choice in
  1)
    install_deps
    setup_app
    setup_nginx
    start_app
    echo ""
    echo "══════════════════════════════════════"
    echo "  🎉 Deploy สำเร็จ!"
    echo "  เข้าเว็บ: http://YOUR_SERVER_IP:3000"
    echo "  รัน option 3 เพื่อตั้งค่า SSL"
    echo "══════════════════════════════════════"
    ;;
  2)
    setup_app
    start_app
    echo "🎉 อัพเดทสำเร็จ!"
    ;;
  3)
    setup_ssl
    ;;
  *)
    echo "❌ ตัวเลือกไม่ถูกต้อง"
    ;;
esac
