FROM node:16

WORKDIR /flags-quiz

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "start"]