pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                // Checkout the code from a Git repository
                git 'https://github.com/your-username/your-nodejs-project.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                // Install Node.js dependencies using npm
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                // Run tests using npm test
                sh 'npm test'
            }
        }

        stage('Build') {
            steps {
                // Build your Node.js application
                sh 'npm run build'
            }
        }
    }

    post {
        success {
            // Send a notification or perform other actions on success
            echo 'Build successful! Deploying...'
        }
        failure {
            // Send a notification or perform other actions on failure
            echo 'Build failed! Check the logs for details.'
        }
    }
}
