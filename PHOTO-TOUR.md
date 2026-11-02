# Фотографичная версия

Главный экран использует новый кадр, созданный встроенным imagegen. Исходник: `output/imagegen/residence-photo.png`, веб-версия: `dist/assets/residence-photo.webp` (около 479 КБ).

Прогулка использует статичные архитектурные изображения и мягкие переходы, обзор территории с активными точками, перетягивание обзора, четыре места, просмотр без описания, возврат и день/вечер. Настоящих видеопролётов и свободного вращения 3D здесь нет. Прежняя процедурная модель сохранена в исходниках, но не подключена к странице. Все изображения вымышлены и не являются фотографиями реального построенного объекта.

Генерация: встроенный image_gen, без CLI/API fallback.

Финальный промпт:

> Use case: precise-object-edit / photorealistic-natural. Input image is the edit target, architectural identity reference. Create a premium architectural editorial PHOTOGRAPH of this exact fictional residential complex in Moscow: preserve two rectangular 14-17 storey limestone residential towers, same facade rhythm and shared 2-storey podium, same courtyard and camera composition. Make it feel like an actual full-frame architectural photograph, NOT glossy CGI or a miniature: neutral late afternoon daylight, light overcast pale blue sky, restrained warm sandstone and dark bronze, subtle facade imperfections, physically believable window reflections, individual different curtains and interiors, natural diverse birch foliage and ornamental grasses, realistic pavement joints. A couple distant naturally scaled residents walking in courtyard, no posing. Fine realistic photographic detail and believable building proportions. Wide landscape 16:9 2400px-class hero image. No typography, no logos, no watermark. Preserve building identity and location layout. Avoid bloom, orange color grade, oversharpening, surreal geometry, curved futuristic buildings, fake overly perfect glossy render.

Входной кадр: `dist/assets/character-day-real.webp`. Фактическое разрешение результата 1672×941. Полноразмерный PNG сохранён в проекте, а не только в каталоге генератора.

Обновление: интерактив перенесён из первого экрана в раздел территории (#architecture), повтор фасадного изображения заменён аэровидом. Первый экран статичен; облака двигаются только в векторной маске неба, синхронизированной с кадрированием изображения. Приближение плана ограничено 1.075 и смещением в пределах запаса изображения, чтобы не оголялись края. Четыре активные зоны открывают сцены без промежуточного слайда. На мобильном плане видна вся территория; описание расположено под сценой. Проверка границ — amenity-motion.test.mjs.
`nУдалён раздел галереи «Место, которое чувствуется» и связанные обработчики. Вместо OpenStreetMap подключён русскоязычный iframe Яндекс Карт с фрагментом Москвы (37.600000,55.735000,z13), без вымышленной метки ЖК. Нумерация: Москва 05, знакомство 06. В браузере проверена загрузка карты и сохранность карточек квартир. Документация виджета: https://yandex.ru/support/maps/ru/concept/get-map-reference.html

Ночная линза: в главном экране мягкая радиальная маска открывает существующий вечерний кадр вокруг курсора; на touch касание показывает его примерно на 1.6 секунды. Скролл не блокируется, при жесте прокрутки эффект скрывается. Обе картинки используют одинаковый cover-расчёт. requestAnimationFrame работает только во время следования, эффект выключается за пределами первого экрана и в скрытой вкладке. Убраны декоративные стрелки у ссылок/кнопок перехода и скачивания; стрелки слайдера и направления сортировки оставлены как элементы управления.
`nОбновление эффекта: ночной кадр смешивается через lighten без затемняющего фильтра. Дневная яркость не уменьшается: маска вокруг курсора добавляет только более светлые участки вечернего кадра (свет окон и подсветку).
