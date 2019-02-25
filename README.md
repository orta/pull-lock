# Pull Lock

Automate tasks that happen when you pull in new code.

```json
{
  "husky": {
    "hooks": {
      "post-merge": "pull-lock"
    }
  },
  "pull-lock": {
    "yarn.lock": "yarn install",
    "Example/Podfile.lock": ["cd Example", "bundle exec pod install"]
  }
}
```

Like [lint-staged](https://github.com/okonet/lint-staged) for when you've `git pull`ed. You set up a 
[husky](https://github.com/typicode/husky) `"post-merge"` hook which runs the CLI tool `pull-lock`. 

`pull-lock` will then compare the changed files to the config and execute commands for you automatically. 

Pull Lock only uses dependencies which Husky also uses, and so it adds no new dependencies to your tree.

## Installation and setup

1. `yarn add --dev pull-lock husky`
1. Update your `package.json` like this:

```diff json
{
  "husky": {
    "hooks": {
+     "post-merge": "pull-lock"
    }
  },
+ "pull-lock": {
+   "yarn.lock": "yarn install",
+ }
}
```

Then when you run a `git pull` or `git merge`, `pull-lock` will check to see if `yarn.lock` has changed the 
diffed files and run the scripts inside your config files.

In the case above, if someone has made dependency changes which edit the `yarn.lock` then `yarn install` will
be called automatically for you.

## Advanced config

As pull-lock uses [cosmic-config](https://github.com/davidtheclark/cosmiconfig) you can leave your app
settings in either:

* a `pull-lock` object in your `package.json`
* a `.pulllockrc` file in JSON or YML format
* a `pull-lock.config.js` file in JS format

 
## Working on Pull Lock

```sh
# clone it
git clone https://github.com/orta/pull-lock.git
cd pull-lock

# set up deps
yarn
# verify tests
yarn jest
# Run the integration scripts to see it on a merge and on a pull
yarn integrate:pull
# or
yarn integrate:merge
```
