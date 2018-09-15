#!/usr/bin/env bash

ls -a tradr.sqlite
gzip -c tradr.sqlite > tradr.sqlite.gz
ls -a tradr.sqlite.gz
./gdrive-rpi upload --delete -p tradr tradr.sqlite.gz
./gdrive-rpi list -q "name contains 'tradr.sqlite'"
