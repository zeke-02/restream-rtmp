import type { AWS } from '@serverless/typescript';

//import hello from '@functions/hello';

const serverlessConfiguration: AWS = {
  service: 'Stats',
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
    iam: {
      role: 'arn:aws:iam::839237287596:role/demo-lambda-vpc',
    }
  },
  // import the function via paths
  functions: { getStats: {
    handler: 'lambdas/getStats.handler',
    vpc:{
      securityGroupIds: ['sg-06727be990068cfef'],
      subnetIds: ['subnet-00e70b5df3e8e3a2a']
    },
    events: [
        {
            http: {
                path: 'get-stats',
                method: 'get',
                cors: true,
            },
        },
    ],},
    testSet: {
      handler: 'lambdas/testSet.handler',
      vpc:{
        securityGroupIds: ['sg-06727be990068cfef'],
        subnetIds: ['subnet-00e70b5df3e8e3a2a']
      },
      events: [
          {
              http: {
                  path: 'set',
                  method: 'get',
                  cors: true,
              },
          },
      ],},
      testGet: {
        handler: 'lambdas/testGet.handler',
        vpc:{
          securityGroupIds: ['sg-06727be990068cfef'],
          subnetIds: ['subnet-00e70b5df3e8e3a2a']
        },
        events: [
            {
                http: {
                    path: 'get',
                    method: 'get',
                    cors: true,
                },
            },
        ],},
        uploadUsers: {
          handler: 'lambdas/uploadUsers.handler',
          vpc:{
            securityGroupIds: ['sg-0d863373165dab029'],
            subnetIds: ['subnet-0e8bff91d567fd71d']
          },
          events: [
              {
                  http: {
                      path: 'uploadUsers',
                      method: 'get',
                      cors: true,
                  },
              },
          ],}
  },
};

module.exports = serverlessConfiguration;
