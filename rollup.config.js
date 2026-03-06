import fs from 'fs';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import * as dotenv from 'dotenv';
import { globSync } from 'glob';

dotenv.config();

if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
    console.log('🗑️  Папка dist успешно очищена!');
}

// Получаем все .ts файлы и приводим слеши к единому формату (важно для Windows)
const scriptFiles = globSync('src/scripts/**/*.ts').map(file => file.replace(/\\/g, '/'));

const removeExportsPlugin = () => {
    return {
        name: 'remove-exports',
        renderChunk(code) {
            // Удаляем блок экспорта в конце файла
            return code.replace(/export\s+\{[^}]+\};?[\r\n]*$/g, '');
        }
    };
};

// Теперь мы экспортируем МАССИВ конфигураций.
// Rollup запустит отдельную, полностью независимую сборку для каждого файла.
export default scriptFiles.map(file => {
    // Вычисляем относительный путь для сохранения структуры папок.
    // Например: 'src/scripts/farm/lumberjack.ts' превратится в 'farm/lumberjack'
    const relativePath = file.replace('src/scripts/', '').replace(/\.ts$/, '');

    return {
        input: file,
        output: {
            // Записываем файл точно по нужному пути внутри dist
            file: `dist/${relativePath}.oajs`,
            format: 'es',
        },
        plugins: [
            replace({
                preventAssignment: true,
                values: {
                    'process.env.TG_BOT_TOKEN': JSON.stringify(process.env.TG_BOT_TOKEN || ''),
                    'process.env.TG_CHAT_ID': JSON.stringify(process.env.TG_CHAT_ID || ''),
                    'process.env.TG_THREAD_ID': JSON.stringify(process.env.TG_THREAD_ID || ''),
                }
            }),
            typescript(),
            removeExportsPlugin()
        ],
        treeshake: {
            moduleSideEffects: true
        }
    };
});