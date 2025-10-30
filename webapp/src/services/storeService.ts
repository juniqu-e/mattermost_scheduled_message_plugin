// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * Global Redux Store 관리
 */

// 전역 store 참조
let globalStore: any = null;

/**
 * Plugin에서 store 등록
 * @param store Redux store 인스턴스
 */
export function setGlobalStore(store: any): void {
    globalStore = store;
    // eslint-disable-next-line no-console
    console.log('✓ Global store가 설정되었습니다.');
}

/**
 * Global store 가져오기
 * @returns Redux store 또는 null
 */
export function getGlobalStore(): any | null {
    return globalStore;
}

/**
 * Window에서 store 찾기 (fallback)
 * @returns Redux store 또는 null
 */
export function findStoreInWindow(): any | null {
    try {
        const storeKey = Object.keys(window).find((key) =>
            key.includes('store') || key.includes('Store'),
        );

        if (storeKey) {
            const store = (window as any)[storeKey];
            if (store && store.getState) {
                // eslint-disable-next-line no-console
                console.log(`✓ Window에서 store 발견: ${storeKey}`);
                return store;
            }
        }

        // eslint-disable-next-line no-console
        console.log('✗ Window에서 Store를 찾을 수 없습니다.');
        return null;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Window에서 store 검색 실패:', error);
        return null;
    }
}

/**
 * Store 인스턴스 가져오기 (global 또는 window에서)
 * @returns Redux store 또는 null
 */
export function getStore(): any | null {
    return globalStore || findStoreInWindow();
}
