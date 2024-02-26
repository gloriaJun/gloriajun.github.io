
#code-quality #sonar-qube #ci_cd

### configure sonar scanner
#### sonarqube-scanner (npm module)


```javascript
const path = require('path');  
  
const commander = require('commander');  
const scanner = require('sonarqube-scanner');  
  
const packageJSON = require('../package.json');  
  
const projectBaseDir = path.resolve(__dirname, '..');  
  
const arrayToString = (arr) => {  
  return arr.join(',');  
};  
  
const generateReportPath = (testTypes) => {  
  const baseDir = `tests/coverages`;  
  
  return {  
    'sonar.testExecutionReportPaths': arrayToString(  
      testTypes.map((type) => {  
        return `${baseDir}/${type}/test-sonar-report.xml`;  
      })  
    ),  
    'sonar.javascript.lcov.reportPaths': arrayToString(  
      testTypes.map((type) => {  
        return `${baseDir}/${type}/lcov.info`;  
      })  
    ),  
  };  
};  
  
/**  
 *  commands */commander  
  .arguments('<branch> [pullRequestId] [targetBranch]')  
  .description('sonar scanner', {  
    branch: 'current branch',  
    pullRequestId: 'pull request number',  
    targetBranch: 'target branch to merge',  
  })  
  .action(function (branch, pullRequestId, targetBranch) {  
    scanner(  
      {  
        serverUrl: <serverUrl>,  
        token: process.env.SONAR_TOKEN,        
        options: {  
          'sonar.verbose': 'true',  
          'sonar.ws.timeout': '300',  
          'sonar.projectKey': 'webapp',  
          'sonar.projectName': packageJSON.name,  
          'sonar.projectVersion': packageJSON.version,  
          'sonar.projectBaseDir': projectBaseDir,  
          'sonar.sourceEncoding': 'UTF-8',  
          ...(pullRequestId && targetBranch  
            ? {  
                'sonar.pullrequest.key': pullRequestId,  
                'sonar.pullrequest.branch': branch,  
                'sonar.pullrequest.base': targetBranch,
              }  
            : {  
                'sonar.branch.name': branch,  
              }),  
          'sonar.sources': 'src',  
          'sonar.exclusions': arrayToString([  
            '**/*.stories.*',  
            '**/__snapshots__/**',  
            '**/tests/**',  
            '**/libs/**',
            '**/assets/**',  
          ]),  
          'sonar.tests': 'src',  
          'sonar.test.inclusions': arrayToString([  
            '**/*.test.ts',  
            '**/*.test.tsx',  
            '**/*.test.js',  
            '**/*.spec.ts',  
            '**/*.spec.tsx',  
            '**/*.spec.js',  
          ]),  
          ...generateReportPath(['unit', 'storybook']),  
          'sonar.eslint.reportPaths': 'eslint.json',  
          'sonar.typescript.tsconfigPath': 'tsconfig.json',  
        },  
      },  
      () => process.exit()  
    );  
  })  
  .parse(process.argv);
```


#### sonar-project.properties

```bash
sonar.projectKey=<projectKey>
sonar.projectName=<projectName>
sonar.projectBaseDir=./apps 
sonar.sources=src  
sonar.verbose=true  
sonar.ws.timeout=300  
sonar.qualitygate.wait=true  
sonar.qualitygate.timeout=600
sonar.exclusions=**/*.stories.*,**/__snapshots__/**,*/tests/**,**/libs/**,**/assets/**
sonar.tests=src
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx,**/*.test.js,**/*.spec.ts,**/*.spec.tsx,**/*.spec.js
sonar.testExecutionReportPaths=coverages/unit/test-sonar-report.xml,tests/coverages/storybook/test-sonar-report.xml
sonar.javascript.lcov.reportPaths=coverages/unit/lcov.info,coverages/storybook/lcov.info
sonar.eslint.reportPaths=eslint.json
sonar.typescript.tsconfigPath=tsconfig.json
```


### Run with CI

#### Jenkins

##### run npm script
```bash
stages {  
  stage("Analysis") {  
    steps {  
      script {  
        withSonarQubeEnv('SonarQubeServer') {   
          withCredentials([string(credentialsId: 'sonar-credential-id', variable: 'SONAR_TOKEN')]) {  
            def sonarArgs = ''  
            if (isPrBranch == 'true') {  
              sonarArgs="${env.CHANGE_BRANCH} ${env.CHANGE_ID} ${env.CHANGE_TARGET}"  
            } else {  
              sonarArgs="${env.BRANCH_NAME}"  
            }  
              
            sh "SONAR_TOKEN=${SONAR_TOKEN} ${npmCommand} run sonar ${sonarArgs}" 
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
```

##### sonar scanner plugin

```bash
stages {
stage("Analysis") {
  steps {
	script {
	  def scannerHome = tool 'SonarQubeScanner'
	  
	  def args = ''
	  
	  if (isPrBranch == 'true') {
		args = " \
		  -Dsonar.pullrequest.key=${env.CHANGE_ID} \
		  -Dsonar.pullrequest.branch=${env.CHANGE_BRANCH} \
		  -Dsonar.pullrequest.base=${env.CHANGE_TARGET} \
		  "
	  } else {
		args = " \
		  -Dsonar.branch.name=${env.BRANCH_NAME} \
		  "
	  }

	  withSonarQubeEnv('SonarQubeServerForBankTH') {
		sh "${scannerHome}/bin/sonar-scanner \
		  -Dsonar.projectBaseDir=${HOME}/${BASE_WORK_DIR} \
		  -Dproject.settings=${HOME}/${BASE_WORK_DIR}/ci/sonar-scanner.properties \
		  ${args} \
			"
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
```


#### Gitlab

```yaml
sonarqube-check-branch:  
  stage: sonarqube-check  
  image:  
    name: sonarsource/sonar-scanner-cli:latest  
  needs:  
    - test-lint  
    - test-unit  
    - test-storybook  
  variables:  
    SONAR_USER_HOME: $CI_PROJECT_DIR/.sonar  # Defines the location of the analysis task cache  
    GIT_DEPTH: 0  # Tells git to fetch all the branches of the project, required by the analysis task  
    SCANNER_BRANCH_OPTIONS: >-  
      -Dsonar.branch.name=$CI_COMMIT_BRANCH  
  cache:  
    - key: sonar-$CI_COMMIT_REF_NAME  
      paths:  
        - .sonar/cache  
  rules:  
    - if: $CI_COMMIT_BRANCH == 'master' || $CI_COMMIT_BRANCH == 'develop'  
    - if: $CI_MERGE_REQUEST_IID  
      variables:  
        SCANNER_BRANCH_OPTIONS: >-  
          -Dsonar.pullrequest.key=$CI_MERGE_REQUEST_IID  
          -Dsonar.pullrequest.branch=$CI_MERGE_REQUEST_SOURCE_BRANCH_NAME  
          -Dsonar.pullrequest.base=$CI_MERGE_REQUEST_TARGET_BRANCH_NAME  
    - when: never  
  allow_failure: true  
  script:  
    - sonar-scanner -Dsonar.projectKey=$SONAR_PROJECT_KEY -Dproject.settings=sonar-project.properties $SCANNER_BRANCH_OPTIONS  
  
  
sonarqube-vulnerability-report:  
  stage: sonarqube-vulnerability-report  
  rules:  
    - !reference [sonarqube-check-branch, rules]  
  allow_failure: true  
  needs:  
    - sonarqube-check-branch  
  script:  
    - curl -u "${SONAR_TOKEN}:" "${SONAR_HOST_URL}/api/issues/gitlab_sast_export?${SONAR_PROJECT_KEY}&branch=${CI_COMMIT_BRANCH}&pullRequest=${CI_MERGE_REQUEST_IID}" -o gl-sast-sonar-report.json  
  artifacts:  
    expire_in: 1 day  
    reports:  
      sast: gl-sast-sonar-report.json
```


