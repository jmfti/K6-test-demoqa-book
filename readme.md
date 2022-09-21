# Load test with k6

Just a load test I have made with k6 against Book Store in https://demoqa.com/

## Description
This is a sample performance test with K6 using the book store in demoqa 
[https://demoqa.com/]

## Structure
/config is for configuration parameters for the loadtest
* profiles.json: a json file with configuration properties
** this file is intended to have 1 element for each profile
/input for anything we consider input in any process
/output for anything we consider an output for any process
/reporting: there's an R markdown script that will generate an HTML report

loadtest.js the script that models the user journey. It exports a default function which has several groupsof requests and a fixed pacing of 60s.

## How to use
Just clone git repository, execute run_test.sh, enjoy

run_test.sh creates if does not exist the paths ./output, ./input
executes the test run in a docker container and drop the csv in the output directory

after the test run a report is generated with an R script in markdown, in ./reporting/report.html
in order to work it needs the results in the output directory, more precisely, the result_current_run.csv and baseline.csv

more things can be done in terms of results comparison. A t-test or a kolmogorov-smirnov test to see whether there's a significative difference between samples and decide
whether the new results are better or not.

But for that you have to unlock premium access ($) :P

### Run 10 requests / min
bash run_test.sh 10

### Run 100 requests / min
bash run_test.sh 100

### Things I should change but I won't because it's a PoC
* Endpoint by configuration. All the endpoints are hardcoded in the script. I should move them to the json profiles configuration
* probably some others that doesn't come right now to my mind