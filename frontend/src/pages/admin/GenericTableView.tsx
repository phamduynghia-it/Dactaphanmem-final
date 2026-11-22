import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Layers, RefreshCw, Plus } from 'lucide-react';

interface GenericTableViewProps {
  title: string;
  subtitle: string;
  tableName: string;
  apiEndpoint?: string;
}

export const GenericTableView: React.FC<GenericTableViewProps> = ({ 
  title, 
  subtitle, 
  tableName, 
  apiEndpoint 
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!apiEndpoint) return;
    setLoading(true);
    try {
      const data = await axiosClient.get<any, any[]>(apiEndpoint);
      if (Array.isArray(data)) {
        setItems(data);
      }
    } catch (err) {
      console.warn(`Could not load from ${apiEndpoint}`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiEndpoint]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          {apiEndpoint && (
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors shadow-xs"
              title="Tải lại dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
          )}

          <button 
            onClick={() => alert(`Chức năng thêm mới ${title}`)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-medium transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm mới {title}</span>
          </button>
        </div>
      </div>

      {/* If data exists from API, render data table; otherwise show module status card */}
      {items.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  {Object.keys(items[0]).map((key) => (
                    <th key={key} className="px-6 py-4">{key}</th>
                  ))}
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                    {Object.keys(items[0]).map((key) => {
                      const val = row[key];
                      const displayVal = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? '');
                      return (
                        <td key={key} className="px-6 py-4">
                          {key.toLowerCase().includes('price') || key.toLowerCase().includes('amount') ? (
                            <span className="font-bold text-emerald-700">
                              {Number(val || 0).toLocaleString('vi-VN')} đ
                            </span>
                          ) : (
                            <span className={key === 'id' ? 'font-mono text-gray-500' : 'text-gray-900'}>
                              {displayVal}
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-right">
                      <button className="text-emerald-600 hover:text-emerald-800 font-medium text-xs">
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-xs text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Mô-đun {title}</h3>
          <p className="text-sm text-gray-500 max-w-md mt-1">
            Dữ liệu được kết nối trực tiếp với API backend <code className="bg-gray-100 text-emerald-800 px-2 py-0.5 rounded font-mono text-xs">{apiEndpoint || tableName}</code> và bảng <code className="bg-gray-100 text-emerald-800 px-2 py-0.5 rounded font-mono text-xs">{tableName}</code>.
          </p>
        </div>
      )}
    </div>
  );
};
