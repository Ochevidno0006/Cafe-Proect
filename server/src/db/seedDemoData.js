/**
 * Seeds a realistic demo cafe ("Чайхона Восток") with categories, dishes,
 * attributes, labels, translations, ads, gallery, contacts, and a
 * publication — so a fresh clone can be demoed with one command:
 *
 *   npm run seed:demo
 *
 * Safe to re-run: if the demo phone number is already registered, it exits
 * without creating duplicates.
 */
const { pool } = require('../config/db');
const authService = require('../services/authService');
const categoryRepository = require('../repositories/categoryRepository');
const dishRepository = require('../repositories/dishRepository');
const menuBlockRepository = require('../repositories/menuBlockRepository');
const advertisementRepository = require('../repositories/advertisementRepository');
const galleryRepository = require('../repositories/galleryRepository');
const contactRepository = require('../repositories/contactRepository');
const cafeSettingsRepository = require('../repositories/cafeSettingsRepository');
const publishService = require('../services/publishService');
const userRepository = require('../repositories/userRepository');

const DEMO_PHONE = '+992937001122';

const DISHES = [
  { cat: 'hot', name: 'Плов Ферганский', price: 45, desc: 'Рис, баранина, морковь, зира, барбарис', img: 'demo-plov.svg',
    attrs: { weight: '350 г', prep_time: '25 мин', spiciness: 'Средняя' }, labels: ['popular', 'recommended'],
    en: ['Fergana Plov', 'Rice, lamb, carrots, cumin, barberries'], tg: ['Оши Фарғонагӣ', 'Биринҷ, гӯшти гӯсфанд, сабзӣ, зира'] },
  { cat: 'hot', name: 'Манты с тыквой', price: 38, desc: 'Тонкое тесто, тыква, курдючный жир, лук', img: 'demo-manti.svg' },
  { cat: 'hot', name: 'Лагман по-домашнему', price: 40, desc: 'Домашняя лапша, говядина, овощи, соус', img: 'demo-lagman.svg' },
  { cat: 'hot', name: 'Шашлык из баранины', price: 55, desc: 'Мраморная баранина, маринад с луком', img: 'demo-kebab.svg',
    labels: ['popular'], en: ['Lamb Kebab', 'Marbled lamb, onion marinade'] },
  { cat: 'soup', name: 'Шурпа', price: 32, desc: 'Наваристый суп с бараниной и овощами', img: 'demo-shurpa.svg',
    labels: ['spicy'], en: ['Shurpa Soup', 'Hearty lamb and vegetable soup'] },
  { cat: 'hot', name: 'Омлет с зеленью', price: 22, desc: 'Домашние яйца, зелень, сыр', img: 'demo-omlet.svg' },
  { cat: 'snack', name: 'Самса с мясом', price: 12, desc: 'Слоёное тесто, говядина, лук', img: 'demo-somsa.svg' },
  { cat: 'snack', name: 'Ачик-чучук', price: 18, desc: 'Томаты, лук, зелень, оливковое масло', img: 'demo-salad.svg', labels: ['vegetarian', 'new'] },
  { cat: 'drink', name: 'Зелёный чай', price: 8, desc: 'Крупнолистовой чай в чайнике', img: 'demo-chай.svg' },
  { cat: 'dessert', name: 'Медовик', price: 20, desc: 'Домашний медовый торт со сметанным кремом', img: 'demo-torte.svg', labels: ['promo'] },
];

async function main() {
  const existing = await userRepository.findByPhone(DEMO_PHONE, { includeDeleted: true });
  if (existing) {
    console.log(`Demo cafe already exists for ${DEMO_PHONE}. Nothing to do.`);
    return;
  }

  const { cafe } = await authService.registerAdmin({
    firstName: 'Фарход',
    lastName: 'Каримов',
    phone: DEMO_PHONE,
    cafeName: 'Чайхона Восток',
    password: 'password123',
  });

  const categories = {
    hot: await categoryRepository.create(cafe.id, { name: 'Горячее', imageUrl: '/uploads/demo-plov.svg' }),
    soup: await categoryRepository.create(cafe.id, { name: 'Супы', imageUrl: '/uploads/demo-shurpa.svg' }),
    snack: await categoryRepository.create(cafe.id, { name: 'Закуски', imageUrl: '/uploads/demo-somsa.svg' }),
    drink: await categoryRepository.create(cafe.id, { name: 'Напитки', imageUrl: '/uploads/demo-chай.svg' }),
    dessert: await categoryRepository.create(cafe.id, { name: 'Десерты', imageUrl: '/uploads/demo-torte.svg' }),
  };

  const createdDishes = {};
  for (const d of DISHES) {
    const dish = await dishRepository.create(cafe.id, {
      categoryId: categories[d.cat].id,
      name: d.name,
      price: d.price,
      description: d.desc,
      photoUrl: `/uploads/${d.img}`,
      rating: 5,
    });
    createdDishes[d.name] = dish;

    if (d.attrs) {
      await dishRepository.setAttributes(
        dish.id,
        Object.entries(d.attrs).map(([key, value]) => ({ key, value, isVisible: true }))
      );
    }
    if (d.labels) await dishRepository.setLabels(dish.id, d.labels);
    if (d.en) await dishRepository.setTranslation(dish.id, 'en', { name: d.en[0], description: d.en[1] });
    if (d.tg) await dishRepository.setTranslation(dish.id, 'tg', { name: d.tg[0], description: d.tg[1] });
  }

  const block = await menuBlockRepository.create(cafe.id, { name: 'Популярное сейчас' });
  await menuBlockRepository.setDishes(
    block.id,
    cafe.id,
    ['Плов Ферганский', 'Шашлык из баранины', 'Манты с тыквой', 'Самса с мясом'].map((n) => createdDishes[n].id)
  );

  await advertisementRepository.create(cafe.id, { imageUrl: '/uploads/demo-kebab.svg' });
  await advertisementRepository.create(cafe.id, { imageUrl: '/uploads/demo-torte.svg' });
  await galleryRepository.create(cafe.id, { imageUrl: '/uploads/demo-hall.svg', category: 'hall' });
  await galleryRepository.create(cafe.id, { imageUrl: '/uploads/demo-interior.svg', category: 'interior' });
  await contactRepository.create(cafe.id, { type: 'phone', value: '+992 93 700-11-22' });
  await contactRepository.create(cafe.id, { type: 'whatsapp', value: '+992 93 700-11-22' });
  await contactRepository.create(cafe.id, { type: 'address', value: 'г. Душанбе, ул. Рудаки, 45' });
  await contactRepository.create(cafe.id, { type: 'instagram', value: '@vostok_chaykhona' });

  await cafeSettingsRepository.updateCafeSettings(cafe.id, {
    status: 'open', searchEnabled: true, favoritesEnabled: true, shareEnabled: true,
  });
  await cafeSettingsRepository.updateTheme(cafe.id, { preset: 'modern' });
  await cafeSettingsRepository.setLanguages(cafe.id, [
    { code: 'ru', isEnabled: true }, { code: 'tg', isEnabled: true }, { code: 'en', isEnabled: true },
  ]);

  await publishService.publish(cafe.id, null);

  console.log(`Demo cafe seeded: "${cafe.name}" — slug: ${cafe.slug}`);
  console.log(`Login: phone ${DEMO_PHONE}, password password123`);
  console.log(`Public menu: /api/public/menu/${cafe.slug}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
