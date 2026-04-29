import { useState } from 'react';
import { ProductManagement } from './ProductManagement';
import { ProductModal } from './modals/ProductModal';
import { BulkUploadModal } from './modals/BulkUploadModal';
import { ImportHistoryModal } from './modals/ImportHistoryModal';
import { useProducts } from '../hooks/useProducts';
import { useVendor } from '../hooks/useVendor';
import { supabase } from '../lib/supabase';
import { Product } from '../types';

export function ProductManagementContainer() {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();
  const { vendor } = useVendor();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showImportHistory, setShowImportHistory] = useState(false);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setShowModal(true);
    }
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    if (selectedProduct) {
      await updateProduct(selectedProduct.id, productData);
    } else {
      await addProduct(productData as Omit<Product, 'id' | 'created_at' | 'updated_at'>);
    }
    setShowModal(false);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(productId);
    }
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleBulkUpload = async (file: File, category: string): Promise<{ success: number; errors: string[] }> => {
    if (!vendor) {
      return { success: 0, errors: ['Vendor profile not found'] };
    }

    const errors: string[] = [];
    let successCount = 0;
    let totalRows = 0;
    let importId: string | null = null;

    try {
      const { data: importRecord, error: importError } = await supabase
        .from('product_imports')
        .insert({
          vendor_id: vendor.id,
          filename: file.name,
          status: 'processing',
        })
        .select()
        .single();

      if (importError) throw importError;
      importId = importRecord.id;

      const text = await file.text();
      const lines = text.split('\n').filter((line) => line.trim());

      if (lines.length < 2) {
        await supabase
          .from('product_imports')
          .update({ status: 'failed', errors: ['File is empty or invalid'], completed_at: new Date().toISOString() })
          .eq('id', importId);
        return { success: 0, errors: ['File is empty or invalid'] };
      }

      totalRows = lines.length - 1;
      const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, '_'));
      const requiredFields = ['name', 'sku', 'price'];
      const missingFields = requiredFields.filter((field) => !headers.includes(field));

      if (missingFields.length > 0) {
        const errorMsg = `Missing required columns: ${missingFields.join(', ')}`;
        await supabase
          .from('product_imports')
          .update({ status: 'failed', errors: [errorMsg], total_rows: totalRows, completed_at: new Date().toISOString() })
          .eq('id', importId);
        return { success: 0, errors: [errorMsg] };
      }

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = parseCSVLine(lines[i]);
          const productData: any = {};
          headers.forEach((header, index) => {
            productData[header] = values[index] || '';
          });

          if (!productData.name || !productData.sku || !productData.price) {
            errors.push(`Row ${i + 1}: Missing required fields (name, sku, price)`);
            continue;
          }

          const images = productData.images
            ? productData.images.split(',').map((url: string) => url.trim()).filter(Boolean)
            : [];
          const tags = productData.tags
            ? productData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean).slice(0, 10)
            : [];

          const productStatus = ['active', 'draft', 'archived'].includes(productData.status)
            ? productData.status
            : 'active';

          await addProduct({
            name: productData.name,
            description: productData.description || '',
            category: productData.category || category,
            sku: productData.sku,
            price: parseFloat(productData.price) || 0,
            cost: 0,
            color: productData.color || '',
            size_dimensions: productData.size_dimensions || '',
            care_instructions: productData.care_instructions || '',
            material: productData.material || '',
            shipping_timeline: productData.shipping_timeline || '',
            stock_quantity: parseInt(productData.stock_quantity) || 0,
            tags,
            images,
            status: productStatus,
            vendor_id: '',
          });

          successCount++;
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`);
        }
      }

      await supabase
        .from('product_imports')
        .update({
          status: 'completed',
          total_rows: totalRows,
          success_count: successCount,
          error_count: errors.length,
          errors,
          completed_at: new Date().toISOString(),
        })
        .eq('id', importId);

      return { success: successCount, errors };
    } catch (error) {
      if (importId) {
        await supabase
          .from('product_imports')
          .update({ status: 'failed', errors: ['Failed to process file'], completed_at: new Date().toISOString() })
          .eq('id', importId);
      }
      return { success: 0, errors: ['Failed to process file'] };
    }
  };

  const handleDownloadTemplate = () => {
    const template = 'name,sku,price,cost,description,category,status\n' +
      'Example Product,PROD-001,29.99,15.00,Product description,Books,active\n' +
      'Sample Item,PROD-002,49.99,25.00,Another product,Art,draft';

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-upload-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sufi-purple"></div>
      </div>
    );
  }

  return (
    <>
      <ProductManagement
        products={products}
        onAddProduct={handleAddProduct}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
        onBulkUpload={() => setShowBulkUpload(true)}
        onImportHistory={() => setShowImportHistory(true)}
      />
      {showModal && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setShowModal(false)}
          onSave={handleSaveProduct}
        />
      )}
      {showBulkUpload && (
        <BulkUploadModal
          onClose={() => setShowBulkUpload(false)}
          onUpload={handleBulkUpload}
        />
      )}
      {showImportHistory && (
        <ImportHistoryModal onClose={() => setShowImportHistory(false)} />
      )}
    </>
  );
}
