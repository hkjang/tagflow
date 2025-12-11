'use client';

import { useTranslation } from '../../lib/i18n';
import Link from 'next/link';

export default function GuidePage() {
    const { t } = useTranslation();

    const sectionStyle = {
        backgroundColor: 'white',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '1.5rem',
        marginBottom: '1.5rem',
    };

    const sectionTitleStyle = {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    };

    const featureCardStyle = (bgColor: string, borderColor: string) => ({
        padding: '1rem',
        backgroundColor: bgColor,
        borderRadius: '0.5rem',
        borderLeft: `4px solid ${borderColor}`,
        marginBottom: '0.75rem',
    });

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f3f4f6',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '2rem',
        }}>
            <div style={{
                maxWidth: '900px',
                margin: '0 auto',
            }}>
                {/* Header */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    padding: '2rem',
                    marginBottom: '1.5rem',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                color: '#1f2937',
                                marginBottom: '0.5rem',
                            }}>
                                {t('guide.title')}
                            </h1>
                            <p style={{ color: '#6b7280' }}>{t('guide.subtitle')}</p>
                        </div>
                        <Link href="/dashboard" style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            borderRadius: '0.375rem',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                        }}>
                            대시보드로 이동
                        </Link>
                    </div>
                </div>

                {/* Overview Section */}
                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle as any}>
                        📋 {t('guide.overview.title')}
                    </h2>
                    <p style={{ color: '#374151', lineHeight: '1.75' }}>
                        {t('guide.overview.description')}
                    </p>
                </div>

                {/* Core Features Section */}
                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle as any}>
                        ✨ 주요 기능
                    </h2>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {/* Dashboard Feature */}
                        <div style={featureCardStyle('#f0f9ff', '#2563eb')}>
                            <h3 style={{ fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>
                                📊 대시보드
                            </h3>
                            <p style={{ color: '#374151', fontSize: '0.875rem' }}>
                                실시간 태그 이벤트 현황, 오늘/이번 주/이번 달 통계, 최근 이벤트 목록을 한눈에 확인할 수 있습니다.
                            </p>
                        </div>

                        {/* Tag Input Feature */}
                        <div style={featureCardStyle('#f0fdf4', '#16a34a')}>
                            <h3 style={{ fontWeight: '600', color: '#166534', marginBottom: '0.5rem' }}>
                                📱 태그 입력 (스캔)
                            </h3>
                            <p style={{ color: '#374151', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                RFID 카드 UID를 수동으로 입력하여 태그 이벤트를 등록합니다.
                            </p>
                            <ul style={{ color: '#374151', fontSize: '0.875rem', marginLeft: '1rem', marginBottom: 0 }}>
                                <li>8자리 UID 입력 시 자동 제출</li>
                                <li>한글 키보드에서도 자동 영문 변환</li>
                                <li>목적 선택 및 추가 정보 입력 지원</li>
                                <li>입력한 목적/필드 값은 세션 동안 유지</li>
                            </ul>
                        </div>

                        {/* Reports Feature */}
                        <div style={featureCardStyle('#fefce8', '#ca8a04')}>
                            <h3 style={{ fontWeight: '600', color: '#854d0e', marginBottom: '0.5rem' }}>
                                📈 리포트
                            </h3>
                            <p style={{ color: '#374151', fontSize: '0.875rem' }}>
                                이벤트 기록을 조회하고 분석합니다. 기간별 필터링 및 내보내기 기능을 지원합니다.
                            </p>
                        </div>

                        {/* Webhook Feature */}
                        <div style={featureCardStyle('#fdf4ff', '#a855f7')}>
                            <h3 style={{ fontWeight: '600', color: '#7e22ce', marginBottom: '0.5rem' }}>
                                🔗 웹훅 연동
                            </h3>
                            <p style={{ color: '#374151', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                                태그 이벤트 발생 시 외부 시스템으로 데이터를 자동 전송합니다.
                            </p>
                            <ul style={{ color: '#374151', fontSize: '0.875rem', marginLeft: '1rem', marginBottom: 0 }}>
                                <li>HTTP GET/POST/PUT/DELETE 지원</li>
                                <li>필드 매핑: 원본 키 → 변환 키 설정</li>
                                <li>목적 데이터 자동 포함 (purpose_id, purpose_data)</li>
                                <li>사용자 정의 키 이름으로 매핑 가능</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Purpose Management Section - NEW */}
                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle as any}>
                        🎯 태그 목적 관리 <span style={{ fontSize: '0.75rem', backgroundColor: '#dcfce7', color: '#166534', padding: '0.125rem 0.5rem', borderRadius: '9999px', marginLeft: '0.5rem' }}>NEW</span>
                    </h2>
                    <p style={{ color: '#374151', fontSize: '0.875rem', marginBottom: '1rem' }}>
                        태그 이벤트에 목적(출석, 시설 이용 등)을 지정하고 목적별로 추가 정보를 수집할 수 있습니다.
                    </p>

                    <div style={featureCardStyle('#fff7ed', '#f97316')}>
                        <h3 style={{ fontWeight: '600', color: '#c2410c', marginBottom: '0.5rem' }}>
                            📝 목적별 필드 설정
                        </h3>
                        <ul style={{ color: '#374151', fontSize: '0.875rem', marginLeft: '1rem', marginBottom: 0 }}>
                            <li><strong>필드 추가/수정/삭제:</strong> 목적에 맞는 입력 필드 정의</li>
                            <li><strong>필드 타입:</strong> 문자열, 숫자, 날짜, 선택(드롭다운)</li>
                            <li><strong>필수 여부:</strong> 필수 입력 필드 지정</li>
                            <li><strong>기본값:</strong> 자주 사용하는 값 미리 설정</li>
                        </ul>
                    </div>

                    <div style={featureCardStyle('#f0fdfa', '#14b8a6')}>
                        <h3 style={{ fontWeight: '600', color: '#0f766e', marginBottom: '0.5rem' }}>
                            🔧 목적별 웹훅 연결
                        </h3>
                        <p style={{ color: '#374151', fontSize: '0.875rem' }}>
                            특정 목적의 태그 이벤트만 특정 웹훅으로 전송하도록 설정할 수 있습니다.
                        </p>
                    </div>

                    <div style={featureCardStyle('#fef2f2', '#ef4444')}>
                        <h3 style={{ fontWeight: '600', color: '#dc2626', marginBottom: '0.5rem' }}>
                            📊 목적별 통계
                        </h3>
                        <p style={{ color: '#374151', fontSize: '0.875rem' }}>
                            각 목적별로 오늘, 이번 주, 이번 달, 전체 이벤트 수를 확인할 수 있습니다.
                        </p>
                    </div>
                </div>

                {/* Webhook Mapping Section - NEW */}
                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle as any}>
                        🔄 웹훅 파라미터 매핑 <span style={{ fontSize: '0.75rem', backgroundColor: '#dcfce7', color: '#166534', padding: '0.125rem 0.5rem', borderRadius: '9999px', marginLeft: '0.5rem' }}>NEW</span>
                    </h2>
                    <p style={{ color: '#374151', fontSize: '0.875rem', marginBottom: '1rem' }}>
                        웹훅으로 전송되는 데이터의 키 이름을 외부 시스템에 맞게 변환할 수 있습니다.
                    </p>

                    <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', fontFamily: 'monospace', fontSize: '0.8rem', marginBottom: '1rem' }}>
                        <div style={{ marginBottom: '0.5rem', color: '#6b7280' }}>예시: 웹훅 페이로드</div>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`{
  "card_uid": "6a1324ed",
  "purpose_id": 1,
  "purpose_data": { "edu_id": "CLA00007" },
  "edu_id": "CLA00007",          // 최상위 복제
  "purpose_edu_id": "CLA00007",  // prefix 버전
  "system_name": "TagFlow RFID System"
}`}</pre>
                    </div>

                    <ul style={{ color: '#374151', fontSize: '0.875rem', marginLeft: '1rem' }}>
                        <li><strong>기본 필드:</strong> card_uid, event_time, source_ip, system_name</li>
                        <li><strong>목적 필드:</strong> purpose_id, purpose_data (객체)</li>
                        <li><strong>평탄화 필드:</strong> purpose_data 내 필드가 최상위로 복제됨</li>
                        <li><strong>커스텀 매핑:</strong> 임의의 키 이름 직접 입력 가능</li>
                    </ul>
                </div>

                {/* Scan Page Features - NEW */}
                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle as any}>
                        📱 스캔 페이지 기능 <span style={{ fontSize: '0.75rem', backgroundColor: '#dcfce7', color: '#166534', padding: '0.125rem 0.5rem', borderRadius: '9999px', marginLeft: '0.5rem' }}>개선</span>
                    </h2>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        <div style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                            <strong style={{ color: '#374151' }}>🔤 한글 자동 변환</strong>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                                한글 키보드 상태에서 입력해도 자동으로 영문으로 변환됩니다. (예: ㄱ → r, ㄴ → s)
                            </p>
                        </div>
                        <div style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                            <strong style={{ color: '#374151' }}>💾 세션 유지</strong>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                                선택한 목적과 입력한 필드 값이 로그아웃 전까지 유지됩니다.
                            </p>
                        </div>
                        <div style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                            <strong style={{ color: '#374151' }}>📐 2컬럼 레이아웃</strong>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                                왼쪽에 입력 영역, 오른쪽에 최근 이벤트 목록이 표시되어 한눈에 볼 수 있습니다.
                            </p>
                        </div>
                        <div style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                            <strong style={{ color: '#374151' }}>✅ 자동 제출</strong>
                            <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                                8자리 UID 입력 완료 시 자동으로 이벤트가 등록됩니다.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Getting Started Section */}
                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle as any}>
                        🚀 시작하기
                    </h2>
                    <ol style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        display: 'grid',
                        gap: '0.75rem',
                    }}>
                        {[
                            '관리자 계정으로 로그인합니다. (기본: admin / admin123)',
                            '설정 → 웹훅에서 외부 시스템 연동을 설정합니다.',
                            '태그 목적 관리에서 사용할 목적과 필드를 정의합니다.',
                            '스캔 페이지에서 목적을 선택하고 태그를 입력합니다.',
                            '대시보드에서 실시간 통계를 확인합니다.',
                        ].map((step, index) => (
                            <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '24px',
                                    height: '24px',
                                    backgroundColor: '#2563eb',
                                    color: 'white',
                                    borderRadius: '50%',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    flexShrink: 0,
                                }}>{index + 1}</span>
                                <span style={{ color: '#374151' }}>{step}</span>
                            </li>
                        ))}
                    </ol>
                </div>

                {/* User Roles Section */}
                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle as any}>
                        👥 사용자 권한
                    </h2>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '0.875rem',
                        }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9fafb' }}>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600' }}>
                                        권한
                                    </th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600' }}>
                                        설명
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 0.5rem',
                                            backgroundColor: '#fee2e2',
                                            color: '#991b1b',
                                            borderRadius: '0.25rem',
                                            fontWeight: '500',
                                        }}>Admin</span>
                                    </td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>
                                        모든 기능 사용 가능 (사용자 관리, 웹훅 설정, 목적 관리, 시스템 설정)
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 0.5rem',
                                            backgroundColor: '#dbeafe',
                                            color: '#1e40af',
                                            borderRadius: '0.25rem',
                                            fontWeight: '500',
                                        }}>Operator</span>
                                    </td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>
                                        태그 입력, 리포트 조회, 대시보드 확인
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 0.5rem',
                                            backgroundColor: '#dcfce7',
                                            color: '#166534',
                                            borderRadius: '0.25rem',
                                            fontWeight: '500',
                                        }}>Viewer</span>
                                    </td>
                                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>
                                        대시보드 및 리포트 조회만 가능
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Tips Section */}
                <div style={sectionStyle}>
                    <h2 style={sectionTitleStyle as any}>
                        💡 유용한 팁
                    </h2>
                    <ul style={{ color: '#374151', fontSize: '0.875rem', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
                        <li>스캔 페이지에서 목적을 선택하면 해당 목적의 필드가 자동으로 표시됩니다.</li>
                        <li>웹훅 매핑에서 From Key를 직접 입력하면 커스텀 필드도 매핑할 수 있습니다.</li>
                        <li>purpose_data 내 필드는 최상위 레벨에도 자동 복제되어 매핑이 더 쉽습니다.</li>
                        <li>한글 키보드 상태에서도 태그 입력이 정상 동작합니다.</li>
                        <li>로그아웃하지 않으면 선택한 목적과 필드 값이 유지됩니다.</li>
                    </ul>
                </div>

                {/* Help Section */}
                <div style={{
                    backgroundColor: '#eff6ff',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    textAlign: 'center',
                    border: '1px solid #bfdbfe',
                }}>
                    <h2 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: '#1e40af',
                        marginBottom: '0.5rem',
                    }}>
                        💬 도움이 필요하신가요?
                    </h2>
                    <p style={{ color: '#3b82f6', fontSize: '0.875rem' }}>
                        문의사항은 시스템 관리자에게 연락해 주세요.
                    </p>
                </div>
            </div>
        </div>
    );
}
