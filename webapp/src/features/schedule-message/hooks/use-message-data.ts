// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useCallback} from 'react';

import {draftService} from '../model/services/draft-service';

import type {FileInfo} from '@/entities/mattermost/model/types';

/**
 * 현재 메시지와 파일 데이터를 가져오는 Hook
 * Redux Store를 통해 draft 정보를 관리
 */
export function useMessageData() {
    /**
     * 현재 메시지 가져오기
     */
    const getCurrentMessage = useCallback((): string => {
        return draftService.getMessage();
    }, []);

    /**
     * 현재 파일 가져오기
     */
    const getCurrentFiles = useCallback((): FileInfo[] => {
        return draftService.getFileInfos();
    }, []);

    /**
     * Draft 초기화 (메시지 및 파일 모두 삭제)
     */
    const clearDraft = useCallback((): void => {
        draftService.clearDraft();
    }, []);

    /**
     * 업로드 중인 파일이 있는지 확인
     */
    const hasUploadsInProgress = useCallback((): boolean => {
        return draftService.hasUploadsInProgress();
    }, []);

    return {
        getCurrentMessage,
        getCurrentFiles,
        clearDraft,
        hasUploadsInProgress,
    };
}
