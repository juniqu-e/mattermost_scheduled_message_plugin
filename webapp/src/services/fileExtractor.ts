// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {FileAttachment} from '../types/schedule';
import {
    FILE_CONTAINER_SELECTORS,
    FILE_ITEM_SELECTORS,
    FILE_NAME_SELECTORS,
    FILE_SIZE_SELECTORS,
} from '../constants/selectors';
import {getFileExtension, parseSizeString} from '../utils/fileFormatter';
import {getStore} from './storeService';

/**
 * Redux Store에서 파일 정보 추출
 * @returns 파일 첨부 배열
 */
export function extractFilesFromStore(): FileAttachment[] {
    const fileAttachments: FileAttachment[] = [];

    try {
        const store = getStore();

        if (!store || !store.getState) {
            // eslint-disable-next-line no-console
            console.log('✗ Store를 찾을 수 없습니다.');
            return fileAttachments;
        }

        const state = store.getState();

        // eslint-disable-next-line no-console
        console.log('Redux State 확인:', {
            hasEntities: !!state.entities,
            hasStorage: !!state.storage,
            hasDrafts: !!(state.storage?.storage?.drafts),
            hasFiles: !!(state.entities?.files),
        });

        // drafts에서 현재 채널의 파일 정보 찾기
        const currentChannelId = state.entities?.channels?.currentChannelId;
        if (currentChannelId && state.storage?.storage?.drafts) {
            const draft = state.storage.storage.drafts[currentChannelId];
            // eslint-disable-next-line no-console
            console.log('Current draft:', draft);

            if (draft?.fileInfos && Array.isArray(draft.fileInfos)) {
                draft.fileInfos.forEach((fileInfo: any) => {
                    fileAttachments.push({
                        id: fileInfo.id || `file_${Date.now()}`,
                        name: fileInfo.name || 'Unknown',
                        size: fileInfo.size || 0,
                        extension: fileInfo.extension || getFileExtension(fileInfo.name || ''),
                    });
                });

                // eslint-disable-next-line no-console
                console.log(`✓ Store에서 ${fileAttachments.length}개 파일 찾음`);
            }
        }
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Store에서 파일 정보 추출 실패:', error);
    }

    return fileAttachments;
}

/**
 * DOM에서 파일 컨테이너 찾기
 * @returns 파일 컨테이너 Element 또는 null
 */
function findFileContainer(): Element | null {
    for (const selector of FILE_CONTAINER_SELECTORS) {
        const container = document.querySelector(selector);
        if (container) {
            // eslint-disable-next-line no-console
            console.log(`✓ 파일 컨테이너 발견: ${selector}`);
            return container;
        }
    }

    // eslint-disable-next-line no-console
    console.log('✗ 파일 컨테이너를 찾을 수 없습니다.');
    // eslint-disable-next-line no-console
    console.log('전체 파일 관련 요소들:', document.querySelectorAll('[class*="file"]'));
    return null;
}

/**
 * 컨테이너에서 파일 아이템들 찾기
 * @param container 파일 컨테이너
 * @returns 파일 아이템 NodeList
 */
function findFileItems(container: Element): NodeListOf<Element> | null {
    for (const selector of FILE_ITEM_SELECTORS) {
        const items = container.querySelectorAll(selector);
        if (items && items.length > 0) {
            // eslint-disable-next-line no-console
            console.log(`✓ 파일 아이템 ${items.length}개 발견: ${selector}`);
            return items;
        }
    }

    // 직접 자식 요소들 확인
    if (container.children.length > 0) {
        // eslint-disable-next-line no-console
        console.log('파일 아이템을 찾을 수 없어 직접 자식 요소 사용');
        return container.querySelectorAll(':scope > *');
    }

    return null;
}

/**
 * 파일 아이템에서 파일명 추출
 * @param item 파일 아이템 Element
 * @param index 인덱스
 * @returns 파일명
 */
function extractFileName(item: Element, index: number): string {
    for (const selector of FILE_NAME_SELECTORS) {
        const element = item.querySelector(selector);
        if (element?.textContent?.trim()) {
            const fileName = element.textContent.trim();
            // eslint-disable-next-line no-console
            console.log(`  파일명 발견 (${selector}): ${fileName}`);
            return fileName;
        }
    }

    // title 속성이나 aria-label 확인
    const fileName = (item as HTMLElement).title ||
                    (item as HTMLElement).getAttribute('aria-label') ||
                    `파일_${index + 1}`;

    // eslint-disable-next-line no-console
    console.log(`  파일명 대체: ${fileName}`);
    return fileName;
}

/**
 * 파일 아이템에서 파일 크기 추출
 * @param item 파일 아이템 Element
 * @returns 바이트 크기
 */
function extractFileSize(item: Element): number {
    for (const selector of FILE_SIZE_SELECTORS) {
        const element = item.querySelector(selector);
        if (element?.textContent?.trim()) {
            const fileSizeText = element.textContent.trim();
            // eslint-disable-next-line no-console
            console.log(`  파일 크기 발견 (${selector}): ${fileSizeText}`);
            return parseSizeString(fileSizeText);
        }
    }

    return 0;
}

/**
 * DOM에서 파일 정보 추출
 * @returns 파일 첨부 배열
 */
export function extractFilesFromDOM(): FileAttachment[] {
    const fileAttachments: FileAttachment[] = [];

    // eslint-disable-next-line no-console
    console.log('=== 파일 정보 추출 디버깅 시작 ===');

    // 1. 파일 컨테이너 찾기
    const filePreviewContainer = findFileContainer();
    if (!filePreviewContainer) {
        return fileAttachments;
    }

    // eslint-disable-next-line no-console
    console.log('파일 컨테이너 HTML:', filePreviewContainer.outerHTML.substring(0, 500));

    // 2. 파일 아이템들 찾기
    const fileItems = findFileItems(filePreviewContainer);
    if (!fileItems || fileItems.length === 0) {
        // eslint-disable-next-line no-console
        console.log('✗ 파일 아이템이 없습니다.');
        return fileAttachments;
    }

    // eslint-disable-next-line no-console
    console.log(`처리할 파일 아이템 개수: ${fileItems.length}`);

    // 3. 각 파일 아이템 처리
    fileItems.forEach((item, index) => {
        // eslint-disable-next-line no-console
        console.log(`\n파일 ${index + 1} 처리 중...`);
        // eslint-disable-next-line no-console
        console.log('아이템 HTML:', (item as HTMLElement).outerHTML.substring(0, 300));

        const fileName = extractFileName(item, index);
        const fileSize = extractFileSize(item);
        const extension = getFileExtension(fileName);
        const fileId = (item as HTMLElement).dataset.fileId || `file_${Date.now()}_${index}`;

        const fileAttachment: FileAttachment = {
            id: fileId,
            name: fileName,
            size: fileSize,
            extension,
        };

        // eslint-disable-next-line no-console
        console.log('  최종 파일 정보:', fileAttachment);

        fileAttachments.push(fileAttachment);
    });

    // eslint-disable-next-line no-console
    console.log('\n=== DOM에서 파일 정보 추출 완료 ===');
    // eslint-disable-next-line no-console
    console.log(`총 ${fileAttachments.length}개 파일 추출됨`);

    return fileAttachments;
}

/**
 * 파일 정보 추출 (Redux Store 우선, 실패 시 DOM)
 * @returns 파일 첨부 배열
 */
export function extractAttachedFiles(): FileAttachment[] {
    // eslint-disable-next-line no-console
    console.log('\n==========================================');
    // eslint-disable-next-line no-console
    console.log('파일 정보 추출 시작');
    // eslint-disable-next-line no-console
    console.log('==========================================\n');

    // 1단계: Redux Store에서 시도
    // eslint-disable-next-line no-console
    console.log('1단계: Redux Store에서 파일 정보 추출 시도...');
    const filesFromStore = extractFilesFromStore();

    if (filesFromStore.length > 0) {
        // eslint-disable-next-line no-console
        console.log(`✓ Redux Store에서 ${filesFromStore.length}개 파일 찾음!`);
        // eslint-disable-next-line no-console
        console.log('추출된 파일 목록:', filesFromStore);
        return filesFromStore;
    }

    // eslint-disable-next-line no-console
    console.log('✗ Redux Store에서 파일을 찾을 수 없음');

    // 2단계: DOM에서 추출 시도
    // eslint-disable-next-line no-console
    console.log('\n2단계: DOM에서 파일 정보 추출 시도...');
    const filesFromDOM = extractFilesFromDOM();

    if (filesFromDOM.length > 0) {
        // eslint-disable-next-line no-console
        console.log(`✓ DOM에서 ${filesFromDOM.length}개 파일 찾음!`);
        return filesFromDOM;
    }

    // eslint-disable-next-line no-console
    console.log('✗ 파일을 찾을 수 없습니다.');
    // eslint-disable-next-line no-console
    console.log('\n==========================================');
    // eslint-disable-next-line no-console
    console.log('파일 정보 추출 완료: 0개');
    // eslint-disable-next-line no-console
    console.log('==========================================\n');

    return [];
}
