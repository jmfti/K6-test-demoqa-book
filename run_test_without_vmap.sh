#!/bin/bash

# example of use 
# bash run_test.sh 10  #that runs 10 users
# bash run_test.sh 100 # that runs 100 users

date=$(date '+%Y_%m_%d_%H_%M_%S')
outcsv="${date}_results.csv"
outhtml="${date}_results.html"
base_path=$(pwd)

# cat loadtest.js | docker run --rm -i -e TARGET=10 -e profile=dev grafana/k6 run - > report.html # if html report uncomment this
cat loadtest.js | docker run --rm -i -e TARGET=$1 -e profile=dev grafana/k6 run -

# sed '/html\>/,$!d' report.html > report_filtered.html   # if html uncomment this