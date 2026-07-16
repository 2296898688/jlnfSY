/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Attachment {
  name: string;
  url: string;
}

export interface TimelineItem {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  description: string;
  operator?: string;
  image?: string;
  metrics?: { label: string; value: string }[];
  tags?: string[];
  attachments?: Attachment[];
}

export interface Batch {
  id: string;
  productName: string;
  batchNumber: string;
  category: string;
  createTime: string;
  timelineCount: number;
  imageUrl: string;
  images?: string[];
  status: 'draft' | 'published';
  // Detailed fields for configuration view
  productSubTitle?: string;
  tags?: string[];
  productIntro?: string;
  topLabel?: string;
  location?: string;
  attachments?: Attachment[];
  timelineItems: TimelineItem[];
  /** 商城跳转链接 */
  shopUrl?: string;
  /** 跳转倒计时（秒），默认 30 */
  countdownSeconds?: number;
}

export type ViewState = 'dashboard' | 'config' | 'new_batch_modal' | 'qr_modal' | 'preview';
