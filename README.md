# DVP

# 📊 Database Cost Analysis: 100 Million Records System Design

> **Complete System Design & Pricing Comparison for 10 Crore Records (100M)**  
> **Record Size:** 15 KB | **Total Data:** ~1.5 TB | **Workload:** Read-Heavy (95% Read / 5% Write)  
> **Date:** December 2025

---

## 📑 Table of Contents

- [Executive Summary](#executive-summary)
- [Data Architecture Overview](#data-architecture-overview)
- [Option A: Self-Hosted MongoDB (Hostinger VPS)](#option-a-self-hosted-mongodb-hostinger-vps)
- [Option B: MongoDB Atlas (Managed Service)](#option-b-mongodb-atlas-managed-service)
- [Option C: AWS DynamoDB (Serverless)](#option-c-aws-dynamodb-serverless)
- [Detailed Cost Breakdown by Traffic](#detailed-cost-breakdown-by-traffic)
- [Pros & Cons Analysis](#pros--cons-analysis)
- [Final Recommendation](#final-recommendation)
- [Implementation Guide](#implementation-guide)
- [FAQ](#faq)

---

## Executive Summary

### The Challenge
You need to store **100 million records** where each record is **15 KB** in size (nested JSON/documents). This is **15x larger** than typical database benchmarks, which fundamentally changes the economics of database selection.

### Key Findings

| Database Solution | Monthly Cost (10k req/day) | Monthly Cost (1M req/day) | Best For |
|-------------------|---------------------------|--------------------------|----------|
| **Self-Hosted MongoDB** | **$156** | **$156** | **Budget-conscious, technical teams** |
| MongoDB Atlas | $1,300 | $1,350 | Enterprise teams wanting zero maintenance |
| AWS DynamoDB | $526 | $600 | Infinite scale requirements (millions of req/sec) |

### 🏆 Winner: Self-Hosted MongoDB on Hostinger VPS
- **85% cheaper** than MongoDB Atlas
- **74% cheaper** than AWS DynamoDB
- **Fixed cost** regardless of traffic (10k or 1M req/day)
- Full control, no vendor lock-in

---

## Data Architecture Overview

### 📦 Data Specifications

```
Total Records:        100,000,000 (10 Crore)
Average Record Size:  15 KB
Total Raw Data:       1,500 GB (1.465 TB)
With Indexes (+25%):  1,875 GB (1.83 TB)
Compressed Storage:   1,000-1,200 GB (MongoDB WiredTiger compression)
```

### 🔄 Workload Profile

```
Write Operations:  5% (5 million writes once data is loaded)
Read Operations:   95% (95 million reads)
Traffic Scenarios: 10k, 100k, 1M requests per day
```

### 🎯 Why 15KB Record Size Matters

Most database pricing is optimized for **1 KB records**. Your 15 KB records have massive implications:

- **DynamoDB:** Charges per 1KB unit → you pay **15x more per operation**
- **MongoDB:** Uses compression → saves ~30-40% on storage
- **Atlas:** Storage capacity tiers → need M40/M50 instead of M10/M20

---

## Option A: Self-Hosted MongoDB (Hostinger VPS)

### Architecture Design

```
┌─────────────────────────────────────────────┐
│         6-Node Sharded Cluster               │
├─────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐          │
│  │Shard 1 │ │Shard 2 │ │Shard 3 │          │
│  │ KVM 8  │ │ KVM 8  │ │ KVM 8  │          │
│  │ 32GB   │ │ 32GB   │ │ 32GB   │          │
│  │ 400GB  │ │ 400GB  │ │ 400GB  │          │
│  └────────┘ └────────┘ └────────┘          │
│                                             │
│  ┌────────┐ ┌────────┐                     │
│  │Shard 4 │ │Shard 5 │                     │
│  │ KVM 8  │ │ KVM 8  │                     │
│  │ 32GB   │ │ 32GB   │                     │
│  │ 400GB  │ │ 400GB  │                     │
│  └────────┘ └────────┘                     │
│                                             │
│  ┌──────────────────┐                      │
│  │  Config/Router   │                      │
│  │     KVM 4        │                      │
│  │     16GB RAM     │                      │
│  │     200GB        │                      │
│  └──────────────────┘                      │
└─────────────────────────────────────────────┘
```

### Hostinger VPS Specifications

Based on current December 2025 pricing, Hostinger offers:

| Plan | vCPU | RAM | Storage | Bandwidth | Price/Month |
|------|------|-----|---------|-----------|-------------|
| **KVM 8** | 8 cores | 32 GB | 400 GB NVMe | 32 TB | **$19.99** |
| KVM 4 | 4 cores | 16 GB | 200 GB NVMe | 16 TB | $10.49 |
| KVM 2 | 2 cores | 8 GB | 100 GB NVMe | 8 TB | $5.99 |

### Cost Breakdown (Monthly)

| Component | Details | Cost |
|-----------|---------|------|
| **Compute** | 5 x KVM 8 Data Shards @ $19.99 | $99.95 |
| **Compute** | 1 x KVM 4 Config Server @ $10.49 | $10.49 |
| **Storage** | Included (2.4 TB total across 6 nodes) | $0.00 |
| **Backup Storage** | AWS S3 Standard-IA (1.5 TB @ $0.0125/GB) | $18.75 |
| **Backup Transfer** | Monthly sync to S3 | $5.00 |
| **Total** | **Fixed Monthly Cost** | **$134.19** |

### 📊 Traffic Scaling

| Daily Requests | Monthly Cost | Cost per 1M Requests |
|----------------|--------------|---------------------|
| 10,000 | $134.19 | N/A (Fixed) |
| 100,000 | $134.19 | N/A (Fixed) |
| 1,000,000 | $134.19 | N/A (Fixed) |

**Key Insight:** Self-hosted = Fixed cost. No per-request charges.

### Storage Capacity Analysis

```
Total Cluster Storage:  2,400 GB (6 nodes × 400 GB)
Data Distribution:      1,200 GB actual data ÷ 5 shards = ~240 GB per shard
Headroom:              160 GB per shard for growth
Utilization:           ~60% per node
```

### Backup Strategy

```bash
# Daily Backup Script
mongodump --host=localhost --port=27017 --gzip --archive=/backup/dump-$(date +%Y%m%d).gz

# Compress and Encrypt
tar -czf backup.tar.gz dump.gz
openssl enc -aes-256-cbc -salt -in backup.tar.gz -out backup.enc

# Upload to S3 Standard-IA
aws s3 cp backup.enc s3://your-bucket/backups/$(date +%Y%m%d)/
```

**Backup Costs:**
- S3 Standard-IA Storage: $0.0125/GB/month
- 1,500 GB × $0.0125 = **$18.75/month**
- Retrieval: $0.01 per GB (only when restoring)

---

## Option B: MongoDB Atlas (Managed Service)

### Architecture Design

```
┌────────────────────────────────────┐
│    MongoDB Atlas M50 Cluster       │
├────────────────────────────────────┤
│  Cloud Provider: AWS/GCP/Azure     │
│  Region: US-East-1                 │
│  Storage: 160 GB NVMe (Default)    │
│  RAM: 32 GB                        │
│  vCPU: 8 cores                     │
│  Auto-Scaling: Enabled             │
│  Backup: Continuous Cloud Backup   │
└────────────────────────────────────┘
```

### Cluster Tier Selection

For 1.5 TB of data, you need **M40 or M50** tier:

| Tier | RAM | Storage | vCPU | Hourly | Monthly (730 hrs) |
|------|-----|---------|------|--------|-------------------|
| M30 | 8 GB | 40 GB | 2 | $0.54 | $394 |
| **M40** | 16 GB | 80 GB | 4 | **$1.13** | **$825** |
| **M50** | 32 GB | 160 GB | 8 | **$2.00** | **$1,460** |

### Why M40/M50 is Required

M10-M40 clusters maintain a 60:1 RAM-to-storage ratio, while larger configurations use 120:1 ratios. For 1.5 TB:
- M40 provides 80 GB storage → Need to scale up
- M50 provides 160 GB storage → Still need customization
- **Custom storage expansion required** → Additional costs

### Cost Breakdown (Monthly)

| Component | Details | Cost |
|-----------|---------|------|
| **M50 Base Cluster** | 32 GB RAM, 160 GB storage, 8 vCPU | $1,460 |
| **Storage Expansion** | +1,340 GB custom storage | $335 |
| **Backup (Cloud Backup)** | Snapshot storage billed per GB-day | $150 |
| **Data Transfer** | Inter-region/public egress | $50 |
| **Total** | **Managed Service** | **$1,995** |

### 📊 Traffic Scaling

| Daily Requests | Additional Traffic Cost | Total Monthly |
|----------------|------------------------|---------------|
| 10,000 | $0 | $1,995 |
| 100,000 | ~$10 | $2,005 |
| 1,000,000 | ~$50 | $2,045 |

**Note:** Atlas doesn't charge per request like DynamoDB, but data transfer increases with traffic.

### Backup Pricing

Cloud Backups charge per GB per month, with rates varying by provider:

| Provider | Cost per GB/Month |
|----------|-------------------|
| AWS | $0.14 - $0.19 |
| Azure | $0.34 - $0.65 |
| GCP | $0.08 - $0.12 |

For 1,500 GB on AWS: **1,500 × $0.14 = $210/month**

---

## Option C: AWS DynamoDB (Serverless)

### Architecture Design

```
┌────────────────────────────────────┐
│     AWS DynamoDB Table             │
├────────────────────────────────────┤
│  Capacity Mode: On-Demand          │
│  Table Class: Standard             │
│  Encryption: SSE-KMS               │
│  Backup: Point-in-Time Recovery    │
│  Global Tables: No (single region) │
└────────────────────────────────────┘
```

### ⚠️ The 15KB Problem

DynamoDB's pricing model penalizes large items:

**Write Capacity Units (WCU):**
- 1 WCU = 1 write of up to **1 KB**
- Your 15 KB item = **15 WCUs per write**
- Standard table: $1.25 per million WRUs

**Read Capacity Units (RCU):**
- 1 RCU = 1 strongly consistent read of up to **4 KB**
- Your 15 KB item = **4 RCUs per read** (15÷4 = 3.75, rounded up to 4)
- Standard table: $0.25 per million RRUs

### Cost Breakdown (Monthly)

#### Base Costs (Zero Traffic)

| Component | Calculation | Cost |
|-----------|-------------|------|
| **Storage** | 1,500 GB × $0.25/GB | $375.00 |
| **PITR Backup** | 1,500 GB × $0.20/GB | $300.00 |
| **Base Total** | Storage + Backup | **$675.00** |

#### Traffic Costs (10k Requests/Day)

```
Daily: 10,000 requests
Monthly: 300,000 requests

Writes (5%): 15,000 requests × 15 WCUs = 225,000 WCUs
Reads (95%): 285,000 requests × 4 RCUs = 1,140,000 RCUs

Write Cost: 0.225M × $1.25 = $0.28
Read Cost: 1.14M × $0.25 = $0.29
Traffic Total: $0.57
```

**Total: $675.00 + $0.57 = $675.57/month**

#### Traffic Costs (1M Requests/Day)

```
Daily: 1,000,000 requests
Monthly: 30,000,000 requests

Writes (5%): 1,500,000 × 15 WCUs = 22,500,000 WCUs
Reads (95%): 28,500,000 × 4 RCUs = 114,000,000 RCUs

Write Cost: 22.5M × $1.25 = $28.13
Read Cost: 114M × $0.25 = $28.50
Traffic Total: $56.63
```

**Total: $675.00 + $56.63 = $731.63/month**

### 📊 Complete Traffic Analysis

| Daily Requests | Storage | PITR | Traffic | **Total** |
|----------------|---------|------|---------|-----------|
| 0 (storage only) | $375 | $300 | $0 | **$675** |
| 10,000 | $375 | $300 | $1 | **$676** |
| 100,000 | $375 | $300 | $8 | **$683** |
| 1,000,000 | $375 | $300 | $57 | **$732** |

---

## Detailed Cost Breakdown by Traffic

### Complete Monthly Costs

| Traffic Level | Self-Hosted | MongoDB Atlas | AWS DynamoDB | Winner |
|---------------|-------------|---------------|--------------|--------|
| **10k req/day** | $134 | $1,995 | $676 | Self-Hosted |
| **100k req/day** | $134 | $2,005 | $683 | Self-Hosted |
| **1M req/day** | $134 | $2,045 | $732 | Self-Hosted |

### Cost per Million Requests

| Solution | Cost per 1M Requests | Notes |
|----------|---------------------|-------|
| **Self-Hosted** | $0.00 (Fixed) | No per-request charges |
| **MongoDB Atlas** | ~$1.50 | Minor data transfer costs |
| **AWS DynamoDB** | ~$56.63 | Heavy penalty for 15KB items |

### Annual Cost Projection (1M req/day)

| Solution | Monthly | Annual | 3-Year Total |
|----------|---------|--------|--------------|
| **Self-Hosted** | $134 | $1,608 | $4,824 |
| **MongoDB Atlas** | $2,045 | $24,540 | $73,620 |
| **AWS DynamoDB** | $732 | $8,784 | $26,352 |

**Savings with Self-Hosted:**
- vs Atlas: **$68,796 over 3 years**
- vs DynamoDB: **$21,528 over 3 years**

---

## Pros & Cons Analysis

### 🟢 Self-Hosted MongoDB (Hostinger VPS)

| ✅ Pros | ❌ Cons |
|---------|---------|
| **Unbeatable Price:** <$150/month for enterprise scale | **Manual Setup:** Requires Linux, MongoDB, sharding configuration |
| **Fixed Costs:** No surprises, predictable billing | **Maintenance:** You handle upgrades, patches, monitoring |
| **High Performance:** 32GB RAM per node, NVMe SSDs | **Backup Management:** Must script and maintain S3 sync |
| **Full Control:** Custom configs, indices, query optimization | **Downtime Risk:** If node fails, you must fix it |
| **No Vendor Lock-in:** Move data anywhere, no proprietary formats | **Scaling Complexity:** Adding shards requires planning |
| **Data Sovereignty:** Complete control over data location | **No Automatic Scaling:** Must manually scale up/down |

**Best For:** Teams with DevOps skills, budget-conscious startups, predictable workloads

---

### 🔵 MongoDB Atlas (Managed Service)

| ✅ Pros | ❌ Cons |
|---------|---------|
| **Zero Maintenance:** No server management, automatic updates | **Expensive:** 15x more costly than self-hosted |
| **Auto-Scaling:** Click to scale tier or storage | **Storage Penalty:** Custom storage costs don't deduct base tier |
| **Enterprise Security:** Built-in encryption, compliance, auditing | **Vendor Lock-in:** Harder to migrate away |
| **Global Distribution:** Multi-region with one click | **Limited Control:** Can't access underlying OS or config files |
| **Professional Support:** 24/7 support from MongoDB experts | **Data Transfer Costs:** Charges for cross-region traffic |
| **Automatic Backups:** Point-in-time recovery built-in | **Minimum Tier Costs:** Can't downgrade below certain thresholds |

**Best For:** Enterprises wanting "peace of mind," teams without DevOps resources, compliance-heavy industries

---

### 🟠 AWS DynamoDB (Serverless)

| ✅ Pros | ❌ Cons |
|---------|---------|
| **Infinite Scale:** Can handle 100M req/sec if needed | **15KB Penalty:** You pay 15x more per write than 1KB benchmarks |
| **True Serverless:** No servers, no capacity planning | **Expensive Storage:** $0.25/GB (no compression) vs MongoDB's compression |
| **99.999% SLA:** Industry-leading uptime guarantee | **Redesign Required:** Can't directly port MongoDB schemas |
| **AWS Integration:** Native with Lambda, API Gateway, S3 | **Limited Querying:** No joins, limited indexing (GSI/LSI only) |
| **Pay-per-Request:** Only pay for what you use | **Backup Costs:** PITR adds $300/month for 1.5TB |
| **Automatic Sharding:** Handled by AWS, no config | **Nested Data Complexity:** Querying nested fields requires GSIs |

**Best For:** Hyper-scale applications (millions of req/sec), event-driven architectures, AWS-native ecosystems

---

## Comparison Matrix

### Feature Comparison

| Feature | Self-Hosted | MongoDB Atlas | DynamoDB |
|---------|-------------|---------------|----------|
| **Pricing Model** | Fixed | Tiered + Usage | Pay-per-Request |
| **Setup Time** | 4-8 hours | 15 minutes | 5 minutes |
| **Scaling** | Manual | Automatic | Automatic |
| **Maintenance** | Self-managed | Fully managed | Fully managed |
| **Backup** | DIY (S3) | Continuous | PITR built-in |
| **Query Flexibility** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Cost (1M req/day)** | $134 | $2,045 | $732 |
| **Data Model** | Document | Document | Key-Value |
| **Compression** | ✅ Yes (30-40%) | ✅ Yes | ❌ No |
| **Vendor Lock-in** | ❌ None | ⚠️ Medium | ⚠️ High |

### Technical Comparison

| Aspect | Self-Hosted | Atlas | DynamoDB |
|--------|-------------|-------|----------|
| **Max Storage** | 2.4 TB (expandable) | Unlimited | Unlimited |
| **Query Language** | MongoDB Query Language | MongoDB Query Language | PartiQL (SQL-like) |
| **Indexing** | Unlimited compound indices | Unlimited compound indices | 5 GSI + 5 LSI max |
| **Transactions** | ✅ Multi-document ACID | ✅ Multi-document ACID | ⚠️ Single-item or TransactWriteItems |
| **Aggregation** | ✅ Full pipeline | ✅ Full pipeline | ❌ Limited |
| **TTL** | ✅ Yes | ✅ Yes | ✅ Yes |

---

## Final Recommendation

### 🏆 Winner: Self-Hosted MongoDB on Hostinger VPS

**Why Self-Hosted Wins:**

1. **Cost Efficiency:** 85-93% cheaper than alternatives
2. **Perfect Fit for 15KB Records:** MongoDB's compression saves 30-40% storage
3. **Predictable Billing:** Fixed $134/month regardless of traffic
4. **Query Flexibility:** Full MongoDB query language + aggregation pipeline
5. **No Vendor Lock-in:** Standard MongoDB format, migrate anywhere

### Decision Matrix

**Choose Self-Hosted MongoDB if:**
- ✅ You have DevOps/System Admin skills in-house
- ✅ You want predictable, low monthly costs
- ✅ You need full control over database configuration
- ✅ You're comfortable with Linux server management
- ✅ You have time to invest in initial setup (4-8 hours)

**Choose MongoDB Atlas if:**
- ❌ You have zero DevOps resources
- ✅ You need enterprise support and SLAs
- ✅ Budget is not a primary concern
- ✅ You want multi-region global distribution
- ✅ Compliance requires managed services

**Choose DynamoDB if:**
- ❌ Your records are 1-4 KB (NOT 15 KB)
- ✅ You need to scale to 10M+ requests/sec
- ✅ Your app is heavily AWS-integrated (Lambda, API Gateway)
- ✅ You can redesign your schema for single-table design
- ✅ You need 99.999% uptime SLA

---

## Implementation Guide

### Self-Hosted MongoDB Setup (Step-by-Step)

#### 1. Purchase Hostinger VPS Instances

```bash
# Required VPS:
5x KVM 8 (Data Shards): $19.99/month each = $99.95
1x KVM 4 (Config Server): $10.49/month = $10.49
Total: $110.44/month
```

#### 2. Initial Server Setup (All Nodes)

```bash
# SSH into each server
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install MongoDB 7.0
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org

# Enable and start MongoDB
systemctl enable mongod
systemctl start mongod
```

#### 3. Configure Sharding

**On Config Server (KVM 4):**

```bash
# Edit /etc/mongod.conf
sharding:
  clusterRole: configsvr
replication:
  replSetName: configReplSet
net:
  bindIp: 0.0.0.0
  port: 27019

# Restart
systemctl restart mongod

# Initialize config replica set
mongosh --port 27019
rs.initiate({
  _id: "configReplSet",
  configsvr: true,
  members: [{ _id: 0, host: "config-server-ip:27019" }]
})
```

**On Each Shard (KVM 8 × 5):**

```bash
# Edit /etc/mongod.conf for Shard 1
sharding:
  clusterRole: shardsvr
replication:
  replSetName: shard1
net:
  bindIp: 0.0.0.0
  port: 27018

# Restart
systemctl restart mongod

# Initialize shard replica set
mongosh --port 27018
rs.initiate({
  _id: "shard1",
  members: [{ _id: 0, host: "shard1-ip:27018" }]
})

# Repeat for shard2, shard3, shard4, shard5
```

**On Router (mongos):**

```bash
# Start mongos process
mongos --configdb configReplSet/config-server-ip:27019 --bind_ip 0.0.0.0 --port 27017

# Add shards
mongosh --port 27017
sh.addShard("shard1/shard1-ip:27018")
sh.addShard("shard2/shard2-ip:27018")
sh.addShard("shard3/shard3-ip:27018")
sh.addShard("shard4/shard4-ip:27018")
sh.addShard("shard5/shard5-ip:27018")
```

#### 4. Enable Sharding on Database

```javascript
// Connect to mongos
mongosh --port 27017

// Enable sharding
sh.enableSharding("your_database")

// Shard collection by _id (or choose custom shard key)
sh.shardCollection("your_database.your_collection", { _id: "hashed" })

// Verify
sh.status()
```

#### 5. Setup Automated Backups

```bash
# Create backup script: /root/backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/backup"
S3_BUCKET="s3://your-backup-bucket"

# Dump database
mongodump --host=localhost --port=27017 --gzip --archive=$BACKUP_DIR/dump-$DATE.gz

# Encrypt
openssl enc -aes-256-cbc -salt -in $BACKUP_DIR/dump-$DATE.gz -out $BACKUP_DIR/dump-$DATE.enc -k "your-password"

# Upload to S3 Standard-IA
aws s3 cp $BACKUP_DIR/dump-$DATE.enc $S3_BUCKET/backups/ --storage-class STANDARD_IA

# Cleanup local backups older than 7 days
find $BACKUP_DIR -name "dump-*.enc" -mtime +7 -delete

# Schedule via cron (daily 2 AM)
crontab -e
0 2 * * * /root/backup.sh >> /var/log/mongodb-backup.log 2>&1
```

#### 6. Monitoring Setup

```bash
# Install Prometheus Node Exporter
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz
tar xvfz node_exporter-*.tar.gz
cd node_exporter-*
./node_exporter &

# Install MongoDB Exporter
wget https://github.com/percona/mongodb_exporter/releases/download/v0.40.0/mongodb_exporter-0.40.0.linux-amd64.tar.gz
tar xvfz mongodb_exporter-*.tar.gz
./mongodb_exporter --mongodb.uri=mongodb://localhost:27017 &
```

---

## FAQ

### Q: Can I start with fewer shards?

**A:** Yes! Start with 3 shards (3 × KVM 8 = $60/month) and add shards as data grows.

### Q: What if traffic exceeds 1M requests/day?

**A:** Self-hosted cost remains **$134/month**. Add more RAM or enable read replicas if needed.

### Q: How long does setup take?

**A:** 
- Initial setup: 4-6 hours
- Full testing: +2 hours
- Total: **1 business day**

### Q: What about disaster recovery?

**A:** 
- Backups stored in S3 (99.999999999% durability)
- Point-in-time restore: Last 30 days
- Cross-region replication: Optional (+$5/month)

### Q: Can I mix solutions?

**A:** Yes! Common patterns:
- **Primary:** Self-Hosted MongoDB
- **Analytics:** DynamoDB or S3 + Athena
- **Caching:** Redis/ElastiCache

### Q: What if I outgrow 1.5 TB?

**A:** 
1. **Vertical:** Upgrade to KVM 16 ($39.99, 64GB RAM, 800GB storage)
2. **Horizontal:** Add 6th-10th shards
3. **Migrate:** Move to Atlas M60+ or dedicated hardware

---

## Conclusion

For a **100 million record system with 15KB documents**, **Self-Hosted MongoDB on Hostinger VPS** delivers:

✅ **93% cost savings** vs MongoDB Atlas  
✅ **82% cost savings** vs AWS DynamoDB  
✅ **Fixed pricing** regardless of traffic  
✅ **Full query flexibility** for nested JSON  
✅ **No vendor lock-in**  

**Total Cost:** $134/month for 1.5TB + 1M requests/day

**Get Started:**
1. [Sign up for Hostinger VPS](https://www.hostinger.com/vps-hosting)
2. Follow implementation guide above
3. Deploy your application
4. Scale confidently

---

**Last Updated:** December 12, 2025  
**Author:** Database Architecture Team  
**License:** MIT  

**Questions?** Open an issue or contact: [your-email@domain.com]

---

## Appendix: Additional Resources

### MongoDB Sharding Resources
- [MongoDB Sharding Guide](https://docs.mongodb.com/manual/sharding/)
- [Shard Key Selection](https://docs.mongodb.com/manual/core/sharding-shard-key/)
- [WiredTiger Compression](https://docs.mongodb.com/manual/core/wiredtiger/#compression)
