import subprocess
import os
import sys

# Configurations
DOCKER_COMPOSE_PATH = "./deploy/docker_compose.yml"

# - Mongo
DATABASE_COMPOSE_SERVICE = "mongo"
DATABASE_CONTAINER_NAME = "mongodb"
DATABASE_VOLUME_NAME = "mongo-data"

# # - Backend
# BACKEND_CONTAINER_NAME = "backend"
# BACKEND_DOCKERFILE_DIR = "./backend/"
# BACKEND_BUILD_NAME = "backend"
#
# # -Frontend
# FRONTEND_CONTAINER_NAME = "frontend"
# FRONTEND_DOCKERFILE_DIR = "./frontend/"
# FRONTEND_BUILD_NAME = "frontend"

def run(cmd, check=True, suppressOutput=False):
    print(f"▶ Running: {cmd}")
    subprocess.run(cmd, shell=True, check=check)

def start_db():
    print("Starting database...")
    run(f"docker compose -f {DOCKER_COMPOSE_PATH} up -d {DATABASE_COMPOSE_SERVICE}")
    print("Database is working!")

def stop_db():
    print("Stopping database...")
    run(f"docker stop {DATABASE_CONTAINER_NAME}")
    print("Stopped database successfully.")

def clear_db():
    compose_dir = os.path.dirname(DOCKER_COMPOSE_PATH)
    compose_namespace = os.path.basename(compose_dir)
    print("Stopping database...")
    run(f"docker stop {DATABASE_CONTAINER_NAME}", check=False)
    print("Clearing database data...")
    run(f"docker volume rm {compose_namespace}/{DATABASE_VOLUME_NAME}")
    print("Database cleared!")

def start_all():
    # -- Build backend locally into backend/dist
    print("Building backend...")
    run("cd ./backend && npm run build")

    # TODO: add option for --watch flag in compose (updates when files change) with a new Dockerfile.prod file for frontend
    print("Building and running all...")
    run(f"docker compose -f {DOCKER_COMPOSE_PATH} up -d --build")
    print("Started database and website successfully.")


def stop_all():
    print("Stopping current composition...")
    run(f"docker compose -f {DOCKER_COMPOSE_PATH} down")
    print("Stopped running.")

def print_usage():
    print("Usage: python runner.py [db|all] [on|stop|clear]")
    print("Note: use 'db clear' to clear the DB's storage.")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print_usage()
        sys.exit(1)
    
    DOCKER_COMPOSE_PATH = os.path.abspath(DOCKER_COMPOSE_PATH)
    if not os.path.isfile(DOCKER_COMPOSE_PATH):
        print("Error: invalid docker compose path.")
        sys.exit(1)

    mode, action = sys.argv[1], sys.argv[2]

    if mode == "db":
        if action == "on":
            start_db()
        elif action == "stop":
            stop_db()
        elif action == "clear":
            clear_db()
        else:
            print_usage()
    elif mode == "all":
        if action == "on":
            start_all()
        elif action == "stop":
            stop_all()
        else:
            print_usage()
    else:
        print_usage()