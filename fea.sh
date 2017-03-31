#! /bin/bash
#
# @param $1 name of the branch (minus "feature/" prefix) to create and
# switch to
# @example ./fea.sh input-fields

if [ $# -eq 0 ]
then
  echo Error: need command-line argument
else
  branchName=feature/$1
  git checkout -b $branchName
fi