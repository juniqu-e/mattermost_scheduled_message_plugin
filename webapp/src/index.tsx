// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import manifest from 'manifest';
import type {Store, Action} from 'redux';

import type {GlobalState} from '@mattermost/types/store';
import type {PluginRegistry} from 'types/mattermost-webapp';

import reducer from './store/reducer';
import ScheduleModal from './components/ScheduleModal';
import ScheduleButton from './components/ScheduleButton';
import {setGlobalStore} from './services/storeService';
import {MESSAGE_INPUT_ID} from './constants/selectors';

import './styles.css';

/**
 * Mattermost Plugin Class
 */
export default class Plugin {
    public async initialize(
        registry: PluginRegistry,
        store: Store<GlobalState, Action<Record<string, unknown>>>,
    ) {
        // Global store 설정 (파일 정보 추출용)
        setGlobalStore(store);

        // Redux reducer 등록
        registry.registerReducer(reducer);

        // Root component로 모달 등록 (전역에서 접근 가능)
        registry.registerRootComponent(ScheduleModal);

        // 메시지 입력 창에 스케줄 버튼 추가
        registry.registerPostEditorActionComponent(ScheduleButton);

        // 채널 헤더에도 버튼 추가 (선택사항)
        registry.registerChannelHeaderButtonAction(
            <i className='icon icon-clock-outline' style={{fontSize: '20px'}}/>,
            () => {
                // 채널 헤더 버튼 클릭 시 로직
                const messageInput = document.getElementById(MESSAGE_INPUT_ID) as HTMLTextAreaElement;
                const message = messageInput?.value || '';

                // Import dynamically to avoid circular dependencies
                Promise.all([
                    import('./store/actions'),
                    import('./services/fileExtractor'),
                ]).then(([{openScheduleModal}, {extractAttachedFiles}]) => {
                    const fileAttachments = extractAttachedFiles();

                    if (!message.trim() && fileAttachments.length === 0) {
                        // eslint-disable-next-line no-alert
                        alert('메시지를 입력하거나 파일을 첨부해주세요.');
                        return;
                    }

                    const currentChannelId = (store.getState() as any).entities?.channels?.currentChannelId;
                    store.dispatch(openScheduleModal({
                        message,
                        fileAttachments,
                        channelId: currentChannelId,
                    }));
                });
            },
            'Schedule Message',
            '메시지 예약 전송',
        );
    }
}

declare global {
    interface Window {
        registerPlugin(pluginId: string, plugin: Plugin): void;
    }
}

window.registerPlugin(manifest.id, new Plugin());
