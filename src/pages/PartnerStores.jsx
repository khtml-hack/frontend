import React from 'react';
import { useNavigate } from 'react-router-dom';

const PartnerStores = () => {
    const navigate = useNavigate();

    const stores = [
        {
            id: 1,
            name: '최씨네 커피공방',
            category: '카페',
            address: '서울특별시 송파구 위례광장로 121',
            distance: '200m',
            image: '/api/placeholder/80/80',
        },
        {
            id: 2,
            name: '신선한 과일마트',
            category: '마트',
            address: '서울특별시 송파구 위례성대로 22',
            distance: '350m',
            image: '/api/placeholder/80/80',
        },
        {
            id: 3,
            name: '맛있는 치킨집',
            category: '치킨',
            address: '서울특별시 송파구 위례광장로 15',
            distance: '450m',
            image: '/api/placeholder/80/80',
        },
    ];

    return (
        <div className="mobile-frame">
            {/* Status Bar */}
            <div className="status-bar">
                <div className="font-semibold">9:41</div>
                <div className="flex items-center gap-1">
                    <div className="w-6 h-3 border border-black rounded-sm">
                        <div className="w-5 h-2 bg-black rounded-sm m-0.5"></div>
                    </div>
                </div>
            </div>

            {/* Header Background */}
            <div className="bg-gray-100 h-72 relative">
                <div className="px-8 pt-8">
                    <h1 className="text-4xl font-extrabold peak-green tracking-tight">Peak _down</h1>
                </div>
            </div>

            {/* Content */}
            <div className="px-8 -mt-16">
                {/* QR Payment Button */}
                <button className="bg-green-500 rounded-2xl p-4 w-full mb-6 flex items-center gap-4">
                    <div className="bg-white rounded-xl p-3">
                        <div className="w-8 h-8 bg-gray-800 rounded-md flex items-center justify-center">
                            <div className="w-6 h-6 bg-white rounded-sm grid grid-cols-3 gap-px">
                                <div className="bg-black rounded-sm"></div>
                                <div className="bg-black rounded-sm"></div>
                                <div className="bg-black rounded-sm"></div>
                                <div className="bg-black rounded-sm"></div>
                                <div className="bg-white rounded-sm"></div>
                                <div className="bg-black rounded-sm"></div>
                                <div className="bg-black rounded-sm"></div>
                                <div className="bg-black rounded-sm"></div>
                                <div className="bg-black rounded-sm"></div>
                            </div>
                        </div>
                    </div>
                    <div className="text-white text-xl font-medium">제휴매장에서 포인트로 결제하기</div>
                </button>

                {/* Store List */}
                <div className="space-y-4 mb-6">
                    <h2 className="text-xl font-medium text-gray-800 mb-4">근처 제휴 매장</h2>

                    {stores.map((store) => (
                        <div key={store.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
                                    <span className="text-gray-400 text-sm">매장</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 mb-1">{store.name}</h3>
                                    <p className="text-sm text-gray-500 mb-1">{store.category}</p>
                                    <p className="text-sm text-gray-400">{store.address}</p>
                                    <p className="text-sm text-green-600">{store.distance}</p>
                                </div>
                                <button
                                    onClick={() => navigate(`/stores/${store.id}`)}
                                    className="bg-gray-100 text-gray-800 px-4 py-2 rounded-xl text-sm font-medium"
                                >
                                    보기
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Categories */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">카테고리</h3>
                    <div className="grid grid-cols-4 gap-3">
                        {['🍕 음식', '☕ 카페', '🛒 마트', '💊 약국'].map((category) => (
                            <button
                                key={category}
                                className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100"
                            >
                                <div className="text-sm">{category}</div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="absolute bottom-16 left-0 right-0 border-t border-gray-300 pt-4">
                <div className="flex justify-center">
                    <div className="flex gap-12">
                        <button onClick={() => navigate('/home')} className="text-black text-2xl font-medium">
                            홈
                        </button>
                        <button className="text-black text-2xl font-medium underline">결제매장</button>
                        <button onClick={() => navigate('/mypage')} className="text-black text-2xl font-medium">
                            마이페이지
                        </button>
                    </div>
                </div>
            </div>

            {/* Home Indicator */}
            <div className="home-indicator"></div>
        </div>
    );
};

export default PartnerStores;
