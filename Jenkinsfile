pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "pedrodinis/movies-backend"
        FRONTEND_IMAGE = "pedrodinis/movies-frontend"
    }

    stages {

        stage('Clone') {
            steps {
                git branch: 'main', url: 'https://github.com/ASofy0007/TP_PD'
            }
        }

        stage('Build Backend') {
            steps {
                dir('RestAPI') {
                    sh 'docker build -t $BACKEND_IMAGE:latest .'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('WebApp') {
                    sh 'docker build -t $FRONTEND_IMAGE:latest .'
                }
            }
        }

        stage('Login & Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-token',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push pedrodinis/movies-backend:latest
                        docker push pedrodinis/movies-frontend:latest
                    '''
                }
            }
        }
        stage('Deploy with Ansible') {
            steps {
                sh '''
                    ansible-playbook -i Ansible/inventory.ini Ansible/deploy.yml
                '''
            }
        }
    }

   post {
        success {
            emailext(
                subject: "SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                    Build succeeded!
    
                    Project: ${env.JOB_NAME}
                    Build Number: ${env.BUILD_NUMBER}
                """,
                to: "test@mailtrap.io"
            )
        }
    
        failure {
            emailext(
                subject: "FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                    Build failed!
    
                    Project: ${env.JOB_NAME}
                    Build Number: ${env.BUILD_NUMBER}
                """,
                to: "test@mailtrap.io"
            )
        }
    }
}
