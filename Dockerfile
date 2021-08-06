FROM node:14-alpine

RUN npm i -g @pinpt/gcp-process-logger@latest

CMD ["gcp-process-logger"]
