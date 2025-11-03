# 📱 Webapp Frontend

Mattermost Schedule Message Plugin - Frontend Application

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development build (with watch)
npm run dev

# Production build
npm run build

# Run linter
npm run lint
```

---

## 📁 프로젝트 구조

```
webapp/
├── src/
│   ├── features/           # 비즈니스 기능
│   │   └── schedule-message/
│   ├── entities/           # 도메인 엔티티
│   │   └── mattermost/
│   ├── shared/             # 공유 유틸리티
│   └── index.tsx           # 앱 진입점
│
├── ARCHITECTURE_GUIDE.md   # 📖 상세 아키텍처 문서
├── STRUCTURE.md            # 폴더 구조 설명
└── IMPROVEMENTS.md         # 개선 사항
```

---

## 🏗️ 아키텍처

### Feature-Sliced Design (FSD)

```
features (비즈니스 기능)
   ↓
entities (도메인 엔티티)
   ↓
shared (공유 레이어)
```

**핵심 원칙:**
- ✅ 단방향 의존성
- ✅ Public API Pattern
- ✅ Feature Isolation
- ✅ Store Injection

### 레이어 구조

#### 🎯 Features
사용자 대면 기능. 각 feature는 독립적으로 개발/테스트 가능.

```
features/schedule-message/
├── api/        # API 클라이언트
├── hooks/      # React Hooks
├── model/      # 비즈니스 로직 & 타입
├── ui/         # UI 컴포넌트
└── index.ts    # Public API
```

#### 🏛️ Entities
도메인 엔티티 및 비즈니스 모델.

```
entities/mattermost/
├── api/        # Mattermost 서비스 (Store 주입)
├── config/     # 상수
├── model/      # 타입 & Selectors
└── index.ts    # Public API
```

#### 🔧 Shared
프로젝트 전체에서 재사용되는 코드.

```
shared/
├── lib/        # 유틸리티 함수
└── types/      # 공통 타입
```

---

## 🔌 Mattermost 통합

### Plugin Pattern

```typescript
// src/index.tsx
export default class Plugin {
    public async initialize(registry, store) {
        // 1. Store 주입
        mattermostService.initialize(store);

        // 2. 컴포넌트 등록
        registry.registerPostEditorActionComponent(SchedulePostButton);
    }
}
```

### Store 접근

```typescript
// ❌ Anti-pattern
const state = window.store?.getState();

// ✅ Best practice
const state = mattermostService.getState();
```

---

## 📦 Path Aliases

```typescript
import {...} from '@/features/schedule-message';
import {...} from '@/entities/mattermost';
import {...} from '@/shared/lib/datetime';
```

설정 위치:
- `tsconfig.json` - TypeScript
- `webpack.config.js` - Webpack

---

## 🛠️ 개발 가이드

### 새 Feature 추가

1. **구조 생성**
   ```bash
   mkdir -p src/features/new-feature/{api,hooks,model,ui}
   touch src/features/new-feature/index.ts
   ```

2. **구현**
   ```typescript
   // api/
   export class NewFeatureApiClient { ... }

   // hooks/
   export function useNewFeature() { ... }

   // model/
   export class NewFeatureService { ... }

   // ui/
   export const NewFeatureComponent = () => { ... };
   ```

3. **Public API 정의**
   ```typescript
   // index.ts
   export {NewFeatureComponent} from './ui/new-feature-component';
   export type {NewFeatureProps} from './model/types';
   ```

4. **Plugin 등록**
   ```typescript
   // src/index.tsx
   registry.registerSomeApi(NewFeatureComponent);
   ```

### 의존성 규칙

```typescript
// ✅ 올바른 의존성
features → entities → shared

// ❌ 잘못된 의존성
shared → entities  // 역방향 ❌
entities → features  // 역방향 ❌
features ↔ features  // 동일 레벨 ❌
```

---

## 📊 빌드 정보

- **Bundle Size**: 136 KiB (minified)
- **Build Time**: ~2초
- **Modules**: 36 modules

### 최적화

- ✅ Tree shaking
- ✅ Code splitting
- ✅ Minification
- ✅ Source maps (dev only)

---

## 🧪 테스트

```bash
# Run tests (when configured)
npm test

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
src/
├── features/
│   └── schedule-message/
│       ├── __tests__/
│       │   ├── schedule-api.test.ts
│       │   ├── use-message-data.test.ts
│       │   └── schedule-post-button.test.tsx
│       └── ...
```

---

## 📚 문서

| 문서 | 설명 |
|------|------|
| **ARCHITECTURE_GUIDE.md** | 📖 상세 아키텍처 가이드 |
| **STRUCTURE.md** | 📁 폴더 구조 설명 |
| **IMPROVEMENTS.md** | 🚀 개선 사항 |

---

## 🔧 기술 스택

- **React** 17+ (Functional Components + Hooks)
- **TypeScript** 4+
- **Redux** (Mattermost injected)
- **Webpack** 5
- **ESLint** + **Babel**

---

## 📋 스크립트

```bash
# 개발
npm run dev              # Watch mode
npm run debug            # Debug mode
npm run debug:watch      # Debug watch mode

# 빌드
npm run build            # Production build
npm run build:watch      # Build watch mode

# 린트
npm run lint             # ESLint check
```

---

## 🎯 주요 개선사항 (v2.0.0)

### 아키텍처
- ✅ FSD (Feature-Sliced Design) 적용
- ✅ 단방향 의존성 구조
- ✅ Public API Pattern

### Mattermost 통합
- ✅ Store 주입 패턴 구현
- ✅ `window.store` 직접 접근 제거
- ✅ Type-safe Store 접근

### 코드 품질
- ✅ 불필요한 서비스 레이어 제거
- ✅ DOM 조작 최소화
- ✅ Redux 우선 데이터 소스

### 성능
- ✅ Bundle size 최적화 (142KB → 136KB)
- ✅ 코드 라인 35% 감소
- ✅ 빌드 시간 개선

---

## 🐛 트러블슈팅

### Store 초기화 오류
```
Error: MattermostService not initialized
```
→ `Plugin.initialize`에서 `mattermostService.initialize(store)` 호출 확인

### Path alias 오류
```
Cannot find module '@/features/...'
```
→ `tsconfig.json`과 `webpack.config.js`의 paths/alias 설정 확인

### Draft 정보 없음
```
getCurrentDraft() returns null
```
→ Redux store 구조 확인: `state.storage.storage['draft_${channelId}']`

---

## 📞 지원

- **이슈**: [GitHub Issues](https://github.com/your-repo/issues)
- **문서**: [Developer Guide](https://developers.mattermost.com/extend/plugins/)

---

**Last Updated**: 2025-11-03
