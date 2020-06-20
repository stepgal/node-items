FROM ubuntu:18.04

# Install dependencies
RUN apt-get update && \
 apt-get install -y nodejs && \
 apt-get install -y npm && \
 apt-get install -y git
 
RUN git clone https://github.com/stepgal/node-items.git
WORKDIR /node-items
RUN cp .env.example .env
RUN npm install

EXPOSE 3003

RUN echo "git fetch" >> run.sh
RUN echo "git pull origin master" | tee -a run.sh
RUN echo "npm install" | tee -a run.sh
RUN echo "node server.js" | tee -a run.sh
RUN chmod 777 run.sh

CMD ./run.sh