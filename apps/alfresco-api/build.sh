#!/bin/bash

# tagVersion=$1

# if [ -z "$tagVersion" ]; then
#   tagVersion="latest"
# fi

docker build -f ./apps/alfresco-api/Dockerfile -t ansaries/alfresco-api:latest .

docker push ansaries/alfresco-api:latest

kubectl delete deployment -n pega23 -l app=alfresco-api

kubectl apply -f ./apps/alfresco-api/k8s.yaml -n pega23 
