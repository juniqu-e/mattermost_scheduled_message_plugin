// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import manifest from 'manifest';
import type {Store, Action} from 'redux';

import type {GlobalState} from '@mattermost/types/store';

import {SchedulePostButton} from '@/features/schedule-message';
import {mattermostService} from '@/entities/mattermost';
import type {PluginRegistry} from '@/shared/types/mattermost-webapp';

export default class Plugin {
    public async initialize(registry: PluginRegistry, store: Store<GlobalState, Action<Record<string, unknown>>>) {
        // @see https://developers.mattermost.com/extend/plugins/webapp/reference/

        // Initialize Mattermost service with injected store
        mattermostService.initialize(store);

        // Register the schedule message button in the post editor formatting bar
        registry.registerPostEditorActionComponent(SchedulePostButton);
    }
}

declare global {
    interface Window {
        registerPlugin(pluginId: string, plugin: Plugin): void;
    }
}

window.registerPlugin(manifest.id, new Plugin());
