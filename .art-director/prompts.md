# Промпты для картинок (CarusBrest)

## Общие правила для всех кадров
- Прикладывать референсы машины: `site/assets/img/trx-side.jpg` (сбоку) и `site/assets/img/trx-front-poster.jpg` (спереди). В каждом кадре — ИМЕННО этот синий Ram 1500 TRX: синий кузов, чёрный капот с воздухозаборниками, решётка с буквами RAM, надпись TRX на борту.
- Разрешение: не меньше 1920 px по длинной стороне (2K). Если генератор отдаёт 1024 — апскейл ×2.
- Без текста, вывесок, логотипов чужих компаний (Copart, IAAI, MSC и т. п.). Разрешены только шильдики самой машины.
- Документальное фото, 35 мм, камера низко, машина — главный герой (40–45% ширины кадра).
- Цвет по маршруту (осознанно): США — тёплый вечерний свет и пыль; порт США — тёплый, дымка; Поти — светлая морская дымка днём; Беларусь — пасмурная осень, как их ролик TRX; СТО — свет их цеха.

## 1. Аукцион (США) — ГОТОВ, нужен апскейл
Файл: `materials/gen/1-auction-v3.webp` → апскейл до ≥1920×1080.
Где на сайте: первый кадр маршрута на весь экран, заголовок слева.

## 2. Порт США — карточка у пина на глобусе
Формат 3:2, ≥1920 px.
> Photorealistic documentary photo, 3:2. The same blue Ram 1500 TRX (exactly like the reference images) being slowly driven into an open 40-ft shipping container at a US East Coast seaport. Stacked containers, gantry cranes, part of a container ship hull in the background. Warm late-afternoon light with slight haze, low camera, truck in the right half of the frame, calmer space on the left. A port worker in a hi-vis vest guiding the truck, face not visible. No readable text, no company logos on containers or cranes. High resolution, at least 1920 px wide.

## 3. Поти (Грузия) — кадр на весь экран после приближения глобуса
Формат 16:9, ≥1920 px.
> Photorealistic documentary photo, 16:9. The same blue Ram 1500 TRX (exactly like the reference images) standing on a Black Sea port terminal in Poti, Georgia, just unloaded from an open container. Port cranes, stacked containers, and the hazy green Caucasus mountains in the distance. Bright hazy midday sea light, slightly cooler than the US shots. Low camera, truck placed in the right third of the frame, open empty concrete on the left third for text. A worker in a hi-vis vest with a clipboard near the truck, face not visible. No readable text, no logos. High resolution, at least 1920 px wide.

## 4. Автовоз — ГОТОВ (v1 стоит на сайте: `gen-autovoz.webp`)

## 4 (исходный промпт). Автовоз — карточка на «дороге сверху»
Формат 4:3, ≥1600 px.
> Photorealistic documentary photo, 4:3. A car-carrier truck driving on a two-lane highway through flat Eastern European fields and pine forest in autumn, overcast grey sky, slightly wet asphalt. The same blue Ram 1500 TRX (exactly like the reference images) secured on the top deck, other cars below. Three-quarter front view from the roadside, slight motion blur on the wheels and road. Muted cool colors like an autumn day in Belarus. No readable text, no logos on the truck. High resolution.

## 5. TRX на подъёмнике — первый кадр для видео Kling (секция СТО)
**ГОТОВ: v4 (ножничный) — `materials/gen/5-lift-v4.webp`, ждёт видео в Kling.**
Формат 16:9, ≥1920 px. Дополнительно приложить их цех: `site/assets/img/sto-lift.jpg`.
> Photorealistic photo, 16:9. The same blue Ram 1500 TRX (exactly like the reference images) standing on a two-post car lift inside this exact workshop from the reference (OSB wooden ceiling, long fluorescent lights, light tiled floor, tool cabinets). Lift arms positioned under the frame, the truck still on the ground, wheels touching the floor. Side three-quarter view, static camera at chest height, truck in the center-right, some free space above the truck (it will rise in the video). Realistic workshop lighting, no people, no readable text. High resolution.
Брак: лапы подъёмника не под рамой, машина «парит», искажённые колёса.

### 5 v2 — правка к v1 (в v1 лапы лежат на полу слева от машины, а не под ней)
Приложить `materials/gen/5-lift-v1.webp` как основу + референсы TRX.
> Keep this exact workshop, camera angle, lighting and the blue Ram TRX. Fix the car lift: the truck stands between the two red posts of ONE two-post lift, and all four yellow lift arms are swung UNDER the truck — two arms reaching under the cab near the front wheels, two arms under the rear of the cab in front of the rear wheels, rubber pads touching the frame. No lift arms lying on the floor outside the truck. Remove the second lift's red posts behind the truck. Wheels still on the floor. Keep the empty space above the roof. No people, no readable text except the RAM badge. Same 16:9 framing, high resolution.
Брак: хоть одна лапа видна на полу вне машины; лишние стойки; изменился кузов или цех.

### 5 v3 — правка к v2 (лапы под машиной — да; но 4 стойки вместо 2, плита вдоль машины, старые ворота уменьшили машину)
Приложить `materials/gen/5-lift-v2.webp` как основу + референсы TRX.
> Keep this blue Ram TRX in exact side view, the same workshop interior (OSB ceiling, fluorescent lights, light tiles, red tool cabinets) and the same lighting. Remove the old metal gates and the door frame: the camera is inside the workshop, the truck fills about 70% of the frame width. Make the lift a correct TWO-POST lift: exactly two red posts, both at the middle of the truck — one on the near side standing in front of the B-pillar between the doors, one on the far side directly behind it. The yellow floor plate runs ACROSS under the truck from one post to the other, perpendicular to the truck. Four yellow arms reach under the frame, rubber pads touching it. No other posts. Wheels on the floor, free space above the roof. No people, no readable text except RAM/TRX badges. 16:9, high resolution.
Брак: больше двух стоек; плита вдоль машины; машина приподнята; вернулись ворота.

### 5 v4 — ножничный подъёмник (v3: ворота ушли, машина крупнее, но снова 4 стойки и плита вдоль — генератор упорно рисует так, стойки убираем совсем)
Приложить `materials/gen/5-lift-v3.webp` как основу + референсы TRX.
> Keep everything in this image exactly the same: the workshop, the camera position, the lighting and the blue Ram TRX in side view. Replace the red post lift with a low-profile scissor lift: there are NO vertical posts anywhere in the frame — remove all four red posts and the yellow plate. A flat, low, yellow scissor lift lies on the floor directly UNDER the truck between the front and rear wheels, its rubber pads touching the frame below the doors; only its edge is visible under the truck. Wheels on the floor, empty space above the roof. No people, no readable text except RAM/TRX badges. 16:9, high resolution.
Брак: осталась хоть одна стойка; подъёмник торчит из-под машины дальше колёс; изменилась машина или цех.
Если v4 тоже не выйдет — берём v3 как есть: в 5-секундном видео, пока машина едет вверх, ошибку со стойками заметит только мастер.

## 6. TRX сверху — ГОТОВ (вырезан: `site/assets/img/trx-top.webp`, едет по «дороге»)

## 6 (исходный промпт). TRX сверху
Формат 2:3 вертикальный.
> Exact top-down orthographic view of the same blue Ram 1500 TRX (exactly like the reference images), seen directly from above, the front of the truck pointing DOWN to the bottom of the frame, centered, on a pure flat white background, no shadow, no reflections, no ground texture. Clean edges for cutting out. High resolution.
Если не выйдет чисто — на дороге поедет щит CB, ничего страшного.

## 7. Выдача ключей — ГОТОВ (v2 стоит на сайте: `gen-keys.webp`, финал «дороги»)

## 7 (история). Выдача ключей в Бресте
Формат 4:3.
### 7 v2 — правка к v1 (в v1 здание выглядит как заброшенный гараж, оба человека в рабочих перчатках, машина резче рук)
> Photorealistic documentary photo, 4:3. Foreground: close-up of two hands passing a modern car key fob — on the left a mechanic's hand in a clean black work glove, on the right the customer's BARE hand with a sleeve of a dark casual jacket. Hands sharp, in focus, in the lower half of the frame, no table. Background, softly out of focus: the same blue Ram 1500 TRX (exactly like the reference images) parked in front of the open sectional door of a NEW, clean small car service building made of grey metal sandwich panels, bright workshop light inside, wet asphalt, birch and pine trees, overcast autumn day in Belarus. Muted cool colors. No people's faces, no readable text, no logos.
Брак: облезлые стены, шифер, ржавчина; обе руки в перчатках; машина резче рук; ключ странной формы.

### 7 (исходный промпт)
> Photorealistic documentary photo, 4:3. The same blue Ram 1500 TRX (exactly like the reference images) parked at the open gate of a small car service building in Belarus on an overcast autumn day, wet asphalt, birch and pine trees. Close-up of two hands passing car keys in the foreground (faces not visible), the truck slightly out of focus behind. Muted cool colors. No readable text, no logos.

Готовые файлы класть в `.art-director/materials/gen/` с номером сцены в начале имени (например `3-poti.webp`).

## 8. Оформление — ГОТОВ (v1 стоит на сайте: `gen-office.webp`)

## 8 (исходный промпт). Оформление в Бресте — замена фото офиса на «дороге» (вторая остановка)
Формат 16:10, ≥1600 px. Приложить референсы TRX.
> Photorealistic documentary photo, 16:10. Over-the-shoulder close-up at a desk in a small, clean modern office in Belarus on an overcast autumn day. In the foreground a manager's hands slide a folder of car documents (registration papers, a customs declaration with a stamp — no readable text) across the desk toward a customer's hands; a pen and the car key lie on the papers. Behind them, through a large window, the same blue Ram 1500 TRX (exactly like the reference images) is parked outside on wet asphalt, softly out of focus. Warm desk lamp light inside, cool grey daylight outside. No faces, no readable text, no logos. High resolution.
Брак: читаемый текст на документах; лица; машина за окном не похожа на их TRX; лишние пальцы.
