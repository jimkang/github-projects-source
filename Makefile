SMOKECHROME = node_modules/.bin/tap-closer | \
	node_modules/.bin/smokestack -b chrome

SMOKEFIREFOX = node_modules/.bin/tap-closer | \
	node_modules/.bin/smokestack -b firefox

BROWSERIFY = ./node_modules/.bin/browserify

test: clean-test-dbs
	node tests/no-cache-tests.js
	node tests/user-namespace-tests.js
	node tests/storage-tests.js
	node tests/api-storage-tests.js
	node tests/metadata-tests.js

test-chrome:
	$(BROWSERIFY) tests/no-cache-tests.js | $(SMOKECHROME)
	$(BROWSERIFY) tests/user-namespace-tests.js | $(SMOKECHROME)
	$(BROWSERIFY) tests/storage-tests.js | $(SMOKECHROME)
	$(BROWSERIFY) tests/api-storage-tests.js | $(SMOKECHROME)
	$(BROWSERIFY) tests/metadata-tests.js | $(SMOKECHROME)

test-firefox:
	$(BROWSERIFY) tests/no-cache-tests.js | $(SMOKEFIREFOX)
	$(BROWSERIFY) tests/user-namespace-tests.js | $(SMOKEFIREFOX)
	$(BROWSERIFY) tests/storage-tests.js | $(SMOKEFIREFOX)
	$(BROWSERIFY) tests/api-storage-tests.js | $(SMOKEFIREFOX)
	$(BROWSERIFY) tests/metadata-tests.js | $(SMOKEFIREFOX)

test-browser: test-chrome test-firefox

clean-test-dbs:
	rm -rf user-namespace-test
	rm -rf local-deed-stream-test
	rm -rf deed-update-test
	rm -rf api-deed-stream-test*
	rm -rf metadata-tests*

pushall:
	git push origin master && npm publish

prettier:
	prettier --single-quote --write "**/*.js"
