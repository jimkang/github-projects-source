SMOKECHROME = node_modules/.bin/tap-closer | \
	node_modules/.bin/smokestack -b chrome

SMOKEFIREFOX = node_modules/.bin/tap-closer | \
	node_modules/.bin/smokestack -b firefox

BROWSERIFY = ./node_modules/.bin/browserify

test: clean-test-dbs
	node tests/storage-tests.js
	node tests/api-storage-tests.js

test-chrome:
	$(BROWSERIFY) tests/storage-tests.js | $(SMOKECHROME)
	$(BROWSERIFY) tests/api-storage-tests.js | $(SMOKECHROME)

test-firefox:
	$(BROWSERIFY) tests/storage-tests.js | $(SMOKEFIREFOX)
	$(BROWSERIFY) tests/api-storage-tests.js | $(SMOKEFIREFOX)

test-browser: test-chrome test-firefox

clean-test-dbs:
	rm -rf local-deed-stream-test
	rm -rf deed-update-test
	rm -rf api-deed-stream-test*

pushall:
	git push origin master && npm publish
