#!/bin/bash

# example of use 
# bash run_test.sh 10  #that runs 10 users
# bash run_test.sh 100 # that runs 100 users

date=$(date '+%Y_%m_%d_%H_%M_%S')
outcsv="${date}_results.csv"
base_path=$(pwd)
#outcsv="/mnt/c/temp/demoqabook/output/${date}_results.csv"
#if not exists paths input, output, create them
if [ ! -d "input" ]; then
  mkdir input
fi
if [ ! -d "output" ]; then
  mkdir output
fi
docker run -it -v $(pwd):/loadtest -v $(pwd)/input:/input -v $(pwd)/output:/output -e TARGET=$1 -e profile=dev grafana/k6 run --out csv=/output/$outcsv /loadtest/loadtest.js

cp $base_path/output/$outcsv $base_path/output/result_current_run.csv

docker run --rm -ti -v $PWD:/report -w /report rocker/verse Rscript -e 'rmarkdown::render("/report/reporting/report.rmd")'