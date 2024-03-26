#!/bin/bash

NO_FORMAT="\033[0m"
C_AQUAMARINE1="\033[38;5;86m"
C_ORANGE1="\033[38;5;215m"

private_key="./config/private_key.pem"
public_key="./config/public_key.pem"
env_file="./config/.env"
node_modules="./node_modules"

print_text() {
  echo -en "${C_AQUAMARINE1}[nest-api] ${C_ORANGE1}[$1/3] ${NO_FORMAT}$2"
}

generate_keys() {
  openssl genrsa -out $private_key 2048
  openssl rsa -pubout -in $private_key -out $public_key
}

if [[ -e $private_key || -e $public_key ]]; then
  print_text 1 "Keys already exist. Do you want to replace them? (y/n): "
  read -r replace_keys

  if [[ $replace_keys != "y" && $replace_keys != "Y" ]]; then
    print_text 1 "Ignoring keys generation.\n"
  else
    print_text 1 "Generating keys.\n"
    generate_keys
  fi
else
  generate_keys
fi

if [[ -e $env_file ]]; then
  print_text 2 "Ignoring environment variable file creation as it already exist.\n"
else
  cp ./config/.example.env $env_file

  print_text 2 "The environment variables file is defined here: ${C_AQUAMARINE1}./config/.env\n"
  print_text 2 "Configure it to launch the API.\n"
fi

if [[ -e $node_modules ]]; then
  print_text 3 "Ignoring node dependencies installation as they are already installed.\n"
else
  print_text 3 "Installing node dependencies.\n"  
  npm i
fi

print_text 3 "Setup has been completed.\n"
