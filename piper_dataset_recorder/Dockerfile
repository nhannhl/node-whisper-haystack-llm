# Use official nginx alpine image for smaller size
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy the HTML file to nginx default directory
COPY piper_training_dataset_recorder.html /usr/share/nginx/html/index.html

# Expose port 80
EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
