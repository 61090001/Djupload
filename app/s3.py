import boto3
from botocore.client import Config
import os

s3 = boto3.client('s3',
                    endpoint_url=os.getenv('S3_ENDPOINT_URL', 'http://localhost:9000'),
                    aws_access_key_id=os.getenv('S3_ACCESS_KEY_ID', ''),
                    aws_secret_access_key=os.getenv('S3_SECRET_ACCESS_KEY', ''),
                    config=Config(signature_version='s3v4'),
                    region_name=os.getenv('S3_REGION', 'us-east-1'))

bucket = os.getenv('S3_BUCKET', 'my-bucket')

# Generate a signed url for uploading file
def gensigneduploadurl(key):
    params = {'Bucket':bucket,'Key':key}
    return s3.generate_presigned_url('put_object', params)

# Generate a signed url for reading file
def gensignedreadurl(key):
    params = {'Bucket':bucket,'Key':key}
    return s3.generate_presigned_url('get_object', params)
