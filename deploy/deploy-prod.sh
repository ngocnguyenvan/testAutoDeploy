#!/bin/bash

TARBALL=$1

exec node ./deploy/thousand-stars.js --environment production deploy $TARBALL
