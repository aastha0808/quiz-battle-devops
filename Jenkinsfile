pipeline {
    agent any

    environment {
        IMAGE_NAME    = "quiz-battle-backend"
        COMPOSE_FILE  = "docker-compose.yml"
        REPO_URL      = "https://github.com/aastha0808/quiz-battle-devops.git"
    }

    stages {

        stage('Clone Repository') {
            steps {
                echo '>>> Cloning source code from GitHub...'
                git branch: 'main',
                    url: "${REPO_URL}"
            }
        }

        stage('Build JAR with Maven') {
            steps {
                echo '>>> Building Spring Boot JAR...'
                dir('backend') {
                    sh 'chmod +x mvnw'
                    sh './mvnw clean package -DskipTests -B'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '>>> Building Docker image...'
                sh 'docker compose -f ${COMPOSE_FILE} build --no-cache backend'
            }
        }

        stage('Stop Old Containers') {
            steps {
                echo '>>> Tearing down old containers...'
                sh 'docker compose -f ${COMPOSE_FILE} down --remove-orphans || true'
            }
        }

        stage('Start New Containers') {
            steps {
                echo '>>> Starting fresh containers...'
                sh 'docker compose -f ${COMPOSE_FILE} up -d'
            }
        }

        stage('Health Check') {
            steps {
                echo '>>> Waiting for backend to be ready...'
                sh '''
                    sleep 20
                    curl -f http://localhost:8080/actuator/health || \
                    echo "Warning: Health check endpoint not reachable. Check if actuator is configured."
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Deployment complete. Quiz Battle is live!'
        }
        failure {
            echo '❌ Pipeline failed. Check logs above.'
            sh 'docker compose -f ${COMPOSE_FILE} logs --tail=50 || true'
        }
    }
}