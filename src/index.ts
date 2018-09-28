#! /usr/bin/env node
import { exec } from "child_process"

const diffCommand = `git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD`
exec(diffCommand, (err, stdout, stderr) => stdout)
