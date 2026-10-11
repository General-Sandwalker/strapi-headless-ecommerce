# Strapi backend image (Node 18, Alpine)
# NOTE vs. assignment: `python3` added to the apk packages — better-sqlite3
# compiles from source via node-gyp, which requires Python 3. On a bare
# node:18-alpine image the SQLite driver would fail to build without it.
FROM node:18-alpine
RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev python3
WORKDIR /opt/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 1337
CMD ["npm", "run", "develop"]
