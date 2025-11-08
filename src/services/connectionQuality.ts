/**
 * Connection Quality Monitoring Service
 * Monitors WebRTC connection quality and provides metrics
 */

export interface ConnectionQualityMetrics {
  participantId: string;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'very-poor';
  score: number; // 0-100
  bandwidth: {
    available: number; // kbps
    used: number; // kbps
  };
  latency: number; // ms
  packetLoss: number; // percentage
  jitter: number; // ms
  resolution: {
    width: number;
    height: number;
    frameRate: number;
  };
  codec: string;
  timestamp: number;
}

export interface ConnectionStats {
  bytesReceived: number;
  bytesSent: number;
  packetsReceived: number;
  packetsSent: number;
  packetsLost: number;
  jitter: number;
  roundTripTime: number;
}

export class ConnectionQualityMonitor {
  private statsInterval: NodeJS.Timeout | null = null;
  private readonly updateInterval = 5000; // 5 seconds
  private onQualityUpdate?: (metrics: ConnectionQualityMetrics) => void;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private lastStats: Map<string, ConnectionStats> = new Map();

  constructor(onQualityUpdate?: (metrics: ConnectionQualityMetrics) => void) {
    this.onQualityUpdate = onQualityUpdate;
  }

  /**
   * Start monitoring a peer connection
   */
  public startMonitoring(participantId: string, peerConnection: RTCPeerConnection): void {
    this.peerConnections.set(participantId, peerConnection);

    if (!this.statsInterval) {
      this.statsInterval = setInterval(() => {
        this.updateAllMetrics();
      }, this.updateInterval);
    }
  }

  /**
   * Stop monitoring a peer connection
   */
  public stopMonitoring(participantId: string): void {
    this.peerConnections.delete(participantId);
    this.lastStats.delete(participantId);

    if (this.peerConnections.size === 0 && this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
  }

  /**
   * Get current metrics for a participant
   */
  public async getMetrics(participantId: string): Promise<ConnectionQualityMetrics | null> {
    const peerConnection = this.peerConnections.get(participantId);
    if (!peerConnection) return null;

    return this.calculateMetrics(participantId, peerConnection);
  }

  /**
   * Update metrics for all connections
   */
  private async updateAllMetrics(): Promise<void> {
    for (const [participantId, peerConnection] of this.peerConnections.entries()) {
      try {
        const metrics = await this.calculateMetrics(participantId, peerConnection);
        if (metrics && this.onQualityUpdate) {
          this.onQualityUpdate(metrics);
        }
      } catch (error) {
        console.error(`Error calculating metrics for ${participantId}:`, error);
      }
    }
  }

  /**
   * Calculate quality metrics from WebRTC stats
   */
  private async calculateMetrics(
    participantId: string,
    peerConnection: RTCPeerConnection
  ): Promise<ConnectionQualityMetrics | null> {
    try {
      const stats = await peerConnection.getStats();
      const currentStats = this.extractStats(stats);
      const previousStats = this.lastStats.get(participantId);

      this.lastStats.set(participantId, currentStats);

      // Calculate packet loss
      const packetLoss = previousStats
        ? this.calculatePacketLoss(previousStats, currentStats)
        : 0;

      // Calculate bandwidth
      const bandwidth = previousStats
        ? this.calculateBandwidth(previousStats, currentStats)
        : { available: 0, used: 0 };

      // Get latency (RTT)
      const latency = currentStats.roundTripTime || 0;

      // Get jitter
      const jitter = currentStats.jitter || 0;

      // Calculate quality score (0-100)
      const score = this.calculateQualityScore({
        latency,
        packetLoss,
        jitter,
        bandwidth: bandwidth.available,
      });

      // Determine quality level
      const quality = this.getQualityLevel(score);

      // Get video track info
      const videoTrack = this.getVideoTrack(peerConnection);
      const resolution = videoTrack
        ? this.getTrackResolution(videoTrack)
        : { width: 0, height: 0, frameRate: 0 };

      const codec = this.getCodec(stats);

      const metrics: ConnectionQualityMetrics = {
        participantId,
        quality,
        score,
        bandwidth,
        latency,
        packetLoss,
        jitter,
        resolution,
        codec,
        timestamp: Date.now(),
      };

      return metrics;
    } catch (error) {
      console.error('Error calculating metrics:', error);
      return null;
    }
  }

  /**
   * Extract stats from RTCStatsReport
   */
  private extractStats(stats: RTCStatsReport): ConnectionStats {
    let bytesReceived = 0;
    let bytesSent = 0;
    let packetsReceived = 0;
    let packetsSent = 0;
    let packetsLost = 0;
    let jitter = 0;
    let roundTripTime = 0;

    stats.forEach((report) => {
      if (report.type === 'inbound-rtp') {
        const inbound = report as RTCInboundRtpStreamStats;
        bytesReceived += inbound.bytesReceived || 0;
        packetsReceived += inbound.packetsReceived || 0;
        packetsLost += inbound.packetsLost || 0;
        jitter = inbound.jitter || 0;
      } else if (report.type === 'outbound-rtp') {
        const outbound = report as RTCOutboundRtpStreamStats;
        bytesSent += outbound.bytesSent || 0;
        packetsSent += outbound.packetsSent || 0;
      } else if (report.type === 'candidate-pair') {
        const pair = report as RTCIceCandidatePairStats;
        roundTripTime = pair.currentRoundTripTime ? pair.currentRoundTripTime * 1000 : 0;
      }
    });

    return {
      bytesReceived,
      bytesSent,
      packetsReceived,
      packetsSent,
      packetsLost,
      jitter,
      roundTripTime,
    };
  }

  /**
   * Calculate packet loss percentage
   */
  private calculatePacketLoss(
    previous: ConnectionStats,
    current: ConnectionStats
  ): number {
    const packetsReceived = current.packetsReceived - previous.packetsReceived;
    const packetsLost = current.packetsLost - previous.packetsLost;
    const totalPackets = packetsReceived + packetsLost;

    if (totalPackets === 0) return 0;
    return (packetsLost / totalPackets) * 100;
  }

  /**
   * Calculate bandwidth usage
   */
  private calculateBandwidth(
    previous: ConnectionStats,
    current: ConnectionStats
  ): { available: number; used: number } {
    const timeDiff = this.updateInterval / 1000; // seconds
    const bytesReceived = current.bytesReceived - previous.bytesReceived;
    const bytesSent = current.bytesSent - previous.bytesSent;

    const receivedKbps = (bytesReceived * 8) / (timeDiff * 1000);
    const sentKbps = (bytesSent * 8) / (timeDiff * 1000);
    const totalKbps = receivedKbps + sentKbps;

    // Estimate available bandwidth (simplified)
    const available = Math.max(totalKbps * 1.5, 1000); // Assume 50% headroom, min 1Mbps

    return {
      available: Math.round(available),
      used: Math.round(totalKbps),
    };
  }

  /**
   * Calculate quality score (0-100)
   */
  private calculateQualityScore(params: {
    latency: number;
    packetLoss: number;
    jitter: number;
    bandwidth: number;
  }): number {
    const { latency, packetLoss, jitter, bandwidth } = params;

    // Latency score (0-30 points)
    let latencyScore = 30;
    if (latency > 300) latencyScore = 0;
    else if (latency > 200) latencyScore = 10;
    else if (latency > 150) latencyScore = 20;

    // Packet loss score (0-30 points)
    let packetLossScore = 30;
    if (packetLoss > 10) packetLossScore = 0;
    else if (packetLoss > 5) packetLossScore = 10;
    else if (packetLoss > 2) packetLossScore = 20;

    // Jitter score (0-20 points)
    let jitterScore = 20;
    if (jitter > 50) jitterScore = 0;
    else if (jitter > 30) jitterScore = 10;

    // Bandwidth score (0-20 points)
    let bandwidthScore = 20;
    if (bandwidth < 500) bandwidthScore = 0;
    else if (bandwidth < 1000) bandwidthScore = 10;

    return latencyScore + packetLossScore + jitterScore + bandwidthScore;
  }

  /**
   * Get quality level from score
   */
  private getQualityLevel(score: number): ConnectionQualityMetrics['quality'] {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    if (score >= 20) return 'poor';
    return 'very-poor';
  }

  /**
   * Get video track from peer connection
   */
  private getVideoTrack(peerConnection: RTCPeerConnection): MediaStreamTrack | null {
    const receivers = peerConnection.getReceivers();
    for (const receiver of receivers) {
      const track = receiver.track;
      if (track && track.kind === 'video') {
        return track;
      }
    }
    return null;
  }

  /**
   * Get track resolution
   */
  private getTrackResolution(track: MediaStreamTrack): {
    width: number;
    height: number;
    frameRate: number;
  } {
    const settings = track.getSettings();
    return {
      width: settings.width || 0,
      height: settings.height || 0,
      frameRate: settings.frameRate || 0,
    };
  }

  /**
   * Get codec from stats
   */
  private getCodec(stats: RTCStatsReport): string {
    let codec = 'unknown';
    stats.forEach((report) => {
      if (report.type === 'inbound-rtp' || report.type === 'outbound-rtp') {
        const rtp = report as RTCInboundRtpStreamStats | RTCOutboundRtpStreamStats;
        if (rtp.codecId) {
          const codecReport = Array.from(stats.values()).find(
            (r) => r.type === 'codec' && r.id === rtp.codecId
          ) as RTCCodecStats | undefined;
          if (codecReport) {
            codec = codecReport.mimeType || 'unknown';
          }
        }
      }
    });
    return codec;
  }

  /**
   * Cleanup
   */
  public cleanup(): void {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
    this.peerConnections.clear();
    this.lastStats.clear();
  }
}

