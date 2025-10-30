// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import manifest from '../manifest';

const pluginId = manifest.id;

/**
 * Redux Action Types
 */
export const OPEN_SCHEDULE_MODAL = `${pluginId}_open_schedule_modal`;
export const CLOSE_SCHEDULE_MODAL = `${pluginId}_close_schedule_modal`;
export const SET_SCHEDULE_DATA = `${pluginId}_set_schedule_data`;
