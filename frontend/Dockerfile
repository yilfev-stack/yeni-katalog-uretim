FROM node:20 AS build

WORKDIR /app

COPY package.json ./
COPY yarn.lock* ./
RUN yarn install || npm install

ARG REACT_APP_BACKEND_URL=
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV DISABLE_ESLINT_PLUGIN=true
ENV CI=false

COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
