#!/bin/sh

# Clean pm2 log files
sudo pm2 flush

# Removes codedeploy old deploy folder
sudo rm -rf /opt/codedeploy-agent/deployment-root

# Getting out
cd ~
