# Важно

Для функций которые должны попадать в сборку необходимо добавлять `export`.
Это нужно для того, чтобы сборщик не удалил функцию как "неиспользуемую".

```js
// Неверно, функция будет удалена
function startLumberjacking() {
  Orion.Print('Starting to chop trees...');
  walkTo(1500, 2000);
}
```

```js
// Верно
export function startLumberjacking() {
  Orion.Print('Starting to chop trees...');
  walkTo(1500, 2000);
}
```
