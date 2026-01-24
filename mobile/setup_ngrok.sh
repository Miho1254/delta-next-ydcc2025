#!/bin/bash
# Install Ngrok
curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok.asc \
  | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null \
  && echo "deb https://ngrok-agent.s3.amazonaws.com bookworm main" \
  | sudo tee /etc/apt/sources.list.d/ngrok.list \
  && sudo apt update \
  && sudo apt install ngrok -y

# Config Authtoken
ngrok config add-authtoken 2pIrDx6vQ4aSAbXn8LlQcdRQ7e7_3FSjCrxyZNfdWBEUt4c9y
