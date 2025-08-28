import React from 'react';
import { NavLink } from 'react-router-dom';

// 필요하면 다른 컴포넌트에서 바닥 여백 잡을 때 쓰라고 높이 상수도 같이 export
export const BOTTOM_TAB_HEIGHT = 83;

export default function BottomTap() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 border-t border-[#bebebe] bg-white z-50 w-[393px] mx-auto">
            <div className="h-px bg-[#bebebe]"></div>
            <div className="bg-white h-[83px] flex items-center justify-center">
                <ul className="mx-auto w-full max-w-[420px] flex justify-around items-center py-4 text-[22px]">
                    <li>
                        <NavLink
                            to="/stores"
                            className={({ isActive }) =>
                                `text-black leading-[26px] ${isActive ? 'font-bold' : 'font-medium'}`
                            }
                        >
                            결제매장
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/home"
                            className={({ isActive }) =>
                                `text-black leading-[26px] ${isActive ? 'font-bold' : 'font-medium'}`
                            }
                        >
                            홈
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/mypage"
                            className={({ isActive }) =>
                                `text-black leading-[26px] ${isActive ? 'font-bold' : 'font-medium'}`
                            }
                        >
                            마이페이지
                        </NavLink>
                    </li>
                </ul>
            </div>
        </nav>
    );
}
