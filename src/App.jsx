import React, { useState } from 'react';
import { 
  MapPin, Clock, Share2, Navigation, Hotel, Utensils, 
  Check, Copy, ChevronRight, UserCheck, Smartphone, Monitor, ArrowRight
} from 'lucide-react';

export default function TravelPlannerApp() {
  const [activeTab, setActiveTab] = useState('timeline'); // timeline | hotels | restaurants
  const [selectedDay, setSelectedDay] = useState(1);
  const [shareCopied, setShareCopied] = useState(false);
  const [activeRouteModal, setActiveRouteModal] = useState(null);

  // 1. 일자별 장소 데이터 (시간 수정 가능)
  const [itinerary, setItinerary] = useState([
    {
      id: 1,
      time: '12:30',
      name: '나리타 국제공항 (NRT)',
      category: '공항',
      nextDistanceKm: 62.0, // 1km 초과 -> 대중교통 자동 지정
      nextRouteInfo: {
        method: '대중교통',
        duration: '55분',
        details: '나리타 공항역 (스카이라이너) ➔ 닛포리역 환승 (야마노테선) ➔ 시부야역 하차'
      }
    },
    {
      id: 2,
      time: '14:00',
      name: '시부야 숙소 (체크인)',
      category: '숙소',
      nextDistanceKm: 0.65, // 1km 이하 -> 도보 자동 지정
      nextRouteInfo: {
        method: '도보',
        duration: '8분',
        details: '시부야역 B1 출구 ➔ 메이지도리 방향 직진 ➔ 도보 650m 이동'
      }
    },
    {
      id: 3,
      time: '14:30',
      name: '규카츠 모토무라 시부야점',
      category: '식당',
      nextDistanceKm: 2.4, // 1km 초과 -> 대중교통 자동 지정
      nextRouteInfo: {
        method: '대중교통',
        duration: '18분',
        details: '시부야역 버스정류장 ➔ 버스 01번 탑승 ➔ 3개 정류장 이동 후 하차'
      }
    },
    {
      id: 4,
      time: '16:00',
      name: '시부야 스카이 전망대',
      category: '관광지',
      nextDistanceKm: null, // 마지막 장소
      nextRouteInfo: null
    }
  ]);

  // 2. 한국인 선호 숙소 TOP 10 데이터
  const top10Hotels = [
    { id: 1, name: '칸데오 호텔 도쿄 신바시', dist: '주요 동선 1.2km', price: '₩210,000 ~ ₩280,000', tag: '대욕탕 최강 / 한국어 직원 상주' },
    { id: 2, name: '호텔 그레이스리 신주쿠', dist: '신주쿠역 도보 5분', price: '₩180,000 ~ ₩240,000', tag: '위치 완벽 / 수압 강하고 깨끗함' },
    { id: 3, name: '시부야 스트림 에디트 호텔', dist: '시부야역 직결', price: '₩250,000 ~ ₩320,000', tag: '이동 편리 / 모던함 / 신축' },
    { id: 4, name: '도미 인 프리미엄 시부야 메이지진구마에', dist: '시부야 도보 10분', price: '₩190,000 ~ ₩260,000', tag: '무료 야식 라멘 / 온천 대욕장' },
    { id: 5, name: '온센 료칸 야구엔 신주쿠', dist: '신주쿠 차로 7분', price: '₩220,000 ~ ₩300,000', tag: '도심 속 료칸 / 한국인 감성 핫플' },
    { id: 6, name: '시타딘 센트럴 신주쿠', dist: '신주쿠 가부키초 인근', price: '₩160,000 ~ ₩220,000', tag: '가성비 우수 / 객실 넓음' },
    { id: 7, name: '호텔 몬테레이 한조몬', dist: '한조몬역 바로 앞', price: '₩140,000 ~ ₩190,000', tag: '조용한 동네 / 지하철 초근접' },
    { id: 8, name: '시부야 엑셀 호텔 도큐', dist: '시부야 스크램블 교차로 앞', price: '₩230,000 ~ ₩290,000', tag: '교통 최고 / 스크램블 뷰' },
    { id: 9, name: '무지 호텔 긴자', dist: '긴자 중심가', price: '₩280,000 ~ ₩350,000', tag: '무인양품 감성 / 정갈한 조식' },
    { id: 10, name: '알몬트 인 도쿄 닌교초', dist: '닌교초역 도보 4분', price: '₩120,000 ~ ₩170,000', tag: '초가성비 / 한국인 만족도 높음' }
  ];

  // 3. 한국인 입맛 맞춤 맛집 데이터 (한국어 리뷰 필터 적용)
  const koreanTasteRestaurants = [
    { id: 1, name: '규카츠 모토무라 시부야점', category: '일식 / 규카츠', krRating: 4.8, dist: '시부야 스카이 도보 4분', note: '향신료 부담 없음 / 부드러운 고기 / 한국어 메뉴판' },
    { id: 2, name: '아후리 라멘 (AFURI)', category: '라멘', krRating: 4.6, dist: '대중교통 10분', note: '느끼하지 않은 깔끔한 유자소금라멘 / 키오스크 한국어 지원' },
    { id: 3, name: '우동 신 (Udon Shin)', category: '우동', krRating: 4.7, dist: '대중교통 15분', note: '쫄깃한 붓카케 우동 / 한국인 대기 맛집' },
    { id: 4, name: '스시잔마이 시부야점', category: '초밥', krRating: 4.5, dist: '시부야역 도보 3분', note: '가성비 우수한 스시 / 호불호 없는 맛' }
  ];

  // 시간 수정 핸들러
  const handleTimeChange = (id, newTime) => {
    setItinerary(itinerary.map(item => item.id === id ? { ...item, time: newTime } : item));
  };

  // 링크 공유 복사 핸들러
  const handleCopyLink = () => {
    navigator.clipboard.writeText('[suspicious link removed]');
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans">
      {/* 🟢 상단 헤더 & 실시간 동기화 상태 바 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              도쿄 3박 4일 여행
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-normal">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                남편 동시 접속 중
              </span>
            </h1>
            <p className="text-xs text-slate-500">2026.11.10(화) ~ 2026.11.13(금)</p>
          </div>
          
          <button 
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            {shareCopied ? <Check size={14} /> : <Share2 size={14} />}
            {shareCopied ? '링크 복사됨!' : '공유 링크'}
          </button>
        </div>

        {/* 1일차~4일차 탭 */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 text-xs">
          {[1, 2, 3, 4].map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition ${
                selectedDay === day 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {day}일차 (11/{9 + day})
            </button>
          ))}
        </div>
      </header>

      {/* 🧭 메인 콘텐츠 뷰 분기 (타임라인 / 숙소추천 / 맛집추천) */}
      <main className="p-4">
        {/* 네비게이션 서브 탭 */}
        <div className="flex bg-slate-200 p-1 rounded-xl mb-4 text-xs font-semibold">
          <button 
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-2 rounded-lg flex justify-center items-center gap-1.5 transition ${
              activeTab === 'timeline' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            <Clock size={14} /> 일정 & 동선
          </button>
          <button 
            onClick={() => setActiveTab('hotels')}
            className={`flex-1 py-2 rounded-lg flex justify-center items-center gap-1.5 transition ${
              activeTab === 'hotels' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            <Hotel size={14} /> 한국인 추천 숙소 (10선)
          </button>
          <button 
            onClick={() => setActiveTab('restaurants')}
            className={`flex-1 py-2 rounded-lg flex justify-center items-center gap-1.5 transition ${
              activeTab === 'restaurants' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'
            }`}
          >
            <Utensils size={14} /> 입맛 맞춤 맛집
          </button>
        </div>

        {/* 📍 TAB 1: 타임라인 & 동선 최적화 View */}
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-800 flex justify-between items-center">
              <span>✈️ 출발 항공편: <strong>NRT 11:30 도착 (진에어 LJ201)</strong></span>
              <span className="text-indigo-600 font-semibold text-[11px]">동선 최적화 완료</span>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-300">
              {itinerary.map((item, index) => {
                // 1km 규칙 자동 판별 (1km 이하: 도보, 1km 초과: 대중교통)
                const isWalking = item.nextDistanceKm !== null && item.nextDistanceKm <= 1.0;

                return (
                  <div key={item.id} className="relative">
                    {/* 마커 아이콘 */}
                    <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
                      {index + 1}
                    </div>

                    {/* 장소 카드 */}
                    <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex justify-between items-start">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 mb-1">
                          {item.category}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                      </div>

                      {/* 시간 편집 필드 */}
                      <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-md px-2 py-1">
                        <Clock size={12} className="text-slate-400" />
                        <input 
                          type="time" 
                          value={item.time}
                          onChange={(e) => handleTimeChange(item.id, e.target.value)}
                          className="bg-transparent text-xs font-semibold text-slate-700 outline-none w-14 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* 🚌 / 🚶 동선 보기 연동 바 (장소 간 이동) */}
                    {item.nextRouteInfo && (
                      <div className="my-2.5 ml-2 pl-4 border-l-2 border-dashed border-indigo-300">
                        <button
                          onClick={() => setActiveRouteModal(item)}
                          className="w-full bg-white hover:bg-indigo-50/50 border border-indigo-200 rounded-lg p-2 flex items-center justify-between text-xs transition text-left group"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              isWalking ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {isWalking ? '🚶 도보' : '🚌 대중교통'} ({item.nextDistanceKm}km)
                            </span>
                            <span className="text-slate-600 font-medium">{item.nextRouteInfo.duration} 소요</span>
                          </div>
                          
                          <span className="text-indigo-600 font-semibold text-[11px] flex items-center gap-0.5 group-hover:translate-x-0.5 transition">
                            동선 보기 <ChevronRight size={12} />
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 🏨 TAB 2: 한국인 선호 숙소 추천 10선 */}
        {activeTab === 'hotels' && (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
              💡 <strong>한국인 투숙객 검증 필터 적용</strong>: 한국어 후기 비중 70% 이상, 치안 및 수압 검증 완료된 숙소 10선입니다.
            </div>

            {top10Hotels.map((hotel, idx) => (
              <div key={hotel.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-100 text-indigo-700 font-bold text-xs px-2 py-0.5 rounded">
                      TOP {idx + 1}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{hotel.name}</h3>
                  </div>
                  <p className="text-xs text-slate-500">{hotel.dist}</p>
                  <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <UserCheck size={12} /> {hotel.tag}
                  </p>
                </div>

                <div className="flex md:flex-col justify-between items-end gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                  <span className="text-sm font-bold text-slate-900">{hotel.price} <span className="text-[10px] font-normal text-slate-400">/1박</span></span>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition">
                    일정에 추가
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 🍱 TAB 3: 한국인 입맛 맞춤 맛집 추천 */}
        {activeTab === 'restaurants' && (
          <div className="space-y-3">
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800">
              👅 <strong>한국인 입맛 맞춤 필터</strong>: 구글/트립어드바이저 중 '한국어 리뷰' 평점만 별도 추출하여 향신료/간 부담 없는 식당만 선별했습니다.
            </div>

            {koreanTasteRestaurants.map(restaurant => (
              <div key={restaurant.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded">
                      한국인 평점 ★ {restaurant.krRating}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1">{restaurant.name}</h3>
                  </div>
                  <span className="text-xs text-slate-500">{restaurant.category}</span>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  💬 {restaurant.note}
                </p>

                <div className="flex justify-between items-center pt-1 text-xs">
                  <span className="text-slate-400">{restaurant.dist}</span>
                  <button className="text-indigo-600 font-semibold hover:underline">
                    + 일정 추가하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 🗺️ 동선 상세 보기 모달 */}
      {activeRouteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                <Navigation size={18} className="text-indigo-600" />
                상세 동선 안내
              </h3>
              <button 
                onClick={() => setActiveRouteModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-indigo-50 p-3 rounded-xl flex items-center justify-between text-indigo-900 font-semibold">
                <span>이동 거리: {activeRouteModal.nextDistanceKm}km</span>
                <span className="bg-indigo-200 px-2 py-0.5 rounded text-indigo-800">
                  {activeRouteModal.nextDistanceKm <= 1.0 ? '도보 추천 (1km 이하)' : '대중교통 추천 (1km 초과)'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <p className="font-bold text-slate-700">이동 경로 안내 ({activeRouteModal.nextRouteInfo.duration}):</p>
                <p className="text-slate-600 leading-relaxed">{activeRouteModal.nextRouteInfo.details}</p>
              </div>
            </div>

            <button 
              onClick={() => setActiveRouteModal(null)}
              className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-indigo-700 transition"
            >
              확인 완료
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
