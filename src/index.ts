#! /usr/bin/env node

import { spawn } from "child_process"
import { readFileSync } from "fs"
import { join } from "path"

import * as cosmiconfig from "cosmiconfig" // used by husky
import debug from "debug" // used by husky
import * as execa from "execa" // used by husky

const d = debug(`pull-lock`)
d("Started Pull Lock!")

// Suppress logging when in tests
const isJest = typeof jest !== "undefined"
// tslint:disable-next-line:no-console
const log = isJest ? () => "" : console.log

/**
 * Grabs merge info out of the environment which git sets for the hook,
 * and it will also grab the current branch
 */
export const getPostMergeInfo = (cwd: string, env: any) => {
  const key = Object.keys(env).find((k) => k.includes("GITHEAD"))
  const sha = `${key}`.replace("GITHEAD_", "")
  return {
    // Probably either "merge [branch_name]" or "pull [branch_name]"
    action: env.GIT_REFLOG_ACTION as string,
    fromBranch: env[key],
    sha,
    toBranch: getGitMergeReference(cwd),
  }
}

/** Grab the current branch e.g. master, or dev or whatever */
export const getGitMergeReference = (cwd: string) =>
  execa.shellSync("git rev-parse --abbrev-ref HEAD", { cwd, env: process.env }).stdout

/**
 * Goes from the information in the env to the real commit shas
 * @param info A merge config from getPostMergeInfo
 */

export const getDiffInfoFromReflog = (cwd: string, info: ReturnType<typeof getPostMergeInfo>) => {
  const refLogFilePath = join(cwd, ".git", "logs", "refs", "heads", info.toBranch)
  // Grab the last 10 lines, as these files can be _very_ long
  let refLog: string
  try {
    const { stdout } = execa.shellSync(`head -n '${refLogFilePath}'`, { cwd, env: process.env })
    refLog = stdout
  } catch (error) {
    refLog = readFileSync(refLogFilePath, "utf8")
  }
  // Get the last reflog for now, probably isn't enough for prod though
  const lines = refLog.split("\n")
  const last = lines[lines.length - 2]

  return {
    fromSha: last.split(" ")[0],
    toSha: last.split(" ")[1],
  }
}

/**
 * Calls git to grab the files between two shas
 *
 * @param fromSha the first part of the diff
 * @param toSha the second part of the diff
 */
const localGetChangedFiles = (fromSha: string, toSha: string) =>
  new Promise<string[]>((done) => {
    const args = ["diff", `${fromSha}...${toSha}`, `--name-only`]
    const child = spawn("git", args, { env: process.env })

    child.stdout.on("data", (data) => {
      done(
        data
          .toString()
          .trim()
          .split("\n"),
      )
    })

    child.stderr.on("data", (data) => {
      // tslint:disable-next-line:no-console
      console.error(`Could not get commits from git between ${fromSha} and ${toSha}`)
      throw new Error(data.toString())
    })
  })

/**
 * Executes the commands that we want to run
 *
 * @param cwd The current working dir for the user
 * @param files files changed in the diff
 * @param config a cosmic config map
 */
export const runPullLock = (cwd: string, files: string[], config: cosmiconfig.Config) => {
  for (const file of files) {
    if (config[file]) {
      const command = config[file]
      log(`pull-lock > ${command}`)
      execa.shellSync(command, { cwd, env: process.env, stdio: "inherit" })
    }
  }
}

/** Runs pull-lock */
const run = async (cwd: string) => {
  // Grab the exposed vars from the ENV
  const mergeConfig = await getPostMergeInfo(cwd, process.env)
  d("Found merge from " + mergeConfig.fromBranch + " with sha " + mergeConfig.sha + " via env")

  // Use those env vars to get the before and after sha from gits internal ref log
  const diffConfig = getDiffInfoFromReflog(cwd, mergeConfig)
  d(`From ${diffConfig.fromSha} to ${diffConfig.toSha}`)

  // Do our async work in parallel
  Promise.all([localGetChangedFiles(diffConfig.fromSha, diffConfig.toSha), cosmiconfig("pull-lock").search(cwd)]).then(
    ([files, explorer]) => {
      d("Found these in the diff:", files)
      if (!explorer) {
        // Log and fail the build
        // tslint:disable-next-line:no-console
        console.error("pull-lock: Did not find a config.")
        // tslint:disable-next-line:no-console
        console.error("           Please add a `pull-lock` section to your package.json (or use the alternate files).")
        process.exitCode = 1
      } else {
        const config = explorer.config
        d("config:", config)
        runPullLock(cwd, files, config)
      }
    },
  )
}

// Runs if this isn't being required (like say for the tests)
const runningAsScript = !module.parent
if (runningAsScript) {
  run(process.env.PWD)
}
