# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./

FROM base AS deps
RUN pnpm install --frozen-lockfile

FROM deps AS development
ENV NODE_ENV=development
COPY . .
EXPOSE 5173
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0"]

FROM deps AS build
ARG VITE_AUTH_URL=http://localhost:5127/api/v1
ARG VITE_ADMIN_URL=http://localhost:3006/bankSystem/v1
ENV VITE_AUTH_URL=$VITE_AUTH_URL
ENV VITE_ADMIN_URL=$VITE_ADMIN_URL
COPY . .
RUN pnpm run build

FROM nginx:1.27-alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
