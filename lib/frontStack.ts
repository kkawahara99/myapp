import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import * as s3 from 'aws-cdk-lib/aws-s3';

export interface FrontStackProps extends cdk.StackProps {
  sysId: string;
  envId: string;
}

export class FrontStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: FrontStackProps) {
    super(scope, id, props);

    // S3バケットの作成
    const bucket = new s3.Bucket(this, 'FrontEndBucket', {
      bucketName: `${props.sysId}-${props.envId}-s3-frontend-${props.env!.account}`,
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // CloudFrontディストリビューションの作成
    const distribution = new cloudfront.CloudFrontWebDistribution(this, 'FrontEndDistribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: bucket
          },
          behaviors: [{ isDefaultBehavior: true }]
        }
      ]
    });

    // WAFの作成
    const webAcl = new wafv2.CfnWebACL(this, 'WebACL', {
      name: `${props.sysId}-${props.envId}-webacl`,
      defaultAction: { allow: {} },
      scope: 'CLOUDFRONT',
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: 'webACL',
        sampledRequestsEnabled: true
      },
      rules: [
        {
          name: 'AWS-AWSManagedRulesCommonRuleSet',
          priority: 1,
          statement: {
            managedRuleGroupStatement: {
              vendorName: 'AWS',
              name: 'AWSManagedRulesCommonRuleSet'
            }
          },
          action: { allow: {} },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: 'CommonRuleSet',
            sampledRequestsEnabled: true
          }
        }
      ]
    });

    // CloudFrontにWAFをアタッチ
    new cloudfront.CfnDistribution(this, 'Distribution', {
      distributionConfig: {
        enabled: true,
        origins: [
          {
            id: 'S3Origin',
            domainName: bucket.bucketWebsiteDomainName,
            s3OriginConfig: {
              originAccessIdentity: ''
            }
          }
        ],
        defaultCacheBehavior: {
          targetOriginId: 'S3Origin',
          forwardedValues: {
            queryString: false
          },
          viewerProtocolPolicy: 'allow-all'
        },
        webAclId: webAcl.attrArn
      }
    });
  }
}
