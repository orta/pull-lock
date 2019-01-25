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

cd ..
git

# Make a new commit editing file on a new branch 
git checkout -b new_branch
echo "Hi" > file.md
git add file.md
git commit -m "Edit the file.md"

echo "Hi also" > file2.md
git add file2.md
git commit -m "Edit the file2.md"

# OK, now we go back to master and merge in those changes
# this is what should trigger pull-lock
git checkout master

echo "About to merge a branch, pull-lock should note this:"
sleep 1
HUSKY_DEBUG="*" git merge new_branch

echo "-----"
echo "done, wiping the folder"

cd ..
# rm -rf project
