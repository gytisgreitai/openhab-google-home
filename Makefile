IMAGE_NAME=openhab-ga-unofficial-demo
REMOTE=gytisgreitai

build:
	rm -rf dist/
	yarn run tsc -b

docker:
	docker buildx build --platform linux/arm/v7,linux/amd64,linux/arm64 -t ${REMOTE}/${IMAGE_NAME}:${TAG} --push -f docker/${TYPE}/Dockerfile .

docker-app:
	make docker -e TYPE=app -e TAG=app-only

docker-nginx:
	make docker -e TYPE=nginx -e TAG=latest

all: build docker-nginx docker-app 

.PHONY: docker-nginx build docker-app all docker