IMAGE_NAME=openhab-ga-unofficial-demo
REMOTE=gytisgreitai

build:
	rm -rf dist/
	yarn run tsc -b

docker:
	docker build -t ${IMAGE_NAME}:${TAG} -f docker/${TYPE}/Dockerfile .
	docker tag ${IMAGE_NAME}:${TAG} ${REMOTE}/${IMAGE_NAME}:${TAG}
	docker push ${REMOTE}/${IMAGE_NAME}:${TAG}

docker-app:
	make docker -e TYPE=app -e TAG=app-only

docker-nginx:
	make docker -e TYPE=nginx -e TAG=latest

all: build docker-nginx docker-app 

.PHONY: docker-nginx build docker-app all docker