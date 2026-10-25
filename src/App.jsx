import React, { useState, useEffect } from 'react';
import { 
  MapPin, Clock, Share2, Navigation, Hotel, Utensils, 
  Check, Copy, ChevronRight, UserCheck, Plus, Trash2, Save, FileText, Compass
} from 'lucide-react';

export default function TravelPlannerApp() {
  const [activeTab, setActiveTab] = useState('timeline');
  const [selectedDay, setSelectedDay] = useState(1);
  const [shareCopied, setShareCopied] = useState(false);
  const [activeRouteModal, setActiveRouteModal] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [saveStatus, setSaveStatus] = useState('자동 저장됨');

  const daysList = [1, 2, 3]; // 일차 리스트

  // 마카오 기본 샘플 데이터
  const initialItinerary = {
    1: [
      { id: 1, time: '10:00', name: '세나도 광장', category: '관광지', lat: 22.1935334, lng: 113.5397593, nextDistanceKm: 0.3, nextRouteInfo: { method: '도보', duration: '4분', details: '중앙로 따라 직선 이동' } },
      { id: 2, time: '11:00', name: '성 도미니크 성당', category: '관광지', lat: 22.1945917, lng: 113.5404004, nextDistanceKm: 0.4, nextRouteInfo: { method: '도보', duration: '5분', details: '육포 거리 방향 도보' } },
      { id: 3, time: '12:00', name: '성 바울 성당 유적', category: '관광지', lat: 22.1974561, lng: 113.5408647, nextDistanceKm: 8.5, nextRouteInfo: { method: '대중교통', duration: '25분', details: '26A 버스 탑승 ➔ 베네시안 하차' } },
      { id: 4, time: '15:00', name: '베네시안 리조트 마카오', category: '숙소/관광', lat: 22.1484129, lng: 113.5602018, nextDistanceKm: null, nextRouteInfo: null }
    ],
    2: [],
    3: []
  };

  const macauRestaurants = [
    { id: 1, name: '신무이 굴국수 (타이파)', category: '면요리', nearLocation: '타이파 빌리지', lat: 22.1512, lng: 113.5560, krRating: 4.8, note: '향신료 없음 / 담백한 국물 / 한국인 필수 해장 맛집' },
    { id: 2, name: '북방관 (North - 베네시안)', category: '중식', nearLocation: '베네시안 리조트 마카오', lat: 22.1485, lng: 113.5605, krRating: 4.7, note: '바삭 달콤 가지튀김 & 꿔바로우 강추' },
    { id: 3, name: '웡치케이 (세나도 광장)', category: '완탕면', nearLocation: '세나도 광장', lat: 22.1936, lng: 113.5398, krRating: 4.5, note: '새우 완탕면 & 계란 볶음밥 호불호 없는 맛' }
  ];

  const [itinerary, setItinerary] = useState(() => {
    try {
      const saved = localStorage.getItem('macau_itinerary');
      return saved ? JSON.parse(saved) : initialItinerary;
    } catch (e) {
      return initialItinerary;
    }
  });

  const [newSingle, setNewSingle] = useState({ name: '', time: '12:00', lat: '', lng: '' });

  useEffect(() => {
    try {
      localStorage.setItem('macau_itinerary', JSON.stringify(itinerary));
      setSaveStatus('자동 저장 완료');
      const timer = setTimeout(() => setSaveStatus('자동 저장됨'), 1500);
      return () => clearTimeout(timer);
    } catch (e) {
      console.error(e);
    }
  }, [itinerary]);

  // 📋 여러 장소 텍스트 일괄 파싱 & 추가 함수
  const handleBulkImport = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText.split('\n').filter(l => l.trim().length > 0);
    const parsedPlaces = [];

    lines.forEach((line) => {
      const clean = line.trim();
      const coordMatch = clean.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)$/);
      if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lng = parseFloat(coordMatch[2]);
        let name = clean.substring(0, coordMatch.index).trim();
        if (name) {
          parsedPlaces.push({
            id: Date.now() + Math.random(),
            time: '12:00',
            name: name,
            category: '관광지',
            lat: lat,
            lng: lng,
            nextDistanceKm: 1.0,
            nextRouteInfo: { method: '도보', duration: '10분', details: '인근 이동 경로' }
          });
        }
      } else {
        const parts = clean.split(/[\t,]+/).map(s => s.trim()).filter(Boolean);
        if (parts.length >= 3) {
          const name = parts[0];
          const lat = parseFloat(parts[1]);
          const lng = parseFloat(parts[2]);
          if (name && !isNaN(lat) && !isNaN(lng)) {
            parsedPlaces.push({
              id: Date.now() + Math.random(),
              time: '12:00',
              name: name,
              category: '관광지',
              lat: lat,
              lng: lng,
              nextDistanceKm: 1.0,
              nextRouteInfo: { method: '도보', duration: '10분', details: '인근 이동 경로' }
            });
          }
        }
      }
    });

    if (parsedPlaces.length > 0) {
      setItinerary(prev => ({
        ...prev,
        [selectedDay]: [...(prev[selectedDay] || []), ...parsedPlaces]
      }));
      setBulkText('');
      setShowBulkModal(false);
      alert(`🎉 총 ${parsedPlaces.length}개 장소가 Day ${selectedDay}에 일괄 추가되었습니다!`);
    } else {
      alert('형식을 확인해 주세요!\n예시:\n세나도 광장 22.1935334, 113.5397593\n성 바울 성당 유적 22.1974561, 113.5408647');
    }
  };

  const handleSingleAdd = (e) => {
    e.preventDefault();
    if (!newSingle.name) return;

    const newItem = {
      id: Date.now(),
      time: newSingle.time || '12:00',
      name: newSingle.name,
      category: '관광지',
      lat: parseFloat(newSingle.lat) || 22.1935,
      lng: parseFloat(newSingle.lng) || 113.5397,
      nextDistanceKm: 0.8,
      nextRouteInfo: { method: '도보', duration: '8분', details: '이동 경로' }
    };

    setItinerary(prev => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] || []), newItem]
    }));
    setNewSingle({ name: '', time: '12:00', lat: '', lng: '' });
  };

  const handleDelete = (day, id) => {
    setItinerary(prev => ({
      ...prev,
      [day]: (prev[day] || []).filter(item => item.id !== id)
    }));
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (e) {
      alert('주소 복사 기능은 실제 웹사이트에서 작동합니다.');
    }
  };

  const currentPlaces = itinerary[selectedDay] || [];
  const currentNames = currentPlaces.map(p => p.name);
  const matchedRestaurants = macauRestaurants.filter(r => 
    currentNames.some(name => name.includes(r.nearLocation) || r.nearLocation.includes(name))
  );

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-slate-100 text-slate-800 pb-20">
      {/* 🟢 헤더 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3.5 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
              🇲🇴 홍콩 & 마카오 여행
              <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                {saveStatus}
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">실시간 동기화 공유 플래너</p>
          </div>
          
          <button 
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition"
          >
            {shareCopied ? <Check size={14} /> : <Share2 size={14} />}
            {shareCopied ? '복사 완료' : '공유하기'}
          </button>
        </div>

        {/* Day 탭 */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 text-xs">
          {daysList.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition ${
                selectedDay === day 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Day {day} ({itinerary[day]?.length || 0})
            </button>
          ))}
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* 네비게이션 탭 */}
        <div className="flex bg-slate-200/80 p-1 rounded-2xl text-xs font-bold text-slate-600">
          <button 
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-2 rounded-xl transition ${activeTab === 'timeline' ? 'bg-white text-indigo-600 shadow-sm' : ''}`}
          >
            <Clock size={14} className="inline mr-1" /> Day {selectedDay} 일정
          </button>
          <button 
            onClick={() => setActiveTab('restaurants')}
            className={`flex-1 py-2 rounded-xl transition ${activeTab === 'restaurants' ? 'bg-white text-indigo-600 shadow-sm' : ''}`}
          >
            <Utensils size={14} className="inline mr-1" /> 근처 맛집
          </button>
        </div>

        {activeTab === 'timeline' && (
          <div className="space-y-4">
            {/* 📋 일괄 추가 버튼 */}
            <div className="flex gap-2">
              <button 
                onClick={() => setShowBulkModal(true)}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold py-2.5 rounded-2xl text-xs shadow-md hover:opacity-95 transition flex items-center justify-center gap-1.5"
              >
                <FileText size={15} /> 여러 개 한 번에 붙여넣기 (일괄 추가)
              </button>
            </div>

            {/* 단건 직접 추가 폼 */}
            <form onSubmit={handleSingleAdd} className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2 text-xs">
              <span className="font-bold text-slate-700 block">➕ 단건 직접 추가</span>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  placeholder="장소명" 
                  value={newSingle.name}
                  onChange={e => setNewSingle({ ...newSingle, name: e.target.value })}
                  className="p-2 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                />
                <input 
                  type="time" 
                  value={newSingle.time}
                  onChange={e => setNewSingle({ ...newSingle, time: e.target.value })}
                  className="p-2 border border-slate-200 rounded-xl outline-none"
                />
                <input 
                  type="text" 
                  placeholder="위도 (예: 22.1935)" 
                  value={newSingle.lat}
                  onChange={e => setNewSingle({ ...newSingle, lat: e.target.value })}
                  className="p-2 border border-slate-200 rounded-xl outline-none"
                />
                <input 
                  type="text" 
                  placeholder="경도 (예: 113.5397)" 
                  value={newSingle.lng}
                  onChange={e => setNewSingle({ ...newSingle, lng: e.target.value })}
                  className="p-2 border border-slate-200 rounded-xl outline-none"
                />
              </div>
              <button type="submit" className="w-full bg-slate-800 text-white font-bold py-2 rounded-xl">추가하기</button>
            </form>

            {/* 타임라인 카드 목록 */}
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-indigo-200">
              {currentPlaces.map((item, index) => (
                <div key={item.id} className="relative">
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                    {index + 1}
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md mr-1.5">
                          {item.category}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm inline">{item.name}</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                          {item.time}
                        </span>
                        <button onClick={() => handleDelete(selectedDay, item.id)} className="text-slate-300 hover:text-rose-500 p-1">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 font-mono">
                      <span>📍 Lat: {item.lat}</span>
                      <span>📍 Lng: {item.lng}</span>
                    </div>
                  </div>

                  {item.nextRouteInfo && (
                    <div className="my-2 ml-2 pl-4 border-l-2 border-dashed border-indigo-300">
                      <button 
                        onClick={() => setActiveRouteModal(item)}
                        className="w-full bg-white hover:bg-indigo-50/50 border border-indigo-200 rounded-xl p-2 flex items-center justify-between text-xs text-left shadow-xs"
                      >
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          item.nextDistanceKm <= 1.0 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.nextDistanceKm <= 1.0 ? '🚶 도보' : '🚌 대중교통'} ({item.nextDistanceKm}km)
                        </span>
                        <span className="text-indigo-600 font-bold text-[11px] flex items-center gap-0.5">
                          동선 보기 <ChevronRight size={12} />
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'restaurants' && (
          <div className="space-y-3 text-xs">
            {matchedRestaurants.map(restaurant => (
              <div key={restaurant.id} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-1.5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded text-[10px]">
                      연동 관광지: {restaurant.nearLocation}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{restaurant.name}</h3>
                  </div>
                  <span className="font-bold text-amber-500">★ {restaurant.krRating}</span>
                </div>
                <p className="text-slate-600 bg-slate-50 p-2 rounded-xl">💬 {restaurant.note}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 📋 일괄 붙여넣기 모달 */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                <FileText size={18} className="text-indigo-600" /> 여러 장소 한 번에 일괄 추가
              </h3>
              <button onClick={() => setShowBulkModal(false)} className="text-slate-400 font-bold p-1">✕</button>
            </div>

            <p className="text-slate-500 leading-relaxed">
              엑셀이나 메모장에서 아래 형식으로 복사한 텍스트를 그대로 붙여넣으세요!
            </p>

            <textarea 
              rows={6}
              placeholder={`세나도 광장 22.1935334, 113.5397593\n성 바울 성당 유적 22.1974561, 113.5408647\n베네시안 리조트 마카오 22.1484129, 113.5602018`}
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-mono text-xs leading-relaxed"
            />

            <div className="flex gap-2">
              <button onClick={() => setShowBulkModal(false)} className="flex-1 bg-slate-100 font-bold py-3 rounded-xl text-slate-600">취소</button>
              <button onClick={handleBulkImport} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md">
                Day {selectedDay}에 한 번에 추가하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🗺️ 동선 상세 안내 모달 */}
      {activeRouteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-3 shadow-xl text-xs">
            <h3 className="font-bold text-slate-900 text-sm">📍 이동 동선 상세</h3>
            <div className="bg-indigo-50 p-3 rounded-2xl space-y-1 text-indigo-900">
              <p className="font-bold">거리: {activeRouteModal.nextDistanceKm}km ({activeRouteModal.nextDistanceKm <= 1.0 ? '도보 추천' : '대중교통 추천'})</p>
              <p>{activeRouteModal.nextRouteInfo.details}</p>
            </div>
            <button onClick={() => setActiveRouteModal(null)} className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl">확인</button>
          </div>
        </div>
      )}
    </div>
  );
}
