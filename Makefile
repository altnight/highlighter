default: run

run: prepare
	./node_modules/.bin/web-ext run -s ./highlighter

prepare:
	npm install

.PHONY: default run prepare
