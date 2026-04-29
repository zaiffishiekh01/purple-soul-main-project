import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Download, RotateCcw } from 'lucide-react';

interface VirtualTryOnProps {
  productImage: string;
  productName: string;
  onClose: () => void;
}

export default function VirtualTryOn({ productImage, productName, onClose }: VirtualTryOnProps) {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [productScale, setProductScale] = useState(0.3);
  const [productPosition, setProductPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (backgroundImage) {
      drawCanvas();
    }
  }, [backgroundImage, productScale, productPosition]);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function capturePhoto() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);

        setBackgroundImage(canvas.toDataURL());
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (error) {
      alert('Camera access denied. Please upload a photo instead.');
    }
  }

  function drawCanvas() {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bgImg = new Image();
    bgImg.src = backgroundImage;

    bgImg.onload = () => {
      canvas.width = bgImg.width;
      canvas.height = bgImg.height;
      ctx.drawImage(bgImg, 0, 0);

      const productImg = new Image();
      productImg.src = productImage;

      productImg.onload = () => {
        const scaledWidth = productImg.width * productScale;
        const scaledHeight = productImg.height * productScale;
        const x = (canvas.width * productPosition.x) / 100 - scaledWidth / 2;
        const y = (canvas.height * productPosition.y) / 100 - scaledHeight / 2;

        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 10;

        ctx.drawImage(productImg, x, y, scaledWidth, scaledHeight);
      };
    };
  }

  function handleCanvasMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    setIsDragging(true);
  }

  function handleCanvasMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setProductPosition({ x, y });
  }

  function handleCanvasMouseUp() {
    setIsDragging(false);
  }

  function downloadImage() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${productName}-virtual-preview.png`;
    link.href = canvas.toDataURL();
    link.click();
  }

  function resetPosition() {
    setProductPosition({ x: 50, y: 50 });
    setProductScale(0.3);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary">Virtual Try-On: {productName}</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-secondary"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!backgroundImage ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold mb-4">Get Started</h3>
              <p className="text-secondary mb-8">Upload a photo of your space or take a new one</p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 font-medium"
                >
                  <Upload className="w-5 h-5" />
                  Upload Photo
                </button>

                <button
                  onClick={capturePhoto}
                  className="flex items-center gap-2 border-2 border-amber-600 text-amber-600 px-6 py-3 rounded-lg hover:bg-amber-50 font-medium"
                >
                  <Camera className="w-5 h-5" />
                  Take Photo
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <div className="mt-12 max-w-2xl mx-auto">
                <h4 className="font-semibold mb-4">Tips for Best Results:</h4>
                <ul className="text-left text-secondary space-y-2">
                  <li>• Take a clear, well-lit photo of your wall or space</li>
                  <li>• Stand directly in front of the wall for accurate perspective</li>
                  <li>• Make sure the area is uncluttered</li>
                  <li>• Consider the lighting in your space</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-surface-deep rounded-lg p-4">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                    className="w-full h-auto cursor-move rounded-lg"
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={downloadImage}
                    className="flex-1 flex items-center justify-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 font-medium"
                  >
                    <Download className="w-5 h-5" />
                    Save Image
                  </button>

                  <button
                    onClick={resetPosition}
                    className="flex items-center gap-2 border border-default px-4 py-2 rounded-lg hover:bg-surface-deep"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Reset
                  </button>

                  <button
                    onClick={() => setBackgroundImage(null)}
                    className="flex items-center gap-2 border border-default px-4 py-2 rounded-lg hover:bg-surface-deep"
                  >
                    <Upload className="w-5 h-5" />
                    New Photo
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Controls</h3>
                  <div className="bg-surface-deep p-4 rounded-lg space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">
                        Size: {(productScale * 100).toFixed(0)}%
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={productScale}
                        onChange={(e) => setProductScale(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm text-secondary mb-2">
                        Drag the artwork on the preview to reposition it
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Product Details</h3>
                  <div className="bg-surface-deep p-4 rounded-lg">
                    <img
                      src={productImage}
                      alt={productName}
                      className="w-full h-48 object-contain mb-3"
                    />
                    <p className="font-medium">{productName}</p>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Pro Tip</h4>
                  <p className="text-sm text-purple-800">
                    Consider the actual dimensions of your wall and the artwork when deciding on placement.
                    This preview helps visualize style and composition.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
