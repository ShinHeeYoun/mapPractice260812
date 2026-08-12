export const i18n = {
    en: {
        vol: "Vol. 1",
        city: "SEOUL, KOREA",
        edition: "Daily Edition",
        contents: "CONTENTS",
        tab_intro: "I. Introduction",
        tab_map: "II. Map",
        tab_place: "A. Place",
        tab_route: "B. Route Find",
        tab_restaurants: "C. Restaurants",
        
        intro_title: "Welcome to Signatural API NEWS",
        intro_p1: "This is a simple Java Web Application skeleton running on Tomcat 9. It is designed using a classic black and white newspaper theme.",
        intro_p2: "Please navigate to the Map section to use the Telegraphic Mapping Service and Directions.",
        
        place_title: "PLACE",
        place_desc: "This page utilizes the Google Maps Geocoding API to convert physical addresses into geographic coordinates. When a user submits an address, a JSON payload is sent to our Java backend servlet via an asynchronous fetch request. The Java backend then securely constructs an HTTP GET request containing our private API key and forwards it to Google's servers. Upon success, Google returns a comprehensive JSON response containing the exact latitude, longitude, and formatted address, which our frontend then uses to center the map and drop a precise marker.",
        lbl_target: "Target Location:",
        btn_dispatch: "DISPATCH TELEGRAM",
        
        route_title: "ROUTE FIND",
        route_desc: "This section employs the Google Maps Directions API via the Maps JavaScript SDK to calculate optimal transit routes. When you provide an origin and destination, the browser directly sends a routing request to Google specifying 'TRANSIT' as the preferred travel mode. Google processes this request and returns a detailed JSON object containing route legs, total distance, estimated duration, and step-by-step transit instructions. Our application then uses a DirectionsRenderer to automatically draw the polyline path on the map and parses the nested steps to display a continuous text itinerary.",
        lbl_origin: "Origin:",
        lbl_destination: "Destination:",
        btn_calc: "CALCULATE ROUTE",
        
        rest_title: "RESTAURANTS",
        rest_desc: "This directory leverages the Google Maps Places API to discover local businesses around a specified center point. First, it uses the Geocoder API to convert your string-based base location into precise latitudinal and longitudinal coordinates. Next, it sends a nearbySearch request to the Places service, specifying a 1000-meter radius and the selected establishment type. The API returns an array of Place objects containing names, vicinities, user ratings, and price levels, which we subsequently sort using a custom Haversine distance algorithm and a rating penalty before displaying them in a tabular format.",
        lbl_base: "Base Location:",
        lbl_category: "Category:",
        lbl_sort: "Sort By:",
        btn_search_dir: "SEARCH DIRECTORY",
        
        opt_restaurant: "Restaurants (Diners & Eateries)",
        opt_cafe: "Cafes (Coffee Houses)",
        opt_bakery: "Bakeries",
        opt_hospital: "Hospitals & Clinics",
        opt_park: "Parks & Recreation",
        
        opt_distance: "Distance (Nearest First)",
        opt_rating: "Rating (Highest First)",
        
        ph_seoul_tower: "e.g. Seoul Tower",
        ph_gangnam: "e.g. Gangnam Station"
    },
    ko: {
        vol: "제 1호",
        city: "대한민국 서울",
        edition: "일간지",
        contents: "목차",
        tab_intro: "I. 소개",
        tab_map: "II. 지도",
        tab_place: "A. 장소 검색",
        tab_route: "B. 길찾기",
        tab_restaurants: "C. 주변 식당",
        
        intro_title: "시그너처럴 API 뉴스에 오신 것을 환영합니다",
        intro_p1: "이 페이지는 톰캣 9 환경에서 구동되는 심플한 자바 웹 애플리케이션 골격입니다. 고전적인 흑백 신문 테마를 사용하여 디자인되었습니다.",
        intro_p2: "전신 기반의 지도 서비스 및 길찾기 기능을 이용하시려면 지도 섹션으로 이동해 주십시오.",
        
        place_title: "장소 검색",
        place_desc: "이 페이지는 물리적 주소를 지리적 좌표로 변환하기 위해 Google Maps Geocoding API를 활용합니다. 사용자가 텍스트 주소를 제출하면, 비동기 통신을 통해 백엔드 Java Servlet으로 JSON 요청이 날아갑니다. Java 백엔드는 자체적으로 API 키를 안전하게 조합하여 구글 서버로 HTTP GET 요청을 전달합니다. 성공 시, 구글은 위도, 경도, 그리고 포맷팅된 전체 주소가 담긴 JSON 응답값을 반환하며, 프론트엔드는 이를 분석하여 지도 중앙을 옮기고 마커를 꽂습니다.",
        lbl_target: "목표 위치:",
        btn_dispatch: "전보 발송",
        
        route_title: "길찾기",
        route_desc: "이 섹션은 대중교통 최적 경로를 계산하기 위해 Google Maps JavaScript SDK를 통한 Directions API를 사용합니다. 사용자가 출발지와 도착지를 입력하면, 브라우저가 직접 구글에 대중교통(TRANSIT) 모드를 지정한 경로 안내 요청을 보냅니다. 구글 서버는 총 거리, 예상 소요 시간, 그리고 단계별 환승 정보가 담긴 거대한 JSON 객체를 응답값으로 돌려줍니다. 이후 우리 애플리케이션은 DirectionsRenderer 객체를 이용해 지도 위에 파란색 선을 자동으로 그리고, 복잡하게 중첩된 환승 정보를 파싱하여 한 줄짜리 텍스트 여정표로 변환하여 출력합니다.",
        lbl_origin: "출발지:",
        lbl_destination: "도착지:",
        btn_calc: "경로 계산",
        
        rest_title: "주변 식당",
        rest_desc: "이 디렉토리 탭은 지정된 중심점을 기준으로 주변 상권(식당 등)을 검색하기 위해 Google Maps Places API를 활용합니다. 우선, Geocoder API를 호출하여 사용자가 입력한 문자열 주소를 정확한 위도/경도 좌표로 변환하는 선행 요청이 날아갑니다. 그다음, 반경 1,000미터 이내의 선택된 업종을 찾는 nearbySearch 요청을 Places 서비스에 전송합니다. 구글 API는 상호명, 주소, 유저 별점, 가격대가 포함된 Place 객체들의 배열을 응답값으로 반환하며, 프론트엔드는 자체 개발한 하버사인 거리 계산 알고리즘과 베이지안 별점 페널티 로직을 거쳐 이 배열을 정렬한 뒤 표 형태로 렌더링합니다.",
        lbl_base: "기준 위치:",
        lbl_category: "분류:",
        lbl_sort: "정렬 기준:",
        btn_search_dir: "주소록 검색",
        
        opt_restaurant: "음식점",
        opt_cafe: "카페",
        opt_bakery: "제과점",
        opt_hospital: "병원 및 의원",
        opt_park: "공원",
        
        opt_distance: "거리순 (가까운 순)",
        opt_rating: "별점순 (높은 순)",
        
        ph_seoul_tower: "예) 남산서울타워",
        ph_gangnam: "예) 강남역"
    }
};
