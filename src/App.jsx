import React, { useState, useEffect } from 'react';
import { 
  MapPin, Clock, Share2, Navigation, Hotel, Utensils, 
  Check, Copy, ChevronRight, UserCheck, Plus, Trash2, Save, ArrowDown, Compass
} from 'lucide-react';

export default function TravelPlannerApp() {
  const [activeTab, setActiveTab] = useState('timeline'); // timeline | wishlist | hotels | restaurants
  const [selectedDay, setSelectedDay] = useState(1);
  const [shareCopied, setShareCopied] = useState(false);
  const [activeRouteModal, setActiveRouteModal] = useState(null);
  const [saveStatus, setSaveStatus] = useState('자동 저장됨');

  // 1. 초기 일정 데이터 (일자별 위도, 경도 포함)
  const initialItinerary = {
    1: [
      { id: 101, time: '12:30', name: '나리타 국제공항 (NRT)', category: '공항', lat: 35.77198, lng: 140.39285, nextDistanceKm: 62.0, nextRouteInfo: { method: '대중교통', duration: '55분', details: '스카이라이너 ➔ 닛포리역 환승 ➔ 시부야역' } },
      { id: 102, time: '14:00', name: '시부야 숙소 (체크인)', category: '숙소', lat: 35.65803, lng: 139.70163, nextDistanceKm: 0.65, nextRouteInfo: { method: '도보', duration: '8분', details: '시부야역 B1 출구 ➔ 메이지도리 방향 도보 650m' } },
      { id: 103, time: '14:30', name: '규카츠 모토무라 시부야점', category: '식당', lat: 35.65751, lng: 139.70295, nextDistanceKm: 2.4, nextRouteInfo: { method: '대중교통', duration: '18분', details: '시부야역 버스 01번 탑승 ➔ 3개 정류장 이동' } },
      { id: 104, time: '16:00', name: '시부야 스카이 전망대', category: '관광지', lat: 35.65851, lng: 139.70228, nextDistanceKm: null, nextRouteInfo: null }
    ],
    2: [
      { id: 201, time: '10:00', name: '센소지 스카이트리', category: '관광지', lat: 35.71476, lng: 139.79665, nextDistanceKm: 1.2, nextRouteInfo: { method: '대중교통', duration: '10분', details: '도쿄 메트로 아사쿠사선 탑승' } },
      { id: 202, time: '13:00', name: '아사쿠사 큐카츠', category: '식당', lat: 35.71120, lng: 139.79630, nextDistanceKm: null, nextRouteInfo: null }
    ],
    3: []
  };

  // 2. 후보지 (장소 바스켓 / 위시리스트)
  const initialWishlist = [
    { id: 901, name: '도쿄 타워', category: '관광지', lat: 35.65858, lng: 139.74543, note: '야경 명소' },
    { id: 902, name: '팀랩 플래닛 도쿄', category: '관광지', lat: 35.64912, lng: 139.78978, note: '몰입형 전시관' },
    { id: 903, name: '메이지 신궁', category: '관광지', lat: 35.67640, lng: 139.69933, note: '산책 코스' }
  ];

  // 3. 한국인 선호 맛집 전체 데이터 (관광지 연동)
  const allRestaurants = [
    { id: 1, name: '규카츠 모토무라 시부야점', category: '일식 / 규카츠', nearLocation: '시부야 스카이 전망대', lat: 35.65751, lng: 139.70295, krRating: 4.8, dist: '도보 4분 (300m)', note: '향신료 부담 없음 / 부드러운 고기' },
    { id: 2, name: '아후리 라멘 (AFURI 시부야)', category: '라멘', nearLocation: '시부야 스카이 전망대', lat: 35.65910, lng: 139.70050, krRating: 4.6, dist: '도보 6분 (450m)', note: '깔끔한 유자소금라멘 / 한국어 키오스크' },
    { id: 3, name: '아사쿠사 우나테츠 (장어덮밥)', category: '일식', nearLocation: '센소지 스카이트리', lat: 35.71210, lng: 139.79710, krRating: 4.7, dist: '도보 3분 (200m)', note: '한국인 입맛에 맞는 달콤짭조름 장어덮밥' },
    { id: 4, name: '이치란 라멘 아사쿠사점', category: '라멘', nearLocation: '센소지 스카이트리', lat: 35.71100, lng: 139.79600, krRating: 4.5, dist: '도보 2분 (150m)', note: '비밀 소스로 느끼함 잡는 라멘' }
  ];

  // 💾 LocalStorage를 통한 자동 저장 상태 관리
  const [itinerary, setItinerary] = useState(() => {
    const saved = localStorage.getItem('travel_itinerary');
    return saved ? JSON.parse(saved) : initialItinerary;
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('travel_wishlist');
    return saved ? JSON.parse(saved) : initialWishlist;
  });

  // 장소 추가 폼 입력 상태 (위도, 경도 포함)
  const [newPlace, setNewPlace] = useState({ name: '', category: '관광지', time: '12:00', lat: '', lng: '' });

  // 🔄 상태 변경 시 localStorage에 자동 저장
  useEffect(() => {
    localStorage.setItem('travel_itinerary', JSON.stringify(itinerary));
    localStorage.setItem('travel_wishlist', JSON.stringify(wishlist));
    setSaveStatus('자동 저장 완료');
    const timer = setTimeout(() => setSaveStatus('자동 저장됨'), 2000);
    return () => clearTimeout(timer);
  }, [itinerary, wishlist]);

  // 장소 시간 수정
  const handleTimeChange = (day, id, newTime) => {
    setItinerary({
      ...itinerary,
      [day]: itinerary[day].map(item => item.id === id ? { ...item, time: newTime } : item)
    });
  };

  // 장소 삭제
  const handleDeletePlace = (day, id) => {
    setItinerary({
      ...itinerary,
      [day]: itinerary[day].filter(item => item.id !== id)
    });
  };

  // 새 장소 직접 추가 (위도, 경도 포함)
  const handleAddPlace = (e) => {
    e.preventDefault();
    if (!newPlace.name) return;

    const newItem = {
      id: Date.now(),
      time: newPlace.time || '12:00',
      name: newPlace.name,
      category: newPlace.category,
      lat: parseFloat(newPlace.lat) || 35.6580,
      lng: parseFloat(newPlace.lng) || 139.7016,
      nextDistanceKm: 1.5,
      nextRouteInfo: { method: '대중교통', duration: '15분', details: '지도 앱 최적 경로 참고' }
    };

    setItinerary({
      ...itinerary,
      [selectedDay]: [...(itinerary[selectedDay] || []), newItem]
    });

    setNewPlace({ name: '', category: '관광지', time: '12:00', lat: '', lng: '' });
  };

  // 후보지/다른 날짜에서 현재 선택된 Day로 장소 당겨오기
  const handleImportToCurrentDay = (place) => {
    const newItem = {
      id: Date.now(),
      time: '17:00', // 기본 추가 시간
      name: place.name,
      category: place.category || '관광지',
      lat: place.lat,
      lng: place.lng,
      nextDistanceKm: 0.8,
      nextRouteInfo: { method: '도보', duration: '10분', details: '인근 이동 경로' }
    };

    setItinerary({
      ...itinerary,
      [selectedDay]: [...(itinerary[selectedDay] || []), newItem]
    });

    // 후보지에서 제거
    setWishlist(wishlist.filter(w => w.id !== place.id));
  };

  // 현재 Day의 관광지 근처 맛집 자동 추출
  const currentDayPlaces = itinerary[selectedDay] || [];
  const currentDayPlaceNames = currentDayPlaces.map(p => p.name);
  const matchedRestaurants = allRestaurants.filter(r => 
    currentDayPlaceNames.some(name => name.includes(r.nearLocation) || r.nearLocation.includes(name))
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans">
      {/* 🟢 상단 헤더 & 실시간 저장 상태 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              도쿄 3박 4일 여행
              <span className="text-[11px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-normal">
                <Save size={12} /> {saveStatus}
              </span>
            </h1>
            <p className="text-xs text-slate-500">2026.11.10(화) ~ 2026.11.13(금) • 공유 실시간 모드</p>
          </div>
          
          <button 
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            {shareCopied ? <Check size={14} /> : <Share2 size={14} />}
            {shareCopied ? '링크 복사됨!' : '공유 링크'}
          </button>
        </div>

        {/* 1일차~3일차 탭 */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 text-xs">
          {[1, 2, 3].map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition ${
                selectedDay === day 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Day {day} ({itinerary[day]?.length || 0}개 장소)
            </button>
          ))}
        </div>
      </header>

      {/* 🧭 메인 네비게이션 탭 */}
      <main className="p-4">
        <div className="flex bg-slate-200 p-1 rounded-xl mb-4 text-xs font-semibold">
          <button 
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-2 rounded-lg flex justify-center items-center gap-1 transition ${
              activeTab === 'timeline' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            <Clock size={14} /> Day {selectedDay} 일정 & 동선
          </button>
          <button 
            onClick={() => setActiveTab('wishlist')}
            className={`flex-1 py-2 rounded-lg flex justify-center items-center gap-1 transition ${
              activeTab === 'wishlist' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            <Compass size={14} /> 후보지 바스켓 ({wishlist.length})
          </button>
          <button 
            onClick={() => setActiveTab('restaurants')}
            className={`flex-1 py-2 rounded-lg flex justify-center items-center gap-1 transition ${
              activeTab === 'restaurants' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            <Utensils size={14} /> 근처 맞춤 맛집
          </button>
        </div>

        {/* 📍 TAB 1: 타임라인 & 위도/경도 표시 */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            {/* 새 장소 추가 폼 (위도, 경도 입력 지원) */}
            <form onSubmit={handleAddPlace} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <Plus size={14} className="text-indigo-600" /> Day {selectedDay}에 관광지 직접 추가하기
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <input 
                  type="text" 
                  placeholder="장소명 (예: 도쿄 타워)"
                  value={newPlace.name}
                  onChange={(e) => setNewPlace({ ...newPlace, name: e.target.value })}
                  className="p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 col-span-2 md:col-span-1"
                />
                <input 
                  type="time" 
                  value={newPlace.time}
                  onChange={(e) => setNewPlace({ ...newPlace, time: e.target.value })}
                  className="p-2 border border-slate-200 rounded-lg outline-none"
                />
                <input 
                  type="text" 
                  placeholder="위도 (Lat)예: 35.6585"
                  value={newPlace.lat}
                  onChange={(e) => setNewPlace({ ...newPlace, lat: e.target.value })}
                  className="p-2 border border-slate-200 rounded-lg outline-none"
                />
                <input 
                  type="text" 
                  placeholder="경도 (Lng)예: 139.7454"
                  value={newPlace.lng}
                  onChange={(e) => setNewPlace({ ...newPlace, lng: e.target.value })}
                  className="p-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 rounded-lg transition">
                장소 추가
              </button>
            </form>

            {/* 타임라인 목록 */}
            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-300">
              {currentDayPlaces.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                  아직 Day {selectedDay}에 등록된 장소가 없습니다. 상단에서 직접 추가하거나 후보지 탭에서 당겨오세요!
                </div>
              ) : (
                currentDayPlaces.map((item, index) => {
                  const isWalking = item.nextDistanceKm !== null && item.nextDistanceKm <= 1.0;

                  return (
                    <div key={item.id} className="relative">
                      <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
                        {index + 1}
                      </div>

                      {/* 장소 카드 (위도/경도 컬럼 표시) */}
                      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 mr-2">
                              {item.category}
                            </span>
                            <h3 className="font-bold text-slate-900 text-sm inline">{item.name}</h3>
                          </div>

                          <div className="flex items-center gap-2">
                            <input 
                              type="time" 
                              value={item.time}
                              onChange={(e) => handleTimeChange(selectedDay, item.id, e.target.value)}
                              className="bg-slate-50 border border-slate-200 text-xs font-semibold px-2 py-1 rounded outline-none"
                            />
                            <button 
                              onClick={() => handleDeletePlace(selectedDay, item.id)}
                              className="text-slate-400 hover:text-rose-500 p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* 📍 위도 / 경도 컬럼 정보 */}
                        <div className="flex gap-3 text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                          <span>📍 <strong>위도(Lat):</strong> {item.lat}</span>
                          <span>📍 <strong>경도(Lng):</strong> {item.lng}</span>
                        </div>
                      </div>

                      {/* 동선 보기 연동 바 */}
                      {item.nextRouteInfo && (
                        <div className="my-2 ml-2 pl-4 border-l-2 border-dashed border-indigo-300">
                          <button
                            onClick={() => setActiveRouteModal(item)}
                            className="w-full bg-white hover:bg-indigo-50/50 border border-indigo-200 rounded-lg p-2 flex items-center justify-between text-xs text-left"
                          >
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              isWalking ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {isWalking ? '🚶 도보' : '🚌 대중교통'} ({item.nextDistanceKm}km)
                            </span>
                            <span className="text-indigo-600 font-semibold text-[11px] flex items-center gap-0.5">
                              동선 보기 <ChevronRight size={12} />
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 🧭 TAB 2: 후보지 (장소 바스켓) & 일찍 다 갔을 때 당겨오기 */}
        {activeTab === 'wishlist' && (
          <div className="space-y-3">
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs text-indigo-800">
              💡 <strong>일정이 일찍 끝나셨나요?</strong> 아래 후보지나 다른 날짜의 관광지 우측의 <strong>[Day {selectedDay}에 추가]</strong> 버튼을 누르면 현재 일정으로 즉시 이동합니다!
            </div>

            {wishlist.map(place => (
              <div key={place.id} className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex justify-between items-center text-xs">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{place.name}</h3>
                  <p className="text-slate-500 text-[11px]">위도: {place.lat} | 경도: {place.lng}</p>
                  <span className="text-indigo-600 text-[11px] font-medium">💬 {place.note}</span>
                </div>

                <button 
                  onClick={() => handleImportToCurrentDay(place)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                >
                  <Plus size={12} /> Day {selectedDay}에 추가
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 🍱 TAB 3: 내 관광지 근처 맛집 자동 검색 */}
        {activeTab === 'restaurants' && (
          <div className="space-y-3">
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800">
              🎯 <strong>Day {selectedDay} 관광지 맞춤 맛집</strong>: 현재 등록된 관광지 주변 1km 내에 위치한 한국인 검증 맛집입니다.
            </div>

            {matchedRestaurants.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                현재 Day {selectedDay}에 등록된 관광지 근처 맛집 데이터가 없습니다. 관광지를 추가하시면 근처 맛집이 자동으로 나타납니다!
              </div>
            ) : (
              matchedRestaurants.map(restaurant => (
                <div key={restaurant.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded text-[10px]">
                        연동 관광지: {restaurant.nearLocation}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">{restaurant.name}</h3>
                    </div>
                    <span className="font-bold text-amber-500">★ {restaurant.krRating}</span>
                  </div>

                  <p className="text-slate-600 bg-slate-50 p-2 rounded-lg">💬 {restaurant.note}</p>
                  <p className="text-slate-400 text-[11px]">📍 위치: 위도 {restaurant.lat} / 경도 {restaurant.lng} ({restaurant.dist})</p>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* 🗺️ 동선 상세 보기 모달 */}
      {activeRouteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl text-xs">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Navigation size={16} className="text-indigo-600" /> 상세 동선 안내
              </h3>
              <button onClick={() => setActiveRouteModal(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl space-y-1">
              <p className="font-bold text-slate-700">구간 이동 거리: {activeRouteModal.nextDistanceKm}km</p>
              <p className="text-slate-600">{activeRouteModal.nextRouteInfo.details}</p>
            </div>

            <button onClick={() => setActiveRouteModal(null)} className="w-full bg-indigo-600 text-white font-bold py-2 rounded-xl">
              확인 완료
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
