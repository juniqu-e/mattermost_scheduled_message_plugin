// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * Mattermost Entity - Public API
 */

// API
export {mattermostService} from './api/mattermost-service';

// Config
export * from './config/constants';

// Model
export * from './model/selectors/channel-selectors';
export * from './model/selectors/draft-selectors';
export type {FileInfo, PostDraft, MattermostState} from './model/types';
