#!/bin/bash
set -e

if [ "$1" = "slurmdbd" ]
then
    set -x

    { echo "---> Starting the MUNGE Authentication service (munged) ..."; } 2>/dev/null
    setpriv --reuid=munge --regid=munge --init-groups /usr/sbin/munged
    { echo "---> Starting the SlurmDBD Manager Daemon ..."; } 2>/dev/null
    exec setpriv --reuid=slurm --regid=slurm --init-groups /usr/sbin/slurmdbd -D
fi

if [ "$1" = "slurmctld" ]
then
    set -x

    { echo "---> Starting the MUNGE Authentication service (munged) ..."; } 2>/dev/null
    setpriv --reuid=munge --regid=munge --init-groups /usr/sbin/munged

    { echo "---> Starting the Slurm Controller Daemon (slurmctld) ..."; } 2>/dev/null
    exec setpriv --reuid=slurm --regid=slurm --init-groups /usr/sbin/slurmctld -D
fi

if [ "$1" = "slurmd" ]
then
    set -x

    { echo "---> Setup Cgroup v2 ..."; } 2>/dev/null
    mkdir /sys/fs/cgroup/init.scope
    mkdir /sys/fs/cgroup/system.slice
    # Move Root Process to new cgroup
    echo "1" > /sys/fs/cgroup/init.scope/cgroup.procs
    if [ ! "$$" = "1" ]; then
        echo "$$" > /sys/fs/cgroup/init.scope/cgroup.procs
    fi
    # Add cpu and memory controller to system.slice namespace
    echo "+cpuset +cpu +io +memory +pids" > /sys/fs/cgroup/cgroup.subtree_control
    echo "+cpuset +cpu +io +memory +pids" > /sys/fs/cgroup/system.slice/cgroup.subtree_control

    { echo "---> Starting the MUNGE Authentication service (munged) ..."; } 2>/dev/null
    setpriv --reuid=munge --regid=munge --init-groups /usr/sbin/munged

    { echo "---> Starting the Slurm Node Daemon (slurmd) ..."; } 1>/dev/null
    exec /usr/sbin/slurmd -D
fi

if [ "$1" = "slurmrestd" ]
then
    { echo "---> Starting the MUNGE Authentication service (munged) ..."; } 2>/dev/null
    setpriv --reuid=munge --regid=munge --init-groups /usr/sbin/munged

    { echo "---> Starting the Slurm Restd (slurmrestd) ..."; } 1>/dev/null
	shift 1
	exec setpriv --reuid=slurmrestd --regid=slurmrestd --init-groups /usr/sbin/slurmrestd "$@"
fi

set -x
exec "$@"
