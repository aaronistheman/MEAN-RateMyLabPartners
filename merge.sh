#! /bin/bash
# Merge and delete a branch; should be used in the branch-to-merge

noChanges=`git status | grep "nothing to commit" | wc -l`

if [ $noChanges -eq 1 ]
then 
  branch=`git branch | awk ' /*/ { print $2 } '`
  echo $branch
  git checkout develop
  git merge --no-ff $branch
  git branch -d $branch
else
  echo "Commit your changes before using merge.sh"
fi