import React, { useState } from 'react';

const TimeSettingModal = ({ isOpen, onClose, onTimeSet, initialTime = '12:00' }) => {
    const [selectedHour, setSelectedHour] = useState(12);
    const [selectedMinute, setSelectedMinute] = useState(0);
    const [isAM, setIsAM] = useState(true);

    React.useEffect(() => {
        if (initialTime) {
            const [hour, minute] = initialTime.split(':');
            const hourNum = parseInt(hour);

            if (hourNum === 0) {
                setSelectedHour(12);
                setIsAM(true);
            } else if (hourNum <= 12) {
                setSelectedHour(hourNum === 12 ? 12 : hourNum);
                setIsAM(hourNum !== 12);
            } else {
                setSelectedHour(hourNum - 12);
                setIsAM(false);
            }
            setSelectedMinute(parseInt(minute));
        }
    }, [initialTime]);

    if (!isOpen) return null;

    const handleTimeSet = () => {
        let finalHour = selectedHour;

        if (!isAM && finalHour !== 12) {
            finalHour += 12;
        } else if (isAM && finalHour === 12) {
            finalHour = 0;
        }

        const timeString = `${finalHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
        onTimeSet(timeString);
        onClose();
    };

    const adjustHour = (increment) => {
        setSelectedHour((prev) => {
            let newHour = prev + increment;
            if (newHour > 12) newHour = 1;
            if (newHour < 1) newHour = 12;
            return newHour;
        });
    };

    const adjustMinute = (increment) => {
        setSelectedMinute((prev) => {
            let newMinute = prev + increment;
            if (newMinute >= 60) newMinute = 0;
            if (newMinute < 0) newMinute = 55;
            return Math.round(newMinute / 5) * 5; // 5분 단위로 조정
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-black rounded-2xl p-6 w-80 relative">
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 text-white text-xl">
                    ✕
                </button>

                {/* Title */}
                <h2 className="text-white text-lg font-medium mb-6 text-center">이 시간까지는 도착해야해요!</h2>

                {/* Date Label */}
                <p className="text-white text-sm mb-4">오늘</p>

                {/* Time Controls */}
                <div className="flex items-center justify-center mb-6">
                    {/* Hour Control */}
                    <div className="flex flex-col items-center">
                        <button
                            onClick={() => adjustHour(1)}
                            className="text-white text-2xl p-2 hover:bg-gray-700 rounded"
                        >
                            ▲
                        </button>
                        <div className="text-white text-5xl font-bold w-20 text-center py-2">
                            {selectedHour.toString().padStart(2, '0')}
                        </div>
                        <button
                            onClick={() => adjustHour(-1)}
                            className="text-white text-2xl p-2 hover:bg-gray-700 rounded"
                        >
                            ▼
                        </button>
                    </div>

                    <span className="text-white text-5xl font-bold mx-4">:</span>

                    {/* Minute Control */}
                    <div className="flex flex-col items-center">
                        <button
                            onClick={() => adjustMinute(5)}
                            className="text-white text-2xl p-2 hover:bg-gray-700 rounded"
                        >
                            ▲
                        </button>
                        <div className="text-white text-5xl font-bold w-20 text-center py-2">
                            {selectedMinute.toString().padStart(2, '0')}
                        </div>
                        <button
                            onClick={() => adjustMinute(-5)}
                            className="text-white text-2xl p-2 hover:bg-gray-700 rounded"
                        >
                            ▼
                        </button>
                    </div>

                    {/* AM/PM Toggle */}
                    <div className="ml-6 flex flex-col">
                        <button
                            onClick={() => setIsAM(true)}
                            className={`px-3 py-2 rounded text-sm font-medium mb-2 ${
                                isAM ? 'bg-white text-black' : 'bg-gray-600 text-white'
                            }`}
                        >
                            오전
                        </button>
                        <button
                            onClick={() => setIsAM(false)}
                            className={`px-3 py-2 rounded text-sm font-medium ${
                                !isAM ? 'bg-white text-black' : 'bg-gray-600 text-white'
                            }`}
                        >
                            오후
                        </button>
                    </div>
                </div>

                {/* Confirm Button */}
                <button onClick={handleTimeSet} className="w-full bg-gray-600 text-white py-3 rounded-lg font-medium">
                    설정완료
                </button>
            </div>
        </div>
    );
};

export default TimeSettingModal;
