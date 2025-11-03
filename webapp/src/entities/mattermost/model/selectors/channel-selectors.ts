// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {MattermostState} from '../types';

/**
 * 채널 관련 selectors
 */

/**
 * 현재 채널 ID 조회
 */
export function selectCurrentChannelId(state: MattermostState): string | null {
    return state.entities?.channels?.currentChannelId || null;
}
