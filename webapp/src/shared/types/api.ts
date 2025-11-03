// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * API 요청/응답 타입 정의
 */

/**
 * 예약 메시지 생성 요청
 */
export interface CreateScheduledMessageRequest {
    channel_id: string;
    file_ids: string[];
    post_at_time: string;
    post_at_date: string;
    message: string;
}

/**
 * 예약 메시지 응답
 */
export interface ScheduledMessage {
    id: string;
    channel_id: string;
    message: string;
    file_ids: string[];
    scheduled_at: string;
    created_at: string;
}
