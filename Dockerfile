FROM node:16

WORKDIR /flags-quiz

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]