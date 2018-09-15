#!/usr/bin/env bash

ls -a tradr.sqlite
gzip -c tradr.sqlite > tradr.sqlite.gz
ls -a tradr.sqlite.gz
./gdrive-rpi upload --delete -p '1AK43kl7VRY6cbvTeOPgscQ2CRMtcL_a_' 'tradr.sqlite.gz'
./gdrive-rpi list --order 'recency desc' -q "name contains 'tradr.sqlite'" | head -n2
