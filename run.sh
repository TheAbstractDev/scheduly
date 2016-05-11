#!/usr/bin/env bash

if [ $1 ]
then
	if [ $2 ]
	then
		if [ $1 = "production" ]
		then
      if [ $3 ]
      then
        docker run --rm -ti -p 8080:8080 -v "$PWD":/usr/src/app --net host -e "NODE_ENV=production" -e "MONGO_URL=$2" scheduly
      else
		   	docker run --rm -ti -p 8080:8080 -v "$PWD":/usr/src/app --net host -e "NODE_ENV=production" -e "MONGO_URL=$2" -e "IP=$3" scheduly
      fi
		elif [ $1 = "developpement" ]
		then
      if [ $3 ]
      then
		   	docker run --rm -ti -p 8080:8080 -v "$PWD":/usr/src/app --net host -e "MONGO_URL=$2" -e "IP=$3" node:onbuild
      else
        docker run --rm -ti -p 8080:8080 -v "$PWD":/usr/src/app --net host -e "MONGO_URL=$2" node:onbuild
      fi
		fi
	else
		echo "Missing MONGO_URL"
	fi
else
	echo "Missing environement variables"
fi