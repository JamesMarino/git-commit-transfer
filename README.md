# Git Transfer

Have some projects on BitBucket but want to show your commits on the GitHub contributions graph
without pushing multiple repositories or the repositories code itself? Git Transfer is the tool for
you!

GitTransfer will copy across historic commits from multiple repositories without committing any of
the repositories contents. More detail below.

## What it does

1.  Initialises a new Git Repository in the specified directory `...output-directory/repo-name`
2.  Copies all commit history in all repositories found in the specified `input-directory` to
    `commit.json`
3.  Creates a log of each repository and commits the changes in this log file at the date of the
    original repositories commit. You can filter by your own commits in the original repository
    using `email-filter` and commit to a single email address in the new repository using
    `commit-email`
4.  Creates a Read Me with the output of the script run and commits this at the current time
5.  You can now push to a new secret or public repo on GitHub

To copy across updated commits the script will archive the old repository and create a new one with
the updated commits.

## Usage

Note: Use `node index.js --help` for an explanation of parameters.

```bash
node index.js \
--input-directory /Users/james/MyDir1 \
--output-directory /Users/james/MyDir2 \
--repo-name TestRepo \
--email-filter james@marino.io,james@example.com \
--commit-email james@marino.io
```
