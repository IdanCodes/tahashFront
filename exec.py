import subprocess
import os
import sys

# Configurations
DOCKER_COMPOSE_PATH = "./deploy/docker_compose.yml"

VERSION = 0.1
BACKEND_IMAGE = f"idoshahar/tahash-backend:v{VERSION}"
FRONTEND_IMAGE = f"idoshahar/tahash-frontend:v{VERSION}"

def run(cmd, check=True):
    print(f"▶ Running: {cmd}")
    subprocess.run(cmd, shell=True, check=check)

def compose_down():
    run(f"docker compose -f {DOCKER_COMPOSE_PATH} down")

def compose_up():
    run(f"docker compose -f {DOCKER_COMPOSE_PATH} up -d")

def pull_all():
    print("Pulling backend image...")
    run(f"docker pull {BACKEND_IMAGE}")

    print("Pulling frontend image...")
    run(f"docker pull {BACKEND_IMAGE}")

def print_usage():
    print("Usage: python exec.py [pull|up|down]")
    # print("use 'all build' to build according to the docker compose")
    # print("use 'all push' to push the local frontend and backend images")
    # print("use 'db clear' to clear the DB's storage.")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print_usage()
        sys.exit(1)

    DOCKER_COMPOSE_PATH = os.path.abspath(DOCKER_COMPOSE_PATH)
    if not os.path.isfile(DOCKER_COMPOSE_PATH):
        print("Error: invalid docker compose path.")
        sys.exit(1)

    action = sys.argv[1]

    if action == "pull":
        pull_all()
    elif action == "up":
        compose_up()
    elif action == "down":
        compose_down()
    else:
        print_usage()
