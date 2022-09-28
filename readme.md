# Load test with k6

Just a load test I have made with k6 against Book Store in https://demoqa.com/

## Description
This is a sample performance test with K6 using the book store in demoqa 
[https://demoqa.com/]

loadtest.js the script that models the user journey. It exports a default function which has several groups of requests with 1s pacing.
run_test_without_vmap.sh: a bash script that runs a docker container running k6 and outputs summary statistics grouped by url

## How to use
Just clone git repository, execute run_test_without_vmap.sh <num_users>

### Run 10 requests / min
bash run_test_without_vmap.sh 10

### Run 100 requests / min
bash run_test_without_vmap.sh 100

### Things I should change but I won't because it's a PoC
* Endpoint by configuration. All the endpoints are hardcoded in the script. I should move them to the json profiles configuration
* probably some others that doesn't come right now to my mind

# Imporant things

Once you clone the repository make sure git doesn't replace crlf's

git clone <repository> <path>
cd <path>
git config core.autocrlf false
git reset --hard
bash run_test.sh <target>