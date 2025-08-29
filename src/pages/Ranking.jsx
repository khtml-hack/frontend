import React from 'react';
import { useNavigate } from 'react-router-dom';
import BeforeIcon from '../assets/Previous.png';
import GraphIcon from '../assets/Graph.png';
import AnimalsIcon from '../assets/Animals.png';
import BottomRankCard from '../components/BottomRankCard';
export default function Ranking() {
    const navigate = useNavigate();

    return (
        <div className="container-mobile mx-auto w-full max-w-[420px] min-h-[100dvh] flex flex-col bg-white">
            {/* 헤더 */}
            <header className="px-2 pt-10 pb-3">
                <div className="grid grid-cols-[auto_1fr_auto] items-center">
                    <button onClick={() => navigate(-1)} aria-label="뒤로">
                        <img src={BeforeIcon} alt="" className="w-3 h-4" />
                    </button>
                    <h1 className="text-end text-[15px] font-medium">우리구역 등수 자랑하기</h1>
                    <span aria-hidden className="w-4 h-4" />
                </div>
            </header>

            {/* 본문 */}
            <main className="ml-2 flex-1 overflow-y-auto py-6">
                <p className="mb-0 text-[16px] font-semibold">이번주 - 8월 넷째주</p>
                <h2 className="mb-3 text-[30px] font-bold">우리동네 대시보드</h2>

                <section>
                    <div className="flex items-center justify-between py-2 text-[16px] font-semibold px-[60px]">
                        <span className="text-[#656A70]">누적 포인트</span>
                        <span className="text-black">참여율</span>
                    </div>
                    <div className="h-px bg-zinc-200 mb-[40px]" />
                    <img src={GraphIcon} alt="그래프 이미지" className="w-full h-auto mb-6" />
                </section>
                <div className="mt-[20px] mx-0 h-px bg-zinc-300" />
                <div className="mt-[15px]">
                    <h3 className="mb-[2px] text-[20px] font-bold">전체 랭킹</h3>
                    <p className=" text-[14px] text-[#58595D] font-semibold">우리동네 총 18,747명 참여중!</p>
                </div>
                <section className="flex items-center justify-between mt-3">
                    <img src={AnimalsIcon} alt="동물 이미지" className="w-[77px] h-[115px] " />
                    <div className="flex flex-col items-left text-[#404040] mr-[50px] mt-4">
                        <p className="text-[16px] font-bold">A구역</p>
                        <p className="mb-3 text-[13px] font-semibold">평균 누적 포인트:3500원 참여율 65%</p>
                        <p className="mt-1 text-[16px] font-bold">C구역</p>
                        <p className="text-[13px] font-semibold">평균 누적 포인트:2700원 참여율 57%</p>
                    </div>
                </section>

                {/* 개인 랭킹 하단 바 */}
                <div className="mt-[20px]">
                    <BottomRankCard />
                </div>
            </main>
        </div>
    );
}
