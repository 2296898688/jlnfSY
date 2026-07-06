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
  date: string;
  description: string;
  operator?: string;
  image?: string;
  metrics?: { label: string; value: string }[];
  tags?: string[];
}

export interface Batch {
  id: string;
  productName: string;
  batchNumber: string;
  category: string;
  createTime: string;
  timelineCount: number;
  imageUrl: string;
  status: 'draft' | 'published';
  // Detailed fields for configuration view
  productSubTitle?: string;
  tags?: string[];
  productIntro?: string;
  topLabel?: string;
  location?: string;
  attachments?: Attachment[];
  timelineItems: TimelineItem[];
}

export type ViewState = 'dashboard' | 'config' | 'new_batch_modal' | 'qr_modal' | 'preview';
