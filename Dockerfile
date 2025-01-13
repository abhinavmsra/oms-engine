FROM node:latest

RUN apt update -y \
  && apt install -y postgresql-client \
  && apt-get update && apt-get install -y --no-install-recommends curl \
  && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y \
  && export PATH="$HOME/.cargo/bin:$PATH" \
  && rustc --version \
  && cargo --version \
  && cargo install sqlx-cli --no-default-features --features native-tls,postgres


RUN corepack enable pnpm && corepack use pnpm@latest-10
