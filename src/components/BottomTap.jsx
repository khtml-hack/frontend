import React from 'react';
import { NavLink } from 'react-router-dom';

// 필요하면 다른 컴포넌트에서 바닥 여백 잡을 때 쓰라고 높이 상수도 같이 export
export const BOTTOM_TAB_HEIGHT = 56;

export default function BottomTap() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 border-t bg-white z-50 w-[393px] mx-auto">
            <ul className="mx-auto w-full max-w-[420px] flex justify-around py-4 text-[18px]">
                <li>
                    <NavLink to="/stores" className={({ isActive }) => (isActive ? 'font-semibold' : 'opacity-60')}>
                        결제매장
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/home" className={({ isActive }) => (isActive ? 'font-semibold' : 'opacity-60')}>
                        홈
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/mypage" className={({ isActive }) => (isActive ? 'font-semibold' : 'opacity-60')}>
                        마이페이지
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
}
