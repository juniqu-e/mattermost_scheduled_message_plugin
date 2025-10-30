// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * 파일 첨부 정보
 */
export interface FileAttachment {
    id: string;
    name: string;
    size: number;
    extension: string;
}

/**
 * 스케줄 메시지 데이터
 */
export interface ScheduleData {
    message: string;
    fileAttachments: FileAttachment[];
    channelId: string;
    rootId?: string;
}

/**
 * Plugin 상태
 */
export interface PluginState {
    isModalOpen: boolean;
    scheduleData: ScheduleData | null;
}
