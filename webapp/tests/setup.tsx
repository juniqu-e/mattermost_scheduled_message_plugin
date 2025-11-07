// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import '@testing-library/jest-dom';
import React from 'react';
import 'isomorphic-fetch';

// Mock window.ReactBootstrap
(global as any).window = {
    ...global.window,
    ReactBootstrap: {
        Modal: ({children, show}: any) => (show ? React.createElement('div', {'data-testid': 'modal'}, children) : null),
        OverlayTrigger: ({children}: any) => children,
        Tooltip: ({children, id}: any) => React.createElement('div', {'data-testid': id}, children),
    },
};

export {};
