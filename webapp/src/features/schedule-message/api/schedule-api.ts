// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import manifest from 'manifest';

import {Client4} from 'mattermost-redux/client';

import type {CreateScheduledMessageRequest, ScheduledMessage} from '@/shared/types/api';

/**
 * 예약 메시지 API 클라이언트
 */
export class ScheduleApiClient {
    /**
     * 예약 메시지 생성
     */
    async createScheduledMessage(request: CreateScheduledMessageRequest): Promise<ScheduledMessage> {
        const url = `/plugins/${manifest.id}/api/v1/schedule`;

        const response = await Client4.doFetch<ScheduledMessage>(url, {
            method: 'POST',
            body: JSON.stringify(request),
        });

        return response;
    }
}

/**
 * 싱글톤 인스턴스
 */
export const scheduleApiClient = new ScheduleApiClient();
