# Configuration
IMAGE_NAME = cat-pictures-website
CONTAINER_NAME = cat-pictures-website
PORT = 5050

# Colors for help output
BLUE = \033[34m
NC = \033[0m # No Color
HELP_COLOR = $(BLUE)

.PHONY: help build run stop

# Show help by default
default: help

help: ## Show this help message
	@echo "Usage: make [target]"
	@echo
	@echo "Targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(HELP_COLOR)%-15s$(NC) %s\n", $$1, $$2}'

build: ## Build the Docker image
	@echo "Building Docker image..."
	docker build -t $(IMAGE_NAME) .

run: ## Run the container (builds if image doesn't exist)
	@if [ -z "$$(docker images -q $(IMAGE_NAME))" ]; then \
		make build; \
	fi
	@echo "Starting container..."
	@if [ ! -z "$$(docker ps -q -f name=$(CONTAINER_NAME))" ]; then \
		echo "Container is already running."; \
	else \
		docker run -d -p $(PORT):80 --name $(CONTAINER_NAME) $(IMAGE_NAME); \
		echo "Container started at http://localhost:$(PORT)"; \
	fi

stop: ## Stop and remove the container
	docker stop -t 0 $(CONTAINER_NAME) || true
	docker rm -f $(CONTAINER_NAME) || true
