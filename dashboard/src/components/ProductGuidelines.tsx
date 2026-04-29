import { useState, useEffect } from 'react';
import { BookOpen, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Guideline {
  id: string;
  title: string;
  content: string;
  section_order: number;
  is_active: boolean;
}

export function ProductGuidelines() {
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  useEffect(() => {
    fetchGuidelines();
  }, []);

  const fetchGuidelines = async () => {
    try {
      const { data, error } = await supabase
        .from('product_guidelines')
        .select('*')
        .eq('is_active', true)
        .order('section_order');

      if (error) throw error;
      setGuidelines(data || []);

      if (data && data.length > 0) {
        setExpandedSections(new Set([data[0].id]));
      }
    } catch (error) {
      console.error('Error fetching guidelines:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const downloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to download the guidelines');
        return;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-guidelines-pdf`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const html = await response.text();
      const blob = new Blob([html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Product_Upload_Guidelines.html';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to generate guidelines. Please try again.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h3 key={index} className="text-lg font-bold text-gray-900 mt-4 mb-2">{line.substring(2)}</h3>;
      } else if (line.startsWith('## ')) {
        return <h4 key={index} className="text-base font-semibold text-gray-800 mt-3 mb-2">{line.substring(3)}</h4>;
      } else if (line.startsWith('- ')) {
        return <li key={index} className="ml-4 text-gray-700">{line.substring(2)}</li>;
      } else if (line.match(/^\d+\./)) {
        return <li key={index} className="ml-4 text-gray-700 list-decimal">{line}</li>;
      } else if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={index} className="font-semibold text-gray-800 mt-2">{line.replace(/\*\*/g, '')}</p>;
      } else if (line.trim() === '') {
        return <br key={index} />;
      } else {
        return <p key={index} className="text-gray-700 leading-relaxed">{line}</p>;
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Product Upload Guidelines</h1>
              <p className="text-blue-100">
                Complete guide for uploading products to the Sacred Gift Shop
              </p>
            </div>
          </div>
          <button
            onClick={downloadPDF}
            disabled={downloadingPDF}
            className="px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloadingPDF ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                Generating...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
        <BookOpen className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <p className="font-semibold mb-1">Important Notice</p>
          <p>
            Please read these guidelines carefully before uploading products. Following these guidelines
            ensures your products are approved quickly and displayed correctly on the platform.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {guidelines.map((guideline, index) => (
          <div
            key={guideline.id}
            className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-blue-300 transition-colors"
          >
            <button
              onClick={() => toggleSection(guideline.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{guideline.title}</h2>
              </div>
              {expandedSections.has(guideline.id) ? (
                <ChevronUp className="w-6 h-6 text-gray-400" />
              ) : (
                <ChevronDown className="w-6 h-6 text-gray-400" />
              )}
            </button>

            {expandedSections.has(guideline.id) && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="prose prose-sm max-w-none">
                  {formatContent(guideline.content)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Need Help?</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>
            <span className="font-semibold">Bulk upload support:</span>{' '}
            <a href="mailto:bulk@sufisciencecenter.info" className="text-blue-600 hover:underline">
              bulk@sufisciencecenter.info
            </a>
          </p>
          <p>
            <span className="font-semibold">Individual vendor queries:</span>{' '}
            <a href="mailto:vendorsupport@sufisciencecenter.info" className="text-blue-600 hover:underline">
              vendorsupport@sufisciencecenter.info
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
