FROM node:latest

RUN corepack enable pnpm && corepack use pnpm@latest-10
