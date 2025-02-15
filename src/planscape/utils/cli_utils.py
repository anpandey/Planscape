import os
import subprocess


def raster2pgpsql(
    raster_path,
    output_table,
    tile_size,
    srid,
    name_column="name",
    raster_column="raster",
):
    return [
        "raster2pgsql",
        "-s",
        str(srid),
        "-a",
        "-F",
        "-f",
        raster_column,
        "-n",
        name_column,
        "-t",
        tile_size,
        str(raster_path),
        output_table,
    ]


def psql(username, database, host, port):
    return [
        "psql",
        "-U",
        username,
        "-h",
        host,
        "-p",
        str(port),
        "-d",
        database,
    ]


def psql_pipe(command, head_stdin, env=None):
    """This function chain the output
    from `head_stdin` into a `psql`
    pipe, processing any data that comes
    from it.

    `head_stdin` usually will be the
    `stdout` from another subprocess.

    This is a BLOCKING operation.
    """
    environment = os.environ.copy()
    if env:
        environment = {**environment, **env}
    return subprocess.check_output(command, stdin=head_stdin, env=environment)
