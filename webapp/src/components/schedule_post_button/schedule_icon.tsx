// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';

/**
 * ScheduleIcon Component
 * 시계 모양의 스케줄 아이콘 컴포넌트 - 포매팅바 표준 크기 (18x18)
 *
 * @component
 * @example
 * <ScheduleIcon />
 */
export default class ScheduleIcon extends PureComponent {
    render() {
        return (
            <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.4'
                strokeLinecap='round'
                strokeLinejoin='round'
                aria-hidden='true'
                focusable='false'
                role='img'
            >
                <circle
                    cx='12'
                    cy='12'
                    r='10'
                />
                <polyline points='12 7 12 12 16 13'/>
            </svg>
        );
    }
}
