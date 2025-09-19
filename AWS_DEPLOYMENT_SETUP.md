# AWS Deployment Setup Guide for SkyTrack Backend

This guide will help you set up AWS deployment for the SkyTrack NestJS backend application.

## 🚀 Overview

The deployment workflow automatically triggers when you push to the `test` branch and deploys your application to AWS EC2 using Docker containers stored in Amazon ECR.

## 📋 Prerequisites

- AWS Account with appropriate permissions
- EC2 instance running Amazon Linux 2 or Ubuntu
- Docker installed on EC2 instance
- GitHub repository with proper secrets configured

## 🔧 AWS Infrastructure Setup

### 1. Create ECR Repository

```bash
# Create ECR repository for your Docker images
aws ecr create-repository --repository-name skytrack-backend --region us-east-1
```

### 2. Launch EC2 Instance

1. Launch an EC2 instance (t3.micro or larger)
2. Use Amazon Linux 2 or Ubuntu AMI
3. Configure Security Group to allow:
   - SSH (port 22) from your IP
   - HTTP (port 3000) from anywhere (or restrict as needed)
4. Create or use existing key pair for SSH access

### 3. Install Docker on EC2

```bash
# For Amazon Linux 2
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# For Ubuntu
sudo apt update
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ubuntu
```

### 4. Install AWS CLI on EC2

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

## 🔐 AWS Secrets Manager Setup

### 1. Create Database Secrets

```bash
# Create MongoDB connection secret
aws secretsmanager create-secret \
  --name "mongo" \
  --description "MongoDB connection details for SkyTrack" \
  --secret-string '{
    "connectionString": "mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority",
    "database": "dadosClima"
  }' \
  --region us-east-1

# Create PostgreSQL database secret
aws secretsmanager create-secret \
  --name "postgres" \
  --description "PostgreSQL database URL for SkyTrack" \
  --secret-string '{
    "DATABASE_URL": "postgresql://username:password@host:5432/database"
  }' \
  --region us-east-1
```

### 2. Verify Secrets

```bash
# Test retrieving secrets
aws secretsmanager get-secret-value --secret-id "mongo" --region us-east-1
aws secretsmanager get-secret-value --secret-id "postgres" --region us-east-1
```

## 🔑 GitHub Secrets Configuration

Add the following secrets to your GitHub repository (`Settings` > `Secrets and variables` > `Actions`):

### Required Secrets

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `AWS_ACCESS_KEY_ID` | AWS Access Key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_SESSION_TOKEN` | AWS Session Token (if using temporary credentials) | `IQoJb3JpZ2luX2VjE...` |
| `EC2_HOST` | EC2 instance public IP or domain | `ec2-12-34-56-78.us-east-1.compute.amazonaws.com` |
| `EC2_USER` | EC2 SSH username | `ec2-user` (Amazon Linux) or `ubuntu` (Ubuntu) |
| `EC2_PRIVATE_KEY` | Private key for EC2 SSH access | Contents of your `.pem` file |

### Optional Secrets

| Secret Name | Description |
|-------------|-------------|
| `SLACK_WEBHOOK_URL` | For deployment notifications |
| `DISCORD_WEBHOOK_URL` | For deployment notifications |

## 🏗️ Deployment Workflow

The deployment workflow (`.github/workflows/aws-deploy.yml`) will:

1. **Build**: Create Docker image with your NestJS application
2. **Push**: Upload image to Amazon ECR
3. **Deploy**: SSH into EC2 and run the new container
4. **Verify**: Check health endpoint to ensure deployment success

### Workflow Triggers

- Push to `test` branch
- Manual trigger via GitHub Actions UI

## 🔍 Troubleshooting

### Common Issues

1. **ECR Login Failed**
   ```bash
   # Test ECR login on EC2
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
   ```

2. **SSH Connection Failed**
   - Verify EC2 security group allows SSH from GitHub Actions IP ranges
   - Check private key format in GitHub secrets

3. **Health Check Failed**
   - Verify NestJS app is running on port 3000
   - Check that health endpoint returns 200 status at `/api/health`
   - Verify EC2 security group allows traffic on port 3000

4. **Database Connection Issues**
   - Verify AWS Secrets Manager permissions
   - Check secret names match workflow configuration
   - Test database connectivity from EC2

### Debug Commands

```bash
# On EC2 instance, check container logs
docker logs skytrack-backend

# Check if container is running
docker ps

# Check health endpoint locally
curl http://localhost:3000/api/health

# Test database connection
docker exec skytrack-backend npm run db:deploy
```

## 📊 Monitoring

### Application Health

- Health endpoint: `http://your-ec2-ip:3000/api/health`
- API documentation: `http://your-ec2-ip:3000/api-docs`

### Container Monitoring

```bash
# Check container status
docker ps -a

# View logs
docker logs skytrack-backend --tail 100 -f

# Check resource usage
docker stats skytrack-backend
```

## 🔄 Manual Deployment

If you need to deploy manually:

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Pull latest image
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker pull <account-id>.dkr.ecr.us-east-1.amazonaws.com/skytrack-backend:latest

# Stop old container
docker stop skytrack-backend || true
docker rm skytrack-backend || true

# Start new container
docker run -d \
  --name skytrack-backend \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com/skytrack-backend:latest
```

## 💰 Cost Optimization

- Use t3.micro or t3.small for development
- Set up CloudWatch alarms for cost monitoring
- Use ECR lifecycle policies to clean up old images
- Consider using Spot instances for non-production environments

## 🛡️ Security Best Practices

1. **Least Privilege Access**: Use IAM roles with minimal required permissions
2. **Secret Rotation**: Regularly rotate AWS credentials and database passwords
3. **Network Security**: Restrict security group rules to necessary ports and IPs
4. **Container Security**: Run containers as non-root user (already configured in Dockerfile)
5. **Monitoring**: Enable CloudTrail and VPC Flow Logs for auditing

## 📞 Support

If you encounter issues:

1. Check GitHub Actions logs for deployment errors
2. SSH into EC2 and check Docker logs
3. Verify AWS permissions and secret values
4. Test health endpoint manually

For more help, check the AWS documentation or contact your DevOps team.