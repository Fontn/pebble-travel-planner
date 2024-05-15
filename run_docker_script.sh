docker run --rm -it \
    -v ~/documents/git/pebble/dev/trafik/:/pebble/ \
    bboehmke/pebble-dev \
    sh -c 'pebble build && pebble install --phone=192.168.1.x --logs'
