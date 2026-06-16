FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# We don't strictly need to pass the OpenAI key at build time since React shouldn't expose it, 
# but we are using a proxy so we can embed it if needed, or pass via environment.
ARG REACT_APP_OPENAI_API_KEY
ARG REACT_APP_OPENAI_BASE_URL
RUN if [ -n "$REACT_APP_OPENAI_API_KEY" ]; then \
      echo "REACT_APP_OPENAI_API_KEY=$REACT_APP_OPENAI_API_KEY" > .env.production; \
      echo "REACT_APP_OPENAI_BASE_URL=$REACT_APP_OPENAI_BASE_URL" >> .env.production; \
    fi && npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
