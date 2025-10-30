// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';

import type {SchedulePostButtonProps} from '../../types';

import ScheduleIcon from './schedule_icon';

import './schedule_post_button.css';

// Mattermost에서 제공하는 react-bootstrap 사용
const {OverlayTrigger, Tooltip} = window.ReactBootstrap;

/**
 * SchedulePostButton Component
 * 포매팅바에 표시되는 예약 메시지 버튼 컴포넌트
 *
 * OverlayTrigger와 Tooltip으로 hover 시 "Schedule message" 표시
 *
 * @component
 * @example
 * <SchedulePostButton onClick={handleScheduleClick} />
 */
export default class SchedulePostButton extends PureComponent<SchedulePostButtonProps> {
    /**
     * 버튼 클릭 이벤트 핸들러
     * @param {React.MouseEvent<HTMLButtonElement>} e - 마우스 이벤트
     */
    handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (this.props.onClick) {
            this.props.onClick();
        }
    };

    render() {
        const tooltip = (
            <Tooltip id='schedule-post-button-tooltip'>
                {'Schedule message'}
            </Tooltip>
        );

        return (
            <div className='schedule-post-wrapper'>
                {/* 구분선 */}
                <div className='separator'/>

                <OverlayTrigger
                    placement='top'
                    overlay={tooltip}
                >
                    <button
                        type='button'
                        className='schedule-post-button'
                        onClick={this.handleClick}
                        aria-label='Schedule message'
                    >
                        <span className='schedule-post-button__icon'>
                            <ScheduleIcon/>
                        </span>
                    </button>
                </OverlayTrigger>
            </div>
        );
    }
}
