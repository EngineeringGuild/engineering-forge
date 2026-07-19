# Monitoring & Analytics

**File Path**: `docs/specifications/monitoring-analytics.md`  
**Document Type**: Technical Design Document - Monitoring & Analytics Section  
**Version**: 1.0  
**Last Updated**: January 2025  
**Status**: Complete  

---

## 📊 Monitoring Strategy Overview

### **Monitoring Pillars**
```typescript
// monitoring/monitoring-strategy.ts
export interface MonitoringStrategy {
  infrastructure: InfrastructureMonitoring;
  application: ApplicationMonitoring;
  business: BusinessMonitoring;
  security: SecurityMonitoring;
  userExperience: UserExperienceMonitoring;
}

export const MONITORING_STRATEGY: MonitoringStrategy = {
  infrastructure: {
    metrics: ['CPU', 'Memory', 'Disk', 'Network', 'Kubernetes'],
    collection: 'Prometheus + Node Exporter',
    retention: '90 days',
    alerting: 'PagerDuty + Slack'
  },
  application: {
    metrics: ['Response Time', 'Error Rate', 'Throughput', 'Availability'],
    collection: 'Custom Metrics + Prometheus',
    retention: '180 days',
    alerting: 'Grafana + Slack'
  },
  business: {
    metrics: ['User Engagement', 'Revenue', 'Conversion', 'Retention'],
    collection: 'Mixpanel + Custom Analytics',
    retention: '365 days',
    alerting: 'Business Intelligence Dashboard'
  },
  security: {
    metrics: ['Authentication Failures', 'Suspicious Activity', 'Vulnerabilities'],
    collection: 'Security Tools + SIEM',
    retention: '730 days',
    alerting: 'Security Team + SOC'
  },
  userExperience: {
    metrics: ['Page Load Time', 'User Satisfaction', 'Error Rates', 'Performance'],
    collection: 'Real User Monitoring + Synthetic',
    retention: '90 days',
    alerting: 'Product Team + Engineering'
  }
};
```

---

## 🔍 Infrastructure Monitoring

### **Kubernetes Cluster Monitoring**
```yaml
# monitoring/kubernetes/prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s

    rule_files:
      - "rules/*.yml"

    alerting:
      alertmanagers:
        - static_configs:
            - targets:
              - alertmanager:9093

    scrape_configs:
      # Kubernetes API Server
      - job_name: 'kubernetes-apiservers'
        kubernetes_sd_configs:
          - role: endpoints
        scheme: https
        tls_config:
          ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
        relabel_configs:
          - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
            action: keep
            regex: default;kubernetes;https

      # Kubernetes Nodes
      - job_name: 'kubernetes-nodes'
        kubernetes_sd_configs:
          - role: node
        scheme: https
        tls_config:
          ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
        relabel_configs:
          - action: labelmap
            regex: __meta_kubernetes_node_label_(.+)

      # Kubernetes Pods
      - job_name: 'kubernetes-pods'
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
            action: keep
            regex: true
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
            action: replace
            target_label: __metrics_path__
            regex: (.+)
          - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
            action: replace
            regex: ([^:]+)(?::\d+)?;(\d+)
            replacement: $1:$2
            target_label: __address__

      # Kubernetes Services
      - job_name: 'kubernetes-service-endpoints'
        kubernetes_sd_configs:
          - role: endpoints
        relabel_configs:
          - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_scrape]
            action: keep
            regex: true
          - source_labels: [__meta_kubernetes_service_annotation_prometheus_io_path]
            action: replace
            target_label: __metrics_path__
            regex: (.+)
          - source_labels: [__address__, __meta_kubernetes_service_annotation_prometheus_io_port]
            action: replace
            regex: ([^:]+)(?::\d+)?;(\d+)
            replacement: $1:$2
            target_label: __address__

      # Node Exporter
      - job_name: 'kubernetes-node-exporter'
        kubernetes_sd_configs:
          - role: node
        scheme: https
        tls_config:
          ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
        bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
        relabel_configs:
          - action: labelmap
            regex: __meta_kubernetes_node_label_(.+)
          - source_labels: [__meta_kubernetes_node_name]
            action: replace
            target_label: node
```

### **Infrastructure Alerting Rules**
```yaml
# monitoring/kubernetes/alert-rules.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-rules
  namespace: monitoring
data:
  kubernetes.rules: |
    groups:
    - name: kubernetes.rules
      rules:
      # High CPU Usage
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"
          description: "CPU usage is above 80% for more than 5 minutes"

      # High Memory Usage
      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage on {{ $labels.instance }}"
          description: "Memory usage is above 85% for more than 5 minutes"

      # High Disk Usage
      - alert: HighDiskUsage
        expr: (node_filesystem_size_bytes - node_filesystem_free_bytes) / node_filesystem_size_bytes * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High disk usage on {{ $labels.instance }}"
          description: "Disk usage is above 85% for more than 5 minutes"

      # Pod Restarting
      - alert: PodRestarting
        expr: increase(kube_pod_container_status_restarts_total[15m]) > 0
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Pod {{ $labels.pod }} is restarting"
          description: "Pod {{ $labels.pod }} has restarted {{ $value }} times in the last 15 minutes"

      # Node Down
      - alert: NodeDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Node {{ $labels.instance }} is down"
          description: "Node {{ $labels.instance }} has been down for more than 1 minute"
```

---

## 📈 Application Performance Monitoring

### **Custom Metrics Collection**
```typescript
// monitoring/application/metrics-collector.ts
import { register, Counter, Histogram, Gauge } from 'prom-client';

export class ApplicationMetrics {
  private static instance: ApplicationMetrics;
  
  // Request metrics
  private requestCounter: Counter;
  private requestDuration: Histogram;
  private requestSize: Histogram;
  
  // Business metrics
  private craftingCounter: Counter;
  private craftingSuccessRate: Gauge;
  private userActivityGauge: Gauge;
  
  // Error metrics
  private errorCounter: Counter;
  private errorRate: Gauge;
  
  private constructor() {
    this.initializeMetrics();
  }

  public static getInstance(): ApplicationMetrics {
    if (!ApplicationMetrics.instance) {
      ApplicationMetrics.instance = new ApplicationMetrics();
    }
    return ApplicationMetrics.instance;
  }

  private initializeMetrics(): void {
    // Request metrics
    this.requestCounter = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code']
    });

    this.requestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
    });

    this.requestSize = new Histogram({
      name: 'http_request_size_bytes',
      help: 'HTTP request size in bytes',
      labelNames: ['method', 'route'],
      buckets: [100, 1000, 5000, 10000, 50000, 100000]
    });

    // Business metrics
    this.craftingCounter = new Counter({
      name: 'crafting_attempts_total',
      help: 'Total number of crafting attempts',
      labelNames: ['item_type', 'quality', 'success']
    });

    this.craftingSuccessRate = new Gauge({
      name: 'crafting_success_rate',
      help: 'Crafting success rate percentage',
      labelNames: ['item_type']
    });

    this.userActivityGauge = new Gauge({
      name: 'active_users_total',
      help: 'Total number of active users',
      labelNames: ['session_type']
    });

    // Error metrics
    this.errorCounter = new Counter({
      name: 'application_errors_total',
      help: 'Total number of application errors',
      labelNames: ['error_type', 'service', 'severity']
    });

    this.errorRate = new Gauge({
      name: 'application_error_rate',
      help: 'Application error rate percentage',
      labelNames: ['service']
    });

    // Register all metrics
    register.registerMetric(this.requestCounter);
    register.registerMetric(this.requestDuration);
    register.registerMetric(this.requestSize);
    register.registerMetric(this.craftingCounter);
    register.registerMetric(this.craftingSuccessRate);
    register.registerMetric(this.userActivityGauge);
    register.registerMetric(this.errorCounter);
    register.registerMetric(this.errorRate);
  }

  // Record HTTP request
  public recordRequest(method: string, route: string, statusCode: number, duration: number, size: number): void {
    this.requestCounter.inc({ method, route, status_code: statusCode.toString() });
    this.requestDuration.observe({ method, route }, duration);
    this.requestSize.observe({ method, route }, size);
  }

  // Record crafting attempt
  public recordCrafting(itemType: string, quality: string, success: boolean): void {
    this.craftingCounter.inc({ item_type: itemType, quality, success: success.toString() });
    
    // Update success rate
    const successCount = this.craftingCounter.get({ item_type: itemType, success: 'true' });
    const totalCount = this.craftingCounter.get({ item_type: itemType });
    const successRate = (successCount.value / totalCount.value) * 100;
    
    this.craftingSuccessRate.set({ item_type: itemType }, successRate);
  }

  // Record user activity
  public recordUserActivity(sessionType: string, count: number): void {
    this.userActivityGauge.set({ session_type: sessionType }, count);
  }

  // Record error
  public recordError(errorType: string, service: string, severity: string): void {
    this.errorCounter.inc({ error_type: errorType, service, severity });
    
    // Update error rate
    const errorCount = this.errorCounter.get({ service });
    const requestCount = this.requestCounter.get({ service });
    const errorRate = (errorCount.value / requestCount.value) * 100;
    
    this.errorRate.set({ service }, errorRate);
  }

  // Get metrics for Prometheus
  public async getMetrics(): Promise<string> {
    return register.metrics();
  }
}
```

### **Performance Monitoring Middleware**
```typescript
// monitoring/application/performance-middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ApplicationMetrics } from './metrics-collector';

export class PerformanceMonitoringMiddleware {
  private metrics: ApplicationMetrics;

  constructor() {
    this.metrics = ApplicationMetrics.getInstance();
  }

  public monitor(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      const startSize = req.headers['content-length'] ? parseInt(req.headers['content-length']) : 0;

      // Override res.end to capture response metrics
      const originalEnd = res.end;
      res.end = function(chunk?: any, encoding?: any) {
        const duration = (Date.now() - startTime) / 1000; // Convert to seconds
        const responseSize = chunk ? chunk.length : 0;
        const totalSize = startSize + responseSize;

        // Record metrics
        this.metrics.recordRequest(
          req.method,
          req.route?.path || req.path,
          res.statusCode,
          duration,
          totalSize
        );

        // Call original end method
        originalEnd.call(this, chunk, encoding);
      }.bind(this);

      next();
    };
  }

  public monitorCrafting(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction) => {
      if (req.path === '/api/forge/craft' && req.method === 'POST') {
        const { itemType, quality } = req.body;
        
        // Monitor crafting success/failure
        res.on('finish', () => {
          const success = res.statusCode === 200;
          this.metrics.recordCrafting(itemType, quality, success);
        });
      }
      
      next();
    };
  }
}
```

---

## 📊 Business Intelligence & Analytics

### **User Engagement Analytics**
```typescript
// analytics/user-engagement.ts
import { AnalyticsService } from './analytics-service';

export class UserEngagementAnalytics {
  private analytics: AnalyticsService;

  constructor(analytics: AnalyticsService) {
    this.analytics = analytics;
  }

  // Track user session
  public async trackUserSession(userId: string, sessionData: SessionData): Promise<void> {
    await this.analytics.track('user_session', {
      userId,
      sessionId: sessionData.sessionId,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      duration: sessionData.duration,
      pagesVisited: sessionData.pagesVisited,
      actionsPerformed: sessionData.actionsPerformed
    });
  }

  // Track crafting activity
  public async trackCraftingActivity(userId: string, craftingData: CraftingData): Promise<void> {
    await this.analytics.track('crafting_activity', {
      userId,
      itemType: craftingData.itemType,
      quality: craftingData.quality,
      success: craftingData.success,
      duration: craftingData.duration,
      materialsUsed: craftingData.materialsUsed,
      toolsUsed: craftingData.toolsUsed,
      experienceGained: craftingData.experienceGained
    });
  }

  // Track user progression
  public async trackUserProgression(userId: string, progressionData: ProgressionData): Promise<void> {
    await this.analytics.track('user_progression', {
      userId,
      level: progressionData.level,
      experience: progressionData.experience,
      skills: progressionData.skills,
      achievements: progressionData.achievements,
      timeToLevel: progressionData.timeToLevel
    });
  }

  // Track monetization events
  public async trackMonetization(userId: string, monetizationData: MonetizationData): Promise<void> {
    await this.analytics.track('monetization_event', {
      userId,
      eventType: monetizationData.eventType,
      amount: monetizationData.amount,
      currency: monetizationData.currency,
      itemType: monetizationData.itemType,
      paymentMethod: monetizationData.paymentMethod
    });
  }

  // Generate engagement report
  public async generateEngagementReport(dateRange: DateRange): Promise<EngagementReport> {
    const sessions = await this.analytics.query('user_session', dateRange);
    const crafting = await this.analytics.query('crafting_activity', dateRange);
    const progression = await this.analytics.query('user_progression', dateRange);

    return {
      totalSessions: sessions.length,
      averageSessionDuration: this.calculateAverageSessionDuration(sessions),
      totalCraftingAttempts: crafting.length,
      craftingSuccessRate: this.calculateCraftingSuccessRate(crafting),
      averageUserLevel: this.calculateAverageUserLevel(progression),
      userRetentionRate: await this.calculateUserRetentionRate(dateRange),
      topCraftedItems: this.getTopCraftedItems(crafting),
      userEngagementScore: this.calculateUserEngagementScore(sessions, crafting, progression)
    };
  }

  private calculateAverageSessionDuration(sessions: SessionData[]): number {
    if (sessions.length === 0) return 0;
    const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0);
    return totalDuration / sessions.length;
  }

  private calculateCraftingSuccessRate(crafting: CraftingData[]): number {
    if (crafting.length === 0) return 0;
    const successfulCrafts = crafting.filter(c => c.success).length;
    return (successfulCrafts / crafting.length) * 100;
  }

  private calculateAverageUserLevel(progression: ProgressionData[]): number {
    if (progression.length === 0) return 0;
    const totalLevel = progression.reduce((sum, p) => sum + p.level, 0);
    return totalLevel / progression.length;
  }

  private async calculateUserRetentionRate(dateRange: DateRange): Promise<number> {
    // Complex retention calculation logic
    const newUsers = await this.analytics.query('user_registration', dateRange);
    const returningUsers = await this.analytics.query('user_login', dateRange);
    
    if (newUsers.length === 0) return 0;
    
    const uniqueReturningUsers = new Set(returningUsers.map(u => u.userId));
    return (uniqueReturningUsers.size / newUsers.length) * 100;
  }

  private getTopCraftedItems(crafting: CraftingData[]): TopItem[] {
    const itemCounts = new Map<string, number>();
    
    crafting.forEach(c => {
      const key = `${c.itemType}_${c.quality}`;
      itemCounts.set(key, (itemCounts.get(key) || 0) + 1);
    });

    return Array.from(itemCounts.entries())
      .map(([key, count]) => {
        const [itemType, quality] = key.split('_');
        return { itemType, quality, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private calculateUserEngagementScore(sessions: SessionData[], crafting: CraftingData[], progression: ProgressionData[]): number {
    // Complex engagement scoring algorithm
    const sessionScore = sessions.length * 0.3;
    const craftingScore = crafting.length * 0.4;
    const progressionScore = progression.reduce((sum, p) => sum + p.level, 0) * 0.3;
    
    return sessionScore + craftingScore + progressionScore;
  }
}
```

---

## 🚨 Alerting & Incident Management

### **Alert Manager Configuration**
```yaml
# monitoring/alerting/alertmanager-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: alertmanager-config
  namespace: monitoring
data:
  alertmanager.yml: |
    global:
      resolve_timeout: 5m
      slack_api_url: 'https://hooks.slack.com/services/YOUR_SLACK_WEBHOOK'

    route:
      group_by: ['alertname', 'cluster', 'service']
      group_wait: 30s
      group_interval: 5m
      repeat_interval: 4h
      receiver: 'slack-notifications'
      routes:
        - match:
            severity: critical
          receiver: 'pagerduty-critical'
          continue: true
        - match:
            severity: warning
          receiver: 'slack-notifications'

    receivers:
      - name: 'slack-notifications'
        slack_configs:
          - channel: '#engineering-forge-alerts'
            title: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
            text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
            send_resolved: true

      - name: 'pagerduty-critical'
        pagerduty_configs:
          - service_key: 'YOUR_PAGERDUTY_SERVICE_KEY'
            description: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
            client: 'Engineering Forge AlertManager'
            client_url: 'https://engineering-forge.com/alerts'
            severity: '{{ if eq .GroupLabels.severity "critical" }}critical{{ else }}warning{{ end }}'

    templates:
      - '/etc/alertmanager/template/*.tmpl'
```

### **Alert Rules for Application**
```yaml
# monitoring/alerting/application-alerts.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: application-alerts
  namespace: monitoring
data:
  application.rules: |
    groups:
    - name: application.alerts
      rules:
      # High Error Rate
      - alert: HighErrorRate
        expr: application_error_rate > 5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Application error rate is above 5% for more than 5 minutes"

      # High Response Time
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds_bucket) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is above 1 second for more than 5 minutes"

      # Low Crafting Success Rate
      - alert: LowCraftingSuccessRate
        expr: crafting_success_rate < 70
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Low crafting success rate"
          description: "Crafting success rate is below 70% for more than 10 minutes"

      # High User Activity Drop
      - alert: UserActivityDrop
        expr: rate(active_users_total[5m]) < 0.1
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "Significant drop in user activity"
          description: "User activity has dropped significantly for more than 15 minutes"

      # Database Connection Issues
      - alert: DatabaseConnectionIssues
        expr: pg_stat_database_numbackends > 100
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High database connections"
          description: "Database has more than 100 active connections for more than 5 minutes"

      # API Endpoint Down
      - alert: APIEndpointDown
        expr: up{job="engineering-forge-api"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "API endpoint is down"
          description: "Engineering Forge API endpoint has been down for more than 1 minute"
```

---

## 📊 Dashboard & Visualization

### **Grafana Dashboard Configuration**
```json
// monitoring/dashboards/engineering-forge-overview.json
{
  "dashboard": {
    "title": "Engineering Forge - System Overview",
    "panels": [
      {
        "title": "System Health Overview",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=\"kubernetes-pods\"}",
            "legendFormat": "{{kubernetes_pod_name}}"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "thresholds"
            },
            "thresholds": {
              "steps": [
                { "color": "red", "value": 0 },
                { "color": "green", "value": 1 }
              ]
            }
          }
        }
      },
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.50, http_request_duration_seconds_bucket)",
            "legendFormat": "50th percentile"
          }
        ],
        "yAxes": [
          {
            "label": "Response Time (seconds)",
            "unit": "s"
          }
        ]
      },
      {
        "title": "Crafting Success Rate",
        "type": "gauge",
        "targets": [
          {
            "expr": "crafting_success_rate",
            "legendFormat": "{{item_type}}"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "min": 0,
            "max": 100,
            "unit": "percent",
            "thresholds": {
              "steps": [
                { "color": "red", "value": 0 },
                { "color": "yellow", "value": 70 },
                { "color": "green", "value": 90 }
              ]
            }
          }
        }
      },
      {
        "title": "Active Users",
        "type": "stat",
        "targets": [
          {
            "expr": "active_users_total",
            "legendFormat": "{{session_type}}"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "color": {
              "mode": "palette-classic"
            },
            "custom": {
              "displayMode": "list"
            }
          }
        }
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(application_errors_total[5m])",
            "legendFormat": "{{error_type}} - {{service}}"
          }
        ],
        "yAxes": [
          {
            "label": "Errors per second",
            "unit": "reqps"
          }
        ]
      },
      {
        "title": "Resource Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "100 - (avg by(instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "CPU - {{instance}}"
          },
          {
            "expr": "(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100",
            "legendFormat": "Memory - {{instance}}"
          }
        ],
        "yAxes": [
          {
            "label": "Usage Percentage",
            "unit": "percent",
            "min": 0,
            "max": 100
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
```

---

## 🔍 Log Aggregation & Analysis

### **ELK Stack Configuration**
```yaml
# monitoring/logging/elasticsearch-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: elasticsearch-config
  namespace: logging
data:
  elasticsearch.yml: |
    cluster.name: engineering-forge-logs
    node.name: ${HOSTNAME}
    network.host: 0.0.0.0
    http.port: 9200
    discovery.type: single-node
    
    # Index settings
    action.auto_create_index: false
    index.number_of_shards: 1
    index.number_of_replicas: 0
    
    # Security settings
    xpack.security.enabled: false
    xpack.monitoring.enabled: false
    xpack.watcher.enabled: false

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: logstash-config
  namespace: logging
data:
  logstash.yml: |
    http.host: "0.0.0.0"
    xpack.monitoring.elasticsearch.hosts: ["http://elasticsearch:9200"]
    
  pipelines.yml: |
    - pipeline.id: main
      path.config: "/usr/share/logstash/pipeline"

  main.conf: |
    input {
      beats {
        port => 5044
      }
    }
    
    filter {
      if [kubernetes] {
        mutate {
          add_field => { "cluster" => "engineering-forge" }
        }
      }
      
      if [log][message] =~ /crafting/ {
        mutate {
          add_tag => ["crafting"]
        }
      }
      
      if [log][message] =~ /error/ {
        mutate {
          add_tag => ["error"]
        }
      }
    }
    
    output {
      elasticsearch {
        hosts => ["elasticsearch:9200"]
        index => "engineering-forge-logs-%{+YYYY.MM.dd}"
      }
    }

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: kibana-config
  namespace: logging
data:
  kibana.yml: |
    server.name: kibana
    server.host: "0.0.0.0"
    elasticsearch.hosts: ["http://elasticsearch:9200"]
    xpack.security.enabled: false
    xpack.reporting.enabled: false
```

---

## 📈 Performance Analytics

### **Real User Monitoring (RUM)**
```typescript
// monitoring/rum/rum-collector.ts
export class RealUserMonitoring {
  private analytics: AnalyticsService;

  constructor(analytics: AnalyticsService) {
    this.analytics = analytics;
    this.initializeRUM();
  }

  private initializeRUM(): void {
    // Navigation Timing API
    if ('performance' in window) {
      window.addEventListener('load', () => {
        this.collectNavigationTiming();
      });
    }

    // Resource Timing API
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.collectResourceTiming(entry as PerformanceResourceTiming);
        });
      });
      observer.observe({ entryTypes: ['resource'] });
    }

    // User Interactions
    this.trackUserInteractions();
  }

  private collectNavigationTiming(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    this.analytics.track('page_performance', {
      page: window.location.pathname,
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstPaint: this.getFirstPaint(),
      firstContentfulPaint: this.getFirstContentfulPaint(),
      largestContentfulPaint: this.getLargestContentfulPaint()
    });
  }

  private collectResourceTiming(entry: PerformanceResourceTiming): void {
    this.analytics.track('resource_performance', {
      name: entry.name,
      type: entry.initiatorType,
      duration: entry.duration,
      size: entry.transferSize,
      startTime: entry.startTime
    });
  }

  private trackUserInteractions(): void {
    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      this.analytics.track('user_interaction', {
        type: 'click',
        element: target.tagName,
        id: target.id,
        class: target.className,
        text: target.textContent?.substring(0, 50)
      });
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.analytics.track('user_interaction', {
        type: 'form_submit',
        form: form.id || form.action,
        fields: form.elements.length
      });
    });
  }

  private getFirstPaint(): number {
    const entries = performance.getEntriesByType('paint');
    const firstPaint = entries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }

  private getFirstContentfulPaint(): number {
    const entries = performance.getEntriesByType('paint');
    const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : 0;
  }

  private getLargestContentfulPaint(): number {
    if ('PerformanceObserver' in window) {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      });
    }
    return 0;
  }
}
```

---

## 📋 Monitoring Checklist

### **Infrastructure Monitoring**
- [ ] **Kubernetes Monitoring**
  - [ ] Node metrics collection
  - [ ] Pod health monitoring
  - [ ] Resource usage tracking
  - [ ] Cluster autoscaling metrics

- [ ] **Database Monitoring**
  - [ ] Connection pool monitoring
  - [ ] Query performance tracking
  - [ ] Storage usage monitoring
  - [ ] Replication lag monitoring

- [ ] **Network Monitoring**
  - [ ] Load balancer health
  - [ ] Network latency tracking
  - [ ] Bandwidth usage monitoring
  - [ ] SSL certificate monitoring

### **Application Monitoring**
- [ ] **Performance Metrics**
  - [ ] Response time tracking
  - [ ] Throughput monitoring
  - [ ] Error rate tracking
  - [ ] Availability monitoring

- [ ] **Business Metrics**
  - [ ] User engagement tracking
  - [ ] Crafting success rates
  - [ ] Revenue monitoring
  - [ ] User progression tracking

- [ ] **Custom Metrics**
  - [ ] Game-specific metrics
  - [ ] User behavior tracking
  - [ ] Quality indicators
  - [ ] Performance benchmarks

### **Alerting & Incident Management**
- [ ] **Alert Configuration**
  - [ ] Critical alerts (PagerDuty)
  - [ ] Warning alerts (Slack)
  - [ ] Escalation policies
  - [ ] Alert routing rules

- [ ] **Incident Response**
  - [ ] Runbook documentation
  - [ ] Escalation procedures
  - [ ] Post-incident reviews
  - [ ] Continuous improvement

---

## 🎯 Monitoring Best Practices

### **Metrics Collection**
- **Cardinality Management**: Limit label values to prevent metric explosion
- **Sampling**: Use appropriate sampling rates for high-volume metrics
- **Retention**: Configure appropriate retention periods for different metric types
- **Aggregation**: Pre-aggregate metrics where possible

### **Alerting Strategy**
- **Alert Fatigue Prevention**: Only alert on actionable issues
- **Threshold Tuning**: Set thresholds based on historical data
- **Escalation Policies**: Define clear escalation paths
- **Documentation**: Maintain comprehensive runbooks

### **Performance Optimization**
- **Query Optimization**: Optimize Prometheus queries for efficiency
- **Storage Management**: Use appropriate storage backends
- **Scaling**: Scale monitoring infrastructure with application growth
- **Cost Management**: Monitor and optimize monitoring costs

---

*This document provides comprehensive monitoring and analytics specifications for the Engineering Forge project. All monitoring strategies are designed to ensure optimal performance, reliability, and user experience while providing actionable insights for business decisions.*
