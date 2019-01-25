# Make a new git repo
cd tmp
mkdir project
cd project
git init
cp ../package_ex.json package.json
# Make a hard symbolic link to the root node mods
ln -s ../../node_modules .

#  yarn install

# Give it a single commit to get started
touch file.md
touch file2.md

git add .
git commit -m "Init"

node node_modules/husky/husky.js install node_modules/husky

# Make a new clone
cd ..
git clone ./project second
cd second

# Make a new commit editing file on a new branch 
echo "Hi" > file.md
git add file.md
git commit -m "Edit the file.md"

echo "Hi also" > file2.md
git add file2.md
git commit -m "Edit the file2.md"

# Go back to the main repo and set this as a remote
cd ..
cd project
git remote add second ../second

# OK, now we go back to master and merge in those changes
# this is what should trigger pull-lock

echo "About to pull from a remote, pull-lock should note this:"
sleep 1
DEBUG="*" git pull second master

echo "-----"
echo "done, wiping the folder"

cd ..
# rm -rf project
