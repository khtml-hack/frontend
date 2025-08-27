import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patchNickname } from '../api/nicknameApi';
import { logoutUser } from '../api/userApi';
import BottomTap from '../components/BottomTap';

export default function MyPage() {
    const navigate = useNavigate();

    // QR 모달
    const [qrOpen, setQrOpen] = useState(false);

    // 닉네임 상태 & 모달 상태
    const [nickname, setNickname] = useState('김원활');
    const [editOpen, setEditOpen] = useState(false);
    const [formName, setFormName] = useState(nickname);
    const [saving, setSaving] = useState(false);
    const [saveErr, setSaveErr] = useState('');

    // 로그아웃 관련 상태
    const [error, setError] = useState('');

    // ESC로 모달 닫기
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setQrOpen(false);
                setEditOpen(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // 초기 닉네임 로드(선택)
    useEffect(() => {
        try {
            const n = localStorage.getItem('nickname');
            if (n) setNickname(n);
        } catch {}
    }, []);

    // 닉네임 저장
    async function handleSaveNickname() {
        const next = formName.trim();
        if (!next || next === nickname) {
            setEditOpen(false);
            return;
        }
        try {
            setSaving(true);
            setSaveErr('');

            // 필요 시 토큰 꺼내 쓰기 (없으면 undefined)
            const token = localStorage.getItem('accessToken');

            // 실제 API 호출
            const data = await patchNickname(next, token); // { nickname: "..." } 예상

            const confirmed = data?.nickname ?? next;
            setNickname(confirmed);
            try {
                localStorage.setItem('nickname', confirmed);
            } catch {}
            setEditOpen(false);
        } catch (err) {
            console.error('닉네임 저장 오류:', err);
            setSaveErr('저장 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    }

    // 로그아웃 처리
    const handleLogout = async () => {
        setError('');
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                setError('로그인 정보가 없습니다.');
                return;
            }

            await logoutUser(refreshToken);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            navigate('/login');
        } catch (e) {
            console.error('로그아웃 오류:', e);
            setError('로그아웃 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="mobile-frame">
            <div className="mx-auto w-full max-w-[420px] min-h-[100svh] flex flex-col bg-white text-black relative">
                {/* 상단 카드(간단) */}
                <header className="p-7">
                    <h1 className="text-[clamp(22px,5vw,28px)] font-extrabold text-green-500">Peak_down</h1>
                </header>

                {/* 페이지 영역 */}
                <main className="flex-1 px-5 py-4">
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold">마이페이지</h2>
                        <p className="text-sm text-zinc-500">
                            안녕하세요, <b>{nickname}</b> 님
                        </p>

                        {/* 내정보 리스트 */}
                        <section>
                            <h3 className="text-sm text-zinc-500">내정보</h3>
                            <ul className="mt-2 overflow-hidden rounded-xl border divide-y">
                                <li>
                                    <button
                                        className="flex w-full items-center justify-between px-4 py-3"
                                        onClick={() => {
                                            setFormName(nickname);
                                            setEditOpen(true);
                                        }}
                                    >
                                        <span>닉네임 변경</span>
                                        <span className="text-zinc-400">›</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="flex w-full items-center justify-between px-4 py-3"
                                        onClick={() => navigate('/favorite-locations')}
                                    >
                                        <span>자주가는 경로 관리</span>
                                        <span className="text-zinc-400">›</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="flex w-full items-center justify-between px-4 py-3"
                                        onClick={handleLogout}
                                    >
                                        <span className="text-red-500">로그아웃</span>
                                        <span className="text-zinc-400">›</span>
                                    </button>
                                </li>
                            </ul>
                            {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
                        </section>

                        <hr className="border-zinc-200" />

                        {/* 현황 섹션 */}
                        <h3 className="text-sm text-zinc-400">나의 지역화폐 현황 및 사용</h3>
                        <div className="bg-green-500 text-white rounded-2xl px-5 py-4">
                            <div className="flex items-baseline justify-between">
                                <span className="font-semibold">나의 지역화폐 현황</span>
                                <span className="text-xl font-extrabold">2,500원</span>
                            </div>
                            <div className="mt-3 flex gap-2">
                                <button
                                    className="rounded-full border border-white/80 bg-white/10 px-4 py-1.5 text-sm"
                                    onClick={() => navigate('/point-history')}
                                >
                                    적립/사용내역
                                </button>
                                <button
                                    onClick={() => navigate('/stores')}
                                    className="rounded-full border border-white/80 bg-white/10 px-4 py-1.5 text-sm"
                                >
                                    사용하러 가기
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

                {/* 닉네임 변경 모달 */}
                {editOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-6"
                        onClick={() => !saving && setEditOpen(false)}
                        role="dialog"
                        aria-modal="true"
                        aria-label="닉네임 변경"
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <div
                            className="relative z-10 w-full max-w-sm rounded-2xl bg-neutral-900 text-white p-5 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* 닫기 버튼 */}
                            <button
                                className="absolute right-3 top-3 text-white/80 hover:text-white"
                                onClick={() => !saving && setEditOpen(false)}
                                aria-label="닫기"
                            >
                                ×
                            </button>

                            <h3 className="text-center text-lg font-semibold">닉네임 변경하기</h3>

                            <div className="mt-4">
                                <div className="relative">
                                    <input
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveNickname()}
                                        placeholder="닉네임"
                                        maxLength={20}
                                        autoFocus
                                        className="w-full rounded-full bg-neutral-800 px-4 py-3 pr-10 outline-none ring-1 ring-white/10 focus:ring-white/30"
                                    />
                                    {!!formName && (
                                        <button
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                                            onClick={() => setFormName('')}
                                            aria-label="지우기"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                                {saveErr && <p className="mt-2 text-sm text-red-400">{saveErr}</p>}
                            </div>

                            <button
                                onClick={handleSaveNickname}
                                disabled={saving || !formName.trim()}
                                className="mt-5 w-full rounded-full bg-white text-neutral-900 py-2 disabled:opacity-60 active:scale-[.98]"
                            >
                                {saving ? '저장 중…' : '완료'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 하단 탭 */}
            <BottomTap />
        </div>
    );
}
