# Pull Lock

Automate tasks that happen on when you pull in new code. 

```json
{
  "scripts": {
    "postcheckout": "pull-lock"
  },
  "pull-lock": {
    "yarn.lock": "yarn install",
    "Example/Podfile.lock": ["cd Example", "bundle exec pod install"]
  }
}
```

Like [lint-staged](https://github.com/okonet/lint-staged) for when you've `git pull`ed. You set up a 
[husky](https://github.com/typicode/husky) `"postcheckout"` hook which is passed to the CLI tool `pull-lock`. 
`pull-lock` will then compare the changedfiles to the config and execute commands for you automatically.


## Installation and setup

1. `yarn add --dev pull-lock husky`
1. Update your `package.json` like this:

```diff json
{
  "scripts": {
+   "postcheckout": "pull-lock"
  },
+ "pull-lock": {
+   "yarn.lock": "yarn install",
+ }
}
```

Then when you run a `git pull`, `pull-lock` will check for `yarn.lock` inside the diffed files and run the
scripts inside your config files.

## Advanced config

As pull-lock uses [cosmic-config](https://github.com/davidtheclark/cosmiconfig) you can leave your app
settings in either:

* a `pull-lock` object in your `package.json`
* a `.pulllockrc` file in JSON or YML format
* a `pull-lock.config.js` file in JS format

 
