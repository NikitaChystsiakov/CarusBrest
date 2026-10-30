# CarusBrest — демо главной

Концепция главной страницы для [@carusbrest](https://www.instagram.com/carusbrest/) (авто из США под ключ, Брест).

- `site/` — статичный сайт (HTML, CSS, JS, GSAP + ScrollTrigger + Lenis). Видео и кадры — из их рилсов.
- `.art-director/` — бриф, референсы флагманов (`references/board.jpg`), эскизы направлений, DESIGN.md, ревью.
- `Carsify.by — копия/` — прошлое демо той же ниши, только как источник кода.

Запуск локально:

```bash
python3 -m http.server 4198 --bind 127.0.0.1 --directory site
```

Открыть http://127.0.0.1:4198 (интро показывается один раз за сессию вкладки).

Демо: https://carusbrest.vercel.app (Vercel отдаёт папку `site/`, см. `vercel.json`).
