#!/bin/bash
set -e

if [ "$1" = "slurmdbd" ]
then
    echo "---> Starting the MUNGE Authentication service (munged) ..."
    setpriv --reuid=munge --regid=munge --init-groups /usr/sbin/munged
    exec setpriv --reuid=slurm --regid=slurm --init-groups /usr/sbin/slurmdbd -D
fi

if [ "$1" = "slurmctld" ]
then
    echo "---> Starting the MUNGE Authentication service (munged) ..."
    setpriv --reuid=munge --regid=munge --init-groups /usr/sbin/munged

    echo "---> Starting the Slurm Controller Daemon (slurmctld) ..."
	exec setpriv --reuid=slurm --regid=slurm --init-groups /usr/sbin/slurmctld -D
fi

if [ "$1" = "slurmd" ]
then
    echo "---> Starting the MUNGE Authentication service (munged) ..."
    setpriv --reuid=munge --regid=munge --init-groups /usr/sbin/munged

    echo "---> Starting the Slurm Node Daemon (slurmd) ..."
	exec /usr/sbin/slurmd -D
fi

exec "$@"
