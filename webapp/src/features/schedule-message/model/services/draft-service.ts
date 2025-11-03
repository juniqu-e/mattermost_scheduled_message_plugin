// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {mattermostService} from '@/entities/mattermost/api/mattermost-service';
import {DOM_SELECTORS, REDUX_ACTIONS} from '@/entities/mattermost/config/constants';
import {selectCurrentDraft} from '@/entities/mattermost/model/selectors/draft-selectors';
import type {FileInfo, PostDraft} from '@/entities/mattermost/model/types';

/**
 * Draft 관리 서비스
 * Redux Store를 주요 데이터 소스로 사용
 */
export class DraftService {
    /**
     * 현재 채널의 draft 가져오기
     */
    getCurrentDraft(): PostDraft | null {
        try {
            const state = mattermostService.getState();
            return selectCurrentDraft(state);
        } catch (error) {
            console.error('Failed to get current draft:', error);
            return null;
        }
    }

    /**
     * 현재 메시지 가져오기
     * Redux draft를 우선 사용하고, 없으면 textbox에서 가져오기
     */
    getMessage(): string {
        const draft = this.getCurrentDraft();

        // Draft에서 메시지 가져오기
        if (draft?.message) {
            return draft.message.trim();
        }

        // Fallback: DOM에서 가져오기
        const textbox = document.querySelector(DOM_SELECTORS.POST_TEXTBOX) as HTMLTextAreaElement;
        if (textbox) {
            return textbox.value.trim();
        }

        return '';
    }

    /**
     * 파일 정보 가져오기 (Redux Store만 사용)
     */
    getFileInfos(): FileInfo[] {
        const draft = this.getCurrentDraft();

        if (draft?.fileInfos && Array.isArray(draft.fileInfos)) {
            return draft.fileInfos.map((fileInfo: any) => ({
                id: fileInfo.id || '',
                name: fileInfo.name || '',
                size: fileInfo.size || 0,
                extension: fileInfo.extension || '',
            }));
        }

        return [];
    }

    /**
     * Draft 초기화 (메시지와 파일 모두 삭제)
     */
    clearDraft(): void {
        try {
            const currentChannelId = mattermostService.getCurrentChannelId();
            if (!currentChannelId) {
                console.log('No current channel ID for clearing draft');
                return;
            }

            // Redux store의 draft 업데이트
            mattermostService.dispatch({
                type: REDUX_ACTIONS.UPDATE_DRAFT,
                channelId: currentChannelId,
                draft: {
                    message: '',
                    fileInfos: [],
                    uploadsInProgress: [],
                },
            });

            // Textbox도 비우기
            const textbox = document.querySelector(DOM_SELECTORS.POST_TEXTBOX) as HTMLTextAreaElement;
            if (textbox) {
                textbox.value = '';
                textbox.dispatchEvent(new Event('input', {bubbles: true}));
            }
        } catch (error) {
            console.error('Failed to clear draft:', error);
        }
    }
}

/**
 * 싱글톤 인스턴스
 */
export const draftService = new DraftService();
