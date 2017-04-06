#!/bin/sh

# Removes codedeploy old deploy folder
sudo rm -rf /opt/codedeploy-agent/deployment-root

# Clean pm2 log files
sudo pm2 flush

# Getting out
cd ~
