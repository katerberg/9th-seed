FROM ubuntu
LABEL maintainer Mark Katerberg <katerberg@fastmail.fm>
RUN apt-get update && apt-get install -y 
WORKDIR /home/stlvrd
COPY creds/dbCreds /home/stlvrd
