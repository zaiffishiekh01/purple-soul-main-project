import { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useCategoryNames } from '../../hooks/useCategories';
import { dashboardClient } from '../../lib/data-client';

interface BulkUploadModalProps {
  onClose: () => void;
  onUpload: (file: File, category: string) => Promise<{ success: number; errors: string[] }>;
}

export function BulkUploadModal({ onClose, onUpload }: BulkUploadModalProps) {
  const categoryNames = useCategoryNames(true);
  const [category, setCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null);
  const [skuInput, setSkuInput] = useState('');
  const [skuUploading, setSkuUploading] = useState(false);
  const [skuUploadResult, setSkuUploadResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSkuImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const imgFile = e.target.files?.[0];
    if (!imgFile || !skuInput.trim()) {
      alert('Please enter a SKU before selecting an image.');
      return;
    }

    setSkuUploading(true);
    setSkuUploadResult(null);
    try {
      const ext = imgFile.name.split('.').pop();
      const filePath = `sku-images/${skuInput.trim()}-${Date.now()}.${ext}`;

      const { error: uploadError } = await dashboardClient.storage
        .from('product-images')
        .upload(filePath, imgFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = dashboardClient.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const { data: products, error: fetchError } = await dashboardClient
        .from('products')
        .select('id, images')
        .eq('sku', skuInput.trim());

      if (fetchError) throw fetchError;

      if (!products || products.length === 0) {
        setSkuUploadResult(`Image uploaded but no product found with SKU "${skuInput.trim()}". URL: ${publicUrl}`);
        return;
      }

      const product = products[0];
      const updatedImages = [...(product.images || []), publicUrl];

      const { error: updateError } = await dashboardClient
        .from('products')
        .update({ images: updatedImages })
        .eq('id', product.id);

      if (updateError) throw updateError;

      setSkuUploadResult(`Image successfully added to product with SKU "${skuInput.trim()}".`);
      setSkuInput('');
    } catch (err: any) {
      setSkuUploadResult(`Error: ${err.message || 'Failed to upload image.'}`);
    } finally {
      setSkuUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !category) return;

    setUploading(true);
    try {
      const uploadResult = await onUpload(file, category);
      setResult(uploadResult);
    } catch (error) {
      setResult({ success: 0, errors: ['Upload failed. Please try again.'] });
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx')) {
        setFile(droppedFile);
        setResult(null);
      }
    }
  };

  const handleDownloadTemplate = () => {
    if (!category) {
      alert('Please select a product category before downloading the template');
      return;
    }

    let template = '';

    if (category === 'Digital Books' || category === 'Audio Spectrum') {
      template = 'name,sku,category,description,price,download_limit,license_duration_days,tags,images,status\n' +
        'Example Digital Product,DIG-001,Digital Books,This is a digital product description,29.99,unlimited,365,"tag1,tag2,tag3","https://example.com/image1.jpg,https://example.com/image2.jpg,https://example.com/image3.jpg,https://example.com/image4.jpg",active\n' +
        'Sample Audio File,AUD-002,Audio Spectrum,High quality audio file,19.99,5,180,"music,audio,premium","https://example.com/image1.jpg,https://example.com/image2.jpg,https://example.com/image3.jpg,https://example.com/image4.jpg",draft';
    } else {
      template = 'name,sku,category,description,material,color,size_dimensions,care_instructions,price,stock_quantity,shipping_timeline,tags,images,status\n' +
        'Example Physical Product,PHY-001,' + category + ',This is a physical product description,Cotton,Blue,10x10x5 inches,Machine wash cold,49.99,100,3-5 business days,"tag1,tag2,tag3","https://example.com/image1.jpg,https://example.com/image2.jpg,https://example.com/image3.jpg,https://example.com/image4.jpg",active\n' +
        'Sample Item,PHY-002,' + category + ',Another product description,Leather,Black,15x12x8 inches,Wipe clean,79.99,50,5-7 business days,"premium,bestseller","https://example.com/image1.jpg,https://example.com/image2.jpg,https://example.com/image3.jpg,https://example.com/image4.jpg",draft';
    }

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${category.toLowerCase().replace(/\s+/g, '-')}-upload-template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bulk Upload (CSV)</h2>
            <p className="text-sm text-gray-600 mt-1">Upload multiple products at once using a CSV file. Download the template to get started.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Category</h3>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
            >
              <option value="">Choose a category</option>
              {categoryNames.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {category && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-h-[400px] overflow-y-auto">
                <div className="flex items-start gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-900 mb-3">CSV File Requirements for "{category}":</p>

                    {category === 'Digital Books' || category === 'Audio Spectrum' ? (
                      <div>
                        <p className="font-semibold text-blue-900 mb-2">💾 Digital Products Template (10 Columns):</p>
                        <ul className="text-blue-700 space-y-1 text-xs">
                          <li>1. <strong>name</strong> - Product name (required)</li>
                          <li>2. <strong>sku</strong> - Unique product code (required)</li>
                          <li>3. <strong>category</strong> - Product category (required)</li>
                          <li>4. <strong>description</strong> - Detailed description (required)</li>
                          <li>5. <strong>price</strong> - Selling price (required)</li>
                          <li>6. <strong>download_limit</strong> - Number or "unlimited" (required for digital)</li>
                          <li>7. <strong>license_duration_days</strong> - License validity in days (required for digital)</li>
                          <li>8. <strong>tags</strong> - Comma-separated tags (required, max 10)</li>
                          <li>9. <strong>images</strong> - Comma-separated image URLs (required, min 4)</li>
                          <li>10. <strong>status</strong> - active, draft, or archived (required)</li>
                        </ul>
                        <p className="text-xs text-blue-600 mt-3 font-semibold bg-blue-100 rounded-lg p-2">
                          📌 Note: Upload the actual digital files after creating products via the product management page
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-semibold text-blue-900 mb-2">📦 Physical Products Template (14 Columns):</p>
                        <ul className="text-blue-700 space-y-1 text-xs">
                          <li>1. <strong>name</strong> - Product name (required)</li>
                          <li>2. <strong>sku</strong> - Unique product code (required)</li>
                          <li>3. <strong>category</strong> - Product category (required)</li>
                          <li>4. <strong>description</strong> - Detailed description (required)</li>
                          <li>5. <strong>material</strong> - Material composition (required for physical)</li>
                          <li>6. <strong>color</strong> - Product color (required for physical)</li>
                          <li>7. <strong>size_dimensions</strong> - Size/dimensions (required for physical)</li>
                          <li>8. <strong>care_instructions</strong> - Care instructions (required for physical)</li>
                          <li>9. <strong>price</strong> - Selling price (required)</li>
                          <li>10. <strong>stock_quantity</strong> - Stock quantity (required for physical)</li>
                          <li>11. <strong>shipping_timeline</strong> - e.g., "3-5 business days" (required for physical)</li>
                          <li>12. <strong>tags</strong> - Comma-separated tags (required, max 10)</li>
                          <li>13. <strong>images</strong> - Comma-separated image URLs (required, min 4)</li>
                          <li>14. <strong>status</strong> - active, draft, or archived (required)</li>
                        </ul>
                        <p className="text-xs text-blue-600 mt-3 font-semibold bg-blue-100 rounded-lg p-2">
                          📌 Note: Physical products require inventory tracking and shipping information
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleDownloadTemplate}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold text-lg"
                >
                  <Download className="w-5 h-5" />
                  Download Bulk Product Template
                </button>

                <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-xl p-5">
                  <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                    <span className="text-lg">🚀</span> Quick Upload Guide - Add 100+ Products in Under 1 Minute!
                  </h4>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-green-600 flex-shrink-0">1.</span>
                      <span><strong>Download</strong> the template above (CSV format with pre-filled examples)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-green-600 flex-shrink-0">2.</span>
                      <span><strong>Edit</strong> the spreadsheet in Excel, Google Sheets, or any CSV editor</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-green-600 flex-shrink-0">3.</span>
                      <span><strong>Fill in</strong> your product details - name, SKU, price, descriptions, images, etc.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-green-600 flex-shrink-0">4.</span>
                      <span><strong>Save</strong> your file as CSV format (keep the column headers unchanged)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-green-600 flex-shrink-0">5.</span>
                      <span><strong>Review</strong> your data - check for required fields and valid image URLs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-green-600 flex-shrink-0">6.</span>
                      <span><strong>Upload</strong> the file in the box below and watch the magic happen!</span>
                    </li>
                  </ol>
                  <div className="mt-4 bg-white border border-green-300 rounded-lg p-3">
                    <p className="text-xs text-gray-800 flex items-center gap-2">
                      <span className="text-2xl">⚡</span>
                      <span>
                        <strong className="text-green-700">Pro Tip:</strong> Our advanced bulk uploader can process <strong className="text-green-700">50-100 products in just 60 seconds!</strong> Perfect for vendors with large catalogs. Save hours of manual entry time.
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Don't have Image URLs?</h3>
            <p className="text-xs text-gray-600 mb-3">
              Upload an image for a specific SKU that was included in your CSV file. Enter the SKU below:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter SKU"
                value={skuInput}
                onChange={(e) => setSkuInput(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
              />
              <label className={`px-4 py-2 rounded-xl transition-colors cursor-pointer text-sm font-medium flex items-center gap-2 ${
                skuUploading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}>
                {skuUploading ? 'Uploading...' : 'Choose File'}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSkuImageUpload}
                  className="hidden"
                  disabled={skuUploading}
                />
              </label>
            </div>
            {skuUploadResult && (
              <p className={`text-xs mt-2 ${skuUploadResult.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
                {skuUploadResult}
              </p>
            )}
          </div>

          {!result ? (
            <>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-1">
                      {file ? file.name : 'Drop your CSV file here, or browse'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Supports: CSV (Max size: 10MB)
                    </p>
                  </div>
                  <button className="px-6 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium">
                    Browse Files
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {file && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-600">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div
                className={`rounded-xl p-6 border-2 ${
                  result.errors.length === 0
                    ? 'bg-green-50 border-green-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  {result.errors.length === 0 ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">Upload Results</h3>
                    <p className="text-gray-700">
                      Successfully imported <span className="font-bold">{result.success}</span>{' '}
                      product(s)
                    </p>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <div className="mt-4 bg-white rounded-lg p-4">
                    <p className="font-semibold text-gray-900 mb-2">
                      {result.errors.length} Error(s):
                    </p>
                    <ul className="space-y-1 max-h-48 overflow-y-auto">
                      {result.errors.map((error, index) => (
                        <li key={index} className="text-sm text-gray-700">
                          • {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setFile(null);
                  setResult(null);
                  setCategory('');
                }}
                className="w-full px-6 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-medium"
              >
                Upload Another File
              </button>
            </div>
          )}

          {!result && (
            <div className="flex gap-4 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || !category || uploading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50"
              >
                <Upload className="w-5 h-5" />
                {uploading ? 'Uploading...' : 'Upload CSV'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
