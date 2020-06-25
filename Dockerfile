FROM node:latest
RUN mkdir -p "/home/ec2-user/app"
WORKDIR "/home/ec2-user/app"
COPY .env.example .env
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 3002
CMD ["npm", "start"]
