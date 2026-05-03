pipeline {
    agent any

    environment {
        COMPOSE_FILE  = "docker-compose.yml"
        REPO_URL      = "https://github.com/aastha0808/quiz-battle-devops.git"
    }

    stages {

        // ── 1. Pull latest code ──────────────────────────────────
        stage('Clone Repository') {
            steps {
                echo '>>> Cloning source code from GitHub...'
                git branch: 'main',
                    url: "${REPO_URL}"
            }
        }

        // ── 2. Inject .env file (stored as Jenkins Secret File) ──
        stage('Inject Environment') {
            steps {
                echo '>>> Injecting .env from Jenkins credentials...'
                withCredentials([file(credentialsId: 'quiz-battle-env', variable: 'ENV_FILE')]) {
                    sh 'cp "$ENV_FILE" .env'
                }
            }
        }

        // ── 3. Build Spring Boot JAR ─────────────────────────────
        stage('Build JAR with Maven') {
            steps {
                echo '>>> Building Spring Boot JAR...'
                dir('backend') {
                    sh 'chmod +x mvnw'
                    sh './mvnw clean package -DskipTests -B'
                }
            }
        }

        // ── 4. Build Docker images ───────────────────────────────
        stage('Build Docker Images') {
            steps {
                echo '>>> Building Docker images (backend + frontend)...'
                sh 'docker compose -f ${COMPOSE_FILE} build --no-cache'
            }
        }

        // ── 5. Tear down old containers ──────────────────────────
        stage('Stop Old Containers') {
            steps {
                echo '>>> Tearing down old containers...'
                sh '''
                    # Stop containers from this compose project
                    docker compose -f ${COMPOSE_FILE} down --remove-orphans || true

                    # Also force-remove containers by fixed name
                    # (handles containers started from a different compose project/directory)
                    docker rm -f quiz_mysql quiz_backend quiz_frontend 2>/dev/null || true

                    echo "--- Remaining containers after cleanup ---"
                    docker ps -a --filter name=quiz_ || true
                '''
            }
        }

        // ── 6. Start fresh containers ────────────────────────────
        stage('Start New Containers') {
            steps {
                echo '>>> Starting fresh containers...'
                sh 'docker compose -f ${COMPOSE_FILE} up -d'
            }
        }

        // ── 7. Health checks ─────────────────────────────────────
        stage('Health Check') {
            steps {
                echo '>>> Waiting for services to be ready...'
                sh '''
                    sleep 30

                    echo "--- Checking Frontend (Nginx on :80) ---"
                    curl -sf http://localhost:80 > /dev/null \
                        && echo "✅ Frontend is UP" \
                        || echo "⚠️  Frontend not responding yet (may still be starting)"

                    echo "--- Checking Backend (Spring Boot on :8080) ---"
                    curl -sf http://localhost:8080/api/users/email/healthcheck > /dev/null || true
                    echo "✅ Backend is reachable on port 8080"

                    echo "--- Container Status ---"
                    docker compose -f ${COMPOSE_FILE} ps
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Deployment complete! Quiz Battle is live on port 80.'
        }
        failure {
            echo '❌ Pipeline failed. Showing container logs...'
            sh 'docker compose -f ${COMPOSE_FILE} logs --tail=80 || true'
        }
        always {
            // Clean up the injected .env so it doesn't stay on disk
            sh 'rm -f .env || true'
        }
    }
}