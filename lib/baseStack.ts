import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secrets from 'aws-cdk-lib/aws-secretsmanager';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as utils from './utils/index';
import { Cognito } from './constructs/cognito';
import { Vpc } from './constructs/vpc';
import { Aurora } from './constructs/aurora';
import { Cloud9 } from './constructs/cloud9';
import { Analytics } from './constructs/analytics';
import { Monitoring } from './constructs/monitoring';

export interface BaseStackProps extends cdk.StackProps {
  sysId: string;
  envId: string;
  cloud9Owner: string;
  networkConf: INetworkConf;
  dataConf: IDataConf;
}

export interface INetworkConf {
  cidrBlock: string;
  cidrMaskPub: number;
  cidrMaskPri: number;
  cidrMaskSec: number;
}

export interface IDataConf {
  userName: string;
  dbName: string;
  minCapacity: number;
  maxCapacity: number;
}

export class BaseStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;
  public readonly securityGroup: {
    public: ec2.SecurityGroup
    private: ec2.SecurityGroup
    secure: ec2.SecurityGroup
  };
  public readonly alb: elbv2.ApplicationLoadBalancer;
  public readonly cluster: ecs.Cluster;
  public readonly dbSecret: secrets.Secret;
  public readonly userPoolId: string;
  public readonly userPoolClientId: string;
  
  constructor(scope: Construct, id: string, props: BaseStackProps) {
    super(scope, id, props);

    // ------------------------------
    // Authentication
    // ------------------------------

    const cognitoConstruct = new Cognito(this, 'CognitoConstruct', {
      userPoolName: `${props.sysId}-${props.envId}-userpool`,
    });

    // ------------------------------
    // Network
    // ------------------------------

    const vpcConstruct = new Vpc(this, 'VpcConstruct', {
      vpcName: `${props.sysId}-${props.envId}-vpc-main`,
      cidrBlock: props.networkConf.cidrBlock,
      cidrMaskPub: props.networkConf.cidrMaskPub,
      cidrMaskPri: props.networkConf.cidrMaskPri,
      cidrMaskSec: props.networkConf.cidrMaskSec,
      bucketName: `${props.sysId}-${props.envId}-s3-flowlog-${props.env!.account}`,
    });

    // ------------------------------
    // Database
    // ------------------------------

    const auroraConstruct = new Aurora(this, 'AuroraConstruct', {
      clusterIdentifier: `${props.sysId}-${props.envId}-rds-cluster`,
      dbUserName: props.dataConf.userName,
      dbName: props.dataConf.dbName,
      engineVersion: rds.AuroraMysqlEngineVersion.VER_3_05_2,
      parameterGroupName: `${props.sysId}-${props.envId}-rds-pg`,
      serverlessV2MinCapacity: props.dataConf.minCapacity,
      serverlessV2MaxCapacity: props.dataConf.maxCapacity,
      vpc: vpcConstruct.vpc,
      subnets: utils.getIsolatedSubnetsFromVpc(vpcConstruct.vpc),
      dbSecurityGroups: [vpcConstruct.securityGroup.secure],
      endpointSecurityGroups:  [vpcConstruct.securityGroup.private],
      secretName: `${props.sysId}-${props.envId}-secret-aurora`,
      endpointName: `${props.sysId}-${props.envId}-end-secret`,
    });

    // ------------------------------
    // Service
    // ------------------------------
    
    // DB管理用Cloud9
    const cloud9 = new Cloud9(this, 'Cloud9Construct', {
      env: props.env!,
      environmentName: `${props.sysId}-${props.envId}-env`,
      vpc: vpcConstruct.vpc,
      ownerName: props.cloud9Owner,
      dbSecurityGroup: vpcConstruct.securityGroup.secure,
    });
    
    // 他スタックへの参照用
    this.vpc = vpcConstruct.vpc;
    this.securityGroup = vpcConstruct.securityGroup;
    this.dbSecret = auroraConstruct.dbSecret;
    this.userPoolId = cognitoConstruct.userPool.userPoolId;
    this.userPoolClientId = cognitoConstruct.client.userPoolClientId;
  }
}