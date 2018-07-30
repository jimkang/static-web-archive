test: fs-tests git-tests
	node tests/add-cells-to-pages-tests.js
	node tests/make-index-html-from-page-spec-tests.js
	node tests/integration/post-through-chain-test.js
	ABSTRACTION=GitHubFile node tests/integration/post-through-chain-test.js

clean-fs-test-root:
	rm -rf tests/file-abstrctions/test-root/*

fs-tests: clean-fs-test-root
	node tests/file-abstractions/fs-abstraction-tests.js
	node tests/establish-last-page-index-tests.js
	node tests/transforms/buffer-to-persistence-tests.js
	node tests/transforms/update-index-html-persistent-tests.js
	node tests/transforms/add-cells-to-pages-persistent-tests.js
	node tests/transforms/add-single-page-persistent-tests.js
	node tests/update-rss-tests.js

git-tests:
	ABSTRACTION=GitHubFile node tests/establish-last-page-index-tests.js
	ABSTRACTION=GitHubFile node tests/transforms/buffer-to-persistence-tests.js
	ABSTRACTION=GitHubFile node tests/transforms/add-cells-to-pages-persistent-tests.js
	ABSTRACTION=GitHubFile node tests/transforms/update-index-html-persistent-tests.js
	ABSTRACTION=GitHubFile node tests/transforms/add-single-page-persistent-tests.js

pushall:
	git push origin master
	npm publish

prettier:
	prettier --single-quote --write "**/*.js"
