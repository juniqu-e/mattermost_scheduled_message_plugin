// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {getDraftKey} from '../../config/constants';
import type {MattermostState, PostDraft} from '../types';

/**
 * Draft 관련 selectors
 */

/**
 * 특정 채널의 draft 조회
 */
export function selectDraftByChannelId(state: MattermostState, channelId: string): PostDraft | null {
    const storage = state.storage?.storage;
    if (!storage) {
        return null;
    }

    const draftKey = getDraftKey(channelId);
    const draftEntry = storage[draftKey];

    if (!draftEntry) {
        return null;
    }

    return draftEntry.value as PostDraft;
}

/**
 * 현재 채널의 draft 조회
 */
export function selectCurrentDraft(state: MattermostState): PostDraft | null {
    const currentChannelId = state.entities?.channels?.currentChannelId;
    if (!currentChannelId) {
        return null;
    }

    return selectDraftByChannelId(state, currentChannelId);
}
