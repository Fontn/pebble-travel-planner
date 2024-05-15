docker run -it --rm \
    -e DISPLAY=$DISPLAY \
    -v /tmp/.X11-unix:/tmp/.X11-unix \
    -v ~/documents/git/pebble/dev/trafik/:/pebble/ \
    bboehmke/pebble-dev \
    sh -c 'pebble build && pebble install --emulator basalt --logs'
