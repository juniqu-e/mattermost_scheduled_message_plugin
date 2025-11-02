// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import manifest from 'manifest';
import {Client4} from 'mattermost-redux/client';
import React, {PureComponent} from 'react';

import ScheduleIcon from './schedule_icon';

import type {SchedulePostButtonProps, FileInfo} from '../../types';
import ScheduleModal from '../schedule_modal';

import './schedule_post_button.css';

// Mattermost에서 제공하는 react-bootstrap 사용
const {OverlayTrigger, Tooltip} = window.ReactBootstrap;

interface SchedulePostButtonState {
    isModalOpen: boolean;
    message: string;
    fileInfos: FileInfo[];
}

/**
 * API 요청 타입
 */
interface ScheduleMessageRequest {
    channel_id: string;
    file_ids: string[];
    post_at_time: string;
    post_at_date: string;
    message: string;
}

/**
 * 예약 메시지 API 호출
 */
async function scheduleMessage(request: ScheduleMessageRequest): Promise<void> {
    const url = `/plugins/${manifest.id}/api/v1/schedule`;

    await Client4.doFetch(url, {
        method: 'POST',
        body: JSON.stringify(request),
    });
}

/**
 * timestamp를 날짜와 시간으로 분리
 */
function formatDateTime(timestamp: number): {date: string; time: string} {
    const dateObj = new Date(timestamp);

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const date = `${year}-${month}-${day}`;

    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const time = `${hours}:${minutes}`;

    return {date, time};
}

/**
 * Redux store에서 현재 채널 ID 가져오기
 */
function getCurrentChannelId(): string | null {
    try {
        // @ts-expect-error - window.store는 Mattermost가 제공
        const state = window.store?.getState();
        if (!state) {
            console.error('No Redux store found');
            return null;
        }

        const currentChannelId = state.entities?.channels?.currentChannelId;
        if (!currentChannelId) {
            console.error('No current channel ID');
            return null;
        }

        return currentChannelId;
    } catch (error) {
        console.error('Failed to get current channel ID:', error);
        return null;
    }
}

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
export default class SchedulePostButton extends PureComponent<SchedulePostButtonProps, SchedulePostButtonState> {
    constructor(props: SchedulePostButtonProps) {
        super(props);
        this.state = {
            isModalOpen: false,
            message: '',
            fileInfos: [],
        };
    }

    /**
     * 현재 입력창의 메시지 가져오기
     */
    getCurrentMessage = (): string => {
        // Mattermost의 post textbox를 찾아서 메시지 가져오기
        const textbox = document.querySelector('#post_textbox') as HTMLTextAreaElement;
        if (textbox) {
            return textbox.value.trim();
        }
        return '';
    };

    /**
     * Redux store에서 현재 채널의 draft 가져오기
     */
    getDraftFromStore = (): any => {
        try {
            // @ts-ignore - window.store는 Mattermost가 제공
            const state = window.store?.getState();
            if (!state) {
                console.log('No Redux store found');
                return null;
            }

            // 현재 채널 ID 가져오기
            const currentChannelId = state.entities?.channels?.currentChannelId;
            if (!currentChannelId) {
                console.log('No current channel ID');
                return null;
            }

            console.log('Current channel ID:', currentChannelId);

            // Mattermost 10.5.8에서는 draft가 state.storage.storage에 저장됨
            const storage = state.storage?.storage;
            if (!storage) {
                console.log('No storage found in state');
                return null;
            }

            // draft key는 보통 "draft_${channelId}" 형태
            const draftKey = `draft_${currentChannelId}`;
            const draftEntry = storage[draftKey];

            if (!draftEntry) {
                console.log('No draft found for key:', draftKey);
                console.log('Available keys:', Object.keys(storage));
                return null;
            }

            // draft.value에 실제 PostDraft 객체가 들어있음
            const draft = draftEntry.value;
            console.log('Found draft:', draft);

            return draft;
        } catch (error) {
            console.error('Failed to get draft from store:', error);
            return null;
        }
    };

    /**
     * 현재 첨부된 파일 정보 가져오기
     */
    getCurrentFiles = (): FileInfo[] => {
        // Redux store에서 draft의 fileInfos 가져오기 시도
        const draft = this.getDraftFromStore();

        if (draft?.fileInfos && Array.isArray(draft.fileInfos)) {
            console.log('Files from Redux store:', draft.fileInfos);
            return draft.fileInfos.map((fileInfo: any) => ({
                id: fileInfo.id || '',
                name: fileInfo.name || '',
                size: fileInfo.size || 0,
                extension: fileInfo.extension || '',
            }));
        }

        // Redux에서 가져오지 못하면 DOM에서 가져오기 (fallback)
        console.log('Falling back to DOM parsing for files');
        const filePreviewContainers = document.querySelectorAll('.file-preview, .post-image__column');
        const files: FileInfo[] = [];

        filePreviewContainers.forEach((container) => {
            // 파일 이름 찾기
            const fileNameElement = container.querySelector('.post-image__name');
            const fileName = fileNameElement?.textContent || 'unknown';

            // 파일 이름이 UUID 형태이면 그것을 ID로 사용
            // Mattermost는 파일 이름을 UUID로 저장함
            const fileId = fileName.includes('-') ? fileName : '';

            // 파일 크기 찾기
            const fileSizeElement = container.querySelector('.post-image__size');
            let fileSize = 0;
            if (fileSizeElement?.textContent) {
                const sizeText = fileSizeElement.textContent.trim();
                const match = sizeText.match(/([0-9.]+)\s*(KB|MB|GB)/i);
                if (match) {
                    const value = parseFloat(match[1]);
                    const unit = match[2].toUpperCase();
                    if (unit === 'KB') {
                        fileSize = value * 1024;
                    } else if (unit === 'MB') {
                        fileSize = value * 1024 * 1024;
                    } else if (unit === 'GB') {
                        fileSize = value * 1024 * 1024 * 1024;
                    }
                }
            }

            files.push({
                id: fileId,
                name: fileName,
                size: fileSize,
                extension: fileName.split('.').pop() || '',
            });
        });

        console.log('Found files from DOM:', files);
        return files;
    };

    /**
     * 버튼 클릭 이벤트 핸들러
     * @param {React.MouseEvent<HTMLButtonElement>} e - 마우스 이벤트
     */
    handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        // 현재 메시지와 파일 가져오기
        const message = this.getCurrentMessage();
        const fileInfos = this.getCurrentFiles();

        // 메시지나 파일이 없으면 동작하지 않음
        if (!message && fileInfos.length === 0) {
            console.log('No message or files to schedule');
            return;
        }

        // 메시지와 파일 정보 출력
        console.log('Message:', message);
        console.log('Files:', fileInfos);

        // 모달 열기
        this.setState({
            isModalOpen: true,
            message,
            fileInfos,
        });

        if (this.props.onClick) {
            this.props.onClick();
        }
    };

    /**
     * 모달 닫기 핸들러
     */
    handleCloseModal = () => {
        this.setState({
            isModalOpen: false,
            message: '',
            fileInfos: [],
        });
    };

    /**
     * 첨부된 파일 삭제
     */
    clearAttachedFiles = () => {
        try {
            // 방법 1: Redux store의 draft 업데이트
            // @ts-expect-error - window.store는 Mattermost가 제공
            const state = window.store?.getState();
            if (!state) {
                console.log('No Redux store found for clearing files');
                return;
            }

            const currentChannelId = state.entities?.channels?.currentChannelId;
            if (!currentChannelId) {
                console.log('No current channel ID for clearing files');
                return;
            }

            // Mattermost의 draft 업데이트 action dispatch
            // @ts-expect-error - window.store는 Mattermost가 제공
            window.store?.dispatch({
                type: 'UPDATE_DRAFT',
                channelId: currentChannelId,
                draft: {
                    message: '',
                    fileInfos: [],
                    uploadsInProgress: [],
                },
            });

            console.log('Cleared attached files from draft');

            // 방법 2: DOM에서 파일 삭제 버튼 클릭 (fallback)
            const removeButtons = document.querySelectorAll('.post-image__remove, .file-preview__remove');
            removeButtons.forEach((button) => {
                if (button instanceof HTMLElement) {
                    button.click();
                }
            });
        } catch (error) {
            console.error('Failed to clear attached files:', error);
        }
    };

    /**
     * 예약 핸들러
     */
    handleSchedule = async (timestamp: number) => {
        const {message, fileInfos} = this.state;

        console.log('Scheduling message:', {
            timestamp,
            message,
            fileInfos,
            scheduledDate: new Date(timestamp),
        });

        try {
            // 현재 채널 ID 가져오기
            const channelId = getCurrentChannelId();
            if (!channelId) {
                console.error('Cannot schedule message: No channel ID');
                alert('Failed to schedule message: Could not determine current channel');
                return;
            }

            // timestamp를 날짜와 시간으로 분리
            const {date, time} = formatDateTime(timestamp);

            // file IDs 추출
            const fileIds = fileInfos.map((file) => file.id).filter((id) => id);

            // API 호출
            await scheduleMessage({
                channel_id: channelId,
                file_ids: fileIds,
                post_at_time: time,
                post_at_date: date,
                message,
            });

            console.log('Message scheduled successfully');

            // 메시지 입력창 비우기
            const textbox = document.querySelector('#post_textbox') as HTMLTextAreaElement;
            if (textbox) {
                textbox.value = '';
                textbox.dispatchEvent(new Event('input', {bubbles: true}));
            }

            // 첨부된 파일 삭제
            this.clearAttachedFiles();
        } catch (error) {
            console.error('Failed to schedule message:', error);
            alert(`Failed to schedule message: ${error instanceof Error ? error.message : String(error)}`);
        }

        // 모달 닫기
        this.handleCloseModal();
    };

    render() {
        const {isModalOpen, message, fileInfos} = this.state;

        const tooltip = (
            <Tooltip id='schedule-post-button-tooltip'>
                {'Schedule message'}
            </Tooltip>
        );

        return (
            <>
                <div className='schedule-post-wrapper'>
                    {/* 구분선 */}
                    <div className='separator'/>

                    <OverlayTrigger
                        placement='top'
                        overlay={tooltip}
                    >
                        {/* ============================================
                            바리에이션 선택:
                            아래 3가지 버튼 중 하나의 주석을 해제하세요
                            ============================================ */}

                        {/* 바리에이션 1: 아이콘만 (기본) */}
                        {/* <button
                            type='button'
                            className='schedule-post-button'
                            onClick={this.handleClick}
                            aria-label='Schedule message'
                        >
                            <span className='schedule-post-button__icon'>
                                <ScheduleIcon/>
                            </span>
                        </button> */}

                        {/* 바리에이션 2: 아이콘 + 텍스트 */}
                        <button
                            type='button'
                            className='schedule-post-button schedule-post-button--with-text'
                            onClick={this.handleClick}
                            aria-label='Schedule message'
                        >
                            <span className='schedule-post-button__icon'>
                                <ScheduleIcon/>
                            </span>
                            <span className='schedule-post-button__text'>
                                {'예약'}
                            </span>
                        </button>

                        {/* 바리에이션 3: 아이콘 + 텍스트 + 보더 */}
                        {/* <button
                            type='button'
                            className='schedule-post-button schedule-post-button--with-text schedule-post-button--bordered'
                            onClick={this.handleClick}
                            aria-label='Schedule message'
                        >
                            <span className='schedule-post-button__icon'>
                                <ScheduleIcon/>
                            </span>
                            <span className='schedule-post-button__text'>
                                {'예약'}
                            </span>
                        </button> */}
                    </OverlayTrigger>
                </div>

                {/* 모달 */}
                <ScheduleModal
                    isOpen={isModalOpen}
                    message={message}
                    fileInfos={fileInfos}
                    onClose={this.handleCloseModal}
                    onSchedule={this.handleSchedule}
                />
            </>
        );
    }
}
