FROM node

WORKDIR /usr/src/app

COPY package*.json ./

# If you are building your code for production
# RUN npm ci --only=production
RUN npm install

COPY . .

EXPOSE 8080
CMD [ "npm", "start" ]
