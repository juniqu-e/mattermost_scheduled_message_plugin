// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useCallback, useLayoutEffect, useState} from 'react';
import debounce from 'lodash/debounce';

export interface FormattingBarWidthState {
    isWide: boolean;     // > 640px: 아이콘 + 텍스트
    isVisible: boolean;  // > 350px: 버튼 표시
}

/**
 * Mattermost 포매팅바의 너비를 관찰하여 반응형 UI 제어
 *
 * Mattermost의 useResponsiveFormattingBar와 동일한 방식:
 * - ResizeObserver로 포매팅바 컨테이너 관찰
 * - 10ms debounce
 * - 640px 기준으로 wide 모드 판단
 * - 350px 이하에서는 버튼 숨김 (플러그인 버튼 겹침 방지)
 *
 * @param containerRef - 포매팅바 컨테이너 ref (선택적)
 * @returns {isWide, isVisible}
 */
export const useFormattingBarWidth = (containerRef?: React.RefObject<HTMLElement>): FormattingBarWidthState => {
    const [isWide, setIsWide] = useState(true);
    const [isVisible, setIsVisible] = useState(true);

    const handleResize = useCallback(debounce((width: number) => {
        // Mattermost의 기준: > 640px = 'wide'
        setIsWide(width > 640);
        // 350px 이하에서는 버튼 숨김
        setIsVisible(width > 350);
    }, 10), []);

    useLayoutEffect(() => {
        // 포매팅바 컨테이너 찾기
        let container: HTMLElement | null = null;

        if (containerRef?.current) {
            // 방법 1: ref가 제공된 경우, 부모에서 찾기
            container = containerRef.current.closest('[data-testid="formattingBarContainer"]');
        }

        if (!container) {
            // 방법 2: fallback - DOM에서 직접 찾기
            container = document.querySelector('[data-testid="formattingBarContainer"]');
        }

        if (!container) {
            // 포매팅바를 찾지 못한 경우, 기본값(wide) 유지
            return () => {};
        }

        // ResizeObserver 생성 및 관찰 시작
        let sizeObserver: ResizeObserver | null = new ResizeObserver(() => {
            if (container) {
                handleResize(container.clientWidth);
            }
        });

        sizeObserver.observe(container);

        // 초기 너비 체크
        handleResize(container.clientWidth);

        // Cleanup
        return () => {
            sizeObserver?.disconnect();
            sizeObserver = null;
        };
    }, [handleResize, containerRef]);

    return {isWide, isVisible};
};
