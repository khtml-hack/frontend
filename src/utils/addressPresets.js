// 자주 사용되는 주소들의 좌표 프리셋
export const ADDRESS_PRESETS = {
    동대문구청: {
        lat: 37.5745,
        lng: 127.0399,
        address: '동대문구청',
    },
    '한국외국어대학교 서울캠퍼스': {
        lat: 37.5959,
        lng: 127.0587,
        address: '한국외국어대학교 서울캠퍼스',
    },
    한국외국어대학교: {
        lat: 37.5959,
        lng: 127.0587,
        address: '한국외국어대학교 서울캠퍼스',
    },
    서울캠퍼스: {
        lat: 37.5959,
        lng: 127.0587,
        address: '한국외국어대학교 서울캠퍼스',
    },
    동대문: {
        lat: 37.5745,
        lng: 127.0399,
        address: '동대문구청',
    },
    // 추가 자주 사용되는 주소들
    서울역: {
        lat: 37.5547,
        lng: 126.9706,
        address: '서울역',
    },
    강남역: {
        lat: 37.4979,
        lng: 127.0276,
        address: '강남역',
    },
    홍대입구: {
        lat: 37.5568,
        lng: 126.9236,
        address: '홍대입구역',
    },
};

// 주소에서 프리셋 찾기
export const findPresetByAddress = (address) => {
    if (!address) return null;

    const normalizedAddress = address.trim();

    // 정확한 매칭 먼저 시도
    if (ADDRESS_PRESETS[normalizedAddress]) {
        return ADDRESS_PRESETS[normalizedAddress];
    }

    // 부분 매칭 시도
    for (const [key, preset] of Object.entries(ADDRESS_PRESETS)) {
        if (normalizedAddress.includes(key) || key.includes(normalizedAddress)) {
            return preset;
        }
    }

    return null;
};

// 두 주소 모두에 대한 프리셋 찾기
export const findPresetsForRoute = (originAddress, destinationAddress) => {
    const origin = findPresetByAddress(originAddress) || ADDRESS_PRESETS['동대문구청'];
    const destination = findPresetByAddress(destinationAddress) || ADDRESS_PRESETS['한국외국어대학교 서울캠퍼스'];

    return { origin, destination };
};
