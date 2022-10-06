#!/bin/bash
set -e


# Set variables
export NPROCS=$(nproc)
export RELEASE="development"
export BUILDVER="$(date +%Y)$(date +%m)$(date +%d)"
export BUILDITERATION=999
export OS=$(lsb_release -sc)
export ARCH=$(dpkg --print-architecture)
export DIST=$(grep ^ID= /etc/*release | awk -F'=' '{ print $2 }')
export FULLBUILDVER="${BUILDVER}.${BUILDITERATION}+${RELEASE}~${OS}"
export VENDOR="Syncwerk GmbH"
export VENDOREMAIL="support@syncwerk.com"
export MAINTAINER="${VENDOR} <${VENDOREMAIL}>"
export DATERFC=$(date --rfc-2822)
export PUBLISHONPUBILCREPO=False
lsb_release -si | grep -qi "debian" && export DEBSTDVER=3.9.8
lsb_release -si | grep -qi "ubuntu" && export DEBSTDVER=3.9.7


function build {
cat <<EOF


$(date) - Creating syncwerk-server-webapp_${FULLBUILDVER}_${ARCH}.deb - ETA in 4 minutes
------------------------------------------------------------------------------------------------------

EOF
cat debian/control.template | envsubst | sed 's/\\\$/$/g' > debian/control
cat debian/changelog.template | envsubst > debian/changelog
cat debian/copyright.template | envsubst > debian/copyright
debuild -us -uc
}


function install {
cat <<EOF


$(date) - Installing ../syncwerk-server-webapp_${FULLBUILDVER}_${ARCH}.deb
------------------------------------------------------------------------------------------------------

EOF
dpkg -i ../syncwerk-server-webapp_${FULLBUILDVER}_${ARCH}.deb


cat <<EOF


$(date) - Finished, please flush your web browser cache to apply any changes. Execution time:
------------------------------------------------------------------------------------------------------
EOF
}


# Get options and execute task
while true ; do
    case "$1" in
        build-stable) time (export RELEASE="stable" ; build) ; echo ; break ;;
        build-unstable) time (export RELEASE="unstable" ; build) ; echo ; break ;;
        *) time (build ; install) ; echo ; break ;;
    esac
done
