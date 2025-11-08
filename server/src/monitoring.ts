/**
 * Production Monitoring and Analytics
 * Tracks metrics, errors, and performance
 */

import { Server } from 'socket.io';

export interface Metrics {
  connections: number;
  activeMeetings: number;
  totalParticipants: number;
  averageLatency: number;
  errorRate: number;
  bandwidthUsage: number;
  timestamp: number;
}

export class MonitoringService {
  private metrics: Metrics = {
    connections: 0,
    activeMeetings: 0,
    totalParticipants: 0,
    averageLatency: 0,
    errorRate: 0,
    bandwidthUsage: 0,
    timestamp: Date.now(),
  };

  private errorCount = 0;
  private requestCount = 0;
  private latencySum = 0;
  private latencyCount = 0;
  private metricsInterval: NodeJS.Timeout | null = null;

  constructor(private io: Server) {
    this.startMetricsCollection();
  }

  /**
   * Start collecting metrics
   */
  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      this.updateMetrics();
    }, 10000); // Update every 10 seconds
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    const rooms = this.io.sockets.adapter.rooms;
    const activeMeetings = new Set<string>();

    let totalParticipants = 0;
    rooms.forEach((sockets, roomId) => {
      // Filter out socket.io internal rooms
      if (!roomId.startsWith('/')) {
        activeMeetings.add(roomId);
        totalParticipants += sockets.size;
      }
    });

    this.metrics = {
      connections: this.io.sockets.sockets.size,
      activeMeetings: activeMeetings.size,
      totalParticipants,
      averageLatency: this.latencyCount > 0 ? this.latencySum / this.latencyCount : 0,
      errorRate: this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0,
      bandwidthUsage: 0, // TODO: Implement bandwidth tracking
      timestamp: Date.now(),
    };

    // Reset counters
    this.errorCount = 0;
    this.requestCount = 0;
    this.latencySum = 0;
    this.latencyCount = 0;

    // Log metrics
    console.log('Metrics:', JSON.stringify(this.metrics, null, 2));
  }

  /**
   * Record error
   */
  public recordError(error: Error, context?: string): void {
    this.errorCount++;
    this.requestCount++;
    
    console.error(`[ERROR] ${context || 'Unknown'}:`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    // TODO: Send to error tracking service (Sentry, etc.)
  }

  /**
   * Record request latency
   */
  public recordLatency(latency: number): void {
    this.latencySum += latency;
    this.latencyCount++;
    this.requestCount++;
  }

  /**
   * Get current metrics
   */
  public getMetrics(): Metrics {
    return { ...this.metrics };
  }

  /**
   * Health check
   */
  public getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: Metrics;
    issues: string[];
  } {
    const issues: string[] = [];
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (this.metrics.errorRate > 10) {
      issues.push('High error rate');
      status = 'degraded';
    }

    if (this.metrics.averageLatency > 1000) {
      issues.push('High latency');
      status = 'degraded';
    }

    if (this.metrics.errorRate > 50) {
      status = 'unhealthy';
    }

    return {
      status,
      metrics: this.metrics,
      issues,
    };
  }

  /**
   * Cleanup
   */
  public cleanup(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
  }
}

