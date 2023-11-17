FROM node:lts as build
WORKDIR /usr/src/app
COPY ["package.json", "yarn.lock", "npm-shrinkwrap.json*", "./"]
RUN yarn --frozen-lockfile && mv node_modules ../
COPY . .
RUN chown -R node /usr/src/app
USER node
RUN npm run build

FROM node:lts as prod
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "yarn.lock", "npm-shrinkwrap.json*", "./"]
RUN yarn install --production --frozen-lockfile && mv node_modules ../
COPY --from=build /usr/src/app/dist /usr/src/app/dist
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "start"]
