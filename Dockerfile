FROM node:latest

RUN apt update -y && \
  apt install -y postgresql-client

RUN corepack enable pnpm && corepack use pnpm@latest-10
