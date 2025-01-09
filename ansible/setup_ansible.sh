#!/usr/bin/bash

# This script sets up Ansible in a python virtual environment
apt update
apt install -y python3-venv

mkdir -p /opt/ansible
cd /opt/ansible/ && python3 -mvenv ansible-env
/opt/ansible/ansible-env/bin/pip install ansible
/opt/ansible/ansible-env/bin/ansible-galaxy collection install community.general