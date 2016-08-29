#!/bin/bash

TARBALL=$1

exec node ./deploy/thousand-stars.js --environment pre-production deploy $TARBALL
