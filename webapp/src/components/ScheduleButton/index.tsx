// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {GlobalState} from '@mattermost/types/store';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/channels';

import {openScheduleModal} from '../../store/actions';
import {extractAttachedFiles} from '../../services/fileExtractor';
import {MESSAGE_INPUT_ID} from '../../constants/selectors';

import './style.css';

/**
 * 메시지 입력창에 표시되는 스케줄 버튼
 */
const ScheduleButton: React.FC = () => {
    const dispatch = useDispatch();
    const currentChannelId = useSelector((state: GlobalState) => getCurrentChannelId(state));

    const handleClick = () => {
        // 메시지 입력창의 내용 가져오기
        const messageInput = document.getElementById(MESSAGE_INPUT_ID) as HTMLTextAreaElement;
        const message = messageInput?.value || '';

        // 첨부된 파일 정보 가져오기
        const fileAttachments = extractAttachedFiles();

        // 메시지나 파일이 하나라도 있어야 함
        if (!message.trim() && fileAttachments.length === 0) {
            // eslint-disable-next-line no-alert
            alert('메시지를 입력하거나 파일을 첨부해주세요.');
            return;
        }

        // 모달 열기
        dispatch(openScheduleModal({
            message,
            fileAttachments,
            channelId: currentChannelId,
        }));
    };

    return (
        <button
            className='schedule-button'
            onClick={handleClick}
            aria-label='Schedule message'
            title='메시지 예약 전송'
        >
            <i className='icon icon-clock-outline' />
        </button>
    );
};

export default ScheduleButton;
