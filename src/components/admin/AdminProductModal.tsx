import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  Upload,
  Plus,
  Trash2,
  Star,
  ArrowLeft,
  ArrowRight,
  Play,
  Film,
  Layers,
  Tag,
  Ruler,
  Percent,
  AlertCircle,
  Database,
  RefreshCw,
  Camera,
  Smartphone,
  Laptop,
  Loader2,
  Maximize2,
  Copy,
  CheckCircle2,
  Truck,
  Box,
  Scale
} from 'lucide-react';
import { Product, SizeChart, SizeChartRow, ProductVariant } from '../../types/ecommerce';
import { useStore } from '../../context/StoreContext';
import { SIZE_CHART_PRESETS } from '../../data/sizeChartPresets';
import { validatePromotion } from '../../lib/productValidation';
import { optimizeProductVariantImage } from '../../lib/imageOptimizer';
import { uploadImageToSupabaseStorage, isSupabaseConfigured } from '../../lib/supabase';

interface AdminProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: Product | null;
}

type ModalTab = 'general' | 'media' | 'variants' | 'logistics' | 'sizechart' | 'seo';

export const AdminProductModal: React.FC<AdminProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit
}) => {
  const { categories, subcategories, addProduct, updateProduct, addCategory } = useStore();

  const [activeTab, setActiveTab] = useState<ModalTab>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Criação rápida de categoria inline
  const [showQuickCategoryModal, setShowQuickCategoryModal] = useState(false);
  const [quickCategoryName, setQuickCategoryName] = useState('');
  const [isCreatingQuickCat, setIsCreatingQuickCat] = useState(false);

  // Aba 1: Dados Gerais
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('Silva e Sol');
  const [description, setDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [price, setPrice] = useState(89.90);
  const [promotionalPrice, setPromotionalPrice] = useState<number | undefined>(undefined);
  const [isOnSale, setIsOnSale] = useState(false);
  const [promotionStartDate, setPromotionStartDate] = useState('');
  const [promotionEndDate, setPromotionEndDate] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');

  // Aba 2: Mídia
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Aba 3: Variações & Estoque
  const [sizesStr, setSizesStr] = useState('P (38), M (40), G (42), GG (44-46)');
  const [colorsStr, setColorsStr] = useState('Verde, Azul, Branco, Preto');
  const [modelsStr, setModelsStr] = useState('Slim Lateral 8cm, Tradicional');
  const [stockQuantity, setStockQuantity] = useState(20);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [colorImages, setColorImages] = useState<Record<string, string>>({});

  // Estados para Upload e Compressão Leve de Fotos por Variação (Celular/Notebook)
  const [optimizingVariantIndex, setOptimizingVariantIndex] = useState<number | null>(null);
  const [optimizingColorName, setOptimizingColorName] = useState<string | null>(null);
  const [variantUploadNotice, setVariantUploadNotice] = useState<string | null>(null);
  const [previewModalImage, setPreviewModalImage] = useState<{ url: string; title: string; info?: string } | null>(null);

  // Aba 4: Tabela de Medidas (Preset padrão oficial Sungas Silva e Sol)
  const [hasSizeChart, setHasSizeChart] = useState(true);
  const [sizeChartTitle, setSizeChartTitle] = useState(SIZE_CHART_PRESETS[0].chart.title);
  const [sizeChartInstructions, setSizeChartInstructions] = useState(SIZE_CHART_PRESETS[0].chart.instructions || '');
  const [sizeChartColumns, setSizeChartColumns] = useState<string[]>(SIZE_CHART_PRESETS[0].chart.columns);
  const [sizeChartRows, setSizeChartRows] = useState<SizeChartRow[]>(SIZE_CHART_PRESETS[0].chart.rows);

  // Aba Logística & Embalagem (Melhor Envio & Correios)
  const [weightGrams, setWeightGrams] = useState<number>(200);
  const [heightCm, setHeightCm] = useState<number>(4);
  const [widthCm, setWidthCm] = useState<number>(15);
  const [lengthCm, setLengthCm] = useState<number>(20);

  // Aba 5: SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Cálculo de desconto percentual em tempo real
  const calculatedDiscountPercent = promotionalPrice && price > promotionalPrice
    ? Math.round(((price - promotionalPrice) / price) * 100)
    : 0;

  // Carregar dados na abertura
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSlug(productToEdit.slug);
      setSku(productToEdit.sku || '');
      setBrand(productToEdit.brand || 'Silva e Sol');
      setDescription(productToEdit.description);
      setDetailedDescription(productToEdit.detailedDescription || '');
      setPrice(productToEdit.price);
      setPromotionalPrice(productToEdit.promotionalPrice);
      setIsOnSale(productToEdit.isOnSale);
      setPromotionStartDate(productToEdit.promotionStartDate || '');
      setPromotionEndDate(productToEdit.promotionEndDate || '');
      setIsFeatured(productToEdit.isFeatured);
      setIsNew(productToEdit.isNew);
      setIsActive(productToEdit.isActive);
      setCategoryId(productToEdit.categoryId);
      setSubcategoryId(productToEdit.subcategoryId || '');
      setStockQuantity(productToEdit.stockQuantity);
      setImages(productToEdit.images || []);
      setVideoUrl(productToEdit.videoUrl || '');
      setSizesStr((productToEdit.sizes || []).join(', '));
      setColorsStr((productToEdit.colors || []).join(', '));
      setModelsStr((productToEdit.models || []).join(', '));
      setVariants(productToEdit.variants || []);

      const initialColorImgs: Record<string, string> = {};
      productToEdit.variants?.forEach(v => {
        if (v.color && v.imageUrl && !initialColorImgs[v.color.toLowerCase()]) {
          initialColorImgs[v.color.toLowerCase()] = v.imageUrl;
        }
      });
      setColorImages(initialColorImgs);

      setSeoTitle(productToEdit.seoTitle || productToEdit.name);
      setSeoDescription(productToEdit.seoDescription || productToEdit.description);
      setWeightGrams(productToEdit.weightGrams ?? 200);
      setHeightCm(productToEdit.heightCm ?? 4);
      setWidthCm(productToEdit.widthCm ?? 15);
      setLengthCm(productToEdit.lengthCm ?? 20);

      if (productToEdit.sizeChart) {
        setHasSizeChart(true);
        setSizeChartTitle(productToEdit.sizeChart.title);
        setSizeChartInstructions(productToEdit.sizeChart.instructions || '');
        setSizeChartColumns(productToEdit.sizeChart.columns);
        setSizeChartRows(productToEdit.sizeChart.rows);
      } else {
        setHasSizeChart(false);
      }
    } else {
      // Padrão para novo produto - pré-configurado para moda praia masculina / sungas
      setName('');
      setSlug('');
      setSku('');
      setBrand('Silva e Sol');
      setDescription('');
      setDetailedDescription('');
      setPrice(89.90);
      setPromotionalPrice(undefined);
      setIsOnSale(false);
      setPromotionStartDate('');
      setPromotionEndDate('');
      setIsFeatured(false);
      setIsNew(true);
      setIsActive(true);
      setCategoryId(categories[0]?.id || '');
      setSubcategoryId('');
      setStockQuantity(20);
      setImages([]);
      setVideoUrl('');
      setSizesStr('P (38), M (40), G (42), GG (44-46)');
      setColorsStr('Verde, Azul, Branco, Preto');
      setModelsStr('Slim Lateral 8cm, Tradicional');
      setVariants([]);
      setColorImages({});
      setHasSizeChart(true);
      const sungasPreset = SIZE_CHART_PRESETS[0].chart;
      setSizeChartTitle(sungasPreset.title);
      setSizeChartInstructions(sungasPreset.instructions || '');
      setSizeChartColumns(sungasPreset.columns);
      setSizeChartRows(sungasPreset.rows);
      setSeoTitle('');
      setSeoDescription('');
    }
    setActiveTab('general');
    setErrorMsg('');
  }, [productToEdit, isOpen, categories]);

  if (!isOpen) return null;

  // Auto-gerar slug
  const generateSlugFromName = () => {
    const generated = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    setSlug(generated);
    if (!seoTitle) setSeoTitle(`${name} | Silva e Sol`);
    if (!seoDescription) setSeoDescription(description || `Compre ${name} na Silva e Sol com atendimento direto via WhatsApp.`);
  };

  // Upload de Imagens Múltiplas via FileReader
  const handleImageFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setImages(prev => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) e.target.value = '';
  };

  // Upload de Vídeo via FileReader
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setVideoUrl(result);
      }
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImages(prev => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleSetPrimaryImage = (index: number) => {
    if (index === 0) return;
    setImages(prev => {
      const next = [...prev];
      const [chosen] = next.splice(index, 1);
      next.unshift(chosen);
      return next;
    });
  };

  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    setImages(prev => {
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Gerar variações automáticas preservando fotos já atribuídas
  const handleGenerateVariantsGrid = () => {
    const sizes = sizesStr.split(',').map(s => s.trim()).filter(Boolean);
    const colors = colorsStr.split(',').map(c => c.trim()).filter(Boolean);
    const models = modelsStr.split(',').map(m => m.trim()).filter(Boolean);

    const generated: ProductVariant[] = [];
    const baseSku = sku || 'SOL';

    // Gerar combinações
    (sizes.length ? sizes : [undefined]).forEach(size => {
      (colors.length ? colors : [undefined]).forEach(color => {
        (models.length ? models : [undefined]).forEach(model => {
          const varSku = `${baseSku}${size ? `-${size.replace(/[^a-zA-Z0-9]/g, '')}` : ''}${color ? `-${color.slice(0, 3).toUpperCase()}` : ''}`;
          
          // Preserva imagem da cor se já foi enviada ou de variação anterior
          const existingImg = (color ? colorImages[color.toLowerCase()] : undefined) ||
            variants.find(v => v.color?.toLowerCase() === color?.toLowerCase() && v.size === size)?.imageUrl ||
            variants.find(v => v.color?.toLowerCase() === color?.toLowerCase())?.imageUrl;

          generated.push({
            id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            productId: productToEdit?.id || '',
            size,
            color,
            model,
            sku: varSku,
            stockQuantity: Math.floor(stockQuantity / Math.max(1, (sizes.length * (colors.length || 1)))),
            price: price,
            isAvailable: true,
            imageUrl: existingImg
          });
        });
      });
    });

    setVariants(generated);
    setVariantUploadNotice(`Grade gerada com ${generated.length} variação(ões).`);
    setTimeout(() => setVariantUploadNotice(null), 3500);
  };

  // Aplicar Preset de Medidas (ex: Sungas, Camisetas, Regatas, Shorts)
  const handleApplySizeChartPreset = (presetId: string) => {
    const found = SIZE_CHART_PRESETS.find(p => p.id === presetId || p.categoryMatch.includes(presetId));
    const chart = found ? found.chart : SIZE_CHART_PRESETS[0].chart;
    setSizeChartTitle(chart.title);
    setSizeChartInstructions(chart.instructions || '');
    setSizeChartColumns([...chart.columns]);
    setSizeChartRows(chart.rows.map(r => ({ ...r, values: [...r.values] })));
    setVariantUploadNotice(`Tabela de medidas aplicada: "${chart.title}"`);
    setTimeout(() => setVariantUploadNotice(null), 3500);
  };

  // Upload e compressão leve no navegador para foto de variação individual (celular ou notebook)
  const handleVariantImageUpload = async (index: number, file: File) => {
    if (!file) return;
    setOptimizingVariantIndex(index);
    setVariantUploadNotice(null);
    try {
      const optimized = await optimizeProductVariantImage(file);
      let finalUrl = optimized.dataUrl;

      if (isSupabaseConfigured) {
        const storageUrl = await uploadImageToSupabaseStorage(file, 'products', `variant-${index}`);
        if (storageUrl) {
          finalUrl = storageUrl;
        }
      }

      setVariants(prev => prev.map((item, idx) => idx === index ? { ...item, imageUrl: finalUrl } : item));

      // Se a variação tiver cor, atualiza também o mapa de fotos por cor
      const targetVar = variants[index];
      if (targetVar?.color) {
        setColorImages(prev => ({
          ...prev,
          [targetVar.color!.toLowerCase()]: finalUrl
        }));
      }

      // Disponibiliza na galeria geral de fotos do produto caso ainda não esteja
      setImages(prev => prev.includes(finalUrl) ? prev : [...prev, finalUrl]);

      setVariantUploadNotice(
        `Foto da variação processada com sucesso: ${optimized.originalSizeFormatted} → ${optimized.compressedSizeFormatted} (-${optimized.savingsPercent}%)`
      );
      setTimeout(() => setVariantUploadNotice(null), 4500);
    } catch (err: any) {
      console.error('Erro ao otimizar foto da variação:', err);
      // Fallback seguro via FileReader caso canvas encontre arquivo incomum
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          setVariants(prev => prev.map((item, idx) => idx === index ? { ...item, imageUrl: dataUrl } : item));
          setImages(prev => prev.includes(dataUrl) ? prev : [...prev, dataUrl]);
          setVariantUploadNotice('Foto carregada com sucesso para a variação.');
          setTimeout(() => setVariantUploadNotice(null), 4000);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setOptimizingVariantIndex(null);
    }
  };

  // Upload e compressão em lote para uma cor inteira (celular ou notebook)
  const handleColorBulkUpload = async (colorName: string, file: File) => {
    if (!file || !colorName) return;
    setOptimizingColorName(colorName);
    setVariantUploadNotice(null);
    try {
      const optimized = await optimizeProductVariantImage(file);
      let finalUrl = optimized.dataUrl;

      if (isSupabaseConfigured) {
        const storageUrl = await uploadImageToSupabaseStorage(file, 'products', `color-${colorName}`);
        if (storageUrl) {
          finalUrl = storageUrl;
        }
      }

      // 1. Guarda no mapa de cores
      setColorImages(prev => ({
        ...prev,
        [colorName.toLowerCase()]: finalUrl
      }));

      // 2. Adiciona na galeria geral do produto
      setImages(prev => prev.includes(finalUrl) ? prev : [...prev, finalUrl]);

      // 3. Atualiza ou gera as variações correspondentes
      setVariants(prev => {
        if (prev.length === 0) {
          // Se ainda não gerou variações, gera automaticamente com os tamanhos definidos
          const sizes = sizesStr.split(',').map(s => s.trim()).filter(Boolean);
          const currentSizes = sizes.length > 0 ? sizes : ['P (38)', 'M (40)', 'G (42)', 'GG (44-46)'];
          const baseSku = sku || 'SOL';
          return currentSizes.map(size => ({
            id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            productId: productToEdit?.id || '',
            size,
            color: colorName,
            sku: `${baseSku}-${size.replace(/[^a-zA-Z0-9]/g, '')}-${colorName.slice(0, 3).toUpperCase()}`,
            stockQuantity: Math.floor(stockQuantity / Math.max(1, currentSizes.length)),
            price: price,
            isAvailable: true,
            imageUrl: finalUrl
          }));
        }

        const hasColor = prev.some(item => item.color?.toLowerCase() === colorName.toLowerCase());
        if (!hasColor) {
          // Cria as variações para essa nova cor
          const existingSizes = Array.from(new Set(prev.map(p => p.size).filter(Boolean))) as string[];
          const sizesToUse = existingSizes.length > 0 ? existingSizes : ['P (38)', 'M (40)', 'G (42)', 'GG (44-46)'];
          const newVars = sizesToUse.map(size => ({
            id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            productId: productToEdit?.id || '',
            size,
            color: colorName,
            sku: `${sku || 'SOL'}-${size.replace(/[^a-zA-Z0-9]/g, '')}-${colorName.slice(0, 3).toUpperCase()}`,
            stockQuantity: 5,
            price: price,
            isAvailable: true,
            imageUrl: finalUrl
          }));
          return [...prev, ...newVars];
        }

        return prev.map(item => {
          if (item.color && item.color.toLowerCase() === colorName.toLowerCase()) {
            return { ...item, imageUrl: finalUrl };
          }
          return item;
        });
      });

      setVariantUploadNotice(
        `Foto da cor "${colorName}" comprimida (${optimized.compressedSizeFormatted}) e vinculada às variações com sucesso!`
      );
      setTimeout(() => setVariantUploadNotice(null), 4500);
    } catch (err: any) {
      console.error('Erro ao otimizar imagem por cor:', err);
      alert('Falha ao processar imagem da cor: ' + (err?.message || err));
    } finally {
      setOptimizingColorName(null);
    }
  };

  // Replicar a foto de uma variação para todas as outras com a mesma cor
  const handleReplicateImageToColor = (sourceIndex: number) => {
    const sourceVariant = variants[sourceIndex];
    if (!sourceVariant || !sourceVariant.imageUrl || !sourceVariant.color) return;

    const targetColor = sourceVariant.color;
    setColorImages(prev => ({
      ...prev,
      [targetColor.toLowerCase()]: sourceVariant.imageUrl!
    }));

    setVariants(prev => prev.map(item => {
      if (item.color && item.color.toLowerCase() === targetColor.toLowerCase()) {
        return { ...item, imageUrl: sourceVariant.imageUrl };
      }
      return item;
    }));

    const count = variants.filter(v => v.color?.toLowerCase() === targetColor.toLowerCase()).length;
    setVariantUploadNotice(`Foto replicada para todas as ${count} variações da cor "${targetColor}"!`);
    setTimeout(() => setVariantUploadNotice(null), 4000);
  };


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('O nome do produto é obrigatório.');
      setActiveTab('general');
      return;
    }
    if (images.length === 0) {
      setErrorMsg('Adicione pelo menos uma foto para o produto.');
      setActiveTab('media');
      return;
    }
    const promoError = isOnSale
      ? validatePromotion(Number(price), promotionalPrice == null ? undefined : Number(promotionalPrice), { required: true })
      : null;
    if (promoError) {
      setErrorMsg(promoError);
      setActiveTab('general');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      const finalSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const parsedSizes = sizesStr.split(',').map(s => s.trim()).filter(Boolean);
      const parsedColors = colorsStr.split(',').map(c => c.trim()).filter(Boolean);
      const parsedModels = modelsStr.split(',').map(m => m.trim()).filter(Boolean);

      const sizeChartData: SizeChart | undefined = hasSizeChart ? {
        title: sizeChartTitle,
        instructions: sizeChartInstructions,
        columns: sizeChartColumns,
        rows: sizeChartRows
      } : undefined;

      const productPayload = {
        name: name.trim(),
        slug: finalSlug,
        sku: sku.trim() || undefined,
        brand: brand.trim() || 'Silva e Sol',
        description: description.trim(),
        detailedDescription: detailedDescription.trim() || undefined,
        price: Number(price),
        promotionalPrice: isOnSale && promotionalPrice ? Number(promotionalPrice) : undefined,
        isOnSale,
        promotionStartDate: isOnSale && promotionStartDate ? promotionStartDate : undefined,
        promotionEndDate: isOnSale && promotionEndDate ? promotionEndDate : undefined,
        isFeatured,
        isNew,
        isActive,
        categoryId,
        subcategoryId: subcategoryId || undefined,
        stockQuantity: Number(stockQuantity),
        sizes: parsedSizes,
        colors: parsedColors,
        models: parsedModels,
        images,
        videoUrl: videoUrl.trim() || undefined,
        variants: variants.length > 0 ? variants : undefined,
        sizeChart: sizeChartData,
        seoTitle: seoTitle.trim() || name.trim(),
        seoDescription: seoDescription.trim() || description.trim(),
        weightGrams: Number(weightGrams) || 200,
        heightCm: Number(heightCm) || 4,
        widthCm: Number(widthCm) || 15,
        lengthCm: Number(lengthCm) || 20
      };

      if (productToEdit) {
        await updateProduct(productToEdit.id, productPayload);
      } else {
        await addProduct(productPayload);
      }

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar produto.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-5xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Cabeçalho do Modal */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/80">
          <div>
            <h2 className="font-heading font-extrabold text-lg sm:text-xl text-white">
              {productToEdit ? `Editar Produto: ${productToEdit.name}` : 'Cadastrar Novo Produto'}
            </h2>
            <p className="text-xs text-stone-400">
              Gerencie todas as características comerciais, mídias, variações e SEO.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Abas */}
        <div className="flex items-center gap-1 px-6 border-b border-stone-800 bg-stone-950 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'general'
                ? 'border-[#2A8882] text-[#2A8882]'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            1. Dados & Preço
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'media'
                ? 'border-[#2A8882] text-[#2A8882]'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            2. Mídia (Fotos & Vídeo) {images.length > 0 && `(${images.length})`}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('variants')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'variants'
                ? 'border-[#2A8882] text-[#2A8882]'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            3. Variações & Estoque
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logistics')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'logistics'
                ? 'border-[#2A8882] text-[#2A8882]'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>4. Logística & Embalagem</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sizechart')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'sizechart'
                ? 'border-[#2A8882] text-[#2A8882]'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            5. Tabela de Medidas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'seo'
                ? 'border-[#2A8882] text-[#2A8882]'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            6. SEO Google
          </button>
        </div>

        {/* Corpo do Formulário */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ABA 1: GERAL & PREÇO */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* Nome */}
                <div className="sm:col-span-8">
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => { if (!slug) generateSlugFromName(); }}
                    placeholder="Ex: Sunga Solar Degradê Ocre"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs sm:text-sm focus:outline-none focus:border-[#2A8882]"
                  />
                </div>

                {/* SKU */}
                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Código SKU
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Ex: SUN-DEG-01"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs sm:text-sm uppercase font-mono focus:outline-none focus:border-[#2A8882]"
                  />
                </div>
              </div>

              {/* Categorias & Subcategorias */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-stone-300">
                      Categoria Principal *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowQuickCategoryModal(!showQuickCategoryModal)}
                      className="text-[11px] text-[#2A8882] hover:text-[#38b2aa] font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Nova</span>
                    </button>
                  </div>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      setSubcategoryId('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#2A8882]"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>

                  {/* Criação Rápida de Categoria */}
                  {showQuickCategoryModal && (
                    <div className="mt-2 p-2 rounded-xl bg-stone-900 border border-stone-800 space-y-1.5 shadow-md">
                      <p className="text-[11px] font-medium text-stone-300">Nova Categoria:</p>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Ex: Vestidos"
                          value={quickCategoryName}
                          onChange={(e) => setQuickCategoryName(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-white text-xs"
                        />
                        <button
                          type="button"
                          disabled={!quickCategoryName.trim() || isCreatingQuickCat}
                          onClick={async () => {
                            if (!quickCategoryName.trim()) return;
                            setIsCreatingQuickCat(true);
                            try {
                              const newCatId = `cat-${Date.now()}`;
                              const slug = quickCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                              await addCategory({
                                name: quickCategoryName.trim(),
                                slug,
                                order: categories.length + 1,
                                isActive: true
                              });
                              setCategoryId(newCatId);
                              setQuickCategoryName('');
                              setShowQuickCategoryModal(false);
                            } finally {
                              setIsCreatingQuickCat(false);
                            }
                          }}
                          className="px-2.5 py-1.5 bg-[#2A8882] hover:bg-[#22706A] text-white text-xs font-semibold rounded-lg disabled:opacity-50 cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Salvar</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Subcategoria (Opcional)
                  </label>
                  <select
                    value={subcategoryId}
                    onChange={(e) => setSubcategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#2A8882]"
                  >
                    <option value="">Nenhuma subcategoria</option>
                    {subcategories
                      .filter(s => s.categoryId === categoryId)
                      .map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Marca / Coleção
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Silva e Sol"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#2A8882]"
                  />
                </div>
              </div>

              {/* Bloco de Preços e Promoções */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Preço & Ofertas</span>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOnSale}
                      onChange={(e) => setIsOnSale(e.target.checked)}
                      className="w-4 h-4 accent-[#F4803E] rounded"
                    />
                    <span className="text-xs font-semibold text-[#F4803E]">Ativar Preço Promocional</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-stone-400 mb-1 font-medium">Preço Normal (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={price}
                      onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white text-sm font-bold focus:outline-none focus:border-[#2A8882]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-400 mb-1 font-medium">
                      Preço com Desconto (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      disabled={!isOnSale}
                      value={promotionalPrice || ''}
                      onChange={(e) => setPromotionalPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder={isOnSale ? 'Ex: 69.90' : 'Desativado'}
                      className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white text-sm font-bold disabled:opacity-40 focus:outline-none focus:border-[#F4803E]"
                    />
                  </div>

                  {/* Indicador de Desconto Automático */}
                  <div className="flex flex-col justify-end">
                    {isOnSale && calculatedDiscountPercent > 0 ? (
                      <div className="px-3 py-2 bg-[#F4803E]/15 border border-[#F4803E]/40 rounded-xl text-center">
                        <span className="text-xs font-extrabold text-[#F4803E] flex items-center justify-center gap-1">
                          <Percent className="w-3.5 h-3.5" />
                          Desconto Calculado: -{calculatedDiscountPercent}% OFF
                        </span>
                      </div>
                    ) : (
                      <div className="px-3 py-2 bg-stone-900 border border-stone-800/80 rounded-xl text-center text-xs text-stone-500">
                        Nenhum desconto ativo
                      </div>
                    )}
                  </div>
                </div>

                {/* Vigência da Promoção */}
                {isOnSale && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-900">
                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">Data de Início da Oferta (Opcional)</label>
                      <input
                        type="date"
                        value={promotionStartDate}
                        onChange={(e) => setPromotionStartDate(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-[#2A8882]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">Data de Término da Oferta (Opcional)</label>
                      <input
                        type="date"
                        value={promotionEndDate}
                        onChange={(e) => setPromotionEndDate(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-[#2A8882]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Descrições */}
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Descrição Comercial Curta *
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Resumo da peça (tecido, forro, modelagem)..."
                  className="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#2A8882]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Ficha Técnica & Detalhes Adicionais
                </label>
                <textarea
                  rows={3}
                  value={detailedDescription}
                  onChange={(e) => setDetailedDescription(e.target.value)}
                  placeholder="Composição do tecido, forro duplo, cordão reforçado, instruções de lavagem..."
                  className="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#2A8882]"
                />
              </div>

              {/* Flags de Destaque e Status */}
              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 accent-[#2A8882] rounded"
                  />
                  <span className="text-xs font-semibold text-white">Produto Ativo (Visível na loja)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 accent-amber-400 rounded"
                  />
                  <span className="text-xs font-semibold text-amber-400">Destaque na Página Inicial</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNew}
                    onChange={(e) => setIsNew(e.target.checked)}
                    className="w-4 h-4 accent-teal-400 rounded"
                  />
                  <span className="text-xs font-semibold text-teal-400">Selo Lançamento</span>
                </label>
              </div>
            </div>
          )}

          {/* ABA 2: MÍDIA (FOTOS E VÍDEO) */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              {/* Notificação de Supabase Storage */}
              <div className="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-800/60 flex items-start gap-3">
                <Database className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="text-white font-semibold">Armazenamento em Nuvem Supabase Storage Pronto</p>
                  <p className="text-stone-400 mt-0.5">
                    As fotos enviadas ficam preparadas para sincronização com o bucket <code className="text-teal-300 bg-black/40 px-1 py-0.5 rounded">products</code> do Supabase. A primeira foto da lista é a capa principal do produto.
                  </p>
                </div>
              </div>

              {/* Seção de Upload de Fotos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-white">
                    Galeria de Imagens do Produto ({images.length})
                  </label>
                  <span className="text-[11px] text-stone-400">Recomendado: Proporção 4:5 ou 1:1</span>
                </div>

                {/* Upload e Inserção de URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Botão de Upload Local / Seleção Múltipla */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 rounded-2xl bg-stone-950 border-2 border-dashed border-stone-800 hover:border-[#2A8882] transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept="image/*"
                      onChange={handleImageFilesUpload}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-xl bg-[#2A8882]/15 text-[#2A8882] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-white">Clique para selecionar fotos</p>
                      <p className="text-[11px] text-stone-500">Ou arraste arquivos do seu computador</p>
                    </div>
                  </div>

                  {/* Adicionar via URL direta */}
                  <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col justify-between gap-2">
                    <label className="text-xs text-stone-400 font-medium">Ou adicione por link externo (URL):</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="https://exemplo.com/foto-sunga.jpg"
                        className="flex-1 px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#2A8882]"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-[#2A8882] text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grade de Imagens Cadastradas */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-2xl overflow-hidden bg-stone-950 border-2 aspect-[4/5] group flex flex-col justify-between ${
                          idx === 0 ? 'border-amber-400 shadow-lg shadow-amber-400/10' : 'border-stone-800'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Foto ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {/* Badge de Capa Principal */}
                        {idx === 0 && (
                          <div className="absolute top-2 left-2 bg-amber-400 text-stone-950 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                            <Star className="w-3 h-3 fill-stone-950" />
                            <span>CAPA</span>
                          </div>
                        )}

                        {/* Overlay de Ações */}
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="p-1 rounded bg-amber-400 hover:bg-amber-300 text-stone-950 text-[10px] font-bold flex items-center gap-1"
                                title="Definir como foto principal"
                              >
                                <Star className="w-3 h-3" />
                                <span>Capa</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="p-1 rounded bg-red-600 hover:bg-red-500 text-white ml-auto"
                              title="Remover foto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Reordenação com botões */}
                          <div className="flex items-center justify-center gap-2">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMoveImage(idx, 'left')}
                                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white"
                                title="Mover para esquerda"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {idx < images.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleMoveImage(idx, 'right')}
                                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white"
                                title="Mover para direita"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Seção de Vídeo do Produto */}
              <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Film className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Vídeo de Demonstração da Peça (Opcional)
                    </span>
                  </div>
                  {videoUrl && (
                    <button
                      type="button"
                      onClick={() => setVideoUrl('')}
                      className="text-xs text-red-400 hover:underline cursor-pointer"
                    >
                      Remover vídeo
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-stone-400">
                  Adicione um vídeo demonstrando o caimento no corpo ou os detalhes do tecido. Por segurança e conforto, o vídeo é sempre reproduzido com o som mudo por padrão (muted) na loja.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">URL direta do vídeo (MP4 ou WebM):</label>
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://exemplo.com/videos/sunga-solar.mp4"
                        className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">Ou selecione um arquivo de vídeo local:</label>
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-amber-400" />
                        <span>Carregar arquivo MP4</span>
                      </button>
                      <input
                        type="file"
                        ref={videoInputRef}
                        accept="video/mp4,video/webm"
                        onChange={handleVideoFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Prévia do Vídeo no Painel */}
                  <div className="bg-stone-900 rounded-xl border border-stone-800 p-2 flex flex-col items-center justify-center min-h-[160px]">
                    {videoUrl ? (
                      <div className="w-full h-full max-h-48 rounded-lg overflow-hidden relative">
                        <video
                          src={videoUrl}
                          controls
                          muted
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-contain bg-black rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="text-center text-stone-600 p-4">
                        <Play className="w-8 h-8 mx-auto mb-1 opacity-30" />
                        <span className="text-[11px]">Nenhum vídeo adicionado</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: VARIAÇÕES E ESTOQUE */}
          {activeTab === 'variants' && (
            <div className="space-y-6">
              {/* Feedback de Compressão & Upload */}
              {variantUploadNotice && (
                <div className="p-3.5 bg-[#2A8882]/15 border border-[#2A8882]/40 rounded-2xl flex items-center justify-between text-xs text-[#2A8882] font-semibold animate-fadeIn shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2A8882]" />
                    <span>{variantUploadNotice}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVariantUploadNotice(null)}
                    className="text-stone-400 hover:text-stone-200 text-[11px] cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              )}

              {/* Configuração de Atributos */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#2A8882]" />
                    Atributos de Variação (Separe por vírgula)
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerateVariantsGrid}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-[#2A8882] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Gerar Grade de Variações</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Tamanhos */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] text-stone-400 font-medium">Tamanhos disponíveis</label>
                      <span className="text-[10px] text-stone-500">Separar por vírgula</span>
                    </div>
                    <input
                      type="text"
                      value={sizesStr}
                      onChange={(e) => setSizesStr(e.target.value)}
                      placeholder="P (38), M (40), G (42), GG (44-46)"
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#2A8882]"
                    />
                    {/* Atalhos rápidos de tamanhos */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {[
                        { label: 'Sungas (P-GG)', val: 'P (38), M (40), G (42), GG (44-46)' },
                        { label: 'Padrão (P a GG)', val: 'P, M, G, GG' },
                        { label: 'Numérica (38-44)', val: '38, 40, 42, 44' },
                        { label: '+ XG', val: 'P, M, G, GG, XG' }
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setSizesStr(preset.val)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-stone-900 hover:bg-[#2A8882]/20 text-stone-400 hover:text-white border border-stone-800 transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cores */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] text-stone-400 font-medium">Cores disponíveis</label>
                      <span className="text-[10px] text-stone-500">Separar por vírgula</span>
                    </div>
                    <input
                      type="text"
                      value={colorsStr}
                      onChange={(e) => setColorsStr(e.target.value)}
                      placeholder="Verde, Azul, Branco, Preto"
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#2A8882]"
                    />
                    {/* Atalhos rápidos de cores populares Silva e Sol */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {['Verde', 'Azul', 'Branco', 'Preto', 'Amarelo Solar', 'Terracota'].map((cName) => {
                        const isAdded = colorsStr.toLowerCase().includes(cName.toLowerCase());
                        return (
                          <button
                            key={cName}
                            type="button"
                            onClick={() => {
                              const list = colorsStr.split(',').map(s => s.trim()).filter(Boolean);
                              if (isAdded) {
                                setColorsStr(list.filter(c => c.toLowerCase() !== cName.toLowerCase()).join(', '));
                              } else {
                                setColorsStr([...list, cName].join(', '));
                              }
                            }}
                            className={`text-[10px] px-2 py-0.5 rounded-md transition-colors border ${
                              isAdded 
                                ? 'bg-[#2A8882] text-white border-[#2A8882] font-semibold' 
                                : 'bg-stone-900 text-stone-400 hover:text-white border-stone-800'
                            }`}
                          >
                            {isAdded ? `✓ ${cName}` : `+ ${cName}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cortes / Modelos */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] text-stone-400 font-medium">Cortes / Modelos</label>
                      <span className="text-[10px] text-stone-500">Separar por vírgula</span>
                    </div>
                    <input
                      type="text"
                      value={modelsStr}
                      onChange={(e) => setModelsStr(e.target.value)}
                      placeholder="Slim Lateral 8cm, Tradicional, Boxer"
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#2A8882]"
                    />
                    <div className="flex flex-wrap gap-1 pt-1">
                      {[
                        { label: 'Sungas Slim (8cm)', val: 'Slim Lateral 8cm, Tradicional' },
                        { label: 'Boxer & Tradicional', val: 'Boxer, Tradicional' },
                        { label: 'Padrão Único', val: 'Padrão' }
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setModelsStr(preset.val)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-stone-900 hover:bg-[#2A8882]/20 text-stone-400 hover:text-white border border-stone-800 transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Estoque Total Global */}
                <div className="pt-2 border-t border-stone-900 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white">Estoque Global do Produto</span>
                    <p className="text-[11px] text-stone-500">Quantidade total de peças somadas em depósito</p>
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      min="0"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-white text-sm font-bold text-center focus:outline-none focus:border-[#2A8882]"
                    />
                  </div>
                </div>
              </div>

              {/* CARD DE ATRIBUIÇÃO RÁPIDA DE FOTOS POR COR */}
              {(() => {
                const detectedColors = Array.from(
                  new Set([
                    ...colorsStr.split(',').map(c => c.trim()).filter(Boolean),
                    ...variants.map(v => v.color?.trim()).filter(Boolean) as string[],
                    ...Object.keys(colorImages).map(c => c.charAt(0).toUpperCase() + c.slice(1))
                  ])
                );

                if (detectedColors.length === 0) return null;

                return (
                  <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-[#2A8882]" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                            Fotos por Cor (Upload do Celular ou Notebook)
                          </h4>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Envie a foto de cada cor com compressão leve automática. A foto é aplicada a todos os tamanhos da mesma cor.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-stone-400 bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-800 shrink-0">
                        <Smartphone className="w-3.5 h-3.5 text-[#2A8882]" />
                        <span>Celular</span>
                        <span className="text-stone-600">/</span>
                        <Laptop className="w-3.5 h-3.5 text-[#2A8882]" />
                        <span>Notebook</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                      {detectedColors.map((colorName) => {
                        const matchingVariants = variants.filter(v => v.color?.toLowerCase() === colorName.toLowerCase());
                        const colorImg = colorImages[colorName.toLowerCase()] || matchingVariants.find(v => v.imageUrl)?.imageUrl;
                        const isOptimizingThisColor = optimizingColorName === colorName;

                        return (
                          <div
                            key={colorName}
                            className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-center gap-3 transition-colors hover:border-stone-700"
                          >
                            {/* Preview da Foto da Cor */}
                            <div className="relative group shrink-0">
                              {colorImg ? (
                                <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-stone-700 bg-black">
                                  <img
                                    src={colorImg}
                                    alt={colorName}
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setPreviewModalImage({ url: colorImg, title: `Cor: ${colorName}`, info: `${matchingVariants.length} tamanho(s) vinculados` })}
                                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                                    title="Ver foto ampliada"
                                  >
                                    <Maximize2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="w-14 h-14 rounded-lg bg-stone-950 border border-dashed border-stone-700 flex flex-col items-center justify-center text-stone-500 gap-0.5">
                                  <Camera className="w-4 h-4 opacity-50" />
                                  <span className="text-[9px]">Sem foto</span>
                                </div>
                              )}
                            </div>

                            {/* Informações e Controles de Upload */}
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white truncate" title={colorName}>
                                  {colorName}
                                </span>
                                <span className="text-[10px] text-stone-400 bg-stone-950 px-1.5 py-0.5 rounded border border-stone-800 shrink-0">
                                  {matchingVariants.length} tam.
                                </span>
                              </div>

                              {/* Botões de Ação */}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-[#2A8882] text-stone-200 hover:text-white text-[11px] font-semibold cursor-pointer transition-colors border border-stone-700 shadow-xs">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={isOptimizingThisColor}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleColorBulkUpload(colorName, file);
                                      if (e.target) e.target.value = '';
                                    }}
                                  />
                                  {isOptimizingThisColor ? (
                                    <>
                                      <Loader2 className="w-3 h-3 animate-spin text-[#2A8882]" />
                                      <span>Comprimindo...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-3 h-3" />
                                      <span>{colorImg ? 'Trocar' : 'Upload'}</span>
                                    </>
                                  )}
                                </label>

                                {images.length > 0 && (
                                  <select
                                    value={colorImg || ''}
                                    onChange={(e) => {
                                      const chosen = e.target.value;
                                      if (chosen) {
                                        setColorImages(prev => ({ ...prev, [colorName.toLowerCase()]: chosen }));
                                      }
                                      setVariants(prev => prev.map(item => {
                                        if (item.color?.toLowerCase() === colorName.toLowerCase()) {
                                          return { ...item, imageUrl: chosen || undefined };
                                        }
                                        return item;
                                      }));
                                      setVariantUploadNotice(`Foto da galeria aplicada à cor "${colorName}".`);
                                      setTimeout(() => setVariantUploadNotice(null), 3000);
                                    }}
                                    className="px-1.5 py-1 bg-stone-950 border border-stone-800 rounded-lg text-[10px] text-stone-300 max-w-[90px] truncate"
                                  >
                                    <option value="">Galeria...</option>
                                    {images.map((img, idx) => (
                                      <option key={idx} value={img}>Foto {idx + 1}</option>
                                    ))}
                                  </select>
                                )}

                                {colorImg && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setColorImages(prev => {
                                        const next = { ...prev };
                                        delete next[colorName.toLowerCase()];
                                        return next;
                                      });
                                      setVariants(prev => prev.map(item => {
                                        if (item.color?.toLowerCase() === colorName.toLowerCase()) {
                                          return { ...item, imageUrl: undefined };
                                        }
                                        return item;
                                      }));
                                      setVariantUploadNotice(`Foto removida da cor "${colorName}".`);
                                      setTimeout(() => setVariantUploadNotice(null), 3000);
                                    }}
                                    className="p-1 text-stone-400 hover:text-red-400 rounded transition-colors"
                                    title="Remover foto desta cor"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Tabela de Variações Individuais */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-white">
                      Grade Detalhada de Variações ({variants.length})
                    </span>
                    <span className="text-[10px] text-stone-400 hidden sm:inline">
                      • Cada linha pode ter sua própria foto específica
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setVariants(prev => [
                        ...prev,
                        {
                          id: `var-${Date.now()}`,
                          productId: productToEdit?.id || '',
                          size: 'M',
                          color: 'Padrão',
                          sku: `${sku || 'SOL'}-VAR`,
                          stockQuantity: 5,
                          price: price,
                          isAvailable: true
                        }
                      ]);
                    }}
                    className="text-xs text-[#2A8882] hover:underline font-bold cursor-pointer inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar variação manual</span>
                  </button>
                </div>

                {variants.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-stone-950 border border-stone-800 text-center text-stone-500 text-xs">
                    Nenhuma variação gerada ainda. Clique em "Gerar Grade de Variações" acima para criar automaticamente a lista com tamanhos, cores e modelos.
                  </div>
                ) : (
                  <div className="rounded-2xl border border-stone-800 overflow-hidden bg-stone-950 max-h-96 overflow-y-auto">
                    <table className="w-full text-left text-xs text-stone-300">
                      <thead className="bg-stone-900 text-stone-400 font-semibold sticky top-0 border-b border-stone-800 z-10">
                        <tr>
                          <th className="py-2.5 px-3">Variação</th>
                          <th className="py-2.5 px-3 min-w-[210px]">Foto Específica (Upload / Galeria)</th>
                          <th className="py-2.5 px-3">SKU</th>
                          <th className="py-2.5 px-3">Preço (R$)</th>
                          <th className="py-2.5 px-3">Estoque</th>
                          <th className="py-2.5 px-3">Disponível</th>
                          <th className="py-2.5 px-3 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800/60">
                        {variants.map((v, i) => {
                          const isOptimizingRow = optimizingVariantIndex === i;
                          const hasColorSiblings = v.color && variants.filter(o => o.color?.toLowerCase() === v.color?.toLowerCase()).length > 1;

                          return (
                            <tr key={v.id || i} className="hover:bg-stone-900/40 transition-colors">
                              {/* Variação (Tamanho / Cor / Modelo) */}
                              <td className="py-2.5 px-3 font-semibold text-white">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span>{[v.size, v.color, v.model].filter(Boolean).join(' / ')}</span>
                                  {v.imageUrl && (
                                    <span className="w-2 h-2 rounded-full bg-[#2A8882]" title="Possui foto personalizada" />
                                  )}
                                </div>
                              </td>

                              {/* Foto da Variação (Upload Celular/Notebook + Preview + Galeria) */}
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {/* Thumbnail com Zoom */}
                                  <div className="relative group shrink-0">
                                    {v.imageUrl ? (
                                      <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-stone-700 bg-black">
                                        <img
                                          src={v.imageUrl}
                                          alt=""
                                          className="w-full h-full object-cover"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => setPreviewModalImage({
                                            url: v.imageUrl!,
                                            title: `Variação: ${[v.size, v.color, v.model].filter(Boolean).join(' / ')}`,
                                            info: `SKU: ${v.sku || 'N/A'}`
                                          })}
                                          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                                          title="Ampliar visualização"
                                        >
                                          <Maximize2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <div
                                        className="w-9 h-9 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500"
                                        title="Usa a foto principal do produto"
                                      >
                                        <Camera className="w-4 h-4 opacity-40" />
                                      </div>
                                    )}
                                  </div>

                                  {/* Botão de Upload Direto (Notebook / Celular com Câmera ou Galeria) */}
                                  <label
                                    htmlFor={`var-file-input-${i}`}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer border shadow-xs shrink-0 ${
                                      isOptimizingRow
                                        ? 'bg-[#2A8882]/20 border-[#2A8882] text-[#2A8882]'
                                        : 'bg-stone-900 hover:bg-[#2A8882] border-stone-800 hover:border-[#2A8882] text-stone-300 hover:text-white'
                                    }`}
                                    title="Tirar foto ou selecionar do computador/celular"
                                  >
                                    <input
                                      id={`var-file-input-${i}`}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      disabled={isOptimizingRow}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleVariantImageUpload(i, file);
                                        if (e.target) e.target.value = '';
                                      }}
                                    />
                                    {isOptimizingRow ? (
                                      <>
                                        <Loader2 className="w-3 h-3 animate-spin text-[#2A8882]" />
                                        <span>Comprimindo...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="w-3 h-3" />
                                        <span>{v.imageUrl ? 'Trocar' : 'Upload'}</span>
                                      </>
                                    )}
                                  </label>

                                  {/* Seletor rápido a partir das fotos do produto */}
                                  {images.length > 0 && (
                                    <select
                                      value={v.imageUrl || ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setVariants(prev => prev.map((item, idx) => idx === i ? { ...item, imageUrl: val || undefined } : item));
                                      }}
                                      className="px-1.5 py-1 bg-stone-900 border border-stone-800 rounded-lg text-[10px] text-stone-300 max-w-[85px] truncate"
                                      title="Vincular foto existente da galeria geral"
                                    >
                                      <option value="">Padrão</option>
                                      {images.map((img, imgIdx) => (
                                        <option key={imgIdx} value={img}>Foto {imgIdx + 1}</option>
                                      ))}
                                    </select>
                                  )}

                                  {/* Botão de Replicar para todas as variações da mesma cor */}
                                  {v.imageUrl && hasColorSiblings && (
                                    <button
                                      type="button"
                                      onClick={() => handleReplicateImageToColor(i)}
                                      className="p-1 text-stone-400 hover:text-[#2A8882] rounded transition-colors"
                                      title={`Replicar esta foto para todas as variações da cor "${v.color}"`}
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {/* Limpar foto individual */}
                                  {v.imageUrl && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setVariants(prev => prev.map((item, idx) => idx === i ? { ...item, imageUrl: undefined } : item));
                                      }}
                                      className="p-1 text-stone-500 hover:text-red-400 rounded transition-colors"
                                      title="Remover foto desta variação (voltar à principal)"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>

                              {/* SKU */}
                              <td className="py-2.5 px-3">
                                <input
                                  type="text"
                                  value={v.sku || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setVariants(prev => prev.map((item, idx) => idx === i ? { ...item, sku: val } : item));
                                  }}
                                  className="w-28 px-2 py-1 bg-stone-900 border border-stone-800 rounded-lg font-mono text-[11px] text-stone-200 focus:outline-none focus:border-[#2A8882]"
                                />
                              </td>

                              {/* Preço */}
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  step="0.01"
                                  value={v.price || price}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setVariants(prev => prev.map((item, idx) => idx === i ? { ...item, price: val } : item));
                                  }}
                                  className="w-20 px-2 py-1 bg-stone-900 border border-stone-800 rounded-lg text-[11px] text-white focus:outline-none focus:border-[#2A8882]"
                                />
                              </td>

                              {/* Estoque */}
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  min="0"
                                  value={v.stockQuantity}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setVariants(prev => prev.map((item, idx) => idx === i ? { ...item, stockQuantity: val } : item));
                                  }}
                                  className={`w-16 px-2 py-1 bg-stone-900 border rounded-lg text-[11px] font-bold ${
                                    v.stockQuantity <= 0 ? 'border-red-800 text-red-400' : 'border-stone-800 text-emerald-400'
                                  }`}
                                />
                              </td>

                              {/* Disponibilidade */}
                              <td className="py-2.5 px-3">
                                <input
                                  type="checkbox"
                                  checked={v.isAvailable !== false && v.stockQuantity > 0}
                                  onChange={(e) => {
                                    const val = e.target.checked;
                                    setVariants(prev => prev.map((item, idx) => idx === i ? { ...item, isAvailable: val } : item));
                                  }}
                                  className="w-4 h-4 accent-[#2A8882] cursor-pointer"
                                />
                              </td>

                              {/* Excluir linha */}
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => setVariants(prev => prev.filter((_, idx) => idx !== i))}
                                  className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-stone-900 rounded-lg transition-colors cursor-pointer"
                                  title="Remover esta variação"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ABA 4: LOGÍSTICA & EMBALAGEM (MELHOR ENVIO & CORREIOS) */}
          {activeTab === 'logistics' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2A8882]/10 border border-[#2A8882]/30 flex items-center justify-center text-[#2A8882]">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Dimensões & Peso para Cálculo de Frete
                    </h3>
                    <p className="text-xs text-stone-400">
                      Integração com a API do Melhor Envio, Correios (PAC e SEDEX), Jadlog e transportadoras.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-800/80 text-xs text-stone-300 flex items-center gap-2">
                  <Box className="w-4 h-4 text-[#F4803E] shrink-0" />
                  <span>
                    Estes valores são enviados automaticamente no cálculo do carrinho livre para orçar o frete real exato por CEP.
                  </span>
                </div>
              </div>

              {/* Grid de Medidas da Embalagem */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Peso */}
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-[#2A8882]" />
                      <span>Peso da Embalagem</span>
                    </label>
                    <span className="text-[11px] font-mono text-[#F4803E]">
                      {(weightGrams / 1000).toFixed(2)} kg
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="10"
                      step="10"
                      required
                      value={weightGrams}
                      onChange={(e) => setWeightGrams(Math.max(10, parseInt(e.target.value) || 10))}
                      placeholder="Ex: 200"
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white font-mono text-sm focus:outline-none focus:border-[#2A8882]"
                    />
                    <span className="absolute right-3 top-2 text-xs text-stone-500 font-semibold">
                      gramas (g)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {[
                      { label: 'Sunga (150g)', val: 150 },
                      { label: 'Bermuda (250g)', val: 250 },
                      { label: 'Camiseta (300g)', val: 300 },
                      { label: 'Kit (500g)', val: 500 }
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setWeightGrams(preset.val)}
                        className={`text-[10px] px-2 py-0.5 rounded-md transition-colors ${
                          weightGrams === preset.val 
                            ? 'bg-[#2A8882] text-white font-bold' 
                            : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Altura */}
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-200">
                      Altura da Embalagem
                    </label>
                    <span className="text-[11px] text-stone-500">Mín. 2 cm</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="2"
                      max="105"
                      required
                      value={heightCm}
                      onChange={(e) => setHeightCm(Math.max(2, parseInt(e.target.value) || 2))}
                      placeholder="Ex: 4"
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white font-mono text-sm focus:outline-none focus:border-[#2A8882]"
                    />
                    <span className="absolute right-3 top-2 text-xs text-stone-500 font-semibold">
                      cm
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-500">
                    Espessura do pacote ou envelope plástico/kraft.
                  </p>
                </div>

                {/* Largura */}
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-200">
                      Largura da Embalagem
                    </label>
                    <span className="text-[11px] text-stone-500">Mín. 11 cm</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="11"
                      max="105"
                      required
                      value={widthCm}
                      onChange={(e) => setWidthCm(Math.max(11, parseInt(e.target.value) || 11))}
                      placeholder="Ex: 15"
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white font-mono text-sm focus:outline-none focus:border-[#2A8882]"
                    />
                    <span className="absolute right-3 top-2 text-xs text-stone-500 font-semibold">
                      cm
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-500">
                    Largura padrão para envelopes ou caixas de envio.
                  </p>
                </div>

                {/* Comprimento */}
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-200">
                      Comprimento da Embalagem
                    </label>
                    <span className="text-[11px] text-stone-500">Mín. 16 cm</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="16"
                      max="105"
                      required
                      value={lengthCm}
                      onChange={(e) => setLengthCm(Math.max(16, parseInt(e.target.value) || 16))}
                      placeholder="Ex: 20"
                      className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white font-mono text-sm focus:outline-none focus:border-[#2A8882]"
                    />
                    <span className="absolute right-3 top-2 text-xs text-stone-500 font-semibold">
                      cm
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-500">
                    Extensão frontal do pacote para transporte.
                  </p>
                </div>
              </div>

              {/* Cubagem e Resumo Calculado */}
              <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <Box className="w-4 h-4 text-[#2A8882]" />
                    <span>Embalagem Cadastrada: {lengthCm} x {widthCm} x {heightCm} cm</span>
                  </div>
                  <p className="text-stone-400 text-[11px]">
                    Volume cúbico aproximado: <strong className="text-stone-200">{(lengthCm * widthCm * heightCm).toLocaleString()} cm³</strong> • Peso cúbico Correios: <strong className="text-stone-200">{((lengthCm * widthCm * heightCm) / 6000).toFixed(2)} kg</strong>
                  </p>
                </div>

                <div className="px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-semibold text-[11px] shrink-0 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pronto para Melhor Envio & Correios</span>
                </div>
              </div>
            </div>
          )}


          {/* ABA 5: TABELA DE MEDIDAS */}
          {activeTab === 'sizechart' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-950 border border-stone-800">
                <div>
                  <span className="text-xs font-bold text-white">Habilitar Tabela de Medidas</span>
                  <p className="text-[11px] text-stone-500">Exibe o botão interativo de guia de tamanhos na página do produto</p>
                </div>
                <input
                  type="checkbox"
                  checked={hasSizeChart}
                  onChange={(e) => setHasSizeChart(e.target.checked)}
                  className="w-5 h-5 accent-[#2A8882] rounded"
                />
              </div>

              {hasSizeChart && (
                <div className="space-y-4">
                  {/* Botões de Predefinições Rápidas */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                      Carregar Modelo Pré-definido Oficial:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SIZE_CHART_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleApplySizeChartPreset(preset.id)}
                          className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-[#2A8882] hover:bg-[#2A8882]/10 text-stone-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <Ruler className="w-3.5 h-3.5 text-[#2A8882]" />
                          <span>{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-stone-400 mb-1">Título da Tabela</label>
                      <input
                        type="text"
                        value={sizeChartTitle}
                        onChange={(e) => setSizeChartTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#2A8882]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-400 mb-1">Instruções de Medição</label>
                      <input
                        type="text"
                        value={sizeChartInstructions}
                        onChange={(e) => setSizeChartInstructions(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#2A8882]"
                      />
                    </div>
                  </div>

                  {/* Editor de Tabela de Medidas */}
                  <div className="border border-stone-800 rounded-2xl overflow-hidden bg-stone-950">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-stone-200">
                        <thead className="bg-stone-900 text-stone-400 font-bold border-b border-stone-800">
                          <tr>
                            {sizeChartColumns.map((col, colIdx) => (
                              <th key={colIdx} className="py-2.5 px-3">
                                <input
                                  type="text"
                                  value={col}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setSizeChartColumns(prev => prev.map((c, i) => i === colIdx ? val : c));
                                  }}
                                  className="bg-transparent border-b border-stone-700 text-xs font-bold text-white focus:outline-none focus:border-[#2A8882] w-full"
                                />
                              </th>
                            ))}
                            <th className="py-2.5 px-2 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  const colName = prompt('Nome da nova coluna (ex: Comprimento cm):');
                                  if (colName) {
                                    setSizeChartColumns(prev => [...prev, colName]);
                                    setSizeChartRows(prev => prev.map(r => ({ ...r, values: [...r.values, '-'] })));
                                  }
                                }}
                                className="text-[10px] text-[#2A8882] hover:underline"
                              >
                                + Coluna
                              </button>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-800/60">
                          {sizeChartRows.map((row, rowIdx) => (
                            <tr key={rowIdx}>
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  value={row.size}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setSizeChartRows(prev => prev.map((r, i) => i === rowIdx ? { ...r, size: val } : r));
                                  }}
                                  className="w-16 px-2 py-1 bg-stone-900 border border-stone-800 rounded text-center font-bold text-amber-400 text-xs"
                                />
                              </td>
                              {row.values.map((val, valIdx) => (
                                <td key={valIdx} className="py-2 px-3">
                                  <input
                                    type="text"
                                    value={val}
                                    onChange={(e) => {
                                      const newVal = e.target.value;
                                      setSizeChartRows(prev => prev.map((r, i) => {
                                        if (i !== rowIdx) return r;
                                        const newValues = [...r.values];
                                        newValues[valIdx] = newVal;
                                        return { ...r, values: newValues };
                                      }));
                                    }}
                                    className="w-full px-2 py-1 bg-stone-900 border border-stone-800 rounded text-xs"
                                  />
                                </td>
                              ))}
                              <td className="py-2 px-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => setSizeChartRows(prev => prev.filter((_, i) => i !== rowIdx))}
                                  className="p-1 text-stone-500 hover:text-red-400"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-2 border-t border-stone-800/60 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          const newSize = prompt('Tamanho (ex: XG ou 44):') || 'Novo';
                          const defaultVals = sizeChartColumns.slice(1).map(() => '-');
                          setSizeChartRows(prev => [...prev, { size: newSize, values: defaultVals }]);
                        }}
                        className="text-xs text-[#2A8882] hover:underline font-bold cursor-pointer"
                      >
                        + Adicionar Linha de Medida
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ABA 5: SEO GOOGLE */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Configurações de SEO & Indexação no Google
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Otimize para buscas no Google sobre moda praia masculina, sungas e regatas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={generateSlugFromName}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-[#2A8882] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Auto-Preencher com Nome
                </button>
              </div>

              {/* URL Amigável / Slug */}
              <div>
                <label className="block text-xs text-stone-300 font-semibold mb-1">
                  URL Amigável (Slug)
                </label>
                <div className="flex items-center rounded-xl bg-stone-950 border border-stone-800 overflow-hidden text-xs">
                  <span className="px-3 text-stone-500 bg-stone-900 py-2 border-r border-stone-800">
                    silvaesol.com.br/produto/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="sunga-solar-degrade"
                    className="flex-1 px-3 py-2 text-white bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              {/* Meta Title */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-stone-300 font-semibold">
                    Título SEO (Meta Title)
                  </label>
                  <span className={`text-[10px] ${seoTitle.length > 60 ? 'text-amber-400' : 'text-stone-500'}`}>
                    {seoTitle.length} / 60 caracteres recomendados
                  </span>
                </div>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Ex: Sunga Solar Degradê Ocre | Silva e Sol Moda Praia"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#2A8882]"
                />
              </div>

              {/* Meta Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-stone-300 font-semibold">
                    Descrição SEO (Meta Description)
                  </label>
                  <span className={`text-[10px] ${seoDescription.length > 160 ? 'text-amber-400' : 'text-stone-500'}`}>
                    {seoDescription.length} / 160 caracteres recomendados
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Ex.: Sunga em poliéster com elastano, forro em microfibra."
                  className="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:outline-none focus:border-[#2A8882]"
                />
              </div>

              {/* Google SERP Preview */}
              <div className="p-4 rounded-2xl bg-white text-stone-900 shadow-md space-y-1">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                  Pré-visualização do resultado no Google
                </span>
                <div className="text-xs text-emerald-800 font-mono truncate">
                  https://silvaesol.com.br/produto/{slug || 'nome-do-produto'}
                </div>
                <h4 className="text-sm font-semibold text-[#1a0dab] hover:underline cursor-pointer truncate">
                  {seoTitle || name || 'Título do Produto na Silva e Sol'}
                </h4>
                <p className="text-xs text-[#545454] line-clamp-2">
                  {seoDescription || description || 'Descrição do produto exibida na busca do Google com detalhes comerciais e chamada de ação.'}
                </p>
              </div>
            </div>
          )}

          {/* Rodapé Fixo do Modal */}
          <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#2A8882] hover:bg-[#22706A] text-white text-xs font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isSaving ? 'Salvando...' : (productToEdit ? 'Atualizar Produto' : 'Cadastrar Produto')}</span>
              </button>
            </div>
          </div>
        </form>

      </div>

      {/* Modal de Pré-visualização Ampliada da Foto da Variação */}
      {previewModalImage && (
        <div 
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setPreviewModalImage(null)}
        >
          <div 
            className="relative max-w-lg w-full bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-5 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#2A8882]" />
                  {previewModalImage.title}
                </h4>
                {previewModalImage.info && (
                  <p className="text-[11px] text-stone-400 mt-0.5">{previewModalImage.info}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalImage(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-[3/4] max-h-[60vh] w-full bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-stone-800">
              <img
                src={previewModalImage.url}
                alt={previewModalImage.title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
              <span className="flex items-center gap-1.5 text-stone-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2A8882]" />
                Foto otimizada para carregamento ultra-rápido
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalImage(null)}
                className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

