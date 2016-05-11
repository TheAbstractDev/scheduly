#!/usr/bin/env bash

if [ $1 ]
then
	if [ $2 ]
	then
		if [ $1 = "production" ]
		then
		   		docker run --rm -ti -p 8080:8080 -v "$PWD":/usr/src/app --net="host" -e "NODE_ENV=production" -e "MONGO_URL=$2" scheduly
		elif [ $1 = "developpement" ]
		then
		   		docker run --rm -ti -p 8080:8080 -v "$PWD":/usr/src/app --net="host" -e "MONGO_URL=$2" node:onbuild
		fi
	else
		echo "Missing MONGO_URL"
	fi
else
	echo "Missing environement variables"
fi