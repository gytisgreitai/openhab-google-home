VERSION=latest
IMAGE_NAME=openhab-ga-unofficial-demo
IMAGE=${IMAGE_NAME}:${VERSION}
REMOTE=gytisgreitai

docker:
	rm -rf dist/
	yarn run tsc -b
	docker build -t ${IMAGE} .
	docker tag ${IMAGE} ${REMOTE}/${IMAGE}
	docker push ${REMOTE}/${IMAGE}

.PHONY: docker