# --- build stage ---
    FROM node:22 AS builder
    WORKDIR /app
    
    # 依存解決（キャッシュ効く）
    COPY package.json package-lock.json ./
    COPY apps/refreshDailyWeatherForecast/package.json ./apps/refreshDailyWeatherForecast/package.json
    COPY packages/package.json ./packages/package.json
    RUN npm ci
    
    # ソース一式
    COPY tsconfig.base.json ./
    COPY packages ./packages
    COPY apps/refreshDailyWeatherForecast ./apps/refreshDailyWeatherForecast
    
    # まず packages をビルド（推奨）
    RUN npm run -w packages build
    
    # app をビルド
    RUN npm run -w @baseball/refreshDailyWeatherForecast build
    
    # --- runtime stage ---
    FROM node:22-slim
    WORKDIR /app
    ENV NODE_ENV=production
    
    # 実行に必要なものだけ
    COPY --from=builder /app/apps/refreshDailyWeatherForecast/dist ./dist
    COPY --from=builder /app/node_modules ./node_modules
    
    CMD ["node", "dist/apps/refreshDailyWeatherForecast/src/main.js"]
    