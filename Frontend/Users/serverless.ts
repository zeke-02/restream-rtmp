// Requiring @types/serverless in your project package.json
import { PRIORITY_LOW } from 'constants';
import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: 'users',
  provider: {
    name:'aws',
    runtime: 'nodejs14.x',
    stage: 'dev',
    region: 'us-east-1',
    stackName: 'users-service-stack',
    logRetentionInDays: 7,
    environment: {
      WriterEndpoint: "${self:custom.POSTGRESQL.WriterEndpoint}",
      Port: "${self:custom.POSTGRESQL.Port}",
      ReaderEndpoint: "${self:custom.POSTGRESQL.ReaderEndpoint}",
      Username: "${self:custom.POSTGRESQL.Username}",
      Password: "${self:custom.POSTGRESQL.Password}"
    },
    iam: {
      role:{
        name:'restream-users-lambda-role',
        statements: [
          {
            Effect: 'Allow',
            Resource: '*',
            Action: '*'
          }
        ]        
      }
    },
    httpApi: {
      cors: true,
      // cors: {
      //   allowedOrigins:[
      //     '*'
      //   ],
      //   allowedHeaders: [
      //     'Content-Type',
      //     'Authorization',
      //     'X-Amz-Date',
      //     'X-Api-Key',
      //     'X-Amz-Security-Token',
      //     'X-Amz-User-Agent'
      //   ],
      //   allowedMethods: [
      //     'GET',
      //     'POST'
      //   ],
      //   allowCredentials: true,
      //   maxAge: 6000
      // },
      authorizers: {
        userPoolAuthorizer:{
          identitySource: "$request.header.Authorization",
          issuerUrl:"https://cognito-idp.us-east-1.amazonaws.com/us-east-1_la5u1CnTD",
          audience:[
            "62orgop2dnipvfsp2na9hqrapd"
          ]
        }
      }
    }
  },
  custom:{
    POSTGRESQL: {
      WriterEndpoint: { 'Fn::GetAtt' : [ 'AuroraCluster', 'Endpoint.Address' ] },
      Port: { 'Fn::GetAtt' : [ 'AuroraCluster', 'Endpoint.Port' ] },
      ReaderEndpoint: { 'Fn::GetAtt' : [ 'AuroraCluster', 'ReadEndpoint.Address' ] },
      Username: 'master',
      Password: 'password'
    }
  },
  functions: {
    create: {
      handler: 'lambdas/create.handler',
      vpc:{
        securityGroupIds: ['sg-06727be990068cfef'],
        subnetIds: ['subnet-00e70b5df3e8e3a2a']
      },
      events: [
          {
              httpApi: {
                  path: '/create',
                  method: 'POST',
                  authorizer: {
                    name: "userPoolAuthorizer"
                  }
              },
          },
      ],
    },
    retrieveUUID: {
      handler: 'lambdas/retrieveUUID.handler',
      vpc:{
        securityGroupIds: ['sg-06727be990068cfef'],
        subnetIds: ['subnet-00e70b5df3e8e3a2a']
      },
      events: [
          {
              httpApi: {
                  path: '/retrieveUUID',
                  method: 'POST',
                  authorizer: {
                    name: "userPoolAuthorizer"
                  }
              },
          },
      ],
    },
    retrieveKey: {
      handler: 'lambdas/retrieveKey.handler',
      vpc:{
        securityGroupIds: ['sg-06727be990068cfef'],
        subnetIds: ['subnet-00e70b5df3e8e3a2a']
      },
      events: [
          {
              httpApi: {
                  path: '/retrieveKey',
                  method: 'POST',
                  authorizer: {
                    name: "userPoolAuthorizer"
                  }
              },
          },
      ],
    },
    getKey: {
      handler: 'lambdas/getKey.handler',
      vpc:{
        securityGroupIds: ['sg-06727be990068cfef'],
        subnetIds: ['subnet-00e70b5df3e8e3a2a']
      },
      events: [
          {
              httpApi: {
                  path: '/getKey',
                  method: 'GET',
              },
          },
      ],
    },
    scratch: {
      handler: 'lambdas/scratch.handler',
      vpc:{
        securityGroupIds: ['sg-06727be990068cfef'],
        subnetIds: ['subnet-00e70b5df3e8e3a2a']
      },
      events: [
          {
              httpApi: {
                  path: '/scratch',
                  method: 'GET',
              },
          },
      ],
    },
    update: {
      handler: 'lambdas/update.handler',
      vpc:{
        securityGroupIds: ['sg-06727be990068cfef'],
        subnetIds: ['subnet-00e70b5df3e8e3a2a']
      },
      events: [
          {
              httpApi: {
                  path: '/update',
                  method: 'POST',
                  authorizer: {
                    name: "userPoolAuthorizer"
                  }
              },
          },
      ],
    }
    // deleteUser: {
    //   handler: 'lambdas/delete.handler',
    //   vpc:{
    //     securityGroupIds: ['sg-06727be990068cfef'],
    //     subnetIds: ['subnet-00e70b5df3e8e3a2a']
    //   },
    //   events: [
    //     {
    //       httpApi: {
    //         path: 'delete',
    //         method: 'POST',
    //       },
    //     },
    //   ],
    // },
    // updateUser: {
    //   handler: 'lambdas/update.handler',
    //   vpc:{
    //     securityGroupIds: ['sg-06727be990068cfef'],
    //     subnetIds: ['subnet-00e70b5df3e8e3a2a']
    //   },
    //   events: [
    //     {
    //       httpApi: {
    //         path: 'update',
    //         method: 'POST',
    //       },
    //     },
    //   ],
    // },
    // returnUser: {
    //   handler: 'lambdas/return.handler',
    //   vpc:{
    //     securityGroupIds: ['sg-06727be990068cfef'],
    //     subnetIds: ['subnet-00e70b5df3e8e3a2a']
    //   },
    //   events: [
    //     {
    //       httpApi: {
    //         path: 'return',
    //         method: 'POST',
    //       },
    //     },
    //   ],
    // },
  },
  resources: {
    Resources:{
      DBSubnetGroup:{
        Type : 'AWS::RDS::DBSubnetGroup',
        Properties : {
            DBSubnetGroupDescription : 'subnet group for users aurora postgres instances',
            DBSubnetGroupName : 'users-postgresql',
            SubnetIds : [ 'subnet-01ce3bdb73fa9e7d4', 'subnet-037c13f88ffee1a17' ],
          }
      },
      // RDSDBClusterParameterGroup: {
      //   Type: 'AWS::RDS::DBClusterParameterGroup',
      //   Properties: {
      //       Description: 'Aurora Postgresql Cluster Parameter Group',
      //       Family: 'aurora-postgresql12',
      //       Parameters: {
      //     }
      //   }
      // },
      // RDSDBParameterGroup: {
      //   Type: 'AWS::RDS::DBParameterGroup',
      //   Properties: {
      //       Description: 'CloudFormation Sample Aurora Parameter Group',
      //       Family: 'aurora-postgresql12',
      //       Parameters: {
      //           sql_mode: 'IGNORE_SPACE',
      //           max_allowed_packet: 1024,
      //       }
      //   },
      // },
      DBSecurityGroup:{
        Type: 'AWS::EC2::SecurityGroup',
        Properties: {
          GroupDescription: 'Access to Aurora User Credential Database',
          GroupName: 'aurora-group',
          SecurityGroupIngress:[
            {
              'Description' : 'Access from lambdas',
              'FromPort' : 0,
              'IpProtocol': '-1',
              'SourceSecurityGroupId' : 'sg-06727be990068cfef',
              'ToPort' : 6000,
            }
          ],
          VpcId:'vpc-05714f1a84a629b0c'
        }
      },
      AuroraCluster:{
        Type:'AWS::RDS::DBCluster',
        Properties:{
          DatabaseName:'Users',
          Engine:'aurora-postgresql',
          EngineVersion:'12.7',
          EngineMode:'provisioned',
          MasterUsername:'${self:custom.POSTGRESQL.Username}',
          MasterUserPassword: '${self:custom.POSTGRESQL.Password}',
          DBClusterParameterGroupName : "default.aurora-postgresql12",
          DBSubnetGroupName: {
            'Ref':'DBSubnetGroup'
          },
          // DBClusterParameterGroupName: {
          //   'Ref': 'RDSDBClusterParameterGroup'
          // },
          DBClusterIdentifier: 'user-postgresql-cluster',
          SourceRegion:'us-east-1',
          VpcSecurityGroupIds: [
            {
              'Ref':'DBSecurityGroup'
            }
          ] 
        }
      },
      AuroraDBFirstInstance:{
        Type:'AWS::RDS::DBInstance',
        Properties:{
          DBInstanceClass:'db.t4g.medium',
          Engine:'aurora-postgresql',
          EngineVersion:'12.7',
          DBClusterIdentifier:{'Ref': 'AuroraCluster'},
          DBSubnetGroupName: {
            'Ref': 'DBSubnetGroup'
          },
          // DBParameterGroupName: {
          //   'Ref': 'RDSDBParameterGroup'
          // },
        }
      },
      AuroraDBSecondInstance:{
        Type:'AWS::RDS::DBInstance',
        Properties:{
          DBInstanceClass:'db.t4g.medium',
          Engine:'aurora-postgresql',
          EngineVersion:'12.7',
          DBClusterIdentifier:{'Ref': 'AuroraCluster'},
          DBSubnetGroupName: {
            'Ref': 'DBSubnetGroup'
          },
          // DBParameterGroupName: {
          //   'Ref': 'RDSDBParameterGroup'
          // },
        }
      }
    }
  },
  plugins: [
      'serverless-offline'
    ]
};

module.exports = serverlessConfiguration;