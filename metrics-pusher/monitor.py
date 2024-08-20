import docker
import traceback

from prometheus_client import Gauge, CollectorRegistry

registry = CollectorRegistry()
cpu_total = Gauge(
    "system_cpu_total",
    "Total Number of Jiffies",
    registry=registry,
)
used_memory = Gauge(
    "container_memory_used",
    "Number of Used Memory Pages",
    ["container"],
    registry=registry,
)
number_processes = Gauge(
    "container_number_processes",
    "Number of Processes",
    ["container"],
    registry=registry,
)
number_threads = Gauge(
    "container_number_threads",
    "Number of Threads",
    ["container"],
    registry=registry,
)
cpu_user = Gauge(
    "container_cpu_user",
    "Number of Jiffies Spend in User Mode",
    ["container"],
    registry=registry,
)
cpu_kernel = Gauge(
    "container_cpu_kernel",
    "Number of Jiffies Spend in Kernel Mode",
    ["container"],
    registry=registry,
)
disk_write = Gauge(
    "container_disk_write",
    "Number of bytes written to disk",
    ["container"],
    registry=registry,
)
disk_read = Gauge(
    "container_disk_read",
    "Number of bytes read from disk",
    ["container"],
    registry=registry,
)

d = docker.from_env()


def scrape(proc_path):
    f = open(f"{proc_path}/stat", "r")
    total_system_jiffies = sum(int(v) for v in f.readline()[:-1].split()[1:])
    cpu_total.set(total_system_jiffies)
    f.close()

    for container in d.containers.list():
        name = container.name
        pids = [proc[1] for proc in container.top()["Processes"]]

        _used_mem = 0
        _cpu_user = 0
        _cpu_kernel = 0
        _number_threads = 0
        _number_processes = len(pids)
        _disk_read = 0
        _disk_write = 0

        for pid in pids:
            try:
                # https://www.kernel.org/doc/html/latest/filesystems/proc.html#id10
                utime = 10
                stime = utime + 1
                cutime = utime + 2
                cstime = utime + 3
                num_threads = 16
                rss = 20
                f = open(f"{proc_path}/{pid}/stat", "r")
                stats = [int(s) for s in f.read().split(")")[1][3:].split(" ")]
                f.close()

                _used_mem += stats[rss]
                _cpu_user += stats[utime] + stats[cutime]
                _cpu_kernel += stats[stime] + stats[cstime]
                _number_threads += stats[num_threads]

                # https://www.kernel.org/doc/html/latest/filesystems/proc.html#proc-pid-io-display-the-io-accounting-fields
                f = open(f"{proc_path}/{pid}/io", "r")
                rchar = int(f.readline().split(" ")[1])
                wchar = int(f.readline().split(" ")[1])
                f.close()

                _disk_read += rchar
                _disk_write += wchar
            except Exception as e:
                _number_processes -= 1
                traceback.print_exception(e)
        used_memory.labels(container=name).set(_used_mem)
        number_threads.labels(container=name).set(_number_threads)
        number_processes.labels(container=name).set(_number_processes)
        cpu_user.labels(container=name).set(_cpu_user)
        cpu_kernel.labels(container=name).set(_cpu_kernel)
        disk_read.labels(container=name).set(_disk_read)
        disk_write.labels(container=name).set(_disk_write)

        print(
            f"(container) {container.name:<40}",
            _cpu_user,
            _cpu_kernel,
            _used_mem,
            _number_threads,
            _number_processes,
            _disk_read,
            _disk_write,
        )
