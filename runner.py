import subprocess
import os
import sys

# Configurations
DOCKER_COMPOSE_PATH = "./deploy/docker_compose.yml"

VERSION = 0.1
BACKEND_IMAGE = f"idoshahar/tahash-backend:v{VERSION}"
FRONTEND_IMAGE = f"idoshahar/tahash-frontend:v{VERSION}"

# - Mongo
DATABASE_COMPOSE_SERVICE = "mongo"
DATABASE_CONTAINER_NAME = "mongodb"
DATABASE_VOLUME_NAME = "mongo-data"

def run(cmd, check=True):
    print(f"▶ Running: {cmd}")
    subprocess.run(cmd, shell=True, check=check)

def start_db():
    print("Starting database...")
    run(f"docker compose -f {DOCKER_COMPOSE_PATH} up -d {DATABASE_COMPOSE_SERVICE}")
    print("Database is working!")

def stop_db():
    print("Stopping database...")
    run(f"docker compose -f {DATABASE_CONTAINER_NAME} down")
    print("Stopped database successfully.")

def clear_db():
    print("Stopping composition and clearing database volume...")
    run(f"docker compose -f {DOCKER_COMPOSE_PATH} down -v")
    run(f"docker compose -f {DOCKER_COMPOSE_PATH} up -d")
    # compose_dir = os.path.dirname(DOCKER_COMPOSE_PATH)
    # compose_namespace = os.path.basename(compose_dir)
    # print("Stopping database...")
    # run(f"docker compose down {DATABASE_CONTAINER_NAME}", check=False)
    # print("Clearing database data...")
    # run(f"docker volume rm {compose_namespace}/{DATABASE_VOLUME_NAME}")
    # print("Database cleared!")

def build_all():
    print("Building backend...")
    run("cd ./backend && npm run build")

    print("Building docker images...")
    run(f"docker compose -f {DOCKER_COMPOSE_PATH} build")

def push_all():
    print("Pushing local images...")
    run(f"docker push {BACKEND_IMAGE}")
    run(f"docker push {FRONTEND_IMAGE}")

def start_all():
    # -- Build backend locally into backend/dist
    build_all()

    print("Building and running all...")
    run(f"docker compose -f {DOCKER_COMPOSE_PATH} up -d")
    print("Started database and website successfully.")


def stop_all():
    print("Stopping current composition...")
    run(f"docker compose -f {DOCKER_COMPOSE_PATH} down")
    print("Stopped running.")

def print_usage():
    print("Usage: python runner.py [db|all] [on|stop|clear|build-push|build|push]")
    print("use 'all build' to build according to the docker compose")
    print("use 'all push' to push the local frontend and backend images")
    print("use 'db clear' to clear the DB's storage.")

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
        elif action == "build-push":
            print("BUILD:")
            build_all()
            print("PUSH:")
            push_all()
        elif action == "build":
            build_all()
        elif action == "push":
            push_all()
        else:
            print_usage()
    else:
        print_usage()