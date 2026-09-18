/**
 * @license
 * SILVA E SOL - Otimizador e Compressor de Imagens no Navegador
 * Reduz fotos pesadas de celulares (5MB-15MB) para WebP/JPEG leves (~150KB-250KB)
 * instantaneamente no client-side com alta nitidez visual e sem travamentos.
 */

export interface OptimizedImageResult {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  originalSizeFormatted: string;
  compressedSizeFormatted: string;
  savingsPercent: number;
  width: number;
  height: number;
  format: 'image/webp' | 'image/jpeg';
}

export interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 a 1.0
  preferredFormat?: 'image/webp' | 'image/jpeg';
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Comprime e redimensiona uma imagem vinda de celular ou notebook
 */
export async function optimizeBannerImage(
  file: File,
  type: 'desktop' | 'mobile' = 'desktop',
  customOptions?: OptimizationOptions
): Promise<OptimizedImageResult> {
  const originalSize = file.size;

  // Parâmetros recomendados para cada dispositivo
  const defaultOptions: OptimizationOptions = type === 'desktop'
    ? { maxWidth: 1920, maxHeight: 800, quality: 0.84, preferredFormat: 'image/webp' }
    : { maxWidth: 900, maxHeight: 1100, quality: 0.84, preferredFormat: 'image/webp' };

  const options = { ...defaultOptions, ...customOptions };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Erro ao ler o arquivo de imagem'));

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Falha ao processar arquivo como imagem válida'));

      img.onload = () => {
        let { width, height } = img;
        const maxW = options.maxWidth || 1920;
        const maxH = options.maxHeight || 1080;

        // Manter proporção respeitando os limites máximos
        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Contexto 2D do Canvas indisponível'));
          return;
        }

        // Suavização bilinear de alta qualidade
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Fundo branco se imagem tiver transparência acidental
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);

        // Tenta WebP primeiro, com fallback automático
        let targetFormat: 'image/webp' | 'image/jpeg' = options.preferredFormat || 'image/webp';
        let dataUrl = canvas.toDataURL(targetFormat, options.quality || 0.84);

        // Se o navegador não suportar WebP na exportação (raro nos modernos), usa JPEG
        if (!dataUrl.startsWith('data:image/webp')) {
          targetFormat = 'image/jpeg';
          dataUrl = canvas.toDataURL('image/jpeg', options.quality || 0.84);
        }

        // Estimar tamanho em bytes a partir da string base64
        const base64Data = dataUrl.split(',')[1] || '';
        const compressedSize = Math.round((base64Data.length * 3) / 4);

        const savingsPercent = originalSize > 0
          ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
          : 0;

        resolve({
          dataUrl,
          originalSize,
          compressedSize,
          originalSizeFormatted: formatBytes(originalSize),
          compressedSizeFormatted: formatBytes(compressedSize),
          savingsPercent,
          width,
          height,
          format: targetFormat
        });
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Otimiza e comprime imagens de produtos e variações vindas de notebook ou celular.
 * Reduz fotos pesadas (3MB-15MB) para imagens leves (~80KB-180KB em 1200x1500)
 * mantendo nitidez visual, cores vivas e velocidade instantânea no navegador.
 */
export async function optimizeProductVariantImage(
  file: File,
  customOptions?: OptimizationOptions
): Promise<OptimizedImageResult> {
  const originalSize = file.size;

  const defaultOptions: OptimizationOptions = {
    maxWidth: 1200,
    maxHeight: 1500,
    quality: 0.84,
    preferredFormat: 'image/webp'
  };

  const options = { ...defaultOptions, ...customOptions };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Erro ao ler arquivo de imagem do dispositivo'));

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Formato de imagem inválido ou não suportado'));

      img.onload = () => {
        let { width, height } = img;
        const maxW = options.maxWidth || 1200;
        const maxH = options.maxHeight || 1500;

        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback para leitura direta caso canvas não esteja disponível
          const fallbackData = event.target?.result as string;
          resolve({
            dataUrl: fallbackData,
            originalSize,
            compressedSize: originalSize,
            originalSizeFormatted: formatBytes(originalSize),
            compressedSizeFormatted: formatBytes(originalSize),
            savingsPercent: 0,
            width: img.width,
            height: img.height,
            format: 'image/jpeg'
          });
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Preenchimento de fundo branco suave caso haja transparências
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);

        let targetFormat: 'image/webp' | 'image/jpeg' = options.preferredFormat || 'image/webp';
        let dataUrl = canvas.toDataURL(targetFormat, options.quality || 0.84);

        if (!dataUrl.startsWith('data:image/webp')) {
          targetFormat = 'image/jpeg';
          dataUrl = canvas.toDataURL('image/jpeg', options.quality || 0.84);
        }

        const base64Data = dataUrl.split(',')[1] || '';
        const compressedSize = Math.round((base64Data.length * 3) / 4);

        const savingsPercent = originalSize > 0
          ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
          : 0;

        resolve({
          dataUrl,
          originalSize,
          compressedSize,
          originalSizeFormatted: formatBytes(originalSize),
          compressedSizeFormatted: formatBytes(compressedSize),
          savingsPercent,
          width,
          height,
          format: targetFormat
        });
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

