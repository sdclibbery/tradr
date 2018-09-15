#!/usr/bin/env bash

ls -a tradr.sqlite
gzip tradr.sqlite > tradr.sqlite.gzip
ls -a tradr.sqlite.gzip
./gdrive upload -p tradr --delete tradr.sqlite.gzip
ls -a tradr.sqlite.gzip
./gdrive list
