# Stage 1: Build stage (if needed in future for build tools)
FROM nginx:alpine as production

# Copy nginx configuration if we need to customize it
# COPY nginx.conf /etc/nginx/nginx.conf

# Copy static files to nginx html directory
COPY . /usr/share/nginx/html/

# Remove unnecessary files from the final image (if they exist)
RUN rm -f /usr/share/nginx/html/Dockerfile \
    /usr/share/nginx/html/.gitignore \
    /usr/share/nginx/html/Makefile

# Expose port 80
EXPOSE 80

# No need for CMD as nginx:alpine base image already has it
# CMD ["nginx", "-g", "daemon off;"]
