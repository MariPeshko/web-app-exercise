# this is a draft Docker file

FROM nginx:1.25-alpine

# delete default config
RUN rm /etc/nginx/conf.d/default.conf

# put own config
COPY nginx.conf /etc/nginx/conf.d/