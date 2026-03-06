import fs from 'fs';
import * as dotenv from 'dotenv';

// Читаем .env файл
dotenv.config();

const distDir = 'dist';
const targetDir = process.env.ORION_SCRIPTS_PATH;

if (!targetDir) {
    console.error('❌ ОШИБКА: Не задана переменная ORION_SCRIPTS_PATH в файле .env');
    process.exit(1);
}

if (!fs.existsSync(distDir)) {
    console.error('❌ ОШИБКА: Папка dist не существует. Сначала запусти сборку (npm run build).');
    process.exit(1);
}

try {
    // Копируем содержимое dist в папку Ориона с заменой старых файлов
    fs.cpSync(distDir, targetDir, { recursive: true, force: true });
    console.log(`🚀 УСПЕХ: Скрипты скопированы в ${targetDir}`);
} catch (err) {
    console.error('❌ Ошибка при копировании:', err.message);
}