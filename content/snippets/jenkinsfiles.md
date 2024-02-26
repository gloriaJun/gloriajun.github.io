
#jenkins #ci_cd


```
#!/usr/bin/env groovy

@Library('shared-library') _

pipeline {
  agent {
    docker {
      image 'timbru31/java-node:17-jre-20'
      args '-v "${WORKSPACE}/../.sonar":/.sonar'
      reuseNode true
    }
  }
  
  environment {
    // npm_config_cache = "npm-cache"
    // NPM_CONFIG_PREFIX = "${env.WORKSPACE}/.npm"
    YARN_CACHE_FOLDER = "${env.WORKSPACE}/.yarn-cache"
    
    // to avoid 'ERROR: Failed to set up Chromium r1011831!'
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
//     PUPPETEER_EXECUTABLE_PATH=`which chromium`

    BASE_WORK_DIR="apps/web"
    
    /**
      defined internal env
    */
    npmCommand = "yarn"
    // branch check
    isMainBranch = "${env.BRANCH_NAME ==~ /(master|develop)$/}"
    isReleaseBranch = "${env.BRANCH_NAME ==~ /^(release)\/$/}"
//     isHotfixBranch = "${env.BRANCH_NAME ==~ /^(hotfix)\/$/}"
//     isFeatureBranch = "${env.BRANCH_NAME ==~ /^(feature)\/$/}"
    isPrBranch = "${env.BRANCH_NAME ==~ /^PR-\d+$/}"
    // temporary to deploy storybook until distribute insurance feature

    // for test report dir
    coverageReportBaseDir = "${BASE_WORK_DIR}/**/tests/coverages"
    junitReportFilename = "test-junit-report.xml"
  }

  options {
    buildDiscarder(logRotator(
      artifactDaysToKeepStr: '3',
      artifactNumToKeepStr: '3',
      daysToKeepStr: '3',
      numToKeepStr: "5"))
    timestamps()
    disableConcurrentBuilds(abortPrevious: true)
    parallelsAlwaysFailFast()
  }

  triggers {
    // https://www.shellhacks.com/jenkins-schedule-build-periodically-parameters/
    // https://www.jenkins.io/doc/book/pipeline/syntax/
    // interval: Run at some time between 12:00 AM and 2:59 AM
    cron(!(env.BRANCH_NAME ==~ /(master|feature\/)/) && env.CHANGE_ID == null ? '''@midnight''' : '')
    // cron(env.BRANCH_NAME != "master" && changeRequest() ? '''20 15 10 6 *''' : '')  // For Test: Build at 11.00am on June 10 
  }

  stages {

    stage('Checkout') {
      when {
        anyOf {
          not {
            triggeredBy 'TimerTrigger'
          }

          triggeredBy cause: "UserIdCause"

          allOf {
            triggeredBy 'TimerTrigger'
            expression {
              def prevBuild = currentBuild.previousBuild
              def hasChangeLog = {
                return {
                  info ->
                  return info.changeSets.size() > 0
                }
              }

              return (prevBuild != null && !prevBuild.buildCauses.toString().contains("TimerTrigger") && hasChangeLog().call(prevBuild)) || hasChangeLog().call(currentBuild)
            }
          }
        }
      } // end when of checkout

      stages {
        stage('Check Env') {
          steps {
            echo "Branch: ${env.BRANCH_NAME}, PrBranch: ${env.CHANGE_BRANCH}"
            sh "which node; node --version; yarn -version"
            sh "printenv"
          }
        }

        stage('Install Dependencies') {
          steps {
            script {
            
              if (isPrBranch) {
                sh "CYPRESS_INSTALL_BINARY=0 ${npmCommand} install"
              } else {
                sh "${npmCommand} install"
              }
            }
          }
        }

        stage('Tests') {
          parallel {
          
            stage('Lint') {
              steps {
                sh "${npmCommand} run web lint"
                sh "${npmCommand} run web lint -- -f json -o eslint.json"
              }
            }     

            stage('Unit Test Stages') {
              steps {
                script {
                  def list = [
                    unit: "unit",
                    storyshot: "storybook",
                  ];

                  list.each { item ->
                    stage("${item.key}") {
                      try {
                        sh "${npmCommand} run web test:${item.value}:coverage --detectOpenHandles --forceExit"
                      } finally {
                        junit allowEmptyResults: true, testResults: "${coverageReportBaseDir}/${item.value}/${junitReportFilename}"
                      }
                    }
                  } // end list.each
                }
              }
            } // end 'Unit Test Stages' stage

            stage('e2e & lhci') {
              when {
                anyOf {
                  triggeredBy 'TimerTrigger'
                }
              }

              stages {

                stage('Generate `.env`') {
                  steps {
                    createEnv()
                    sh "ls -al .env"
                    sh "cat .env"
                  }
                }

                stage('e2e Test') {
                  // when {
                  //   triggeredBy 'TimerTrigger'
                  // }

                  stages {

                    //   stage('Storybook image snapshot') {
                    //    when {
                    //      expression { isMainBranch == 'true' }
                    //    }

                    //    steps {
                    //      catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    //        script {
                    //          try {
                    //            sh "${npmCommand} run test:image-snapshot"
                    //          } catch (e) {
                    //            error e.message
                    //          }
                    //        }
                    //      }
                    //    }
                    //  } // end of 'Storybook image snapshot'

                    stage('Cypress') {
                      agent {
                        dockerfile {
                          filename "${env.WORKSPACE}/ci/e2e/Dockerfile"
                          args '-p 3000:3000'
                          reuseNode true
                        }
                      }  

                      options {
                        timeout(time: 5, unit: 'HOURS')
                      }

                      steps {
                        sh "nohup ${npmCommand} run lwv dev:coverage &"
                        echo "wait until server started"
                        sleep(time: 60, unit: "SECONDS")

                        script {

                          catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE', message: 'Cypress e2e test had a failure') {
                            sh "NO_COLOR=1 ${npmCommand} run web cypress:run"
                          }
                        }
                      }
                    } // end of cypress stage

                  } // end of e2e stages
                } // end of e2e stage

                stage('lhci Test') {
                  agent {
                    dockerfile {
                      filename "${env.WORKSPACE}/ci/e2e/Dockerfile"
                      args '-p 3000:3000'
                      reuseNode true
                    }
                  }  

                  options {
                    timeout(time: 2, unit: 'HOURS')
                  }

                  steps {
                    sh "nohup ${npmCommand} run lwv dev &"
                    echo "wait until server started"
                    sleep(time: 60, unit: "SECONDS")

                    script {
                      catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE', message: 'Lighthouse test had a failure') {
                        sh "${npmCommand} run web test:lhci"
                      }
                      sh "ls -al lhci-report"
                    }
                  }
                } // end of lhci stage

              } // end of e2e & lhci stages
            } // end of e2e & lhci stage

          } // end parallel
        } // end tests parallel stage


        stage('SonarQube') {
          when {
           not {
            anyOf {
                triggeredBy 'TimerTrigger'
              }
            }
          }        

          options {
            timeout(time: 1, unit: 'HOURS')
          }

          stages {
            stage("Analysis") {
              steps {
                script {
                  withSonarQubeEnv('SonarQubeServerForBankTH') { 
                    withCredentials([string(credentialsId: 'sonar-fintech_web3_ci.bot', variable: 'SONAR_TOKEN')]) {
                      def sonarArgs = ''
                      if (isPrBranch == 'true') {
                        sonarArgs="${env.CHANGE_BRANCH} ${env.CHANGE_ID} ${env.CHANGE_TARGET}"
                      } else {
                        sonarArgs="${env.BRANCH_NAME}"
                      }
                      
                      echo "sonarArgs: ${sonarArgs}"
                      
                      sh "SONAR_TOKEN=${SONAR_TOKEN} ${npmCommand} run web sonar ${sonarArgs}"
                    }
                  } // end of 'withSonarQubeEnv'
                } // end of 'script' of 'Analysis' stages
              }
            }

            stage("Quality Gate") {
              options {
                  timeout(time: 5, unit: 'MINUTES')
                  retry(5)
              }

              steps {
                waitForQualityGate abortPipeline: false
              }
            }
          }
        } // end of 'SonarQube' stage        

        stage('Build') {
          when {
           not {
            anyOf {
                triggeredBy 'TimerTrigger'
              }
            }
          }

          parallel {
            stage('App') {
              steps {
                sh "${npmCommand} run web build"
              }
            }

            stage('Storybook') {
              when {
                anyOf {
                  expression {
                    isReleaseBranch == 'true'
                  }
                }
              }

              stages {
                stage("Build") {
                  steps {
                    script {
                      withCredentials([string(credentialsId: 'ZEPLIN_TOKEN', variable: 'TOKEN')]) {
                        sh "STORYBOOK_ZEPLIN_TOKEN=${TOKEN} ${npmCommand} run web storybook:build"
                        sh "ls -al ${BASE_WORK_DIR}/.out"
                      }
                    }
                  }
                }

                stage("Deploy") {
                  options {
                    timeout(time: 10, unit: 'MINUTES')
                  }

                  steps {
                    script {
                      def getDir = {
                        def dirs = env.BRANCH_NAME.split(" / ")
                        
                        if (isMainBranch) {
                          return dirs[0]
                        } else {
                          return dirs[1]
                        }
                      }
                      echo "${getDir()}"
                    
                      deploy([
                        outputDir: "${BASE_WORK_DIR}/.out",
                        deployTargetDir: "storybook/dist"
                      ])
                    }
                  }
                }
              }
            }
          }
        } // end of 'Build' stage         

      } // end of checkout stages
    } // end of checkout stage

  } // end of pipeline stages

  post {
    cleanup {
      cleanWs(
        deleteDirs: true,
        patterns: [
          [pattern: 'dist', type: 'INCLUDE'],
          [pattern: '.out', type: 'INCLUDE'],
          [pattern: coverageReportBaseDir, type: 'INCLUDE'],
        ]
      )
    }

    success {
      script {
        if (jenkinsStatus.isBackToNormal()) {
          sendNotifications.success()
        }
      }
    }

    unstable {
      script {
        sendNotifications.unstable()
      }
    }

    failure {
      script {
        sendNotifications.fail()
      }
    }
  }
} // end pipeline
```