@echo off
for /l %%i in (1,1,36) do (
  echo %%i >> commits.txt
  git add .
  git commit -m "Commit %%i"
)
