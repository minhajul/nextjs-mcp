import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Create a security group allowing HTTP, HTTPS, and SSH
const securityGroup = new aws.ec2.SecurityGroup("nextjs-sg", {
    description: "Allow HTTP/HTTPS and SSH",
    ingress: [
        { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
        { protocol: "tcp", fromPort: 443, toPort: 443, cidrBlocks: ["0.0.0.0/0"] },
        { protocol: "tcp", fromPort: 3000, toPort: 3000, cidrBlocks: ["0.0.0.0/0"] },
        { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: ["0.0.0.0/0"] },
    ],
    egress: [{
        protocol: "-1",
        fromPort: 0,
        toPort: 0,
        cidrBlocks: ["0.0.0.0/0"],
    }],
});

// Create an EC2 instance
const instance = new aws.ec2.Instance("nextjs-mcp", {
    instanceType: "t3.micro",
    ami: aws.ec2.getAmi({
        owners: ["amazon"],
        mostRecent: true,
        filters: [{
            name: "name",
            values: ["amzn2-ami-hvm-*-x86_64-ebs"],
        }],
    }).then(ami => ami.id),
    vpcSecurityGroupIds: [securityGroup.id],
    keyName: "nextjs-mcp",
    userData: `#!/bin/bash
        # Install Node.js
        curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo yum install -y nodejs

        # Install PM2 globally
        sudo npm install -g pm2

        # Clone your Next.js app (replace with your repo)
        git clone https://github.com/minhajul/nextjs-mcp.git /home/ec2-user/app
        cd /home/ec2-user/app

        # Install dependencies
        npm install

        # Build the app
        npm run build

        # Start with PM2 and make it persistent
        pm2 start npm --name "nextjs" -- start
        pm2 save
        pm2 startup
    `,
    tags: {
        Name: "nextjs-app-server",
    },
});

// Export instance public IP and URL
export const publicIp = instance.publicIp;
export const publicUrl = pulumi.interpolate`http://${instance.publicIp}:3000`;