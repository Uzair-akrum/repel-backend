FROM node:21 as builder

WORKDIR /build

COPY package*.json .
RUN npm install
COPY tsconfig.json tsconfig.json
COPY src/ src/
COPY dist/  dist/

FROM node:21 as runner

WORKDIR /app

COPY --from=builder build/package*.json .
COPY --from=builder build/node_modules node_modules
COPY --from=builder /build/dist dist
COPY tsconfig.json .

CMD [ "npm", "start" ]