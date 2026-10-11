# Next.js frontend image (Node 18, Alpine)
FROM node:18-alpine
WORKDIR /opt/app
COPY package*.json ./
RUN npm install
COPY . .
# Note: For Docker, the API URL must point to the docker service name, not localhost
ENV NEXT_PUBLIC_API_URL=http://backend:1337
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
