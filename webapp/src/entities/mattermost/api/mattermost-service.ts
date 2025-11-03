// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Store, Action} from 'redux';
import type {GlobalState} from '@mattermost/types/store';

import {selectCurrentChannelId} from '../model/selectors/channel-selectors';
import type {MattermostState} from '../model/types';

/**
 * Mattermost 통합 서비스
 * Plugin에서 주입받은 Redux store를 사용
 */
export class MattermostService {
    private store: Store<GlobalState, Action<Record<string, unknown>>> | null = null;

    /**
     * Plugin initialize에서 store 주입
     */
    initialize(store: Store<GlobalState, Action<Record<string, unknown>>>) {
        this.store = store;
    }

    /**
     * Redux store 가져오기
     */
    private getStore(): Store<GlobalState, Action<Record<string, unknown>>> {
        if (!this.store) {
            throw new Error('MattermostService not initialized. Call initialize() first.');
        }
        return this.store;
    }

    /**
     * Redux state 가져오기
     */
    getState(): MattermostState {
        const store = this.getStore();
        return store.getState() as unknown as MattermostState;
    }

    /**
     * 현재 채널 ID 가져오기
     */
    getCurrentChannelId(): string | null {
        try {
            const state = this.getState();
            return selectCurrentChannelId(state);
        } catch (error) {
            console.error('Failed to get current channel ID:', error);
            return null;
        }
    }

    /**
     * Redux action dispatch
     */
    dispatch(action: Action): void {
        try {
            const store = this.getStore();
            store.dispatch(action);
        } catch (error) {
            console.error('Failed to dispatch action:', error);
        }
    }
}

/**
 * 싱글톤 인스턴스
 */
export const mattermostService = new MattermostService();
