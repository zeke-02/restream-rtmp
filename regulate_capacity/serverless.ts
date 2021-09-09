import type { AWS } from '@serverless/typescript';

//import hello from '@functions/hello';

const serverlessConfiguration: AWS = {
  service: 'regulateCapacity',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true,
    },
  },
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
    lambdaHashingVersion: '20201221',
    iamRoleStatements: [
      {
          Effect: 'Allow',
          Action: [
            'lambda:*'
          ],
          Resource: '*',
      },
      {
        Effect: 'Allow',
        Action: [
          'ecs:listTasks',
          'ecs:updateService'
        ],
        Resource: '*',
    },
  ],
  },
  // import the function via paths
  functions: { regulateCapacity: {
    handler: 'lambdas/regulateCapacity.handler',
    vpc:{
      securityGroupIds: ['sg-06727be990068cfef'],
      subnetIds: ['subnet-00e70b5df3e8e3a2a']
    },
    events: [
        {
            http: {
                path: 'regulate',
                method: 'get',
                cors: true,
            },
        },
    ],
}, resetPID: {
  handler: 'lambdas/resetPID.handler',
  vpc:{
    securityGroupIds: ['sg-06727be990068cfef'],
    subnetIds: ['subnet-00e70b5df3e8e3a2a']
  },
  events: [
      {
          http: {
              path: 'invoke',
              method: 'get',
              cors: true,
          },
      },
  ],},
},
};

module.exports = serverlessConfiguration;
