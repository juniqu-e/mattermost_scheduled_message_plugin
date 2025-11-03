// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useCallback} from 'react';

import {scheduleApiClient} from '../api/schedule-api';

import {mattermostService} from '@/entities/mattermost/api/mattermost-service';
import type {FileInfo} from '@/entities/mattermost/model/types';
import {formatDateTime} from '@/shared/lib/datetime';

/**
 * 예약 메시지 전송 Hook
 */
export function useScheduleMessage() {
    /**
     * 예약 메시지 전송
     */
    const scheduleMessage = useCallback(async (
        timestamp: number,
        message: string,
        fileInfos: FileInfo[],
    ): Promise<void> => {
        // 현재 채널 ID 가져오기
        const channelId = mattermostService.getCurrentChannelId();
        if (!channelId) {
            throw new Error('Could not determine current channel');
        }

        // timestamp를 날짜와 시간으로 분리
        const {date, time} = formatDateTime(timestamp);

        // file IDs 추출
        const fileIds = fileInfos.map((file) => file.id).filter((id) => id);

        // API 호출
        await scheduleApiClient.createScheduledMessage({
            channel_id: channelId,
            file_ids: fileIds,
            post_at_time: time,
            post_at_date: date,
            message,
        });
    }, []);

    return {
        scheduleMessage,
    };
}
