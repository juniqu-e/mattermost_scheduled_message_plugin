// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import ScheduleIcon from './schedule-icon';

import {useMessageData} from '../../hooks/use-message-data';
import {useScheduleMessage} from '../../hooks/use-schedule-message';
import {useFormattingBarWidth} from '../../hooks/use-formatting-bar-width';
import type {SchedulePostButtonProps, FileInfo} from '../../model/types';
import ScheduleModal from '../schedule-modal';
import {scheduleApiClient} from '../../api/schedule-api';
import {mattermostService} from '@/entities/mattermost';

import './schedule-post-button.css';

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
const SchedulePostButton: React.FC<SchedulePostButtonProps> = (props) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [fileInfos, setFileInfos] = React.useState<FileInfo[]>([]);
    const [hasUploads, setHasUploads] = React.useState(false);

    const buttonRef = React.useRef<HTMLButtonElement>(null);

    const {getCurrentMessage, getCurrentFiles, clearDraft, hasUploadsInProgress} = useMessageData();
    const {scheduleMessage: scheduleMessageApi} = useScheduleMessage();
    const {isWide, isVisible} = useFormattingBarWidth(buttonRef);

    /**
     * 버튼 클릭 이벤트 핸들러
     */
    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        // 현재 메시지와 파일 가져오기
        const currentMessage = getCurrentMessage();
        const currentFiles = getCurrentFiles();

        // 메시지나 파일이 없으면 예약 목록 조회
        if (!currentMessage && currentFiles.length === 0) {
            try {
                // 현재 채널 ID 가져오기
                const channelId = mattermostService.getCurrentChannelId();
                if (!channelId) {
                    throw new Error('Could not determine current channel');
                }

                // API 호출 (서버가 ephemeral post로 리스트를 보여줌)
                await scheduleApiClient.getSchedules(channelId);
            } catch (error) {
                // 에러 발생 시 무시 (서버가 ephemeral post로 에러 표시)
            }

            if (props.onClick) {
                props.onClick();
            }
            return;
        }

        // 업로드 중인 파일 확인
        const uploadsInProgress = hasUploadsInProgress();

        // 상태 업데이트 및 모달 열기
        setMessage(currentMessage);
        setFileInfos(currentFiles);
        setHasUploads(uploadsInProgress);
        setIsModalOpen(true);

        if (props.onClick) {
            props.onClick();
        }
    };

    /**
     * 모달 닫기 핸들러
     */
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setMessage('');
        setFileInfos([]);
    };

    /**
     * 예약 핸들러
     */
    const handleSchedule = async (timestamp: number) => {
        try {
            // API 호출
            await scheduleMessageApi(timestamp, message, fileInfos);

            // Draft 초기화 (메시지 및 파일 삭제)
            clearDraft();
        } catch (error) {
            // 에러 발생 시 무시 (서버가 ephemeral post로 에러 표시)
        }

        // 모달 닫기
        handleCloseModal();
    };

    /**
     * 리스트 보기 핸들러
     */
    const handleViewList = async () => {
        try {
            // 현재 채널 ID 가져오기
            const channelId = mattermostService.getCurrentChannelId();
            if (!channelId) {
                throw new Error('Could not determine current channel');
            }

            // API 호출 (서버가 ephemeral post로 리스트를 보여줌)
            await scheduleApiClient.getSchedules(channelId);
        } catch (error) {
            // 에러 발생 시 무시 (서버가 ephemeral post로 에러 표시)
        }

        // 모달 닫기 (draft는 유지됨)
        setIsModalOpen(false);
    };

    const tooltip = (
        <Tooltip id='schedule-post-button-tooltip'>
            {'Schedule message'}
        </Tooltip>
    );

    // 350px 이하에서는 버튼 전체를 숨김
    if (!isVisible) {
        return null;
    }

    return (
        <>
            <div className='schedule-post-wrapper'>
                {/* 구분선 */}
                <div className='separator'/>

                <OverlayTrigger
                    placement='top'
                    overlay={tooltip}
                >
                    {/*
                        반응형 버튼:
                        - 포매팅바 > 640px: 아이콘 + "예약" 텍스트 표시
                        - 포매팅바 ≤ 640px: 아이콘만 표시
                        - 포매팅바 ≤ 350px: 버튼 전체 숨김

                        Mattermost의 포매팅바와 동일한 타이밍으로 반응
                    */}
                    <button
                        ref={buttonRef}
                        type='button'
                        className={`schedule-post-button ${isWide ? 'schedule-post-button--with-text' : ''}`}
                        onClick={handleClick}
                        aria-label='Schedule message'
                    >
                        <span className='schedule-post-button__icon'>
                            <ScheduleIcon/>
                        </span>
                        {isWide && (
                            <span className='schedule-post-button__text'>
                                {'예약'}
                            </span>
                        )}
                    </button>
                </OverlayTrigger>
            </div>

            {/* 모달 */}
            <ScheduleModal
                isOpen={isModalOpen}
                message={message}
                fileInfos={fileInfos}
                hasUploadsInProgress={hasUploads}
                onClose={handleCloseModal}
                onSchedule={handleSchedule}
                onViewList={handleViewList}
            />
        </>
    );
};

export default SchedulePostButton;
