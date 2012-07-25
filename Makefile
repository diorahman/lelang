REPORTER = spec

test: test-unit

test-unit:
	/usr/local/bin/mocha --reporter $(REPORTER) test/*.js -t 20000

.PHONY: test test-unit
