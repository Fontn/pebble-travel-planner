# Bus travel planner for pebble
Project started in 2021 for personal use.

## Västtrafik travel planner for pebble.

## Add Västtrafiks access tokens
1. Copy APITokens_example.js in the src/pkjs folder.
2. Rename to APITokens.js
3. Change the `CLIENT_ID`, `VT_KEY` and `VT_SECRET` to the values from Västtrafik's development portal.

## To build and run
1. Change the ip address in `run_docker_script.sh`
2. Run the `run_docker_script.sh` and the project will build and be installed on the pebble.
