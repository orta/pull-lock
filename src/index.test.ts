import { getDiffInfoFromReflog, getPostMergeInfo, runPullLock } from "."

jest.mock("fs", () => ({ readFileSync: jest.fn() }))
import { readFileSync } from "fs"
const mockReadFileSync = readFileSync as jest.Mock

jest.mock("execa", () => ({ shellSync: jest.fn() }))
import { shellSync } from "execa"
const mockExeca = shellSync as jest.Mock

// Works like this for a merge on my computer anyway
const ortasENV = {
  GITHEAD_93042bcd85bd4e0214b453905ceadd565ec3f5b3: "new_branch",
  GIT_EXEC_PATH: "/usr/local/Cellar/git/2.18.0/libexec/git-core",
  GIT_PREFIX: "",
  GIT_REFLOG_ACTION: "merge new_branch",
  HUSKY_GIT_PARAMS: "0",
  PWD: "/Users/ortatherox/dev/projects/artsy/js/libs/pull-lock/tmp/project",
}

it("getPostMergeInfo", () => {
  mockExeca.mockReturnValueOnce({ stdout: "master" })

  const config = getPostMergeInfo(".", ortasENV)

  expect(config).toMatchInlineSnapshot(`
Object {
  "action": "merge new_branch",
  "fromBranch": "new_branch",
  "sha": "93042bcd85bd4e0214b453905ceadd565ec3f5b3",
  "toBranch": "master",
}
`)
})

it("getDiffInfoFromReflog", () => {
  // tslint:disable-next-line:max-line-length
  const reflog = "63d31120cb6d1d1159aba3f87f8b0d264a3afd2f fa244845f3dc46716081915124df1686cbcaa4c9 Orta Therox <orta.therox@gmail.com> 1548432794 -0500  merge new_branch: Fast-forward"
  mockExeca.mockReturnValueOnce({ stdout: "master" })
  mockExeca.mockReturnValueOnce({ stdout: reflog + "\n" })

  const config = getPostMergeInfo(".", ortasENV)
  expect(getDiffInfoFromReflog(".", config)).toMatchInlineSnapshot(`
Object {
  "fromSha": "63d31120cb6d1d1159aba3f87f8b0d264a3afd2f",
  "toSha": "fa244845f3dc46716081915124df1686cbcaa4c9",
}
`)
})

describe("runs scripts for config settings", () => {
  beforeEach(mockExeca.mockClear)

  it("NOOPs", () => {
    // Does nothing
    runPullLock(".", ["file1.md", "file2.md"], {})
    expect(mockExeca).not.toHaveBeenCalled()
  })

  it("Runs a command when there is a match", () => {
    // Runs "echo 'hi'"
    runPullLock(".", ["file1.md", "file2.md"], {
      "file1.md": "echo 'hi'",
    })

    expect(mockExeca).toHaveBeenCalledWith("echo 'hi'", expect.anything())
  })

  it("runs multiple times", () => {
    // Runs "echo 'hi'"
    runPullLock(".", ["file1.js", "file2.js"], {
      "file1.js": "echo 'hello'",
      "file2.js": "echo 'folks'",
    })

    expect(mockExeca).toHaveBeenCalledWith("echo 'hello'", expect.anything())
    expect(mockExeca).toHaveBeenCalledWith("echo 'folks'", expect.anything())
  })
})
