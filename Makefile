GITDIR=tests/file-abstractions/test-root

test-all-fast: fs-tests local-git-tests
	node tests/add-cells-to-pages-tests.js
	node tests/make-index-html-from-page-spec-tests.js
	node tests/integration/post-through-chain-test.js
	ABSTRACTION=LocalGit node tests/integration/post-through-chain-test.js

test: fs-tests local-git-tests git-tests
	node tests/add-cells-to-pages-tests.js
	node tests/make-index-html-from-page-spec-tests.js
	node tests/integration/post-through-chain-test.js
	ABSTRACTION=LocalGit node tests/integration/post-through-chain-test.js
	ABSTRACTION=GitHubFile node tests/integration/post-through-chain-test.js

clean-fs-test-root:
	rm -rf tests/file-abstractions/test-root/*

set-up-rss:
	mkdir -p tests/rss-test-archive-root/rss/
	cp tests/rss-test-archive-root/rss-to-update.rss tests/rss-test-archive-root/rss/index.rss

fs-tests: clean-fs-test-root set-up-rss
	node tests/file-abstractions/fs-abstraction-tests.js
	node tests/establish-last-page-index-tests.js
	node tests/transforms/buffer-to-persistence-tests.js
	node tests/transforms/update-index-html-persistent-tests.js
	node tests/transforms/add-cells-to-pages-persistent-tests.js
	node tests/transforms/add-single-page-persistent-tests.js
	node tests/update-rss-tests.js

local-git-tests: clean-fs-test-root set-up-test-git-dir set-up-rss
	ABSTRACTION=LocalGit node tests/file-abstractions/fs-abstraction-tests.js
	ABSTRACTION=LocalGit node tests/establish-last-page-index-tests.js
	ABSTRACTION=LocalGit node tests/transforms/buffer-to-persistence-tests.js
	ABSTRACTION=LocalGit node tests/transforms/update-index-html-persistent-tests.js
	ABSTRACTION=LocalGit node tests/transforms/add-cells-to-pages-persistent-tests.js
	ABSTRACTION=LocalGit node tests/transforms/add-single-page-persistent-tests.js
	ABSTRACTION=LocalGit node tests/update-rss-tests.js

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

set-up-test-git-dir:
	mkdir -p $(GITDIR)
	cd $(GITDIR) && \
	  git init && \
	  touch git-stub && \
	  git add . && \
	  git commit -a -m"Started." --author "Jim Kang <jimkang@gmail.com>"

